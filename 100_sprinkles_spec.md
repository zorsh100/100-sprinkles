# 🍩 100 Sprinkles — Game Spec

## 1. Overview

**100 Sprinkles** is an adaptive math-based bakery simulator for grades K–8.

- Players solve math problems to progress through bakery stages
- Difficulty adapts in real time using a Skill Rating (SR)
- Sprinkles are earned by answering correctly and unlock new recipes
- Coins are earned by selling bakes and spent in the ingredient shop
- Gameplay evolves from visual counting into a full bakery simulation with economy, recipes, and strategy

---

## 2. Dual Progression System

The game has two separate systems that do different jobs and should never be conflated in the UI.

| System | Purpose | Direction |
|--------|---------|-----------|
| Skill Rating (SR) | Controls question difficulty and game mode | Up and down |
| Sprinkles | Rewards effort and unlocks recipes | Only up |

**SR is a calibrator, not a reward.** It fluctuates to find the player's true level. A player who gets answers wrong will drop in SR — this is intentional.

**Sprinkles are always positive.** Every correct first-attempt answer earns sprinkles regardless of SR movement. A struggling player still makes sprinkle progress.

The UI should reflect this distinction:
- Show sprinkles prominently as a progress bar with a clear next-unlock goal
- Show SR quietly — in a stats screen or as the mode label (e.g. "Pantry Math") — never in a way that feels like punishment when it drops

---

## 3. Skill Rating System (SR)

### Scale: 0–1000

| SR Range | Grade Band |
|----------|-----------|
| 0–79 | Kindergarten |
| 80–109 | Kindergarten Bridge |
| 110–199 | 1st Grade |
| 200–299 | 2nd Grade |
| 300–399 | 3rd Grade |
| 400–499 | 4th Grade |
| 500–599 | 5th Grade |
| 600–699 | 6th Grade |
| 700–799 | 7th Grade |
| 800–899 | 8th Grade |
| 900–1000 | Advanced |

### Core Rule
Question Difficulty ≈ SR ± 20

### SR Delta Rules
- Correct answer (first attempt): +8 to +18 depending on challenge offset and streak
- Correct answer (retry): reduced delta
- Wrong answer: −3 to −11
- Visual mode (SR < 110): deltas are dampened (×0.65) to avoid rapid swings for young players

### What SR Controls
- Question difficulty and type pool
- Game mode (Visual / Story / Pantry / Simulator / Strategy)
- Pantry system unlock (SR ≥ 300)
- Batch size unlock (SR ≥ 400)
- Advanced question types (ratio 700+, algebraic 800+, optimization 900+)

### What SR Does NOT Control
- Recipe unlocks (controlled by sprinkles)

---

## 4. Sprinkles System

Sprinkles are the progression/XP currency. They accumulate indefinitely with no cap.

### Earn Rate
- +1 sprinkle per correct answer on the first attempt
- +0 sprinkles for answers requiring multiple attempts
- +recipe.sprinkleReward per completed bake
- +1 bonus sprinkle when current streak ≥ 5

### Recipe Unlock Thresholds

| Sprinkles | Recipe Unlocked |
|-----------|----------------|
| 0 | Cupcakes (starter) |
| 0 | Cookies (starter) |
| 0 | Donuts (starter) |
| 8 | Muffins ← first unlock, ~2–3 bakes |
| 20 | Brownies |
| 35 | Sugar Cookies |
| 55 | Cake |
| 75 | Cinnamon Rolls |
| 100 | Macarons |
| 130 | Ice Cream Sandwiches |
| 165 | Cheesecake Slices |
| 200 | Pies |

### Unlock Logic
```javascript
// Recipe is available when:
player.sprinkles >= recipe.unlockSprinkles

// Newly unlocked after an answer:
getNewlyUnlockedRecipes(previousSprinkles, currentSprinkles, player.unlockedRecipes)
```

### HUD Display
- Show: "✨ 12 sprinkles"
- Progress bar beneath showing % toward next recipe unlock
- Bar label: "Next unlock at ✨ 20"
- When all recipes unlocked: "⭐ Full menu unlocked"

---

## 5. Player Model

```json
{
  "username": "string",
  "grade": "K-8",
  "SR": 350,
  "bank": 25,
  "sprinkles": 0,
  "pantry": {
    "flour": 0,
    "sugar": 0,
    "eggs": 0
  },
  "skill": {
    "totalAnswered": 0,
    "correctAnswered": 0,
    "currentStreak": 0,
    "bestStreak": 0,
    "lastDelta": 0,
    "lastQuestionType": "arithmetic_visual",
    "recentResults": []
  },
  "unlockedRecipes": ["cupcakes", "cookies", "donuts"],
  "createdAt": 0
}
```

