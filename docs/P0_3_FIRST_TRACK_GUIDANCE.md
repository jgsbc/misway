# DRIFT P0.3 — First track guidance

P0.3 is intentionally limited to first-track discoverability.

## Canonical rule

Entry must reveal **A WALK IN ZEELAND** first. Geometric nearest-track distance is not the authority inside the Entry→Zeeland approach corridor because Peut-être is physically nearer to the deep cave spawn.

## Runtime behavior

- Entry→Zeeland approach: compass target is A WALK IN ZEELAND.
- Once outside that authored approach: compass returns to nearest-track guidance.
- Play remains available only when the vehicle is actually inside a playable track radius.
- Info remains a separate secondary action.
- No track coordinates, terrain, water, physics, camera, audio architecture or route geometry change in this lot.

## Automated gates

- deep Entry spawn must guide to Zeeland even when another track is geometrically nearer;
- cave exit must still guide to Zeeland rather than the non-musical threshold;
- Funky Hoo and Peut-être side spurs must remain outside the forced first-reveal corridor;
- the authored Entry route must reach Zeeland's playable radius within 16 world metres after the cave exit.
