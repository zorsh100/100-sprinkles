import { MAX_SPRINKLES, RECIPES, STAGES, STAGE_META } from "../../game/data.js?v=20260510-054400";
import { renderCoinIcon, renderIngredientIcon } from "../components/icons.js?v=20260510-054400";
import { renderCelebrationBurst, renderMascot } from "../components/mascot.js?v=20260510-054400";
import {
  clampSprinkles,
  formatOrderCount,
  getMissingPantry,
  getOrderCount,
  getPantryNeed,
  getRecipeById,
  getSprinklePercent,
  getShopCost,
  getTotalShopCost,
  getUnlockedRecipes,
  srToBand,
  supportsRecipeSets,
} from "../../game/helpers.js?v=20260510-054400";
import { getSRMode, getSRWindow, isVisualMode } from "../../game/sr.js?v=20260510-054400";
import { renderKindergartenBakery } from "../renderers/kindergarten.js?v=20260510-054400";

const INGREDIENT_META = {
  flour: {
    label: "Flour",
    accentClass: "ingredient-flour",
    note: "Builds the base for cakes, cookies, and trays of treats.",
  },
  sugar: {
    label: "Sugar",
    accentClass: "ingredient-sugar",
    note: "Sweetens every bowl and helps finishing toppings shine.",
  },
  eggs: {
    label: "Eggs",
    accentClass: "ingredient-eggs",
    note: "Helps batter hold together when the oven gets warm.",
  },
};

export function renderBakeryScreen(gameState) {
  const { player, session } = gameState;
  const knownRecipes = RECIPES.filter((recipe) => player.knownRecipes.includes(recipe.id));
  const unlockedRecipes = getUnlockedRecipes(player);
  const selectedRecipe =
    knownRecipes.find((recipe) => recipe.id === session.selectedRecipeId && player.sprinkles >= recipe.unlockSprinkles) ??
    unlockedRecipes[0] ??
    knownRecipes[0] ??
    RECIPES[0];
  const orderCount = getOrderCount(player.SR, session.batchCount);
  const pantryNeed = selectedRecipe ? getPantryNeed(selectedRecipe, orderCount) : null;
  const currentStage = session.order ? STAGES[session.order.stageIndex] : "prep";
  const srWindow = getSRWindow(player.SR);

  if (session.order || session.saleReady) {
    if (isVisualMode(player.SR)) {
      return renderKindergartenBakery({ player, session, currentStage, selectedRecipe });
    }

    return renderBakeScreen(gameState, currentStage, srWindow);
  }

  return renderRecipeScreen(gameState, knownRecipes, unlockedRecipes, selectedRecipe, pantryNeed);
}

