import { RECIPES, STAGES, STAGE_META } from "../../game/data.js";
import { getMissingPantry, getPantryNeed, getRecipeById, getTotalShopCost, getUnlockedRecipes, srToBand } from "../../game/helpers.js";
import { getSRMode, getSRWindow } from "../../game/sr.js";
import { renderKindergartenBakery } from "../renderers/kindergarten.js";

export function renderBakeryScreen(gameState) {
  const { player, session } = gameState;
  const recipes = getUnlockedRecipes(player);
  const selectedRecipe = getRecipeById(session.selectedRecipeId) ?? recipes[0] ?? RECIPES[0];
  const pantryNeed = selectedRecipe ? getPantryNeed(selectedRecipe, session.batchCount) : null;
  const currentStage = session.order ? STAGES[session.order.stageIndex] : "prep";
  const srWindow = getSRWindow(player.SR);

  if (player.SR < 100) {
    return `
      <section class="dashboard kindergarten-dashboard">
        <div class="layout-stack">
          <section class="panel">
            <div class="section-head">
              <div>
                <p class="eyebrow">Bakery dashboard</p>
                <h2>Play Tray</h2>
                <p class="muted">${srToBand(player.SR)} skill band • visual counting only</p>
              </div>
              <div class="badge">1 recipe at a time</div>
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
                <span class="muted tiny">Mode</span>
                <strong>Picture Math</strong>
              </div>
            </div>
          </section>
          ${renderKindergartenOrderBuilder(gameState, selectedRecipe)}
        </div>
        <div class="layout-stack">
          ${renderKindergartenBakery({ player, session, currentStage, selectedRecipe })}
        </div>
      </section>
    `;
  }

  return `
    <section class="dashboard">
      <div class="layout-stack">
        <section class="panel">
          <div class="section-head">
            <div>
              <p class="eyebrow">Bakery dashboard</p>
              <h2>Bake Menu</h2>
              <p class="muted">${srToBand(player.SR)} skill band • every correct answer powers the bakery forward</p>
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
          <div class="pill-row" style="margin-top: 12px;">
            <span class="pill">Target window ${srWindow.min}-${srWindow.max}</span>
            <span class="pill">Streak ${player.skill.currentStreak}</span>
            <span class="pill">Accuracy ${player.skill.totalAnswered ? Math.round((player.skill.correctAnswered / player.skill.totalAnswered) * 100) : 0}%</span>
          </div>
        </section>
        ${renderOrderBuilder(gameState, recipes, selectedRecipe, pantryNeed)}
      </div>
      <div class="layout-stack">
        ${renderQuestionPanel(gameState, currentStage)}
        ${renderStagePanel(gameState, currentStage)}
      </div>
    </section>
  `;
}

function renderKindergartenOrderBuilder(gameState, selectedRecipe) {
  const { session } = gameState;
  const hasActiveOrder = Boolean(session.order);

  return `
    <section class="panel kinder-order-panel">
      <div class="section-head">
        <div>
          <p class="eyebrow">Choose an order</p>
          <h2>${selectedRecipe.icon} ${selectedRecipe.name}</h2>
          <p class="muted">Big pictures, simple counting, and one batch at a time.</p>
        </div>
        <div class="badge">Count and tap</div>
      </div>
      <div class="kinder-order-art">
        <span>🧁</span>
        <span>🍓</span>
        <span>🍩</span>
      </div>
      <div>
        <button class="primary-button kinder-start-button" id="start-order" type="button" ${hasActiveOrder ? "disabled" : ""}>
          ${hasActiveOrder ? "Counting..." : "Start Order"}
        </button>
      </div>
    </section>
  `;
}

