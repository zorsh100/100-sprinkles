# 🍩 100 Sprinkles — Game Spec (Current Build + Roadmap)

## 1. Overview

**100 Sprinkles** is an adaptive K–8 bakery math game that grows from picture-first counting into a light bakery simulator.

Current build goals:
- keep math embedded in bakery actions rather than abstract worksheets
- adapt challenge in real time using Skill Rating (SR)
- make progression feel playful, readable, and kid-first
- gradually layer in pantry, economy, and strategy systems
- present the whole game as a warm bakery world rather than a generic dashboard or worksheet

---

## 2. Skill Rating System (SR)

### Scale: 0–1000

| SR Range | Band |
|----------|------|
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
- Question difficulty targets `SR ± 20`
- SR gains/losses are affected by correctness, challenge level, streak, and number of attempts
- Visual-mode SR movement is softened so younger players are not pushed around as sharply

### Current SR Modes

| SR | Mode |
|----|------|
| 0–79 | Visual Arithmetic |
| 80–109 | Visual Bridge |
| 110–299 | Story Math |
| 300–499 | Pantry Math |
| 500–699 | Full Simulator |
| 700+ | Strategy Mode |

---

## 3. Player Model

```json
{
  "username": "string",
  "grade": "K-8",
  "SR": 350,
  "bank": 25,
  "sprinkles": 0,
  "skill": {
    "totalAnswered": 0,
    "correctAnswered": 0,
    "currentStreak": 0,
    "bestStreak": 0,
    "lastDelta": 0,
    "lastQuestionType": "arithmetic_visual",
    "recentResults": []
  },
  "pantry": {
    "flour": 0,
    "sugar": 0,
    "eggs": 0
  },
  "knownRecipes": ["cupcakes", "cookies", "donuts", "muffins"],
  "createdAt": 0
}
```

Notes:
- `bank` stores coins
- `sprinkles` is the current secondary reward currency in the shipped build
- `skill` tracks long-term accuracy and streak data
- `knownRecipes` is the normalized recipe list field used by the current save format
- the current save normalizer still accepts legacy `unlockedRecipes` and converts it into `knownRecipes`
- `knownRecipes` represents recipes the player knows about; the visible bake menu still filters by SR unlock thresholds

---

## 4. Session Model

```json
{
  "selectedRecipeId": "cupcakes",
  "batchCount": 1,
  "order": null,
  "saleReady": null,
  "recentSale": null,
  "recentSales": [],
  "pendingRecipeUnlocks": [],
  "currentQuestion": null,
  "questionResult": null,
  "recentTemplates": []
}
```

Important behavior:
- `saleReady` stores the finished bake waiting to be sold
- `recentSale` stores the most recently sold bake for the report screen
- `recentSales` stores the last 5 sold bakes, newest first
- `recentTemplates` helps avoid repetitive question scenes

---

## 5. Onboarding

### Flow
1. Pick a save slot
2. Enter username / chef name
3. Select grade
4. Initialize SR
5. Open bakery

```javascript
const GRADE_TO_SR = {
  K: 50, 1: 150, 2: 250, 3: 350,
  4: 450, 5: 550, 6: 650, 7: 750, 8: 850
}
```

### Bank Unlock
```javascript
if (SR >= 300) player.bank = 25
```

### Current Onboarding UX
- the shipped onboarding screen uses a 3×3 grade grid for K–8
- Kindergarten is selected by default and starts at `SR 50`
- the player enters a chef name, not a generic profile field
- Start Baking stays disabled until the name is valid and a grade is selected
- valid names must contain at least 2 alphabetic characters
- the grade preview card updates live as the selected grade changes

### Save Slots
- The current build supports **2 separate player save slots** in the same browser
- Players can start a new notebook in either slot
- Players can switch notebooks from the title or settings screen
- Clearing one slot does not wipe the other
- Legacy single-save data is migrated into Player 1 automatically

---

## 6. Screen Flow

Current major screens:
- Title
- Profile / Onboarding
- Bake Menu
- Active Bake
- Unlock
- Bakery Report / Stats
- Settings
- Pantry Shop
- Math Lab / Learn

UI direction:
- warm bakery visual language
- bakery-counter background art, sprinkle texture, and storefront-style title presentation
- mascot-guided feedback on title, onboarding, bake-complete, and report moments
- visual math scenes instead of plain prompts whenever possible
- colorful, game-like answer choices rather than form-like buttons
- kid-first copy and celebration moments
- controlled UI icons for important items like coins so rendering does not depend on system emoji fonts

---

## 7. Question System

### Unified Model

```javascript
Question = {
  type: string,
  subtype: string,
  stage: string,
  difficulty: number,
  steps: number,
  generateParams: fn,
  render: fn,
  solve: fn
}
```

### Current Allowed Types by SR
- `arithmetic_visual` below SR 110
- `arithmetic`, `cost` at SR 110+
- `business`, `fraction` at SR 300+
- `ratio` at SR 700+
- `algebraic` at SR 800+
- `optimization` at SR 900+

### Generator Rule

```javascript
function generateQuestion({ SR, stage, context }) {
  const targetDS = SR + rand(-20, +20)

  const candidates = QUESTION_BANK.filter(q =>
    allowedTypes(SR).includes(q.type) &&
    Math.abs(q.difficulty - targetDS) <= 30 &&
    (SR < 110 || q.stage === stage)
  )

  const template = weightedPick(candidates)
  const params = generateParams(template, targetDS)

  return instantiate(template, params)
}
```

