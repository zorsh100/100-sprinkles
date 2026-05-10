# 100 Sprinkles — Agent Instructions

## Overview

100 Sprinkles is an adaptive K–8 bakery math game that grows from picture-first counting into a light bakery simulator.

Current gameplay pillars:
- solve adaptive bakery-themed math questions
- move a bake through stage-based bakery stations
- restock ingredients and manage a simple pantry economy
- sell finished bakes for coins
- earn sprinkles as a secondary reward
- unlock more complex systems as SR rises

This project should feel like a warm, playful bakery world first and a worksheet never.

## Current Technical Constraints

- Vanilla JS only
- No framework dependency
- Must run as a static site
- Must work on GitHub Pages
- `localStorage` for saves
- No backend
- Keep asset cache-busting query strings in sync when JS/CSS behavior changes

## Architecture Rules

- Use modular JS files
- Keep rendering separate from game logic
- Keep state/save logic in `src/state.js`
- Keep adaptive question generation flowing through `src/game/questions/generator.js`
- Keep SR logic centralized in `src/game/sr.js`
- Keep bakery progression/economy logic in `src/game/engine.js`
- Prefer extending existing helpers/screens instead of adding duplicate flows
- Avoid giant multi-purpose files when a concern already has a home

## Current SR Rules

- SR target window is `SR ± 20`
- `0–79` = Visual Arithmetic
- `80–109` = Visual Bridge
- `110–299` = Story Math
- `300–499` = Pantry Math
- `500–699` = Full Simulator
- `700+` = Strategy Mode

Question type rules:
- below `110`: `arithmetic_visual` only
- `110+`: `arithmetic`, `cost`
- `300+`: add `business`, `fraction`
- `700+`: add `ratio`
- `800+`: add `algebraic`
- `900+`: add `optimization`

Do not hardcode difficulty by grade or route. SR remains the global difficulty driver.

## Current Save Rules

- The current build supports **2 local save slots** in one browser
- Each slot stores its own `player`, `session`, `flash`, and `savedAt`
- Legacy single-save payloads must still migrate cleanly into Player 1
- Resetting one slot must not clear the other slot
- New UI or flow work must respect the active save slot

## Current Data Expectations

Player model currently includes:
- `username`
- `grade`
- `SR`
- `bank`
- `sprinkles`
- `skill`
- `pantry`
- `knownRecipes`
- `createdAt`

Session model currently includes:
- `selectedRecipeId`
- `batchCount`
- `order`
- `saleReady`
- `recentSale`
- `recentSales`
- `pendingRecipeUnlocks`
- `currentQuestion`
- `questionResult`
- `recentTemplates`

`recentSales` should stay capped at the last 5 sold bakes.

## Bake and Economy Rules

Current live recipes:
- cupcakes
- cookies
- donuts
- muffins

Current pantry ingredients:
- flour
- sugar
- eggs

Current economy behavior:
- base bake value comes from recipe reward + SR scaling + recipe difficulty bonus
- final coin payout is tied to **that bake’s accuracy**
- each bake tracks its own `totalAttempts` and `correctAnswers`
- wrong attempts reduce the final coin payout proportionally
- correct answers still award `+2 sprinkles`
- selling a finished bake also awards recipe sprinkle rewards

When editing bake flow, keep the payout/report/UI copy aligned with the actual reward logic.

## UI Rules

- Preserve the warm bakery visual language
- Keep the mascot, celebration moments, and kid-first tone
- Prefer bakery-context phrasing over abstract math wording
- Avoid plain form-like UI when a bakery-styled panel/card treatment fits
- Keep answer buttons bold, colorful, and touch-friendly
- Maintain strong mobile behavior and clean scrolling
- Prefer controlled icon treatments over unreliable emoji fallbacks when rendering is inconsistent
- Visual scenes should describe what is happening in the bake, not generic dashboard labels

Stage language currently centers on:
- prep
- mixing
- timing
- finishing
- serving

## Report and Feedback Rules

- Bakery Report should show the most recent sold bake clearly
- Bakery Report should also show the last 5 sold bakes, newest first
- If a reward changes because of accuracy, the UI should explain it
- Flash/callout copy should stay short, positive, and readable for kids
- Do not let feedback regress into generic debug-style phrasing

## Working Style for Future Changes

- Inspect current files before editing; do not rely on stale assumptions
- Prefer cohesive system-level fixes over isolated patches
- If you change JS behavior, run `node --check` on touched JS files
- If you change frontend assets or imports, keep the cache-busting version strings synchronized
- When updating docs, distinguish clearly between current shipped behavior and roadmap ideas

## Important

Do not fork the game into separate difficulty systems.
Do not remove the bakery framing from questions.
Do not add features that break static hosting or local save behavior.
Do not regress the current two-player saves, last-5 bakery report history, or accuracy-based bake payouts.