function renderOrderBuilder(gameState, recipes, selectedRecipe, pantryNeed) {
  const { player, session } = gameState;
  const hasActiveOrder = Boolean(session.order);
  const hasSaleReady = Boolean(session.saleReady);
  const missingPantry = player.SR >= 300 && pantryNeed ? getMissingPantry(player, pantryNeed) : {};
  const isReadyToBake = Object.keys(missingPantry).length === 0;
  const missingCost = getTotalShopCost(missingPantry);

  return `
    <section class="panel">
      <div class="section-head">
        <div>
          <p class="eyebrow">Choose an order</p>
          <h2>Recipe board</h2>
          <p class="muted">Every recipe uses the same adaptive question engine, with difficulty tied to SR.</p>
        </div>
        <div class="badge">${session.batchCount} batch${session.batchCount > 1 ? "es" : ""}</div>
      </div>
      <div class="loop-strip">
        <div class="loop-step active">1. Pick recipe</div>
        <div class="loop-step ${player.SR >= 300 ? (isReadyToBake ? "active" : "warning") : "active"}">2. Check pantry</div>
        <div class="loop-step ${hasActiveOrder ? "active" : ""}">3. Bake</div>
        <div class="loop-step ${hasSaleReady ? "active" : ""}">4. Sell</div>
      </div>
      <div class="recipe-grid">
        ${recipes
          .map((recipe) => {
            const isSelected = session.selectedRecipeId === recipe.id;
            return `
              <article class="recipe-card">
                <div class="split">
                  <h3>${recipe.icon} ${recipe.name}</h3>
                  <button class="recipe-button" type="button" data-recipe="${recipe.id}">
                    ${isSelected ? "Selected" : "Pick"}
                  </button>
                </div>
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
      <div class="panel" style="margin-top: 18px;">
        <div class="section-head">
          <div>
            <h3>Order Builder</h3>
            <p class="muted">Selected recipe: ${selectedRecipe ? `${selectedRecipe.icon} ${selectedRecipe.name}` : "None"}</p>
          </div>
          <div class="badge">${player.SR < 100 ? "Picture Mode" : "5-stage bake"}</div>
        </div>
        <label class="field">
          <span>Batches</span>
          <input id="batch-count" type="number" min="1" max="6" value="${session.batchCount}" ${hasActiveOrder ? "disabled" : ""} />
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
                      ${missing ? `<button class="secondary-button quick-buy-button" type="button" data-buy="${ingredient}" data-buy-amount="${missing}">Buy ${missing}</button>` : `<span class="inventory-status">Ready</span>`}
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
        ${
          session.saleReady
            ? `
              <div class="sale-ready-card">
                <div>
                  <strong>${session.saleReady.recipeIcon} Fresh ${session.saleReady.recipeName}</strong>
                  <p class="muted tiny">Baked and ready to serve for ${session.saleReady.revenue} coins.</p>
                </div>
                <button class="primary-button" data-sell-order type="button">Serve & Sell</button>
              </div>
            `
            : ""
        }
        <div style="margin-top: 16px;">
          <button class="primary-button" id="start-order" type="button" ${hasActiveOrder || hasSaleReady ? "disabled" : ""}>
            ${hasActiveOrder ? "Order In Progress" : hasSaleReady ? "Sell Current Batch First" : "Start Order"}
          </button>
        </div>
      </div>
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
            <p class="muted">The baking is done. Now serve the order and collect your coins.</p>
          </div>
          <div class="badge">${session.saleReady.batchCount} batch${session.saleReady.batchCount > 1 ? "es" : ""}</div>
        </div>
        <div class="receipt-card">
          <span>Sale value: ${session.saleReady.revenue} coins</span>
          <span>Sprinkles earned: ${session.saleReady.sprinklesEarned}</span>
        </div>
        <button class="primary-button" data-sell-order type="button">Serve & Sell</button>
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
        <div class="empty-state">
          Choose a recipe, then press <strong>Start Order</strong>.
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

function renderStagePanel(gameState, currentStage) {
  const { player, session } = gameState;
  const progress = session.saleReady ? 100 : session.order ? ((session.order.stageIndex + 1) / STAGES.length) * 100 : 0;

  return `
    <section class="panel">
      <div class="section-head">
        <div>
          <p class="eyebrow">Bakery flow</p>
          <h2>Stage Tracker</h2>
          <p class="muted">${player.SR < 100 ? "Picture counting powers the whole tray." : "Each correct answer clears the next bakery stage."}</p>
        </div>
        <div class="badge">${Math.round(progress)}% complete</div>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${progress}%"></div>
      </div>
      <div class="stage-grid" style="margin-top: 16px;">
        ${STAGES.map((stage) => {
          const done = session.order && session.order.completedStages.includes(stage);
          const active = currentStage === stage && session.order;
          const className = done ? "done" : active ? "active" : "";

          return `
            <div class="stage-chip ${className}">
              <div>${STAGE_META[stage].icon}</div>
              <div>${stage}</div>
            </div>
          `;
        }).join("")}
      </div>
      <div class="panel" style="margin-top: 18px;">
        <div class="pill-row">
          <span class="pill">Flour ${player.pantry.flour}</span>
          <span class="pill">Sugar ${player.pantry.sugar}</span>
          <span class="pill">Eggs ${player.pantry.eggs}</span>
        </div>
      </div>
      ${
        session.recentSale
          ? `
            <div class="receipt-card" style="margin-top: 18px;">
              <strong>Last sale</strong>
              <span>${session.recentSale.recipeIcon} ${session.recentSale.recipeName}</span>
              <span>${session.recentSale.revenue} coins</span>
              <span>${session.recentSale.sprinklesEarned} sprinkles</span>
            </div>
          `
          : ""
      }
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