function renderRecipeScreen(gameState, knownRecipes, unlockedRecipes, selectedRecipe, pantryNeed) {
  const { player, session } = gameState;
  const orderCount = getOrderCount(player.SR, session.batchCount);
  const countLabel = formatOrderCount(player.SR, orderCount);
  const missingPantry = player.SR >= 300 && pantryNeed ? getMissingPantry(player, pantryNeed) : {};
  const isReadyToBake = Object.keys(missingPantry).length === 0;
  const isBlockedByPantry = player.SR >= 300 && !isReadyToBake;
  const missingCost = getTotalShopCost(missingPantry);

  return `
    <section class="flow-screen bakery-screen">
      <section class="panel bakery-hero-panel">
        <div class="section-head bakery-head">
          <div>
            <p class="eyebrow eyebrow-pill">Pick a Recipe</p>
            <h2>Bake Menu</h2>
            <p class="muted bakery-subcopy">Your bakery is booming. Pick a recipe and get the ovens going.</p>
          </div>
          <div class="badge bakery-unlock-badge">${formatRecipeCountBadge(unlockedRecipes.length)}</div>
        </div>
        <div class="hud-strip" aria-label="Bakery stats">
          <div class="hud-pill sr-pill">
            <span class="hud-label">Skill Rating</span>
            <strong class="hud-value">${player.SR}</strong>
          </div>
          <div class="hud-pill coin-pill">
            <span class="hud-label">${renderCoinIcon("coin-icon-sm")} Coins</span>
            <strong class="hud-value">${player.bank}</strong>
          </div>
          <div class="hud-pill sprinkle-pill">
            ${renderSprinkleHud(player)}
          </div>
          <div class="hud-pill mode-pill">
            <span class="hud-label">Math Mode</span>
            <strong class="hud-value hud-text">${getSRMode(player.SR)}</strong>
          </div>
        </div>
      </section>

      <section class="panel flow-screen recipe-selection-panel">
        <div class="section-head bakery-head">
          <div>
            <p class="eyebrow eyebrow-pill">Recipe Selection</p>
            <h2>Choose Today's Bake</h2>
            <p class="muted bakery-subcopy">${supportsRecipeSets(player.SR) ? "Pick a recipe, choose your baking sets, and restock anything the pantry needs." : "Pick a recipe and get the bakery ready."}</p>
          </div>
        </div>

        <div class="recipe-grid bakery-recipe-grid">
          ${knownRecipes
            .map((recipe) => {
              const isUnlocked = player.sprinkles >= recipe.unlockSprinkles;
              const isSelected = selectedRecipe && selectedRecipe.id === recipe.id;
              return `
                <article class="recipe-card bakery-recipe-card ${isSelected ? "selected" : ""} ${isUnlocked ? "" : "locked"}">
                  <div class="recipe-card-head">
                    <div>
                      <h3>${recipe.icon} ${recipe.name}</h3>
                      <p class="recipe-label">${isSelected ? "Today's star bake" : isUnlocked ? "Ready for a fresh batch" : `Collect ✨ ${recipe.unlockSprinkles} sprinkles to unlock this treat`}</p>
                    </div>
                    ${renderRecipeStatusBadge(recipe, isSelected, isUnlocked)}
                  </div>
                  <div class="recipe-details-grid recipe-details-stack">
                    <div class="recipe-info-chip">
                      <span class="recipe-info-title">Ingredients</span>
                      <div class="recipe-icon-row recipe-ingredient-list">
                        <span>${renderIngredientToken("flour", recipe.ingredients.flour)}</span>
                        <span>${renderIngredientToken("sugar", recipe.ingredients.sugar)}</span>
                        <span>${renderIngredientToken("eggs", recipe.ingredients.eggs)}</span>
                      </div>
                    </div>
                    <div class="recipe-info-chip">
                      <span class="recipe-info-title">Rewards</span>
                      <div class="recipe-icon-row recipe-reward-list">
                        <span>${renderCoinIcon("coin-icon-sm")} ${recipe.baseReward} base coins</span>
                        <span>Up to ${Math.min(recipe.sprinkleReward, 5)} sprinkle progress per bake</span>
                      </div>
                    </div>
                  </div>
                  ${renderRecipeAction(recipe, isSelected, isUnlocked)}
                </article>
              `;
            })
            .join("")}
        </div>

        <div class="panel flow-panel-spacer start-bake-panel">
          <div class="section-head bakery-head start-bake-head">
            <div>
              <p class="eyebrow eyebrow-pill">Start Bake</p>
              <h3>Ready to Bake ${selectedRecipe ? `${selectedRecipe.icon} ${selectedRecipe.name}` : "something sweet"}?</h3>
            </div>
            <div class="badge visual-mode-badge" title="Visual mode uses picture-first math prompts for younger players.">${isVisualMode(player.SR) ? "Picture Mode" : "Story Mode"}</div>
          </div>

          ${
            isBlockedByPantry
              ? `<div class="restock-alert-banner" role="alert">${renderCoinIcon()} Need ${missingCost} coins to restock before baking.</div>`
              : ""
          }

          <p class="visual-mode-note muted tiny">${renderStartBakeNote(player, isReadyToBake)}</p>

          ${
            supportsRecipeSets(player.SR)
              ? `
                <div class="start-bake-stepper-block">
                  <span class="stepper-label">Baking: ${countLabel}</span>
                  <div class="batch-stepper" aria-label="Sets to bake">
                    <button class="stepper-button" type="button" data-batch-step="-1" ${orderCount <= 1 ? "disabled" : ""}>−</button>
                    <span class="stepper-value" id="batch-count-value">${orderCount}</span>
                    <button class="stepper-button" type="button" data-batch-step="1" ${orderCount >= 6 ? "disabled" : ""}>+</button>
                  </div>
                  <input id="batch-count" type="hidden" value="${orderCount}" />
                </div>
              `
              : ""
          }

          ${
            player.SR >= 300 && pantryNeed
              ? `
                <div class="inventory-grid compact-pantry-grid ingredient-shop-grid">
                  ${Object.entries(pantryNeed)
                    .map(([ingredient, amount]) => {
                      const owned = player.pantry[ingredient];
                      const missing = Math.max(0, amount - owned);
                      const meta = INGREDIENT_META[ingredient] ?? { label: ingredient, accentClass: "ingredient-generic", note: "Needed for the next bake." };
                      const cost = getShopCost(ingredient, missing || 1);
                      return `
                        <div class="inventory-card ingredient-shop-card ${meta.accentClass} ${missing ? "missing" : "ready"}">
                          <div class="ingredient-shop-icon ingredient-shop-stamp">${renderIngredientIcon(ingredient)}</div>
                          <strong>${meta.label}</strong>
                          <span>Need ${amount}</span>
                          <span>Have ${owned}</span>
                          <span class="muted tiny">${meta.note}</span>
                          ${
                            missing
                              ? `<button class="quick-buy-button ingredient-buy-button" type="button" data-buy="${ingredient}" data-buy-amount="${missing}">Buy ${missing} — ${renderCoinIcon("coin-icon-sm")} ${cost}</button>`
                              : `<span class="inventory-status">Ready for the bake</span>`
                          }
                        </div>
                      `;
                    })
                    .join("")}
                </div>
              `
              : ""
          }

          <div class="flow-actions start-bake-actions">
            <button class="primary-button hero-bake-button" id="start-order" type="button">Start Bake →</button>
          </div>
        </div>
      </section>
    </section>
  `;
}

