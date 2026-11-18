# Cloudberry — A Cozy Climbing Adventure

A mobile-first React + TypeScript + Vite game, expanded in place from the original Cloudberry project. The existing fixed-step jumping, acceleration, edge wrapping, camera, altitude scoring, difficulties, feather boosts, audio and controls remain in use. Everything runs in the browser, without a backend or keys.

## Run and check

Node.js 20.19+ or 22.12+ recommended.

```sh
npm install
npm run dev
npm test
npm run build
```

Open Vite's local URL. For a phone on the same Wi-Fi, use your computer's LAN IP at port 5173. Hold either half of the sky to drift, or use arrows / A / D. Escape, a tab change, or a window blur pauses. Stars and milestones are credited when a run ends; abandoning or restarting an unfinished run forfeits its earnings.

Production output is `dist/`. The tracked `.openai/hosting.json` preserves the existing Site identity. Google Fonts is an optional cosmetic request with local font fallbacks. Character art, world art, collectibles, and wearables are original Canvas/CSS shapes. Lucide supplies UI icons. No new runtime dependencies were needed for this expansion.

## The Little Boutique

Five cosmetic-only characters: Berri the Bunny (free), Mochi the Cat (400 stars), Pip the Bear (500), Clover the Frog (600), and Puff the Cloud (800). Six color palettes and fifteen wearables are defined in `src/catalog.ts`, each with a stable ID, price, description and equipment slot.

Browse categories and tap an item to try it in the dressing room. Previewing never changes gameplay equipment or spends stars. Unlock an item, then tap **Equip**. Already-owned items cannot be purchased again; insufficient balances disable purchase. Free “none” items remove hats, outfits or accessories.

Rendering layers run from back wearables to ears/body, outfit, face, headwear, and front accessories. A flower clip occupies the head decoration space and clears an equipped hat; equipping a hat clears a flower clip. Capes and back accessories are mutually exclusive. The boutique explains automatic removals. All five character silhouettes share the same collision box and movement abilities.

## Four worlds

| World | Lifetime stars | Mechanics |
| --- | ---: | --- |
| Cloud Garden | 0 | Flower platforms give a 15% higher bounce, drifting/fragile clouds, flower stars, butterflies and petals. |
| Peachy Sunset | 500 | 3-second gusts every 14 seconds; a direction ribbon; seaside rooftops, ocean waves and glowing boosts. |
| Moonlight Meadow | 1,500 | Mushroom platforms give a 22% higher bounce; optional fading/shadow steps; firefly clusters give 2 stars. |
| Starlight Dreams | 3,000 | Gravity is 22% lighter; orbiting platforms; portals raise the character about 95px onto a safe route; crystal clusters above 500m give 3 stars. |

Worlds unlock automatically and permanently from **lifetime stars**, which include difficulty-adjusted run rewards and achievement bonuses. Purchases reduce only **spendable stars**. Every world supports Easy, Medium and Hard. Base platform width, gap and player physics come from the original mode configuration. Moving-platform speed and avoidable side-hazard frequency scale with difficulty.

The generator maintains a reachable primary route. Temporarily invisible moonsteps are optional shortcuts, not mandatory jumps. Sunset routes use smaller horizontal changes to allow for wind. Portal destinations receive a stable landing platform. Rotating celestial artwork uses a flat, forgiving collision top. Hazards spawn far from the platform they accompany. Decorative parallax never participates in collisions.

## Progress and achievements

Progress uses the existing `localStorage` key **`cloudberry-save`**, now version 2. Older saves retain spendable stars, personal best, sound, difficulty and selected color; previously free pink and sage colors remain owned. Because the original version had no shop, its saved balance is a reliable starting lifetime total. The old best and stars become Cloud Garden statistics.

The save stores owned IDs, equipment, lifetime currency, selected/unlocked worlds, per-world best/collected stars and counters, maximum single-run stars, rewarded achievement IDs, and completed run IDs. World collection counts are pre-multiplier collectible values and exclude milestone bonuses. World cards show these totals; the home screen continues to show the global personal best.

Twelve milestones have separate progress bars and one-time rewards. New milestones pay automatically at the end of a run. A **Collect completed milestone rewards** button handles any already-completed statistics carried in a migrated save. Milestone rewards also advance lifetime unlocks, and never count as collected world stars.