Note: `unlockedRecipes` starts with only the three zero-threshold starters. Muffins unlock at 8 sprinkles.

---

## 6. Onboarding

### Flow
1. Enter chef name (minimum 2 alphabetical characters)
2. Select grade (defaults to Kindergarten)
3. Initialize SR from grade
4. Navigate to recipe screen

```javascript
const GRADE_TO_SR = {
  K: 0, 1: 150, 2: 250, 3: 350,
  4: 450, 5: 550, 6: 650, 7: 750, 8: 850
}
```

### Bank Unlock
```javascript
if (SR >= 300) player.bank = 25
```

### Start Baking button
Disabled until chef name has at least 2 alphabetical characters and a grade is selected.

---

## 7. Game Modes by SR

| SR | Mode | What Changes |
|----|------|-------------|
| 0–79 | Visual Arithmetic | Picture-only questions, no reading |
| 80–109 | Visual Bridge | Transitional — still visual, slightly more complex |
| 110–299 | Story Math | Word problems, bakery context |
| 300–499 | Pantry Math | Pantry + ingredient cost system active |
| 500–699 | Full Simulator | Batch sets, full economy |
| 700+ | Strategy Mode | Ratio, optimization, advanced math |

---

## 8. Question System

### Unified Model

```javascript
Question = {
  type: string,
  subtype: string,
  stage: string,
  difficulty: number,
  steps: number,
  templateId: string,
  generateParams: fn,
  render: fn,
  solve: fn,
  hint: string  // one plain sentence explaining the math concept
}
```

### Question Writing Rules
- Every question is set inside the bakery — reference trays, ovens, customers, ingredients, coins
- Use the active recipe name where possible ("You loaded 3 trays of cookies" not "3 trays of treats")
- One or two short sentences maximum
- Vocabulary matches SR level:
  - SR 110–299: simple words, short sentences
  - SR 300–499: introduce "cost," "total," "each"
  - SR 500+: introduce "profit," "revenue," "per batch"
- Hint text explains the math in one plain sentence, does not repeat the question

### Example Rewrites
- ❌ "2 trays. 4 coins each. How many coins?" → ✅ "You loaded 2 trays into the oven, 4 cupcakes each. How many cupcakes are baking?"
- ❌ "13 sprinkles. Then 5 more. How many now?" → ✅ "Your mixing bowl had 13 sprinkles. You added 5 more. How many are in the bowl?"
- ❌ "A baker has 3 groups of 4." → ✅ "You packed 3 boxes of muffins with 4 muffins in each box. How many muffins did you pack?"

---

## 9. Question Types

| Type | SR Unlock | Notes |
|------|-----------|-------|
| arithmetic_visual | 0 | K only, picture counting |
| arithmetic | 110 | Basic operations |
| cost | 110 | Prices and totals |
| fraction | 300 | Halves, quarters |
| business | 300 | Profit, revenue |
| ratio | 700 | Ratios and rates |
| algebraic | 800 | Simple algebra |
| optimization | 900 | Maximize/minimize |

---

## 10. Generator

```javascript
function generateQuestion({ SR, stage, context, recentTemplates }) {
  const targetDS = SR + rand(-20, +20)

  const candidates = QUESTION_BANK.filter(q =>
    allowedTypes(SR).includes(q.type) &&
    Math.abs(q.difficulty - targetDS) <= 30 &&
    (SR < 110 || q.stage === stage) &&
    !recentTemplates.slice(-6).includes(q.templateId)
  )

  const template = weightedPick(candidates, t =>
    1 / (1 + Math.abs(t.difficulty - targetDS))
  )
  const params = generateParams(template, targetDS)

  return instantiate(template, params)
}
```

`weightedPick` favors templates whose difficulty is closest to the target. Templates seen in the last 6 questions are excluded to avoid repetition.

---

## 11. Visual Math Mode (SR < 110)

### Rules
- No text-based questions
- Picture groups illustrate the arithmetic
- Same emoji for both groups (quantity matters, not variety)
- A visible operator symbol (＋ / ×) appears between groups in the scene
- Scene label describes what's happening ("OVEN TRAY" not "TRAY SALES")

```javascript
if (SR < 110) {
  allowedTypes = ["arithmetic_visual"]
}
```

---

## 12. Bake Structure (SR ≥ 110)

Five stages per bake, one math question per stage:

| Stage | Icon | Title |
|-------|------|-------|
| prep | 🥣 | Prep Station |
| mixing | 🌀 | Mixing Bowl |
| timing | ⏲️ | Oven Timer |
| finishing | 🍓 | Finishing Touches |
| serving | 🧁 | Serving Counter |

