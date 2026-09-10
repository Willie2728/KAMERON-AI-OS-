import { createHash } from 'node:crypto';

const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');

export function buildContainmentPlan(job, input = {}) {
  const now = new Date().toISOString();
  const freeze = {
    task_id: job.task_id,
    agent_id: job.agent_id,
    workflow_id: job.workflow_id,
    checkpoint_id: job.last_checkpoint_id || null,
    execution_state: job.execution_state || {},
    working_memory_state: job.working_memory_state || {},
    tool_state: job.tool_state || {},
    permissions_snapshot: job.permissions_snapshot || {},
    environment_fingerprint: job.environment_fingerprint || '',
    reason: input.reason || 'security containment',
    source: input.source || 'swarmer',
    evidence: input.evidence || {},
    requested_actions: {
      revoke_credentials: input.revoke_credentials !== false,
      disable_network: input.disable_network !== false,
      disable_tools: input.disable_tools !== false,
      preserve_forensics: input.preserve_forensics !== false
    },
    created_at: now
  };
  return {
    containment_id: `contain_${hash(freeze).slice(0, 24)}`,
    status: 'contained',
    freeze_hash: hash(freeze),
    freeze
  };
}

export function buildRecoveryPlan(job, input = {}) {
  const plan = {
    task_id: job.task_id,
    agent_id: job.agent_id,
    from_checkpoint_id: input.checkpoint_id || job.last_checkpoint_id || null,
    reconcile_systems: input.reconcile_systems || [],
    require_swarmer_clearance: input.require_swarmer_clearance !== false,
    require_outcome_reconciliation: input.require_outcome_reconciliation !== false,
    restore_credentials: input.restore_credentials === true,
    created_at: new Date().toISOString()
  };
  return { recovery_plan_id: `recover_${hash(plan).slice(0, 24)}`, status: 'planned', ...plan };
}
