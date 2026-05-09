import { RECIPES, STAGES, STAGE_META } from "../../game/data.js";
import { getPantryNeed, getRecipeById, getUnlockedRecipes, srToBand } from "../../game/helpers.js";

export function renderBakeryScreen(gameState) {
  const { player, session } = gameState;
  const recipes = getUnlockedRecipes(player);
  const selectedRecipe = getRecipeById(session.selectedRecipeId) ?? recipes[0] ?? RECIPES[0];
  const pantryNeed = selectedRecipe ? getPantryNeed(selectedRecipe, session.batchCount) : null;
  const currentStage = session.order ? STAGES[session.order.stageIndex] : "prep";

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
              <strong>${player.SR < 100 ? "Visual" : player.SR < 300 ? "Story Math" : "Simulator"}</strong>
            </div>
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

function renderOrderBuilder(gameState, recipes, selectedRecipe, pantryNeed) {
  const { player, session } = gameState;
  const hasActiveOrder = Boolean(session.order);

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
            <div class="pill-row">
              <span class="pill">Need flour ${pantryNeed.flour}</span>
              <span class="pill">Need sugar ${pantryNeed.sugar}</span>
              <span class="pill">Need eggs ${pantryNeed.eggs}</span>
            </div>
          `
            : `
            <p class="muted tiny">Pantry math unlocks at SR 300. Until then, ingredients are magically stocked.</p>
          `
        }
        <div style="margin-top: 16px;">
          <button class="primary-button" id="start-order" type="button" ${hasActiveOrder ? "disabled" : ""}>
            ${hasActiveOrder ? "Order In Progress" : "Start Order"}
          </button>
        </div>
      </div>
    </section>
  `;
}

function renderQuestionPanel(gameState, currentStage) {
  const { player, session } = gameState;
  const question = session.currentQuestion;

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
  const progress = session.order ? ((session.order.stageIndex + 1) / STAGES.length) * 100 : 0;

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