Progress bar shows completed stages (✓), active stage (highlighted), and upcoming stages.

---

## 13. Pantry System (SR ≥ 300)

```javascript
player.pantry = {
  flour: number,
  sugar: number,
  eggs: number
}
```

- Pantry badges are hidden from the UI when SR < 300
- Ingredients are deducted when a bake starts
- Player must shop if pantry is insufficient
- Shop shows coin cost on the buy button: "Buy 2 — 🪙4"

### Ingredient Costs
| Ingredient | Cost per unit |
|-----------|--------------|
| flour | 2 coins |
| sugar | 3 coins |
| eggs | 4 coins |

---

## 14. Recipe System

### All Recipes

| Recipe | Unlock | Base Coins | Sprinkle Reward | Ingredients |
|--------|--------|-----------|----------------|-------------|
| Cupcakes | 0 ✨ | 12 | 6 | 🌾×2 🍬×2 🥚×1 |
| Cookies | 0 ✨ | 12 | 6 | 🌾×2 🍬×1 🥚×1 |
| Donuts | 0 ✨ | 15 | 8 | 🌾×3 🍬×2 🥚×1 |
| Muffins | 8 ✨ | 18 | 9 | 🌾×3 🍬×2 🥚×2 |
| Brownies | 20 ✨ | 20 | 10 | TBD |
| Sugar Cookies | 35 ✨ | 22 | 11 | TBD |
| Cake | 55 ✨ | 26 | 13 | TBD |
| Cinnamon Rolls | 75 ✨ | 28 | 14 | TBD |
| Macarons | 100 ✨ | 32 | 16 | TBD |
| Ice Cream Sandwiches | 130 ✨ | 35 | 17 | TBD |
| Cheesecake Slices | 165 ✨ | 38 | 19 | TBD |
| Pies | 200 ✨ | 42 | 21 | TBD |

Ingredient costs and rewards for unlockable recipes (Brownies onward) are TBD and should be set when those recipes are built.

---

## 15. Simulator Loop (SR ≥ 300)

1. Choose recipe
2. Choose batch sets (SR ≥ 400 unlocks multiple sets, max 6)
3. Check pantry
4. Shop if needed
5. Solve 5 math questions (one per stage)
6. Bake completes → saleReady state
7. Sell goods → earn coins + sprinkles
8. Update bank and sprinkle count
9. Check for new recipe unlocks

---

## 16. Coin Economy

- Coins are earned by selling completed bakes
- Coins are spent in the ingredient shop
- Revenue formula: `recipe.baseReward × batchCount + SR bonus`, where the SR bonus is capped at 10% of the base bake value
- Starting bank: 0 coins (35 coins if SR ≥ 300 at onboarding)
- Coins have no cap

---

## 17. Answer Buttons

- Four options per question, one correct
- Button colors: top-left coral, top-right yellow, bottom-left teal, bottom-right purple
- White bold text, minimum 32px
- On tap: flash brighter → show correct/incorrect feedback
- Correct: green highlight, SR delta shown
- Incorrect: red highlight, hint shown, question remains active for retry

---

## 18. Baker Character (Mascot)

A friendly baker character (pink face, chef hat) appears on key screens:

| Screen | Expression |
|--------|-----------|
| Stats (accuracy ≥ 90%) | Big smile, star-burst animation |
| Stats (accuracy 60–89%) | Happy neutral |
| Stats (accuracy < 60%) | Sympathetic, encouraging |
| Recipe unlock | Maximum excitement — jumping or stars |
| Title/onboarding | Welcoming wave |

Expressions use CSS class swaps, not separate image assets.

---

## 19. Save System

```javascript
localStorage.setItem("sprinkles-100-player", JSON.stringify({
  version: 3,
  savedAt: Date.now(),
  player,
  session,
  flash
}))
```

### Version Migration
- v1 → v2: added skill object
- v2 → v3: sprinkles now drive recipe unlocks (not SR); carry forward existing sprinkle count as-is
- Corrupt saves show a friendly message and reset to a fresh state

---

## 20. Core Design Principles

1. **SR calibrates, sprinkles reward** — never conflate the two systems
2. **Math drives gameplay** — every progression gate is a math question
3. **Bakery context always** — no abstract math, everything is set in the bakery
4. **Progression adds complexity** — new mechanics emerge gradually as SR rises
5. **Early wins matter** — Muffins unlock at 8 sprinkles (~2–3 bakes) so players feel progress quickly
6. **Struggling players still advance** — sprinkles reward attempts and completed bakes, not just perfect scores

---

## 21. End State

A game that evolves from:

Visual counting → Word problems → Pantry math → Full simulator → Strategy & optimization
