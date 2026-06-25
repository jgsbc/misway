# MISWAY Drift Map — Product & Technical Specification

## 1. Status

- Phase: framing and governance.
- Experimental target route: `/drift-lab`.
- Existing route preserved: `/drift`.
- V0 implementation: no WebGL.
- V0 dependencies: no new dependency.
- Primary product rule: music stays central.
- Execution rule: documentation first, audit second, prototype third.

This document is the source of truth for the MISWAY Drift Map project until implementation proves otherwise.

---

## 2. Product vision

MISWAY Drift Map transforms the current Drift idea into a playable listening surface.

The user does not browse a list. The user moves through a small musical territory. Each song becomes a place: a chamber, road, island, office, loop, yard, signal, or lamp. The map is not a game added on top of the site. It is a way of listening with movement.

Core experience:

1. The user enters `/drift-lab`.
2. A lightweight map appears.
3. A small vehicle can be moved across the map.
4. The vehicle approaches zones linked to tracks.
5. The zone reveals title, mood, microcopy and visual atmosphere.
6. The user can enter the zone and play the associated track through the existing global audio player.
7. The music continues across navigation exactly like the rest of the site.

The experience must feel strange, direct, poetic, slightly funny, and still premium.

The best guiding line:

> Do not choose a song. Drift until one catches you.

---

## 3. Product boundaries

### What Drift Map is

- A non-linear discovery mode for the MISWAY catalogue.
- A small playable musical map.
- A poetic spatial layer above the existing track data.
- A lightweight interaction experiment before any 3D work.
- A way to make the catalogue feel like a territory.

### What Drift Map is not

- Not a Bruno Simon clone.
- Not a full game.
- Not a portfolio demo.
- Not a WebGL showcase in V0.
- Not a physics sandbox.
- Not a replacement for `/tracks`.
- Not a replacement for the global audio player.
- Not a reason to refactor the whole site.
- Not a visual overload.
- Not a new homepage.
- Not a SEO surface to over-optimize.

---

## 4. Non-negotiable product decisions

These decisions are already validated and must not be reopened without explicit human instruction.

1. Create `/drift-lab` first. Do not replace `/drift`.
2. V0 uses no WebGL: 2D or pseudo-3D only.
3. V0 uses CSS/SVG/React state/requestAnimationFrame as needed.
4. The existing `AudioPlayerProvider` remains the single audio source.
5. 6 to 8 zones maximum in V0.
6. Spatial data lives in `src/lib/driftMap.ts`.
7. Do not overload `src/lib/tracks.ts` with map data.
8. No new dependency in V0.
9. Internal pages stay broadly aligned with the current light theme.
10. Local visual variations are allowed inside the map if they serve the music.
11. Accessibility and fallback are part of the product, not a later patch.
12. WebGL is only a later spike after the V0 experience is validated.

---

## 5. Creative principles

### Tone

- Strange but readable.
- Soft but not vague.
- Loufoque but premium.
- Minimal but alive.
- Dry humor, not sketch comedy.
- Poetic fragments, not long explanation.
- Clear controls, mysterious atmosphere.

### Visual direction

V0 should lean toward:

- light internal-page base;
- white, off-white, pale grey, dust, faint blue, faint amber;
- sparse map elements;
- small visual anomalies;
- restrained gradients;
- clean typography;
- props that feel symbolic, not decorative clutter.

### Forbidden tone

Avoid:

- generic music marketing;
- fake grandeur;
- startup words;
- overexplaining the experience;
- heavy fantasy game language;
- jokes that make MISWAY feel unserious.

### Good microcopy examples

- `WRONG WAY / RIGHT SONG`
- `NO GPS FOR INNER WEATHER`
- `PLEASE DO NOT OPTIMIZE THE DRIFT`
- `THIS ROAD HAS FEELINGS`
- `YOU ARE NOT HERE`
- `ZONE À PEU PRÈS MASTERISÉE`
- `PARKING DES IDÉES FLOUES`
- `SLOW DOWN, YOU ARE IN A SONG`

---

## 6. Stack by phase

### V0 — lightweight map

Use the existing stack only:

- Next.js App Router;
- React;
- TypeScript;
- Tailwind CSS;
- CSS transforms;
- SVG or simple HTML elements;
- requestAnimationFrame if needed;
- Framer Motion if useful and already installed;
- Lucide icons if useful and already installed.

No new dependency.

### V1 — possible 3D signature layer

Only after V0 validation:

- `three`;
- `@react-three/fiber`;
- `@react-three/drei`.

V1 is a spike first, not a product replacement.

### V2 — possible physics layer

Only if V1 proves stable and useful:

- `@react-three/rapier`.

Physics is optional. It must serve musical discovery, not technical fascination.

---

## 7. Target architecture

Recommended file structure:

```txt
src/app/drift-lab/page.tsx
src/components/drift-map/DriftMapClient.tsx
src/components/drift-map/DriftMapScene.tsx
src/components/drift-map/DriftVehicle.tsx
src/components/drift-map/DriftZone.tsx
src/components/drift-map/DriftHud.tsx
src/components/drift-map/DriftControls.tsx
src/components/drift-map/DriftFallback.tsx
src/lib/driftMap.ts
src/lib/driftControls.ts
src/types/drift.ts
```

### Responsibilities

`src/app/drift-lab/page.tsx`
- Route entry.
- Metadata.
- Imports `DriftMapClient`.
- No heavy logic.

`DriftMapClient.tsx`
- Client shell.
- Connects to audio provider.
- Holds high-level map state.
- Chooses fallback if needed.

`DriftMapScene.tsx`
- Map rendering.
- Vehicle and zones composition.
- No audio logic except callbacks.

`DriftVehicle.tsx`
- Vehicle rendering.
- Position and rotation display.
- No track logic.

`DriftZone.tsx`
- Zone rendering.
- Active/near/current states.
- No direct audio creation.

`DriftHud.tsx`
- Current zone information.
- Enter/play action.
- Exit links.
- Minimal controls help.

`DriftControls.tsx`
- Keyboard/touch controls UI.
- Mobile joystick or minimal touch controls.

`DriftFallback.tsx`
- Non-playable fallback.
- Lists zones as cards.
- Uses existing track play actions.

`src/lib/driftMap.ts`
- Spatial truth.
- Zone definitions.
- Biomes.
- Props.
- Track slug mapping.

`src/lib/driftControls.ts`
- Pure helpers for movement and control state.

`src/types/drift.ts`
- TypeScript types for map data and state.

---

## 8. Audio rules

The existing global player is the only audio system.

Mandatory rules:

1. Use `useAudioPlayer()` from `AudioPlayerProvider`.
2. Do not create a second `<audio>` element.
3. Do not create a parallel audio context for tracks in V0.
4. Use `playTrack(track)` for explicit zone entry if the user intends to play the track.
5. Use `toggleTrack(track)` only when the UI semantics are play/pause for the same track.
6. Do not restart a currently active track unless the user explicitly requests it.
7. Preserve loop, next, previous, play/pause and seek behavior.
8. Leaving `/drift-lab` must not stop the current audio.
9. The global player must remain visible or intentionally accounted for.
10. Autoplay restrictions must be respected.

The Drift Map can visually react to proximity, but V0 should avoid automatic audio switching on proximity. Audio should change only on explicit user action.

---

## 9. Proposed data model

Indicative TypeScript model:

```ts
export type DriftBiome =
  | "entry-signal"
  | "zeeland-road"
  | "midnight-office"
  | "here-there"
  | "plain-signal"
  | "neural-loop"
  | "hold-light"
  | "birth-yard";

export type DriftPropType =
  | "sign"
  | "lamp"
  | "speaker"
  | "cable"
  | "chair"
  | "stone"
  | "synth"
  | "marker";

export type DriftProp = {
  id: string;
  type: DriftPropType;
  x: number;
  y: number;
  rotation?: number;
  label?: string;
};

export type DriftZoneConfig = {
  id: string;
  trackSlug: string;
  label: string;
  x: number;
  y: number;
  radius: number;
  biome: DriftBiome;
  portalLabel: string;
  microcopy: string[];
  props?: DriftProp[];
  accentMood?: "cold" | "warm" | "neutral" | "night" | "dust" | "signal";
};

export type DriftMapConfig = {
  width: number;
  height: number;
  spawn: { x: number; y: number };
  zones: DriftZoneConfig[];
};
```

Model rules:

- `trackSlug` must match an existing track slug from `src/lib/tracks.ts`.
- Spatial data belongs to `src/lib/driftMap.ts`.
- Track content remains in `src/lib/tracks.ts`.
- V0 should validate or safely ignore missing track slugs.
- Props must stay light and symbolic.

---

## 10. V0 zones

V0 must use 6 to 8 zones maximum.

Recommended initial zones:

### 1. Entry Node

- Role: spawn / orientation.
- Track: ambient or no track.
- Mood: pale parking, weak signal, soft dust.
- Function: teach controls without tutorial noise.

### 2. Zeeland Road

- Track: `a-walk-in-zeeland`.
- Mood: horizon, wind, dike, first travel.
- Props: bent road sign, thin horizon line.

### 3. Midnight Office

- Track: `midnight-work`.
- Mood: insomnia, studio residue, cold desk light.
- Props: coffee cup, desk lamp, cable.

### 4. Here-There Islands

- Track: `telatelaba`.
- Mood: here and there, two islands, small bridge.
- Props: two signs contradicting each other.

### 5. Plain Signal

- Track: `asitis`.
- Mood: bare acceptance, almost empty.
- Props: one plain marker, one white stone.

### 6. Neural Loop

- Track: `overthink`.
- Mood: loop, internal pressure, mental traffic.
- Props: circular road, sign loop, repeated arrows.

