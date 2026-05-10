import { RECIPES, STAGES, STAGE_META } from "../../game/data.js?v=20260509-205459";
import {
  formatOrderCount,
  getMissingPantry,
  getOrderCount,
  getPantryNeed,
  getRecipeById,
  getTotalShopCost,
  getUnlockedRecipes,
  srToBand,
  supportsRecipeSets,
} from "../../game/helpers.js?v=20260509-205459";
import { getSRMode, getSRWindow, isVisualMode } from "../../game/sr.js?v=20260509-205459";
import { renderKindergartenBakery } from "../renderers/kindergarten.js?v=20260509-205459";

export function renderBakeryScreen(gameState) {
  const { player, session } = gameState;
  const recipes = getUnlockedRecipes(player);
  const selectedRecipe = getRecipeById(session.selectedRecipeId) ?? recipes[0] ?? RECIPES[0];
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

  return renderRecipeScreen(gameState, recipes, selectedRecipe, pantryNeed);
}

function renderRecipeScreen(gameState, recipes, selectedRecipe, pantryNeed) {
  const { player, session } = gameState;
  const orderCount = getOrderCount(player.SR, session.batchCount);
  const countLabel = formatOrderCount(player.SR, orderCount);
  const missingPantry = player.SR >= 300 && pantryNeed ? getMissingPantry(player, pantryNeed) : {};
  const isReadyToBake = Object.keys(missingPantry).length === 0;
  const missingCost = getTotalShopCost(missingPantry);

  return `
    <section class="flow-screen bakery-screen">
      <section class="panel bakery-hero-panel">
        <div class="section-head bakery-head">
          <div>
            <p class="eyebrow eyebrow-pill">Pick a Recipe</p>
            <h2>Bake Menu</h2>
            <p class="muted bakery-subcopy">${srToBand(player.SR)} bakers get a bright, game-like menu so the next order feels exciting right away.</p>
          </div>
          <div class="badge bakery-unlock-badge">🍰 ${recipes.length} recipes ready</div>
        </div>
        <div class="hud-strip" aria-label="Bakery stats">
          <div class="hud-pill sr-pill">
            <span class="hud-label">⭐ Skill Rating</span>
            <strong class="hud-value">${player.SR}</strong>
          </div>
          <div class="hud-pill coin-pill">
            <span class="hud-label">🪙 Coins</span>
            <strong class="hud-value">${player.bank}</strong>
          </div>
          <div class="hud-pill sprinkle-pill">
            <span class="hud-label">✨ Sprinkles</span>
            <strong class="hud-value">${player.sprinkles}</strong>
          </div>
          <div class="hud-pill mode-pill">
            <span class="hud-label">🎯 Mode</span>
            <strong class="hud-value hud-text">${getSRMode(player.SR)}</strong>
          </div>
        </div>
      </section>

      <section class="panel flow-screen recipe-selection-panel">
        <div class="section-head bakery-head">
          <div>
            <p class="eyebrow eyebrow-pill">Recipe Selection</p>
            <h2>Choose Today's Bake</h2>
            <p class="muted bakery-subcopy">${supportsRecipeSets(player.SR) ? "Pick a recipe, choose your sets, and get the bakery ready." : "Pick a recipe and get the bakery ready."}</p>
          </div>
          ${countLabel ? `<div class="badge count-badge">${countLabel}</div>` : ""}
        </div>

        <div class="recipe-grid bakery-recipe-grid">
          ${recipes
            .map((recipe) => {
              const isSelected = session.selectedRecipeId === recipe.id;
              return `
                <article class="recipe-card bakery-recipe-card ${isSelected ? "selected" : ""}">
                  <div class="recipe-card-head">
                    <div>
                      <h3>${recipe.icon} ${recipe.name}</h3>
                      <p class="recipe-label">${isSelected ? "Today's star bake" : "Ready for a fresh batch"}</p>
                    </div>
                    ${renderRecipeStatusBadge(recipe, isSelected)}
                  </div>
                  <div class="recipe-details-grid">
                    <div class="recipe-info-chip">
                      <span class="recipe-info-title">Ingredients</span>
                      <div class="recipe-icon-row">
                        <span>🌾 ×${recipe.ingredients.flour}</span>
                        <span>🍚 ×${recipe.ingredients.sugar}</span>
                        <span>🥚 ×${recipe.ingredients.eggs}</span>
                      </div>
                    </div>
                    <div class="recipe-info-chip">
                      <span class="recipe-info-title">Rewards</span>
                      <div class="recipe-icon-row">
                        <span>🪙 ${recipe.baseReward}</span>
                        <span>✨ ${recipe.sprinkleReward}</span>
                      </div>
                    </div>
                  </div>
                  <div class="recipe-card-footer">
                    <button class="recipe-button ${isSelected ? "recipe-button-selected" : "recipe-button-choose"}" type="button" data-recipe="${recipe.id}">
                      ${isSelected ? "✓ Selected" : "Choose Recipe"}
                    </button>
                  </div>
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
              <p class="muted bakery-subcopy">Tap the big button below to launch the next math-powered order.</p>
            </div>
            <div class="badge visual-mode-badge" title="Visual mode uses picture-first math prompts for younger players.">${isVisualMode(player.SR) ? "🖼 Visual Mode" : "👁 Picture Math Off"}</div>
          </div>

          <p class="visual-mode-note muted tiny">
            ${isVisualMode(player.SR) ? "Picture-first math is on, so early bakers can solve by looking and counting." : "Visual Mode turns on automatically for the youngest bakers when picture math is the best fit."}
          </p>

          ${
            supportsRecipeSets(player.SR)
              ? `
                <label class="field start-bake-field">
                  <span>Sets to bake</span>
                  <input id="batch-count" type="number" min="1" max="6" value="${orderCount}" />
                </label>
              `
              : `<p class="muted tiny">Bigger bakery orders unlock in 4th grade. For now, each bake is one recipe at a time.</p>`
          }

          ${
            player.SR >= 300 && pantryNeed
              ? `
                <div class="inventory-grid">
                  ${Object.entries(pantryNeed)
                    .map(([ingredient, amount]) => {
                      const owned = player.pantry[ingredient];
                      const missing = Math.max(0, amount - owned);
                      return `
                        <div class="inventory-card ${missing ? "missing" : "ready"}">
                          <strong>${ingredient}</strong>
                          <span>Need ${amount}</span>
                          <span>Have ${owned}</span>
                          ${
                            missing
                              ? `<button class="secondary-button quick-buy-button" type="button" data-buy="${ingredient}" data-buy-amount="${missing}">Buy ${missing}</button>`
                              : `<span class="inventory-status">Ready</span>`
                          }
                        </div>
                      `;
                    })
                    .join("")}
                </div>
                <p class="muted tiny">
                  ${
                    isReadyToBake
                      ? "Your pantry is stocked for this order."
                      : `You are missing ingredients. Quick restock cost: ${missingCost} coins.`
                  }
                </p>
              `
              : `
                <p class="muted tiny">Pantry math unlocks at SR 300. Until then, ingredients are magically stocked.</p>
              `
          }

          <div class="flow-actions start-bake-actions">
            <button class="primary-button hero-bake-button" id="start-order" type="button">Start Bake</button>
          </div>
        </div>
      </section>
    </section>
  `;
}

function renderRecipeStatusBadge(recipe, isSelected) {
  if (isSelected) {
    return '<span class="recipe-status-badge recipe-status-selected">✓ Selected</span>';
  }

  if (recipe.unlockSR <= 0) {
    return '<span class="recipe-status-badge recipe-status-unlocked">✓ Unlocked</span>';
  }

  return '<span class="recipe-status-badge recipe-status-unlocked">✓ Unlocked</span>';
}

function renderBakeScreen(gameState, currentStage, srWindow) {
  const { player, session } = gameState;
  const progress = session.saleReady ? 100 : session.order ? ((session.order.stageIndex + 1) / STAGES.length) * 100 : 0;

  return `
    <section class="flow-screen">
      <section class="panel kinder-hero-panel regular-bake-hero">
        <div class="section-head">
          <div>
            <h2>Bake</h2>
            <p class="muted">Solve the math and finish each bakery stage.</p>
          </div>
          <div class="badge">${Math.round(progress)}% complete</div>
        </div>
        <div class="pill-row">
          <span class="pill">${getSRMode(player.SR)}</span>
          <span class="pill">SR ${player.SR}</span>
          <span class="pill">Streak ${player.skill.currentStreak}</span>
          <span class="pill">Accuracy ${player.skill.totalAnswered ? Math.round((player.skill.correctAnswered / player.skill.totalAnswered) * 100) : 0}%</span>
        </div>
        <div class="kinder-stage-banner-row">
          <div class="kinder-stage-banner">
            <span>${STAGE_META[currentStage].icon}</span>
            <span>${STAGE_META[currentStage].title}</span>
          </div>
          <div class="pill">Target window ${srWindow.min}-${srWindow.max}</div>
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

              return `
                <div class="stage-chip ${className}">
                  <div>${STAGE_META[stage].icon}</div>
                  <div>${stage}</div>
                </div>
              `;
            }).join("")}
          </div>
        </div>
        <div class="pill-row flow-panel-spacer regular-bake-pantry">
          <span class="pill">Flour ${player.pantry.flour}</span>
          <span class="pill">Sugar ${player.pantry.sugar}</span>
          <span class="pill">Eggs ${player.pantry.eggs}</span>
        </div>
      </section>
      ${renderQuestionPanel(gameState, currentStage)}
    </section>
  `;
}

function renderQuestionPanel(gameState, currentStage) {
  const { player, session } = gameState;
  const question = session.currentQuestion;

  if (session.saleReady) {
    return `
      <section class="panel question-card">
        <div class="section-head">
          <div>
            <p class="eyebrow">Bake complete</p>
            <h2>${session.saleReady.recipeIcon} Fresh ${session.saleReady.recipeName}</h2>
            <p class="muted">The baking is done. Serve the order to see your stats.</p>
          </div>
          <div class="badge">${formatOrderCount(player.SR, session.saleReady.batchCount) || "Ready to serve"}</div>
        </div>
        <div class="receipt-card">
          <span>Sale value: ${session.saleReady.revenue} coins</span>
          <span>Sprinkles earned: ${session.saleReady.sprinklesEarned}</span>
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
          <div class="stage-banner">🍬 SR ${player.SR}</div>
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

  return `
    <section class="panel question-card stage-panel stage-${currentStage}">
      <div class="section-head">
        <div>
          <p class="eyebrow">Math challenge</p>
          <h2>${STAGE_META[currentStage].title}</h2>
          <p class="muted">${escapeHtml(question.prompt)}</p>
        </div>
        <div class="stage-banner">${STAGE_META[currentStage].icon} ${currentStage}</div>
      </div>
      ${question.promptSecondary ? `<p><strong>${escapeHtml(question.promptSecondary)}</strong></p>` : ""}
      ${visuals}
      <div class="answer-grid">
        ${question.choices
          .map((choice) => {
            const resultClass = getChoiceClass(session.questionResult, choice, question.answer);
            const label =
              question.type === "optimization" && choice === question.answer && question.answerLabel
                ? question.answerLabel
                : String(choice);

            return `
              <button class="choice-button ${resultClass}" type="button" data-answer="${choice}">
                ${escapeHtml(label)}
              </button>
            `;
          })
          .join("")}
      </div>
    </section>
  `;
}

function getChoiceClass(result, choice, answer) {
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
