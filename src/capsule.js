import { createHash, randomUUID } from 'node:crypto';

export const KAMERON_PROTOCOL_VERSION = '0.1.0';

function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map(k => `${JSON.stringify(k)}:${canonical(value[k])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

export function hashCapsulePayload(payload) {
  return createHash('sha256').update(canonical(payload)).digest('hex');
}

export function buildTrustedRecoveryCapsule(input = {}) {
  const capsule = {
    protocol_version: KAMERON_PROTOCOL_VERSION,
    capsule_id: input.capsule_id || randomUUID(),
    task_id: String(input.task_id || ''),
    agent_id: String(input.agent_id || ''),
    workflow_id: String(input.workflow_id || ''),
    parent_checkpoint_id: input.parent_checkpoint_id || null,
    checkpoint_sequence: Number(input.checkpoint_sequence || 0),
    execution_state: input.execution_state || {},
    working_memory_state: input.working_memory_state || {},
    tool_state: input.tool_state || {},
    model_state: input.model_state || {},
    artifact_refs: input.artifact_refs || [],
    pending_actions: input.pending_actions || [],
    completed_actions: input.completed_actions || [],
    environment_fingerprint: String(input.environment_fingerprint || ''),
    runtime_version: String(input.runtime_version || ''),
    dependency_manifest: input.dependency_manifest || {},
    connector_versions: input.connector_versions || {},
    permissions_snapshot: input.permissions_snapshot || {},
    credential_refs: input.credential_refs || [],
    network_policy: input.network_policy || {},
    recovery_instructions: input.recovery_instructions || {},
    rollback_instructions: input.rollback_instructions || {},
    next_safe_action: input.next_safe_action || null,
    trust: {
      provider: input.trust?.provider || 'kameron-local',
      score: Number(input.trust?.score ?? 100),
      capability_gate_approval: input.trust?.capability_gate_approval || 'not-required',
      behavioral_verification_status: input.trust?.behavioral_verification_status || 'not-required',
      security_policy_version: input.trust?.security_policy_version || null
    },
    created_at: input.created_at || new Date().toISOString()
  };
  capsule.integrity_hash = hashCapsulePayload(capsule);
  return capsule;
}

export function verifyCapsuleIntegrity(capsule) {
  const { integrity_hash, ...payload } = capsule || {};
  const expected = hashCapsulePayload(payload);
  return {
    valid: Boolean(integrity_hash) && integrity_hash === expected,
    expected,
    actual: integrity_hash || null
  };
}

export function evaluateRecovery(capsule, policy = {}) {
  const integrity = verifyCapsuleIntegrity(capsule);
  const reasons = [];
  const minimumTrust = Number(policy.minimum_trust_score ?? 70);
  if (!capsule?.task_id) reasons.push('task_id required');
  if (!capsule?.agent_id) reasons.push('agent_id required');
  if (!capsule?.environment_fingerprint) reasons.push('environment fingerprint required');
  if (!integrity.valid) reasons.push('integrity validation failed');
  if (Number(capsule?.trust?.score ?? 0) < minimumTrust) reasons.push(`trust score below ${minimumTrust}`);
  if (policy.require_swarmer === true) {
    if (capsule?.trust?.provider !== 'ai-swarmer-os') reasons.push('SWARMER trust provider required');
    if (capsule?.trust?.capability_gate_approval !== 'approved') reasons.push('SWARMER Capability Gate approval required');
    if (capsule?.trust?.behavioral_verification_status !== 'verified') reasons.push('SWARMER behavioral verification required');
  }
  return {
    decision_id: randomUUID(),
    capsule_id: capsule?.capsule_id || null,
    task_id: capsule?.task_id || null,
    approved: reasons.length === 0,
    outcome: reasons.length === 0 ? 'resume-approved' : 'resume-denied',
    reasons,
    minimum_trust_score: minimumTrust,
    integrity,
    decided_at: new Date().toISOString()
  };
}