### 7. Hold Lamp

- Track: `hold-the-light`.
- Mood: fragile light, small anchor.
- Props: lamp, halo, tiny bench.

### 8. Birth Yard

- Track: `foolfoule`, `jazzypling`, or `play-it`.
- Mood: early sketches, toy yard, first movement.
- Props: small synth, crooked cones, playful sign.

---

## 11. UX desktop

Required:

- Arrow keys and WASD for movement.
- The vehicle must be visible immediately.
- Movement must feel simple and predictable.
- The active or nearest zone must be clearly indicated.
- `Enter` may trigger zone entry / play action.
- `Space` may toggle playback only if it does not conflict with native controls.
- `Escape` may open exit state or link back to `/tracks`.
- HUD must remain minimal.
- Controls help must be visible but not noisy.

Desktop success test:

- A first-time user should understand how to move in under 10 seconds.
- A first-time user should be able to play a track in under 45 seconds.

---

## 12. UX mobile

Mobile is not optional.

Acceptable V0 options:

1. Minimal virtual joystick.
2. Four subtle direction zones.
3. Drag-to-move vehicle.
4. Non-playable fallback if full interaction is poor.

Mobile rules:

- Do not hide the global player by accident.
- Do not create bottom control conflicts with navigation/player.
- Touch targets must be large enough.
- Orientation must work in portrait first.
- The experience must remain usable on average phones.
- If interaction feels cramped, fallback is better than a bad mini-game.

---

## 13. Accessibility

Accessibility requirements:

- Respect `prefers-reduced-motion`.
- Provide a fallback non-playable list of zones.
- Keep keyboard navigation available.
- Keep focus states visible.
- Do not rely only on color to indicate active zones.
- Provide text labels for zones.
- Ensure core actions are buttons or links, not anonymous divs.
- Do not trap keyboard focus inside the map.
- Do not make audio start without user intent.

Reduced motion behavior:

- Disable strong continuous animation.
- Keep movement simple.
- Allow zone selection through buttons/cards.

---

## 14. Performance

V0 performance principles:

- No WebGL.
- No heavy assets.
- No large spritesheets.
- No unbounded particles.
- No animation that causes excessive React re-renders.
- Prefer transforms over layout changes.
- Keep map data small.
- Keep props few.
- Use requestAnimationFrame carefully if needed.
- Stop loops on unmount.
- Maintain compatibility with static export.
- Respect GitHub Pages `basePath` for all local assets.

Performance success test:

- The page must feel responsive on a normal laptop.
- The page must remain usable on a normal mobile device.
- The global audio player must not lag because of map rendering.

---

## 15. SEO and routing

Drift Map is an experience page, not a primary SEO page.

Rules:

- Keep metadata clean and honest.
- Do not add hidden SEO text.
- Do not over-optimize `/drift-lab`.
- Do not add schema that visible content cannot support.
- `/drift-lab` may be excluded from sitemap until promoted, or included with low priority if intentionally public.
- `/drift` remains the public stable route until promotion is explicitly approved.

---

## 16. Promotion strategy

The Drift Map must not replace `/drift` until:

1. V0 is usable on desktop.
2. V0 is usable on mobile or has a solid fallback.
3. Audio global behavior is stable.
4. Navigation does not break.
5. Build and lint pass.
6. Base path is correct.
7. The experience feels MISWAY, not gadget.
8. The human reviewer explicitly approves promotion.

Promotion path:

1. Build `/drift-lab`.
2. Validate manually.
3. Improve V0.
4. Decide whether to replace `/drift`.
5. Keep old Drift as fallback or archive component if useful.

---

## 17. Stop conditions

Stop immediately and report if:

- Build fails.
- Lint fails without clear fix.
- A second audio player is introduced.
- `/drift` is replaced before approval.
- A new dependency is added in V0.
- WebGL is added in V0.
- `tracks.ts` is polluted with spatial map data.
- GitHub Pages `basePath` is broken.
- The global player loses loop/next/previous/seek behavior.
- Mobile becomes unusable.
- Motion cannot be reduced.
- Design becomes cheap, noisy, or gimmicky.
- The music becomes secondary.

---

## 18. Success criteria

### Product success

- User understands quickly what to do.
- User can launch a track easily.
- User feels a distinct MISWAY world.
- User smiles without being lost.
- User can still access the normal catalogue.
- The music remains the point.

### Technical success

- `npm run build` passes.
- `npm run lint` passes if lint is available.
- Static export remains compatible.
- Global audio remains intact.
- No new dependency in V0.
- Mobile path works or fallback works.
- No major accessibility regression.

### Creative success

- Strange but not confusing.
- Loufoque but not clownish.
- Minimal but not empty.
- Premium but not sterile.
- Playable but not game-first.

---

## 19. First execution recommendation

The next lot after this documentation foundation must be:

`DRIFT-AUDIT-00 — Audit technique préparatoire`

Do not start implementation before that audit.