function renderRecipeStatusBadge(recipe, isSelected, isUnlocked) {
  if (isSelected) {
    return '<span class="recipe-status-badge recipe-status-selected">Selected</span>';
  }

  if (isUnlocked) {
    return '<span class="recipe-status-badge recipe-status-unlocked">Unlocked</span>';
  }

  return `<span class="recipe-status-badge recipe-status-locked">✨ ${recipe.unlockSprinkles}</span>`;
}

function renderRecipeAction(recipe, isSelected, isUnlocked) {
  if (isSelected) {
    return "";
  }

  if (!isUnlocked) {
    return `
      <div class="recipe-card-footer">
        <button class="recipe-button recipe-button-locked" type="button" disabled>
          Collect More Sprinkles
        </button>
      </div>
    `;
  }

  return `
    <div class="recipe-card-footer">
      <button class="recipe-button recipe-button-choose" type="button" data-recipe="${recipe.id}">
        Choose Recipe
      </button>
    </div>
  `;
}

function renderStartBakeNote(player, isReadyToBake) {
  if (player.SR >= 300 && !isReadyToBake) {
    return "Restock the pantry, then start the next bake.";
  }

  if (isVisualMode(player.SR)) {
    return "Picture-first math is on for this bake.";
  }

  if (!supportsRecipeSets(player.SR)) {
    return "Single-recipe bakes for now, with story prompts tied to each station.";
  }

  if (player.SR < 300) {
    return "Ingredients are auto-stocked right now while you learn the flow.";
  }

  return "Pantry is stocked and the next order is ready for a math-powered bake.";
}

function formatRecipeCountBadge(count) {
  return `Menu ${count} recipe${count === 1 ? "" : "s"} ready`;
}

function renderIngredientToken(ingredient, amount) {
  const meta = INGREDIENT_META[ingredient] ?? { label: ingredient };
  return `${renderIngredientIcon(ingredient, "ingredient-mark-inline")} ${meta.label} ×${amount}`;
}

