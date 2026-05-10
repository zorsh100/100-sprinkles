import { RECIPES, STAGES, STAGE_META } from "../../game/data.js?v=20260509-205459";
import {
  getMissingPantry,
  getPantryNeed,
  getRecipeById,
  getTotalShopCost,
  getUnlockedRecipes,
  srToBand,
} from "../../game/helpers.js?v=20260509-205459";
import { getSRMode, getSRWindow, isVisualMode } from "../../game/sr.js?v=20260509-205459";
import { renderKindergartenBakery } from "../renderers/kindergarten.js?v=20260509-205459";

export function renderBakeryScreen(gameState) {
  const { player, session } = gameState;
  const recipes = getUnlockedRecipes(player);
  const selectedRecipe = getRecipeById(session.selectedRecipeId) ?? recipes[0] ?? RECIPES[0];
  const pantryNeed = selectedRecipe ? getPantryNeed(selectedRecipe, session.batchCount) : null;
  const currentStage = session.order ? STAGES[session.order.stageIndex] : "prep";
  const srWindow = getSRWindow(player.SR);

  if (session.order || session.saleReady) {
    if (isVisualMode(player.SR)) {
      return `
        <section class="flow-screen">
          <section class="panel">
            <div class="section-head">
              <div>
                <p class="eyebrow">Start Bake</p>
                <h2>Play Tray</h2>
                <p class="muted">${srToBand(player.SR)} skill band • visual counting only</p>
              </div>
              <div class="badge">Picture math</div>
            </div>
            <div class="stats-grid kindergarten-stats-grid">
              <div class="stat-card">
                <span class="muted tiny">Skill Rating</span>
                <strong>${player.SR}</strong>
              </div>
              <div class="stat-card">
                <span class="muted tiny">Sprinkles</span>
                <strong>${player.sprinkles}</strong>
              </div>
              <div class="stat-card">
                <span class="muted tiny">Streak</span>
                <strong>${player.skill.currentStreak}</strong>
              </div>
            </div>
          </section>
          ${renderKindergartenBakery({ player, session, currentStage, selectedRecipe })}
        </section>
      `;
    }

    return renderBakeScreen(gameState, currentStage, srWindow);
  }

  return renderRecipeScreen(gameState, recipes, selectedRecipe, pantryNeed);
}

