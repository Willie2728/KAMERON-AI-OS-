# KAMERON AI OS — Run 29

## Campaign: The Newest Checkpoint Is Not Always the Safest Restart Point

**Hook:** Recovery should resume from a safe business boundary, not blindly from the latest saved state.

A checkpoint can preserve execution state while still leaving an important question unresolved: **what side effects already happened before the worker stopped?**

For a long-running AI workflow, the useful recovery map is:

`checkpoint → side-effect boundary → integrity / dependency / permission / policy revalidation → resume authorization → idempotent continuation → human escalation where required`

That means the pilot question is not just “how often do we save?” It is also:
- which external actions must never happen twice?
- which actions are safe to retry?
- what changed after the checkpoint?
- what must be re-authorized before continuation?
- where should the workflow fall back if the newest state is no longer eligible to resume?

**CTA:** Choose one long-running AI workflow and mark the side effects that must never happen twice.

## Product grounding

The connected KAMERON Base44 app currently presents a recovery-control-plane prototype with checkpoint integrity, resume authorization, runtime supervision and SWARMER trust-gate concepts. Its event feed and metrics are explicitly sample/preview data, and its pricing is illustrative packaging.

This campaign does **not** claim that the Base44 UI currently recovers arbitrary external production software. A real deployment still requires a KAMERON runtime, SDK, worker agent, or integration adapter in the environment where execution occurs.

Status: **Prompt Ready / text only. No new media rendered. Nothing published.**
