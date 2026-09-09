# RUN120 — KAMERON: State Consistency Before Resume

## Customer Truth
A workflow can resume without duplicating an external action and still be wrong if the restored state is stale, incomplete, or out of sync.

## Creative Strategy
**KAM-TXT-104 — Restore Is Not the Same as Correct Resume**

Hook: **A checkpoint is only useful if the state you resume from is still trustworthy.**

CTA: Define both the state-consistency receipt and the no-duplicate receipt before a bounded recovery review.

## Production-Ready Buyer Aid
**KAM-DOC-003 — State-Consistency Receipt Card**

Before contact, the bounded recovery scope now requires the buyer to define evidence that the restored checkpoint/state is sufficiently current and internally consistent. The buyer should name the checkpoint/state object, the source-system version/timestamp/cursor that must agree with it, the expected workflow position, and the mismatch condition that must stop or escalate.

The state-consistency receipt is paired with the existing no-duplicate external/system receipt:
- State-consistency receipt: did the workflow restore the right/current-enough state?
- No-duplicate receipt: did recovery avoid repeating the protected external side effect?

These are evaluation requirements, not assertions that KAMERON guarantees freshness, correctness, exactly-once execution, recovery, an SLA, or production resilience.

## Market / Technical Context
AWS's current Agentic AI Lens says long-running workflows need checkpointed state and idempotent steps; it warns that checkpoint-based recovery without idempotency can create duplicate side effects or data corruption. Source: https://docs.aws.amazon.com/wellarchitected/latest/agentic-ai-lens/agentrel03-bp03.html

RUN120 extends the buyer proof contract beyond replay/idempotency by requiring an explicit buyer-defined state-consistency receipt before resume is treated as correct. That is a test requirement, not proof KAMERON has passed such a test.

## Analytics / Evaluation
Verified baseline after schema/UI change:
- RecoveryScopeSignal: 0 records.
- RecoveryPilotRequest: 0 records.

The anonymous signal stores only the failure class, decision window, whether an integration boundary was supplied, and whether a state-consistency receipt was defined. It does not store the free-text scenario, workflow, checkpoint, receipt, authority, company, or email.

## Production Verification
- Base44 checkpoint: `6aa117e10ae0264b36beb029`
- Base44 commit: `52ef39a450e8c0eea3604759da3877c8961eccb9`
- `npm run build`: exit 0.
- Build warning only: stale Browserslist/caniuse-lite data.
- Video rendered: false.
- External post/ad/email published: false.
- Production deployment verified: false.

## Source-Parity Boundary
The connected GitHub repository does not expose `src/pages/Pricing.jsx` at the current Base44 path (GitHub contents lookup returned 404). Therefore this record does not claim Base44↔GitHub application-source parity.
