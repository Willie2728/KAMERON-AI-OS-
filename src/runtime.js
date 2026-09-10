import { EventEmitter } from 'node:events';
import { buildTrustedRecoveryCapsule, evaluateRecovery } from './capsule.js';
import { buildContainmentPlan, buildRecoveryPlan } from './containment.js';

export class KameronRuntime extends EventEmitter {
  constructor({ storage, runtimeVersion = '0.2.0', policy = {} } = {}) {
    super();
    if (!storage) throw new Error('storage required');
    this.storage = storage;
    this.runtimeVersion = runtimeVersion;
    this.policy = policy;
    this.jobs = new Map();
    this.containments = new Map();
    this.recoveryPlans = new Map();
  }

  registerJob(job) {
    if (!job?.task_id || !job?.agent_id) throw new Error('task_id and agent_id required');
    const state = {
      task_id: String(job.task_id), agent_id: String(job.agent_id), workflow_id: String(job.workflow_id || ''),
      status: 'running', checkpoint_sequence: 0, execution_state: job.execution_state || {},
      working_memory_state: job.working_memory_state || {}, tool_state: job.tool_state || {}, model_state: job.model_state || {},
      environment_fingerprint: String(job.environment_fingerprint || ''), dependency_manifest: job.dependency_manifest || {},
      permissions_snapshot: job.permissions_snapshot || {}, trust: job.trust || {}, registered_at: new Date().toISOString()
    };
    this.jobs.set(state.task_id, state); this.emit('job.registered', state); return state;
  }

  updateJob(taskId, patch = {}) {
    const current = this.jobs.get(taskId); if (!current) throw new Error('unknown task');
    const next = { ...current, ...patch, task_id: current.task_id, agent_id: current.agent_id };
    this.jobs.set(taskId, next); this.emit('job.updated', next); return next;
  }

  checkpoint(taskId, extra = {}) {
    const job = this.jobs.get(taskId); if (!job) throw new Error('unknown task');
    const sequence = Number(job.checkpoint_sequence || 0) + 1;
    const capsule = buildTrustedRecoveryCapsule({ ...job, ...extra, checkpoint_sequence: sequence, runtime_version: this.runtimeVersion, task_id: job.task_id, agent_id: job.agent_id, workflow_id: job.workflow_id });
    this.storage.put(capsule); job.checkpoint_sequence = sequence; job.last_checkpoint_id = capsule.capsule_id; this.jobs.set(taskId, job);
    this.emit('checkpoint.created', capsule); return capsule;
  }

  interrupt(taskId, reason = 'unspecified') {
    const job = this.jobs.get(taskId); if (!job) throw new Error('unknown task');
    job.status = 'interrupted'; job.interruption_reason = reason; job.interrupted_at = new Date().toISOString();
    this.jobs.set(taskId, job); this.emit('job.interrupted', job); return job;
  }

  contain(taskId, input = {}) {
    const job = this.jobs.get(taskId); if (!job) throw new Error('unknown task');
    if (!job.last_checkpoint_id) this.checkpoint(taskId, { trust: { ...(job.trust || {}), containment_checkpoint: true } });
    const current = this.jobs.get(taskId);
    const plan = buildContainmentPlan(current, input);
    current.status = 'contained'; current.containment_id = plan.containment_id; current.contained_at = plan.freeze.created_at;
    current.interruption_reason = plan.freeze.reason; this.jobs.set(taskId, current); this.containments.set(plan.containment_id, plan);
    this.emit('job.contained', plan); return plan;
  }

  recoveryPlan(taskId, input = {}) {
    const job = this.jobs.get(taskId); if (!job) throw new Error('unknown task');
    const plan = buildRecoveryPlan(job, input); this.recoveryPlans.set(plan.recovery_plan_id, plan); this.emit('recovery.planned', plan); return plan;
  }

  listContainments() { return [...this.containments.values()].sort((a,b)=>b.freeze.created_at.localeCompare(a.freeze.created_at)); }
  listRecoveryPlans() { return [...this.recoveryPlans.values()].sort((a,b)=>b.created_at.localeCompare(a.created_at)); }

  evaluate(capsuleId, policy = this.policy) {
    const capsule = this.storage.get(capsuleId); if (!capsule) throw new Error('unknown checkpoint');
    const decision = evaluateRecovery(capsule, policy); this.emit('recovery.evaluated', decision); return decision;
  }

  resume(capsuleId, adapter) {
    const capsule = this.storage.get(capsuleId); if (!capsule) throw new Error('unknown checkpoint');
    const decision = evaluateRecovery(capsule, this.policy);
    if (!decision.approved) { const error = new Error(`Recovery denied: ${decision.reasons.join('; ')}`); error.decision = decision; throw error; }
    if (!adapter || typeof adapter.resume !== 'function') return { decision, status: 'approved-awaiting-execution-adapter', capsule };
    const result = adapter.resume(capsule); this.emit('recovery.resumed', { decision, capsule_id: capsuleId, result }); return { decision, status: 'resume-dispatched', result };
  }
}