function renderBakeScreen(gameState, currentStage, srWindow) {
  const { player, session } = gameState;
  const progress = session.saleReady ? 100 : session.order ? ((session.order.stageIndex + 1) / STAGES.length) * 100 : 0;

  return `
    <section class="flow-screen">
      <section class="panel kinder-hero-panel regular-bake-hero">
        <div class="section-head">
          <div>
            <h2>Keep the Bake Moving</h2>
            <p class="muted">Each right answer helps the order roll from one bakery station to the next.</p>
          </div>
          <div class="badge">Target SR ${srWindow.min}–${srWindow.max}</div>
        </div>
        <div class="pill-row regular-status-row">
          <span class="pill mode-status-pill">${getSRMode(player.SR)}</span>
          <span class="pill sr-status-pill">SR ${player.SR} • ${srToBand(player.SR)}</span>
          <span class="pill streak-status-pill">Streak ${player.skill.currentStreak}</span>
          <span class="pill accuracy-status-pill">Accuracy ${player.skill.totalAnswered ? Math.round((player.skill.correctAnswered / player.skill.totalAnswered) * 100) : 0}%</span>
        </div>
        <div class="kinder-stage-banner-row">
          <div class="kinder-stage-banner">
            <span>${STAGE_META[currentStage].icon}</span>
            <span>${STAGE_META[currentStage].title}</span>
          </div>
          <div class="badge">${Math.round(progress)}% complete</div>
        </div>
        <div class="kinder-path-block">
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${progress}%"></div>
          </div>
          <div class="stage-grid">
            ${STAGES.map((stage) => {
              const done = session.saleReady || (session.order && session.order.completedStages.includes(stage));
              const active = !session.saleReady && currentStage === stage && session.order;
              const className = done ? "done" : active ? "active" : "";
              const label = done ? `✓ ${stage}` : stage;

              return `
                <div class="stage-chip ${className}">
                  <div>${done ? "✓" : STAGE_META[stage].icon}</div>
                  <div>${label}</div>
                </div>
              `;
            }).join("")}
          </div>
        </div>
        ${
          player.SR >= 300
            ? `
              <div class="pill-row flow-panel-spacer regular-bake-pantry">
                <span class="pill pantry-pill">${renderIngredientToken("flour", player.pantry.flour)}</span>
                <span class="pill pantry-pill">${renderIngredientToken("sugar", player.pantry.sugar)}</span>
                <span class="pill pantry-pill">${renderIngredientToken("eggs", player.pantry.eggs)}</span>
              </div>
            `
            : ""
        }
      </section>
      ${renderQuestionPanel(gameState, currentStage)}
    </section>
  `;
}

