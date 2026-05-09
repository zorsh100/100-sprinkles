# 100 Sprinkles — Agent Instructions

## Overview

100 Sprinkles is an adaptive K–8 bakery simulator game.

Core gameplay:

* Solve adaptive math questions
* Run a bakery
* Buy ingredients
* Bake goods
* Sell baked goods
* Earn money and sprinkles
* Unlock recipes

## Technical Constraints

* Vanilla JS only
* No frameworks initially
* Must run on GitHub Pages
* localStorage for saves
* No backend

## Architecture Rules

* Use modular JS files
* Avoid giant files
* Keep rendering separate from game logic
* All question generation goes through generator.js
* SR system controls difficulty globally

## SR Rules

* 0–99 = Kindergarten visual arithmetic only
* 100+ = word problems
* 300+ = pantry + economy
* 700+ = advanced strategy

## UI Rules

* Bright colorful style
* Large touch-friendly buttons
* Mobile-friendly layout
* Stage backgrounds:

  * prep
  * mixing
  * timing
  * finishing
  * serving

## Important

Do NOT hardcode difficulty by level.
All questions must adapt dynamically using SR.