function renderRecipeScreen(gameState, recipes, selectedRecipe, pantryNeed) {
  const { player, session } = gameState;
  const missingPantry = player.SR >= 300 && pantryNeed ? getMissingPantry(player, pantryNeed) : {};
  const isReadyToBake = Object.keys(missingPantry).length === 0;
  const missingCost = getTotalShopCost(missingPantry);

  return `
    <section class="flow-screen">
      <section class="panel">
        <div class="section-head">
          <div>
            <p class="eyebrow">Pick a Recipe</p>
            <h2>Bake Menu</h2>
            <p class="muted">${srToBand(player.SR)} skill band • choose what your bakery will make next</p>
          </div>
          <div class="badge">${recipes.length} recipes unlocked</div>
        </div>
        <div class="stats-grid">
          <div class="stat-card">
            <span class="muted tiny">Skill Rating</span>
            <strong>${player.SR}</strong>
          </div>
          <div class="stat-card">
            <span class="muted tiny">Coins</span>
            <strong>${player.bank}</strong>
          </div>
          <div class="stat-card">
            <span class="muted tiny">Sprinkles</span>
            <strong>${player.sprinkles}</strong>
          </div>
          <div class="stat-card">
            <span class="muted tiny">Mode</span>
            <strong>${getSRMode(player.SR)}</strong>
          </div>
        </div>
      </section>

      <section class="panel flow-screen">
        <div class="section-head">
          <div>
            <p class="eyebrow">Recipe Selection</p>
            <h2>Choose Today’s Bake</h2>
            <p class="muted">Pick a recipe, set your batches, and get the bakery ready.</p>
          </div>
          <div class="badge">${session.batchCount} batch${session.batchCount > 1 ? "es" : ""}</div>
        </div>

        <div class="recipe-grid">
          ${recipes
            .map((recipe) => {
              const isSelected = session.selectedRecipeId === recipe.id;
              return `
                <article class="recipe-card ${isSelected ? "selected" : ""}">
                  <div class="split">
                    <h3>${recipe.icon} ${recipe.name}</h3>
                    <button class="recipe-button" type="button" data-recipe="${recipe.id}">
                      ${isSelected ? "Selected" : "Choose"}
                    </button>
                  </div>
                  <p class="recipe-label">${isSelected ? "Current recipe" : "Tap to choose this recipe"}</p>
                  <div class="recipe-meta">
                    <span>${recipe.baseReward} base coins</span>
                    <span>${recipe.sprinkleReward} sprinkle reward</span>
                    <span>Unlock SR ${recipe.unlockSR}</span>
                  </div>
                  <div class="ingredient-list">
                    <span>Flour ${recipe.ingredients.flour}</span>
                    <span>Sugar ${recipe.ingredients.sugar}</span>
                    <span>Eggs ${recipe.ingredients.eggs}</span>
                  </div>
                </article>
              `;
            })
            .join("")}
        </div>

        <div class="panel flow-panel-spacer">
          <div class="section-head">
            <div>
              <h3>Start Bake</h3>
              <p class="muted">Selected recipe: ${selectedRecipe ? `${selectedRecipe.icon} ${selectedRecipe.name}` : "None"}</p>
            </div>
            <div class="badge">${isVisualMode(player.SR) ? "Picture Mode" : "5-stage bake"}</div>
          </div>

          <label class="field">
            <span>Batches</span>
            <input id="batch-count" type="number" min="1" max="6" value="${session.batchCount}" />
          </label>

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

          <div class="flow-actions">
            <button class="primary-button" id="start-order" type="button">Start Bake</button>
          </div>
        </div>
      </section>
    </section>
  `;
}

function renderBakeScreen(gameState, currentStage, srWindow) {
  const { player, session } = gameState;

  return `
    <section class="flow-screen">
      <section class="panel">
        <div class="section-head">
          <div>
            <p class="eyebrow">Start Bake</p>
            <h2>Baking in Progress</h2>
            <p class="muted">Solve the math, move through each stage, then serve the order.</p>
          </div>
          <div class="badge">${getSRMode(player.SR)}</div>
        </div>
        <div class="pill-row">
          <span class="pill">Target window ${srWindow.min}-${srWindow.max}</span>
          <span class="pill">Streak ${player.skill.currentStreak}</span>
          <span class="pill">Accuracy ${player.skill.totalAnswered ? Math.round((player.skill.correctAnswered / player.skill.totalAnswered) * 100) : 0}%</span>
        </div>
      </section>
      ${renderQuestionPanel(gameState, currentStage)}
      ${renderStagePanel(gameState, currentStage, session)}
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
          <div class="badge">${session.saleReady.batchCount} batch${session.saleReady.batchCount > 1 ? "es" : ""}</div>
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

function renderStagePanel(gameState, currentStage, session) {
  const { player } = gameState;
  const progress = session.saleReady ? 100 : session.order ? ((session.order.stageIndex + 1) / STAGES.length) * 100 : 0;

  return `
    <section class="panel">
      <div class="section-head">
        <div>
          <p class="eyebrow">Bake Path</p>
          <h2>Stage Tracker</h2>
          <p class="muted">${isVisualMode(player.SR) ? "Picture counting powers the whole tray." : "Each correct answer clears the next bakery stage."}</p>
        </div>
        <div class="badge">${Math.round(progress)}% complete</div>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${progress}%"></div>
      </div>
      <div class="stage-grid" style="margin-top: 16px;">
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
      <div class="panel flow-panel-spacer">
        <div class="pill-row">
          <span class="pill">Flour ${player.pantry.flour}</span>
          <span class="pill">Sugar ${player.pantry.sugar}</span>
          <span class="pill">Eggs ${player.pantry.eggs}</span>
        </div>
      </div>
    </section>
  `;
}

function getChoiceClass(result, choice, answer) {
  if (!result) {
    return "";
  }

  if (Number(choice) === Number(answer)) {
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