function renderQuestionPanel(gameState, currentStage) {
  const { player, session } = gameState;
  const question = session.currentQuestion;
  const activeRecipe = session.order ? getRecipeById(session.order.recipeId) : null;

  if (session.saleReady) {
    return `
      <section class="panel question-card celebration-panel bake-finish-panel">
        ${renderCelebrationBurst({ icon: session.saleReady.recipeIcon, label: "Bake Complete!" })}
        <div class="section-head">
          <div>
            <p class="eyebrow">Bake complete</p>
            <h2>${session.saleReady.recipeIcon} Fresh ${session.saleReady.recipeName}</h2>
            <p class="muted">The baking is done. Serve the order to see your stats.</p>
          </div>
          <div class="badge">${formatOrderCount(player.SR, session.saleReady.batchCount) || "Ready to serve"}</div>
        </div>
        ${renderMascot({ mood: "celebrate", compact: true, message: `You did it! These ${session.saleReady.recipeName.toLowerCase()} are ready to wow your customers.` })}
        <div class="receipt-card">
          <span>Sale value: ${renderCoinIcon("coin-icon-sm")} ${session.saleReady.revenue} of ${session.saleReady.baseRevenue ?? session.saleReady.revenue}</span>
          <span>Bake accuracy: ${session.saleReady.accuracyPercent ?? 100}%</span>
          <span>Sprinkles earned: ${session.saleReady.sprinklesEarned}/${Math.min(activeRecipe?.sprinkleReward ?? 5, 5)}</span>
        </div>
        <div class="flow-actions">
          <button class="primary-button" data-sell-order type="button">Serve & Sell</button>
        </div>
      </section>
    `;
  }

  if (!question) {
    return `
      <section class="panel question-card">
        <div class="section-head">
          <div>
            <p class="eyebrow">Math challenge</p>
            <h2>Ready to bake</h2>
            <p class="muted">Start an order to get your next adaptive question.</p>
          </div>
          <div class="stage-banner">Target SR ${player.SR}</div>
        </div>
      </section>
    `;
  }

  const visuals = question.visuals
    ? `
      <div class="visual-group">
        ${question.visuals.left.map((token) => `<div class="visual-token">${token}</div>`).join("")}
      </div>
      <div class="visual-group">
        ${question.visuals.right.map((token) => `<div class="visual-token">${token}</div>`).join("")}
      </div>
    `
    : "";
  const sceneMarkup = question.scene ? renderStoryScene(question.scene) : "";

  return `
    <section class="panel question-card stage-panel stage-${currentStage}">
      <div class="section-head">
        <div>
          <p class="eyebrow">Math challenge</p>
          <h2>${STAGE_META[currentStage].title}</h2>
        </div>
      </div>
      ${renderStoryTicket(question, currentStage, activeRecipe, session.order?.batchCount ?? 1)}
      ${sceneMarkup}
      <p class="muted story-problem-copy">${escapeHtml(question.prompt)}</p>
      ${question.promptSecondary ? `<div class="question-secondary-chip">${escapeHtml(question.promptSecondary)}</div>` : ""}
      ${visuals}
      <div class="story-coach-card">
        <span class="story-coach-label">Baker Tip</span>
        <p>${escapeHtml(question.hint)}</p>
      </div>
      <div class="answer-grid regular-answer-grid">
        ${question.choices
          .map((choice, index) => {
            const resultClass = getChoiceClass(session.questionResult, choice, question.answer);
            const label =
              question.type === "optimization" && choice === question.answer && question.answerLabel
                ? question.answerLabel
                : String(choice);

            return `
              <button class="choice-button regular-answer-button answer-color-${index % 4} ${resultClass}" type="button" data-answer="${choice}">
                <span class="regular-answer-number">${escapeHtml(label)}</span>
              </button>
            `;
          })
          .join("")}
      </div>
    </section>
  `;
}

function renderSprinkleHud(player) {
  const sprinkleCount = clampSprinkles(player.sprinkles);
  const sprinklePercent = getSprinklePercent(sprinkleCount);

  if (sprinkleCount >= MAX_SPRINKLES) {
    return `
      <div class="sprinkle-progress-card">
        <div class="sprinkle-progress-head">
          <span class="sprinkle-progress-label">✨ Sprinkles</span>
          <strong class="sprinkle-progress-total">${sprinkleCount}/${MAX_SPRINKLES}</strong>
        </div>
        <div class="expert-baker-badge">⭐ Expert Baker</div>
      </div>
    `;
  }

  return `
    <div class="sprinkle-progress-card">
      <div class="sprinkle-progress-head">
        <span class="sprinkle-progress-label">✨ Sprinkles</span>
        <strong class="sprinkle-progress-total">${sprinkleCount}/${MAX_SPRINKLES}</strong>
      </div>
      <div class="progress-bar sprinkle-progress-bar" aria-label="${sprinkleCount} of ${MAX_SPRINKLES} sprinkles">
        <div class="progress-fill sprinkle-progress-fill" style="width: ${sprinklePercent}%"></div>
      </div>
    </div>
  `;
}

function renderStoryTicket(question, currentStage, activeRecipe, batchCount) {
  return `
    <div class="story-ticket-card">
      <div class="story-ticket-row">
        <span class="story-ticket-pill">Order Ticket</span>
        <span class="story-ticket-pill story-ticket-pill-soft">${escapeHtml(question.type === "cost" ? "Coin Job" : question.type === "fraction" ? "Fair Share" : question.type === "business" ? "Bakery Business" : "Story Math")}</span>
      </div>
      <div class="story-ticket-grid">
        <div>
          <span class="story-ticket-label">Recipe</span>
          <strong>${activeRecipe ? `${activeRecipe.icon} ${escapeHtml(activeRecipe.name)}` : "Bakery order"}</strong>
        </div>
        <div>
          <span class="story-ticket-label">Station</span>
          <strong>${escapeHtml(STAGE_META[currentStage].title)}</strong>
        </div>
        <div>
          <span class="story-ticket-label">Mission</span>
          <strong>${escapeHtml(getQuestionMission(question, batchCount))}</strong>
        </div>
      </div>
    </div>
  `;
}

