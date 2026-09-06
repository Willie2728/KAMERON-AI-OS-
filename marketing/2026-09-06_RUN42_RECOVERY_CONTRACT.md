# KAMERON AI OS — Run 42: Define Recovery Before the Incident

**Status:** Production-ready text only. Not published. No new media rendered.

## Customer Truth
“Resilient” is not a useful operating requirement until a team defines what state must survive, what can change before resume, and what must trigger a hold.

## Hook
**You cannot buy resilience as an adjective. Define what must survive.**

## Creative Strategy — Recovery Contract
For one bounded workload, define the recovery contract before interruption:

1. Workload boundary — what job or workflow is covered.
2. Checkpoint point/cadence — what state should be preserved and when.
3. Maximum acceptable rework — a planning target, not a service-level guarantee.
4. Dependencies/fingerprints — what must be revalidated before resume.
5. Permissions/policy — what authorization must still hold.
6. Side-effect/idempotency fence — what must not execute twice.
7. Human hold/escalation conditions — what requires review instead of automatic continuation.
8. Recovery success test — how the team decides the resumed workload is acceptable.

## Deployable copy
A checkpoint is only useful when the recovery rules are explicit.

For one workload, define what state must survive, what dependencies and permissions must still match, what side effects cannot repeat, and what conditions force a human hold. Then test the recovery path against that contract.

KAMERON’s core product principle is that checkpoint integrity and resume authorization are different questions. The Base44 experience is the accessible control-plane prototype; recovery of arbitrary external software requires a KAMERON runtime, SDK, worker, or integration adapter where the workload actually executes.

## CTA
Pick one long-running workload and write its Recovery Contract before testing interruption and resume.

## Claims boundary
This is a proposed pilot method, not a production SLA, guaranteed recovery objective, or claim that the Base44 control-plane preview currently resumes arbitrary external systems.