### Current Template Direction
- Story Math prompts are now written as bakery actions, not generic school math
- word problems should reference the current recipe, current stage, pantry items, trays, toppings, counters, customers, or bakery earnings
- low-SR prompts use shorter sentences and simpler vocabulary
- higher-SR prompts can introduce terms like `cost`, `total`, `profit`, `revenue`, and `per tray` / `per batch`
- wrong-answer hints should explain the math move in one plain sentence
- many Story Math templates now include lightweight `scene` metadata so the renderer can show grouped bakery visuals above the prompt

---

## 8. Kindergarten + Bridge Modes

### Rules
- SR below 110 stays visual-first
- SR below 80 is pure visual arithmetic
- SR 80–109 is a bridge band that still leans heavily on visual support
- No plain worksheet presentation
- Visual trays, grouped bakery scenes, and picture-driven choices are preferred
- answer targets are large, colorful, and game-like so the interaction reads as play, not a form

---

## 9. Bake Structure

Stages:
- prep
- mixing
- timing
- finishing
- serving

Active bake behavior:
- one math challenge advances one stage
- correct answers move the bake forward
- wrong answers keep the player on the same stage and count against bake accuracy
- each order tracks its own `totalAttempts` and `correctAnswers`

---

## 10. Pantry System (SR ≥ 300)

```javascript
player.pantry = {
  flour: number,
  sugar: number,
  eggs: number
}
```

Current behavior:
- pantry requirements are calculated from recipe ingredients × batch count
- players can quick-buy missing items from the pantry/shop flow
- bake start is blocked if the pantry does not cover required ingredients
- the current recipe screen surfaces a prominent restock warning banner when the player is blocked
- pantry restocking uses ingredient-specific shop cards with tinted backgrounds and explicit buy costs
- batch count uses a custom stepper instead of a native browser spinner once sets unlock
- ingredient costs:
  - flour = 2
  - sugar = 3
  - eggs = 4

---

## 11. Recipe System

### Current Live Recipes
- cupcakes
- cookies
- donuts
- muffins

### Planned / Roadmap Unlockables
- brownies
- sugar cookies
- cake
- macarons
- cinnamon rolls
- ice cream sandwiches
- cheesecake slices
- pies

Recipe data currently includes:
- icon
- unlock SR
- base coin reward
- sprinkle reward
- difficulty bonus
- ingredient needs

Current recipe-menu behavior:
- the player model starts with the 4 starter recipes in `knownRecipes`
- the UI still filters which recipes are actually selectable by `unlockSR`
- recipe cards show ingredient and reward summaries with explicit text+icon labels to avoid ambiguous emoji fallbacks

---

## 12. Economy and Rewards

### Coins
The shipped UI now uses a controlled **gold coin icon** rather than relying on system emoji rendering, so coin rewards and costs stay readable across platforms.

Base bake value currently comes from:

```javascript
baseRevenue = recipe.baseReward * batchCount + floor(SR / 80) + recipe.difficultyBonus
```

### Accuracy-Based Bake Payout
The shipped build now ties coin earnings to **that bake’s accuracy**:

```javascript
earnedCoins = round(baseRevenue * correctAnswers / totalAttempts)
```

Rules:
- minimum payout is `1` coin
- perfect accuracy earns full bake value
- extra wrong attempts reduce payout proportionally
- the bake-complete screen and Bakery Report show both:
  - earned coins
  - base coins
  - bake accuracy percent

### Sprinkles
Current shipped earn triggers:
- `+2 sprinkles` for each correct answer in a bake
- `+recipe.sprinkleReward × batchCount` when the bake is sold

---

## 13. Simulator Loop

Current loop:
1. Choose recipe
2. Choose batch count when unlocked
3. Check pantry
4. Shop if needed
5. Solve stage-based bakery math
6. Finish bake
7. See a celebration state with mascot feedback
8. Serve and sell goods
9. Update coins, sprinkles, SR, and history

---

## 14. Bakery Report

The report screen now includes:
- latest sold bake summary
- coins, sprinkles, SR, and mode snapshot
- long-term player accuracy and streak pills
- mascot-guided celebration messaging
- **history of the last 5 sold bakes**, including the most recent one

Each history item can include:
- recipe
- time sold
- batch count
- earned coins vs base coins
- bake accuracy
- sprinkles earned

---

## 15. Save System

Current implementation uses `localStorage` with a versioned multi-slot payload.

Conceptually:

```javascript
{
  version: 3,
  activeSaveSlot: "slot-1",
  saveSlots: [
    { id: "slot-1", player, session, flash, savedAt },
    { id: "slot-2", player, session, flash, savedAt }
  ]
}
```

Behavior:
- save on render/update
- 2 player notebooks per browser
- active slot switching without losing the other save
- per-slot reset
- migration support for older single-save payloads

---

## 16. Current Design Principles

1. One adaptive SR-driven math system
2. Bakery actions should frame every question
3. UI should feel playful, warm, and readable for kids
4. Progression should add complexity gradually
5. Reports and rewards should explain outcomes clearly
6. Systems should support both quick play and longer-term progression

---

## 17. Current MVP+ Scope

Shipped in the current build:
- SR system with visual bridge
- adaptive question generator
- 4 live starter recipes
- pantry/shop loop
- settings, shop, and learn screens
- 2-player local save system
- bakery report with last-5 bake history
- accuracy-based bake coin rewards
- bakery-themed visual scenes and improved answer-button presentation
- storefront-style title screen, mascot, and celebration states
- pantry restock alert, custom set stepper, and ingredient-tinted shop cards
- controlled gold coin icon treatment to avoid gray emoji fallback issues

---

## 18. Long-Term End State

A game that evolves from:

Visual counting → Story math → Pantry math → Simulation → Strategy