Purchase and settlement operations re-read storage and use Web Locks where supported to serialize transactions across tabs. Unique run IDs prevent duplicate run credits. Reward IDs prevent duplicate achievement bonuses. Storage exceptions preserve a consistent in-memory session; Settings reports when permanent storage is unavailable. Persistence is browser-specific, and clearing browser data removes local progress.

## Source map

- `src/engine.ts`: original physics loop plus world platform behavior, wind, portals, generation, counters and run summaries.
- `src/GameCanvas.tsx`: Canvas loop, keyboard/touch input, pause, synthesized sound and run receipts.
- `src/catalog.ts`: characters, colors, cosmetics, stable IDs and compatibility rules.
- `src/characterArt.ts`: shared layered character renderer used in gameplay and boutique previews.
- `src/progression.ts`: versioned save migration, purchases, equipment, world selection, deduplicated run credits and the observable player store.
- `src/worlds.ts`: palettes, unlock thresholds, collectible names and mechanic descriptions.
- `src/worldArt.ts`: layered world backgrounds, platforms, hazards and collectible rendering.
- `src/achievements.ts`: reusable achievement definitions and one-time reward calculation.
- `src/components/`: Home, Boutique, CharacterPreview, Worlds and Achievements screens.
- `src/main.tsx`: existing application navigation, difficulty UI, settings and player-store wiring.
- `src/style.css`: preserved original design; `src/expansion.css`: boutique, worlds, milestones and mobile additions.
- `src/*.test.ts`: deterministic mechanics, route reachability, simulated controls, transaction, migration, storage and reward tests.

## Verification

The production TypeScript/Vite build and 72 tests pass. Route tests cover all 12 world/difficulty combinations and multiple seeded generations. Simulated-control tests exceed 100 landings in each combination; those isolate route physics by removing side hazards, whose spawn clearance is tested separately. Tests also cover collision, feather expiration, portals, wind, moonstep solidity, bounded object counts, purchase balance and deduplication, save reloads, legacy migration, world thresholds, equipment compatibility, one-time rewards, and full-storage fallback.

Actual Canvas output was rendered and visually reviewed for all five characters with every wearable and all four environments. Responsive CSS covers narrow portrait widths, scrollable boutique collections, large purchase controls, safe-area insets and reduced-motion preferences. The managed browser-control entrypoint was unavailable, so interactive browser layout, iPhone touch/audio behavior and measured device frame rate remain unverified.

## Journey chapters and a melody in every leap

Use **Journey chapters** on the home screen, or choose it alongside **Endless sky** under Play. Five authored Cloud Garden routes open in sequence: A First Little Leap, Petal Postcards, Vanishing Footsteps, Breeze Buddies, and The Garden in the Sky. Each works with the existing Easy/Medium/Hard physics and platform widths. Objectives mix finish altitude, collected stars, flower bounces, disappearing clouds, and a gentle timed breeze.

The finish garden is a broad, permanent flower platform. If a player arrives short on objective stars, it supplies only the missing goal stars; extra flower bounces can also be completed there. First clears award 50/75/100/125/150 bonus stars. Clearing the final chapter unlocks the existing Daisy Crown cosmetic if it is not already owned. Replays still earn collected stars but cannot repeat first-clear rewards. Failure saves collected run stars without unlocking the next route. Completed level IDs and personal bests persist in the existing save; earlier saves migrate with all existing progress intact.

**Jump-reactive music** is an independent, saved option in Settings, the chapter list, chapter briefing, and the in-game note button. It is off by default. Enable it and tap **Begin journey** (or touch a control in Endless mode) to unlock browser audio. The original 72 BPM score uses a repeating C major / A minor / F major / G harmony. Landing notes belong to the current chord; boosts add a rising flourish and collected stars add chimes. Height gradually introduces melody, bass and upper shimmer. Music pauses with the game and its audio context is released when leaving gameplay. Gentle sound effects remain independently selectable. There are no audio files, music APIs or added dependencies.

New modules: `src/levels.ts` for route definitions and objectives, `src/components/JourneyLevels.tsx` for chapter selection, `src/music.ts` for the Web Audio score, and `src/journey.css` for the new UI. `levels.test.ts` simulates all 15 level/difficulty combinations, checks finite generation and catch-up goals, and verifies one-time rewards and save migration. `music.test.ts` checks harmonic event notes and audio activation, muting, pause and cleanup. The expanded suite has 72 passing tests. Actual iPhone audio playback and browser touch/layout testing remain unverified because the managed browser entrypoint is unavailable.
