---
name: design-spec
description: How the designer writes the Design section of an agent:design issue. References come from the issue or the owner; no web research.
---
Add `## Design` to the issue body (keep the rest):
- **Screens & states:** each screen touched; states empty / loading (fal queue + running) / done / failed / over quota (paywall) / offline.
- **Layout:** top-to-bottom elements, which existing components (`mobile/src/components/<Group>/`) to reuse, any new component and its group.
- **Tokens:** colors, spacing, radius, type from `mobile/src/theme/` (no raw hex); light + dark.
- **Copy:** every new string with its key for `mobile/messages/en.json`.
- **Paywall moment** (if relevant): what triggers it, what the user just saw, Restore Purchases placement.
- **Demo note:** what the judges see in the 2-minute demo.
- **Dev preview entries** to add.
Then one summary comment and relabel `agent:design` → `agent:dev` + `status:todo`.
