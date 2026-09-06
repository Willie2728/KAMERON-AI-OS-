# KAMERON AI OS — Growth Run 39

## Campaign

**A resume decision should leave a receipt.**

A checkpoint being present is not enough to explain why a long-running AI workflow was allowed to continue. The operationally useful question is: **what evidence justified resume instead of hold?**

## Product-grounded message

KAMERON’s connected control-plane prototype already models the pieces of that decision:

`checkpoint located → integrity checked → dependency / permission / policy changes reviewed → resume or hold decision → reason preserved → idempotent continuation`

The commercial wedge is not “recovery at all costs.” It is **inspectable recovery authorization**: the operator should be able to see what changed, what was revalidated, and why a resume was allowed or blocked.

## Hook options

- A resume decision should leave a receipt.
- “Checkpoint found” is not the same as “resume authorized.”
- If the agent continues, show why it was safe to continue.

## CTA

**Pick one long-running AI workflow and write the evidence that would justify Resume versus Hold.**

## Production readiness

Production-ready text / campaign brief only. No new media rendered. Nothing published.

## Product boundary

The connected Base44 KAMERON application is an accessible control-plane/product preview with sample recovery events and preview modules. Recovery of arbitrary external production software requires a KAMERON Runtime, SDK, worker, or integration adapter where that work actually executes. Do not claim the Base44 preview currently restores arbitrary external agents or that sample recovery events are live telemetry.
