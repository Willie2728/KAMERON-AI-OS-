# RUN110 — KAMERON Name the Fault Before Recovery

**Asset ID:** KAM-TXT-103  
**Status:** Production-ready; unpublished; no recovery result claimed.

## Customer truth

A recovery demonstration without a named failure scenario proves very little. Before a buyer treats checkpointing, replay, or resume controls as resilience evidence, the evaluation needs to specify the failure class to exercise, what state must survive, which side effects must not repeat, who owns resume authority, and what external/system receipt proves the required outcome.

## Creative strategy

**Hook:** Name the fault before you ask KAMERON to recover.  
**CTA:** Define the failure class, checkpoint, no-repeat side effects, receipt, and resume authority before contact.

## Production readiness

Base44 file: `src/pages/Pricing.jsx`

The bounded recovery intake now requires:
- one bounded agent/workflow;
- failure class;
- a free-text failure scenario to deliberately inject or simulate;
- checkpoint state;
- side effects that must not repeat;
- buyer-defined no-duplicate receipt;
- resume authority;
- recovery objective;
- optional integration boundary and decision window.

`RecoveryPilotRequest` persists the failure class and scenario. Anonymous `RecoveryScopeSignal` stores only the selected failure class, decision window, and whether an integration boundary was supplied; it does not store the free-text failure scenario or other buyer text.

Build verification: `npm run build` exited 0.  
Base44 checkpoint: `6aa08c32e767b80d9449307d`  
Base44 checkpoint commit: `43899c5a9601a11c5cb979cd90bfecb8df1b6962`

## Analytics / evaluation

RUN110 baseline readback: 0 `RecoveryScopeSignal` records and 0 `RecoveryPilotRequest` records. Empty telemetry is not interpreted as zero demand.

## Claims boundary

The failure scenario is an evaluation requirement, not proof KAMERON has recovered from that failure. Checkpointing or replay does not establish exactly-once external execution. Any recovery, non-duplication, RTO/RPO, availability, deployment, certification, revenue, ROI, or winner claim requires a verified test and external/system receipt.

## Distribution / winner library

Queue for owned technical-review surfaces only until authenticated external distribution and analytics receipts exist. No post, ad, email, pilot, deployment, recovery result, or winner is claimed by this record.