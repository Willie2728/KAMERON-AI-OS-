# KAMERON AI OS — Run 48: A Safe Resume Needs a Side-Effect Receipt

Date: 2026-09-06

## Customer Truth
A checkpoint can be intact and authorized while an external side effect has already happened. Recovery is incomplete if the system cannot determine whether a payment, message, ticket, deployment, or destructive write already occurred before it decides what to do next.

## Creative Strategy
Hook: **Checkpoint recovery can be correct and still repeat the wrong external action.**

Body:
The hard question after restore is not only “Is this checkpoint valid?” It is also “What irreversible effects already happened?”

For one high-consequence workload, define a side-effect receipt before defining the restart:
- action and destination;
- authority used;
- idempotency / dedupe key when supported;
- downstream acknowledgement;
- effect state: planned, dispatched, acknowledged, failed, uncertain, or compensated;
- checkpoint reference;
- human hold rule for uncertain effects.

CTA: **For one consequential workflow, define the side-effect receipt and resume decision before the first recovery drill.**

## Product / Claims Boundary
This is a production-readiness requirement, not a claim that current KAMERON already implements a complete irreversible-side-effect ledger.

The reviewed current `src/runtime.js` evaluates recovery authorization and then dispatches `adapter.resume(capsule)` when an adapter is present. A fresh repository search did not surface an explicit side-effect receipt ledger or replay-or-fork implementation in the reviewed runtime source.

The connected Base44 control plane also labels its Idempotency Fence example as sample/demo UI, not verified live runtime protection.

KAMERON may continue to truthfully position checkpoint integrity and resume authorization as separate questions, while external recovery depends on a runtime/SDK/worker/integration adapter.

## Production Readiness
- Durable requirement created: `docs/RECOVERY_SIDE_EFFECT_RECEIPT_REQUIREMENT.md`
- Requirement commit: `061f7a5cce7b97d2136443d633c7b9695d5546a2`
- Connected Base44 control-plane sandbox build: exit code 0
- No KAMERON runtime code was changed in this marketing iteration
- No image or video rendered

## Distribution Queue
Text / sales-enablement brief only. Do not distribute as an implemented-capability claim. Use it as a qualified enterprise pilot question: which one workflow contains an external side effect expensive enough that duplicate execution would be unacceptable?

## Analytics / Evaluation
Qualified signal: an enterprise buyer can name one consequential workload, its irreversible side effects, the downstream acknowledgement source, and the human hold condition for uncertainty.

No public test has run and no winner is declared.

## Research Boundary
2026 research on semantic rollback in LLM-agent checkpoint/restore describes a category risk where restored agents may synthesize slightly different tool requests and create duplicate or unauthorized irreversible side effects. That research is category evidence only; it is not proof that KAMERON currently prevents those cases.

## Winner Library
No winner. Promote only after an implemented adapter/runtime receipt contract is tested and an attributable buyer test produces decision-useful evidence.
