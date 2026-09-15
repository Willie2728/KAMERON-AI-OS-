import test from 'node:test';
import assert from 'node:assert/strict';
import { buildContainmentPlan } from '../src/containment.js';
import { buildTrustedRecoveryCapsule, evaluateRecovery, verifyCapsuleIntegrity } from '../src/capsule.js';

test('containment defaults to revoke credentials, network and tools',()=>{
  const plan=buildContainmentPlan({task_id:'t1',agent_id:'a1',workflow_id:'w1',last_checkpoint_id:'c1'});
  assert.equal(plan.status,'contained');
  assert.equal(plan.freeze.requested_actions.revoke_credentials,true);
  assert.equal(plan.freeze.requested_actions.disable_network,true);
  assert.equal(plan.freeze.requested_actions.disable_tools,true);
  assert.equal(plan.freeze.requested_actions.preserve_forensics,true);
});

test('tampered recovery capsule is denied',()=>{
  const cap=buildTrustedRecoveryCapsule({task_id:'t1',agent_id:'a1',environment_fingerprint:'env1'});
  cap.execution_state={tampered:true};
  assert.equal(verifyCapsuleIntegrity(cap).valid,false);
  assert.equal(evaluateRecovery(cap).approved,false);
});

test('SWARMER-gated recovery requires approval and verified behavior',()=>{
  const cap=buildTrustedRecoveryCapsule({task_id:'t1',agent_id:'a1',environment_fingerprint:'env1',trust:{provider:'ai-swarmer-os',score:95,capability_gate_approval:'denied',behavioral_verification_status:'unverified'}});
  const decision=evaluateRecovery(cap,{require_swarmer:true,minimum_trust_score:80});
  assert.equal(decision.approved,false);
  assert.ok(decision.reasons.some(r=>r.includes('Capability Gate')));
});
