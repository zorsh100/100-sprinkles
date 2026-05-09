# 🍩 100 Sprinkles — Game Spec (MVP → Advanced Simulator)

## 1. Overview

**100 Sprinkles** is an adaptive math-based bakery simulator for grades K–8.

- Players solve math problems to progress
- Difficulty adapts in real time using a Skill Rating (SR)
- Gameplay evolves into a bakery simulation with economy, recipes, and strategy

---

## 2. Skill Rating System (SR)

### Scale: 0–1000

| SR Range | Grade |
|----------|-------|
| 0–99     | Kindergarten |
| 100–199  | 1st |
| 200–299  | 2nd |
| 300–399  | 3rd |
| 400–499  | 4th |
| 500–599  | 5th |
| 600–699  | 6th |
| 700–799  | 7th |
| 800–899  | 8th |
| 900–1000 | Advanced |

### Core Rule
Question Difficulty ≈ SR ± 20

---

## 3. Player Model

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
  "unlockedRecipes": ["cupcakes", "cookies", "donuts", "muffins"],
  "createdAt": 0
}
```

---

## 4. Onboarding

### Flow
1. Enter username
2. Select grade
3. Initialize SR

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

---

## 5. Game Modes by SR

| SR | Mode |
|----|------|
| 0–99 | Visual arithmetic (no reading) |
| 100–299 | Word problems + basic baking |
| 300–499 | Pantry + cost system |
| 500–699 | Full simulator |
| 700+ | Strategy + optimization |

---

## 6. Question System

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

---

## 7. Question Types

- arithmetic
- arithmetic_visual (K only)
- geometry
- fraction
- cost
- business
- logic
- ratio (700+)
- algebraic (800+)
- optimization (900+)

---

## 8. Generator

```javascript
function generateQuestion({ SR, stage, context }) {
  const targetDS = SR + rand(-20, +20)

  const candidates = QUESTION_BANK.filter(q =>
    allowedTypes(SR).includes(q.type) &&
    Math.abs(q.difficulty - targetDS) <= 30 &&
    (SR < 100 || q.stage === stage)
  )

  const template = weightedPick(candidates)
  const params = generateParams(template, targetDS)

  return instantiate(template, params)
}
```

---

## 9. Kindergarten Mode

### Rules
- No text-based questions
- Visual arithmetic only

```javascript
if (SR < 100) {
  allowedTypes = ["arithmetic_visual"]
}
```

---

## 10. Bake Structure (SR ≥ 100)

Stages:
- prep
- mixing
- timing
- finishing
- serving

---

## 11. Pantry System (SR ≥ 300)

```javascript
player.pantry = {
  flour: number,
  sugar: number,
  eggs: number
}
```

---

## 12. Recipe System

### Starter Recipes
- cupcakes
- cookies
- donuts
- muffins

### Unlockable Recipes
- brownies
- sugar cookies
- cake
- macarons
- cinnamon rolls
- ice cream sandwiches
- cheesecake slices
- pies

---

## 13. Simulator Loop (SR ≥ 300)

1. Choose recipe  
2. Choose batches  
3. Check pantry  
4. Shop if needed  
5. Solve math questions  
6. Produce goods  
7. Sell goods  
8. Update bank  

---

## 14. Save System (GitHub Pages)

```javascript
localStorage.setItem("player", JSON.stringify(player))
```

---

## 15. Core Design Principles

1. One adaptive system (no forks)
2. SR drives everything
3. Math drives gameplay
4. Progression adds complexity
5. Simulation emerges gradually

---

## 16. MVP Scope

- SR system
- Question generator
- 4 starter recipes
- Basic bake loop
- localStorage save

---

## 17. End State

A game that evolves from:

Visual counting → Word problems → Simulation → Strategy
