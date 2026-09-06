# KAMERON AI OS — Recovery Side-Effect Receipt Requirement

Date: 2026-09-06
Status: Product requirement / not yet verified as implemented

## Customer truth
A checkpoint can be intact and authorized while an external side effect has already happened. Resuming from that checkpoint without reconciling prior effects can repeat the wrong action.

Examples include a payment already submitted, a customer message already sent, a ticket already created, a deployment already triggered, or a destructive write already committed.

## Current reviewed boundary
The current `KameronRuntime.resume(capsuleId, adapter)` evaluates recovery eligibility and, when approved, dispatches `adapter.resume(capsule)`. A fresh repository search did not surface an explicit side-effect receipt ledger, replay-or-fork contract, or irreversible-action reconciliation layer in the reviewed runtime source.

This document therefore defines a production-readiness requirement. It must not be marketed as an implemented KAMERON capability until source and tests verify it.

## Required side-effect receipt
Before a consequential external action is considered safely resumable, the runtime or integration adapter should be able to persist a receipt containing at least:

- stable workload / task identifier;
- action identifier and action class;
- target system and destination;
- authority / permission context used for the action;
- idempotency or deduplication key when the provider supports one;
- request fingerprint or digest that excludes secrets;
- provider or downstream acknowledgement reference when available;
- effect state: planned, dispatched, acknowledged, failed, uncertain, compensated;
- timestamp and checkpoint/capsule reference;
- human hold / escalation state for uncertain or irreversible effects.

## Resume reconciliation gate
Before the adapter repeats an external action after restore, KAMERON should reconcile the receipt and choose an explicit outcome:

1. **Reuse prior result** — the external effect is already confirmed and should not be repeated.
2. **Continue after confirmed effect** — restore state after the acknowledged action and move forward.
3. **Retry with provider idempotency** — only where the provider contract makes retry safe.
4. **Fork for human review** — effect state is uncertain or consequences are material.
5. **Deny resume** — authorization, environment, receipt integrity, or side-effect state no longer permits safe continuation.

## Verification gate
Do not claim side-effect-safe recovery until all of the following exist and pass:

- implementation in runtime or adapter contract;
- tests covering duplicate-action prevention;
- tests covering uncertain provider acknowledgement;
- tests covering changed authorization after checkpoint;
- tests covering provider idempotency reuse;
- an inspectable recovery receipt in the control plane or audit output.

## Commercial boundary
Until verified, KAMERON may truthfully say it separates checkpoint integrity from resume authorization and that external recovery requires a runtime/SDK/worker/integration adapter. It should not claim that arbitrary irreversible external actions are automatically protected from duplicate execution after restore.