function getQuestionMission(question, batchCount) {
  if (question.subtype === "addition_story") {
    return "Find the new total after adding more to the bowl.";
  }

  if (question.subtype === "subtraction_story") {
    return "Figure out what is still left on the tray.";
  }

  if (question.subtype === "equal_groups") {
    return `Count every tray in ${batchCount > 1 ? `${batchCount} baking sets` : "this baking set"}.`;
  }

  if (question.subtype === "array_rows") {
    return "Use rows and columns to count the full bakery tray.";
  }

  if (question.subtype === "share_equal_groups") {
    return "Split the batch evenly so every bowl, tray, or box matches.";
  }

  if (question.subtype === "missing_factor") {
    return "Use the total and the size of each group to find how many groups there are.";
  }

  if (question.subtype === "revenue_total" || question.subtype === "ingredient_total") {
    return "Work out the full coin total before the next step.";
  }

  if (question.subtype === "ingredient_combo") {
    return "Find both ingredient totals and add them for the full restock cost.";
  }

  if (question.subtype === "multi_step_total") {
    return "Multiply the trays first, then combine the extra treats.";
  }

  if (question.subtype === "profit") {
    return "Decide what the bakery keeps after paying costs.";
  }

  if (
    question.subtype === "half_of_set" ||
    question.subtype === "third_of_set" ||
    question.subtype === "quarter_of_set"
  ) {
    return "Split the batch into fair topping groups.";
  }

  if (question.subtype === "remainder_leftover") {
    return "Pack equal boxes first, then find what is left for the sample plate.";
  }

  if (question.subtype === "scale_ratio") {
    return "Keep the recipe balanced while scaling it up.";
  }

  if (question.subtype === "one_variable") {
    return "Solve the mystery jar so the station balances.";
  }

  if (question.subtype === "unit_rate") {
    return "Choose the better bakery deal for the display case.";
  }

  return "Use the order details to keep the bake moving.";
}

function renderStoryScene(scene) {
  const groups = Array.isArray(scene.groups) ? scene.groups : [];

  if (!groups.length) {
    return "";
  }

  return `
    <div class="story-scene-card" aria-label="${escapeHtml(scene.label ?? "Story scene")}">
      <div class="story-scene-label">${escapeHtml(scene.label ?? "Bakery scene")}</div>
      ${scene.caption ? `<p class="story-scene-caption">${escapeHtml(scene.caption)}</p>` : ""}
      <div class="story-scene-groups ${scene.kind === "equal_groups" ? "equal-groups-scene" : "count-scene"}">
        ${groups
          .map((group, index) => {
            const tokenClass = group.variant ? ` token-${escapeHtml(group.variant)}` : "";
            const tokenText = escapeHtml(group.tokenText ?? group.emoji ?? "•");
            return `
              <div class="story-scene-group">
                ${group.frame ? `<div class="story-scene-frame">${escapeHtml(group.frame)}</div>` : ""}
                <div class="story-scene-tokens">
                  ${Array.from({ length: Number(group.count) || 0 }, () => `<span class="story-scene-token${tokenClass}">${tokenText}</span>`).join("")}
                </div>
              </div>
              ${index < groups.length - 1 ? `<div class="story-scene-operator" aria-hidden="true">${escapeHtml(scene.operator ?? "+")}</div>` : ""}
            `;
          })
          .join("")}
      </div>
    </div>
  `;
}

function getChoiceClass(result, choice) {
  if (!result) {
    return "";
  }

  if (result.correct && Number(choice) === Number(result.selectedAnswer)) {
    return "correct";
  }

  if (Number(choice) === Number(result.selectedAnswer) && !result.correct) {
    return "wrong";
  }

  return "";
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
