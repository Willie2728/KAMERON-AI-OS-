import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { buildTrustedRecoveryCapsule, evaluateRecovery, verifyCapsuleIntegrity } from '../src/capsule.js';
import { JsonCheckpointStorage, StorageFabric } from '../src/storage.js';
import { KameronRuntime } from '../src/runtime.js';

test('trusted capsule passes local recovery policy', () => {
  const capsule = buildTrustedRecoveryCapsule({
    task_id: 'task-1',
    agent_id: 'agent-1',
    environment_fingerprint: 'env-abc',
    trust: { score: 92 }
  });
  assert.equal(verifyCapsuleIntegrity(capsule).valid, true);
  assert.equal(evaluateRecovery(capsule, { minimum_trust_score: 70 }).approved, true);
});

test('nested checkpoint tampering invalidates integrity', () => {
  const capsule = buildTrustedRecoveryCapsule({
    task_id: 'task-2',
    agent_id: 'agent-2',
    environment_fingerprint: 'env-def',
    execution_state: { cursor: { page: 12, row: 8 } },
    trust: { score: 95 }
  });
  capsule.execution_state.cursor.row = 999;
  assert.equal(verifyCapsuleIntegrity(capsule).valid, false);
  assert.equal(evaluateRecovery(capsule).approved, false);
});

test('SWARMER-required policy denies local-only trust metadata', () => {
  const capsule = buildTrustedRecoveryCapsule({
    task_id: 'task-3',
    agent_id: 'agent-3',
    environment_fingerprint: 'env-ghi',
    trust: { score: 99, provider: 'kameron-local' }
  });
  const decision = evaluateRecovery(capsule, { require_swarmer: true, minimum_trust_score: 70 });
  assert.equal(decision.approved, false);
  assert.match(decision.reasons.join(' '), /SWARMER/);
});

test('runtime checkpoints interrupted work and approves eligible resume', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'kameron-'));
  const storage = new StorageFabric(new JsonCheckpointStorage(dir));
  const runtime = new KameronRuntime({ storage });
  runtime.registerJob({
    task_id: 'task-4',
    agent_id: 'agent-4',
    environment_fingerprint: 'env-jkl',
    execution_state: { step: 41 },
    trust: { score: 90 }
  });
  const capsule = runtime.checkpoint('task-4', { next_safe_action: 'continue-step-42' });
  runtime.interrupt('task-4', 'worker disconnected');
  const result = runtime.resume(capsule.capsule_id);
  assert.equal(result.status, 'approved-awaiting-execution-adapter');
  assert.equal(result.decision.approved, true);
});
