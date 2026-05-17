import { INGREDIENT_BULK_BUYS, MAX_SPRINKLES, QUESTIONS_PER_BAKE, RECIPES, STAGES, STAGE_META } from "../../game/data.js?v=20260517-163900";
import { renderCoinIcon, renderIngredientIcon } from "../components/icons.js?v=20260517-163900";
import { renderCelebrationBurst, renderMascot } from "../components/mascot.js?v=20260517-163900";
import { renderPlayerAvatar } from "../components/player-avatar.js?v=20260517-163900";
import { renderStageArt } from "../components/stage-art.js?v=20260517-163900";
import {
  canAffordIngredients,
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
} from "../../game/helpers.js?v=20260517-163900";
import { getSRMode, isVisualMode } from "../../game/sr.js?v=20260517-163900";
import { renderKindergartenBakery } from "../renderers/kindergarten.js?v=20260517-163900";

const INGREDIENT_META = {
  flour: {
    label: "Flour",
    accentClass: "ingredient-flour",
    note: "Builds the base for cakes, cookies, and trays of treats.",
    buyLabel: INGREDIENT_BULK_BUYS.flour.label,
    buyAmount: INGREDIENT_BULK_BUYS.flour.amount,
    buyCost: INGREDIENT_BULK_BUYS.flour.cost,
  },
  sugar: {
    label: "Sugar",
    accentClass: "ingredient-sugar",
    note: "Sweetens every bowl and helps finishing toppings shine.",
    buyLabel: INGREDIENT_BULK_BUYS.sugar.label,
    buyAmount: INGREDIENT_BULK_BUYS.sugar.amount,
    buyCost: INGREDIENT_BULK_BUYS.sugar.cost,
  },
  eggs: {
    label: "Eggs",
    accentClass: "ingredient-eggs",
    note: "Helps batter hold together when the oven gets warm.",
    buyLabel: INGREDIENT_BULK_BUYS.eggs.label,
    buyAmount: INGREDIENT_BULK_BUYS.eggs.amount,
    buyCost: INGREDIENT_BULK_BUYS.eggs.cost,
  },
};

export function renderBakeryScreen(gameState) {
  const { player, session } = gameState;
  const knownRecipes = RECIPES.filter((recipe) => player.knownRecipes.includes(recipe.id));
  const unlockedRecipes = getUnlockedRecipes(player);
  const hasRenderableOrder = Boolean(session.order?.recipeId && session.currentQuestion);
  const hasRenderableSaleReady = Boolean(
    session.saleReady &&
      session.saleReady.recipeName &&
      session.saleReady.recipeIcon &&
      Number.isFinite(Number(session.saleReady.revenue)),
  );
  const selectedRecipe =
    knownRecipes.find((recipe) => recipe.id === session.selectedRecipeId && player.sprinkles >= recipe.unlockSprinkles) ??
    unlockedRecipes[0] ??
    knownRecipes[0] ??
    RECIPES[0];
  const orderCount = getOrderCount(player.SR, session.batchCount);
  const pantryNeed = selectedRecipe ? getPantryNeed(selectedRecipe, orderCount) : null;
  const currentStage = session.order ? STAGES[session.order.stageIndex ?? 0] ?? "prep" : "prep";

  if (hasRenderableOrder || hasRenderableSaleReady) {
    if (isVisualMode(player.SR)) {
      return renderKindergartenBakery({ player, session, currentStage, selectedRecipe });
    }

    return renderBakeScreen(gameState, currentStage);
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
  const shouldShowPantryOverview = player.SR >= 300 && pantryNeed;

  return `
    <section class="flow-screen bakery-screen">
      <section class="panel bakery-hero-panel">
        <div class="hud-strip compact-bakery-hud" aria-label="Bakery stats">
          <div class="hud-pill baker-pill compact-hud-pill compact-hud-baker">
            <div class="hud-baker-row compact-hud-baker-row">
              ${renderPlayerAvatar(player.avatarId, { size: "sm", className: "hud-baker-avatar", label: `${player.username}'s baker portrait` })}
              <strong class="hud-baker-name">${escapeHtml(player.username)}</strong>
            </div>
          </div>
          <div class="hud-pill sr-pill compact-hud-pill">
            <strong class="compact-hud-value">SR ${player.SR}</strong>
          </div>
          <div class="hud-pill coin-pill compact-hud-pill">
            <strong class="compact-hud-value">${renderCoinIcon("coin-icon-sm")} ${player.bank}</strong>
          </div>
          <div class="hud-pill sprinkle-pill compact-hud-pill">
            <strong class="compact-hud-value">✨ ${clampSprinkles(player.sprinkles)}/${MAX_SPRINKLES}</strong>
          </div>
          <div class="hud-pill mode-pill compact-hud-pill">
            <strong class="compact-hud-value">${getSRMode(player.SR)}</strong>
          </div>
        </div>
      </section>

      ${
        shouldShowPantryOverview
          ? `
            <section class="panel pantry-overview-panel">
              <div class="section-head bakery-head">
                <div>
                  <p class="eyebrow eyebrow-pill">Pantry</p>
                  <h2>Check Your Shelves</h2>
                  <p class="muted bakery-subcopy">${
                    isReadyToBake
                      ? "Everything for this bake is stocked. You are ready to head to the mixing bowl."
                      : "See what is already stocked and top off flour, sugar, or eggs before you choose the next bake."
                  }</p>
                </div>
              </div>

              <div class="inventory-grid compact-pantry-grid ingredient-shop-grid pantry-overview-grid">
                ${Object.entries(INGREDIENT_META)
                  .map(([ingredient, meta]) => {
                    const owned = Number(player.pantry?.[ingredient] || 0);
                    const needed = Number(pantryNeed?.[ingredient] || 0);
                    const canCoverNextBake = owned >= needed;
                    return `
                      <div class="inventory-card ingredient-shop-card pantry-overview-card ${meta.accentClass} ${canCoverNextBake ? "ready" : "missing"}">
                        ${
                          canCoverNextBake
                            ? `<div class="ingredient-ready-check" aria-label="${meta.label} is stocked for the selected recipe">✓</div>`
                            : ""
                        }
                        <div class="ingredient-shop-icon ingredient-shop-stamp">${renderIngredientIcon(ingredient)}</div>
                        <strong>${meta.label}</strong>
                        <span>Have ${owned}</span>
                        <span>${selectedRecipe ? `Next ${selectedRecipe.name}: need ${needed}` : "Ready for sweet recipes"}</span>
                        <details class="ingredient-note-details">
                          <summary>Why this helps</summary>
                          <span class="muted tiny">${meta.note}</span>
                        </details>
                        <button class="quick-buy-button ingredient-buy-button" type="button" data-buy="${ingredient}" data-buy-amount="${meta.buyAmount}">Buy ${meta.buyLabel} — ${renderCoinIcon("coin-icon-sm")} ${meta.buyCost}</button>
                        <span class="muted tiny ingredient-restock-note">${canCoverNextBake ? "You already have enough for the next bake." : "A quick restock helps this ingredient catch up."}</span>
                      </div>
                    `;
                  })
                  .join("")}
              </div>
            </section>
          `
          : ""
      }

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
                  <div class="recipe-card-hero">${recipe.icon}</div>
                  <div class="recipe-card-head">
                    <div>
                      <h3>${recipe.name}</h3>
                      <p class="recipe-label">${isSelected ? "Today's star bake" : isUnlocked ? "Ready for a fresh batch" : `Collect ✨ ${recipe.unlockSprinkles} sprinkles to unlock this treat`}</p>
                    </div>
                    ${isSelected ? '<span class="recipe-status-badge recipe-status-selected">Selected</span>' : ""}
                  </div>
                  <div class="recipe-details-flat">
                    <p class="recipe-ingredient-line">${renderRecipeIngredientLine(recipe.ingredients)}</p>
                    <p class="recipe-reward-line">
                      <span>${renderCoinIcon("coin-icon-sm")} ${recipe.pricePerItem * recipe.itemsPerBatch}</span>
                      <span>✨ up to 5</span>
                    </p>
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
              ? `<div class="restock-alert-banner restock-alert-banner-strong" role="alert">${renderCoinIcon()} Need ${missingCost} coins to restock before baking.</div>`
              : ""
          }

          ${renderStartBakeNote(player) ? `<p class="visual-mode-note muted tiny">${renderStartBakeNote(player)}</p>` : ""}

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
                ${
                  isReadyToBake
                    ? `<p class="pantry-ready">✓ Pantry stocked — ready to bake</p>`
                    : `
                      <div class="inventory-grid compact-pantry-grid ingredient-shop-grid">
                        ${Object.entries(pantryNeed)
                          .map(([ingredient, amount]) => {
                            const owned = player.pantry[ingredient];
                            const missing = Math.max(0, amount - owned);
                            const meta =
                              INGREDIENT_META[ingredient] ??
                              { label: ingredient, accentClass: "ingredient-generic", note: "Needed for the next bake.", buyAmount: 1, buyLabel: "1", buyCost: getShopCost(ingredient, 1) };
                            const canCoverMissing = owned + meta.buyAmount >= amount;
                            return `
                              <div class="inventory-card ingredient-shop-card ${meta.accentClass} ${missing ? "missing" : "ready"}">
                                ${
                                  !missing
                                    ? `<div class="ingredient-ready-check" aria-label="${meta.label} is stocked for the selected recipe">✓</div>`
                                    : ""
                                }
                                <div class="ingredient-shop-icon ingredient-shop-stamp">${renderIngredientIcon(ingredient)}</div>
                                <strong>${meta.label}</strong>
                                <span>Need ${amount}</span>
                                <span>Have ${owned}</span>
                                <details class="ingredient-note-details">
                                  <summary>Why this helps</summary>
                                  <span class="muted tiny">${meta.note}</span>
                                </details>
                                ${
                                  missing
                                    ? `<button class="quick-buy-button ingredient-buy-button" type="button" data-buy="${ingredient}" data-buy-amount="${meta.buyAmount}">Buy ${meta.buyLabel} — ${renderCoinIcon("coin-icon-sm")} ${meta.buyCost}</button>
                                       <span class="muted tiny ingredient-restock-note">${canCoverMissing ? "One restock covers this bake." : "You may need more than one restock."}</span>`
                                    : ""
                                }
                              </div>
                            `;
                          })
                          .filter(Boolean)
                          .join("")}
                      </div>
                    `
                }
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

function renderStartBakeNote(player) {
  if (isVisualMode(player.SR)) {
    return "Picture-first math is on for this bake.";
  }

  return "";
}

function formatRecipeCountBadge(count) {
  return `Menu ${count} recipe${count === 1 ? "" : "s"} ready`;
}

function renderRecipeIngredientLine(ingredients) {
  return `<span class="recipe-ingredient-emoji">🌾</span>×${ingredients.flour} <span class="recipe-ingredient-emoji">🍬</span>×${ingredients.sugar} <span class="recipe-ingredient-emoji">🥚</span>×${ingredients.eggs}`;
}

function renderIngredientToken(ingredient, amount) {
  const label = INGREDIENT_META[ingredient]?.label ?? ingredient;
  return `${renderIngredientIcon(ingredient)} ${escapeHtml(label)} ×${Number(amount) || 0}`;
}

function renderBakeScreen(gameState, currentStage) {
  const { player, session } = gameState;
  const currentQuestionIndex = session.order?.questionIndex ?? ((session.order?.stageIndex ?? 0) * 2);
  const activeQuestionNumber = session.saleReady
    ? QUESTIONS_PER_BAKE
    : Math.min(currentQuestionIndex + 1, session.order?.questionsPerBake ?? QUESTIONS_PER_BAKE);

  return `
    <section class="flow-screen active-bake-layout">
      <section class="panel kinder-hero-panel regular-bake-hero">
        <div class="regular-status-bar" aria-label="Bake status">
          <div class="regular-status-left">
            ${renderPlayerAvatar(player.avatarId, { size: "sm", className: "hud-baker-avatar", label: `${player.username}'s baker portrait` })}
            <span class="regular-status-name">${escapeHtml(player.username)}</span>
          </div>
          <div class="regular-status-right">
            <span class="regular-status-badge streak-status-pill">Streak ${player.skill.currentStreak}</span>
            <span class="regular-status-badge">Question ${activeQuestionNumber}/${session.order?.questionsPerBake ?? QUESTIONS_PER_BAKE}</span>
            <span class="regular-status-badge sr-status-pill">SR ${player.SR} • ${srToBand(player.SR)}</span>
          </div>
        </div>
        <div class="compact-stage-strip" aria-label="Bake progress">
          ${STAGES.map((stage) => {
            const done = session.saleReady || (session.order && session.order.completedStages.includes(stage));
            const active = !session.saleReady && currentStage === stage && session.order;
            const className = done ? "done" : active ? "active" : "upcoming";

            return `
              <div class="compact-stage-pill compact-stage-pill-${stage} ${className}">
                <span class="compact-stage-pill-icon">${done ? "✓" : escapeHtml(STAGE_META[stage].icon)}</span>
                <span class="compact-stage-pill-label">${escapeHtml(STAGE_META[stage].title)}</span>
              </div>
            `;
          }).join("")}
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
          <div class="badge">${session.saleReady.questionsPerBake ?? QUESTIONS_PER_BAKE} questions baked</div>
        </div>
        ${renderMascot({ mood: "celebrate", compact: true, message: `You did it! These ${session.saleReady.recipeName.toLowerCase()} are ready to wow your customers.` })}
        ${renderBakeSaleReceipt(session.saleReady)}
        <div class="flow-actions">
          <button class="primary-button" data-sell-order type="button">Serve & Sell — ${renderCoinIcon("coin-icon-sm")} ${session.saleReady.revenue}</button>
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
          <div class="stage-banner">Bake line ready</div>
        </div>
      </section>
    `;
  }

  return `
    <section class="panel question-card stage-panel active-question-card stage-${currentStage}">
      ${renderStoryTicket(question, currentStage, activeRecipe, session.order?.batchCount ?? 1)}
      <p class="muted story-problem-copy">${escapeHtml(question.prompt)}</p>
      ${question.promptSecondary ? `<div class="question-secondary-chip">${escapeHtml(question.promptSecondary)}</div>` : ""}
      ${
        question.answerMode === "open"
          ? `
            ${renderStoryHelp(question, session.order?.batchCount ?? 1)}
            ${renderOpenAnswerPanel(question, session.questionResult)}
          `
          : `
            ${renderStoryHelp(question, session.order?.batchCount ?? 1)}
            <div class="answer-grid regular-answer-grid">
              ${question.choices
                .map((choice, index) => {
                  const resultClass = getChoiceClass(session.questionResult, choice, question.answer);
                  const label =
                    question.choiceLabels?.[choice] ??
                    (question.type === "optimization" && choice === question.answer && question.answerLabel
                      ? question.answerLabel
                      : String(choice));

                  return `
                    <button class="choice-button regular-answer-button answer-color-${index % 4} ${resultClass}" type="button" data-answer="${choice}">
                      <span class="regular-answer-number">${escapeHtml(label)}</span>
                    </button>
                  `;
                })
                .join("")}
            </div>
          `
      }
    </section>
  `;
}

function renderOpenAnswerPanel(question, questionResult) {
  const previousAnswer = questionResult?.correct ? "" : String(questionResult?.selectedAnswer ?? "");
  const inputStateClass = questionResult?.correct ? "correct" : questionResult ? "wrong" : "";

  return `
    <form class="open-answer-form" data-answer-form>
      <label class="open-answer-label" for="open-answer-input">Type your answer</label>
      <div class="open-answer-row">
        <input
          class="open-answer-input ${inputStateClass}"
          id="open-answer-input"
          name="answer"
          type="number"
          inputmode="numeric"
          autocomplete="off"
          spellcheck="false"
          value="${escapeHtml(previousAnswer)}"
          placeholder="Enter a number"
        />
        <button class="primary-button open-answer-submit" type="submit">Check Answer</button>
      </div>
    </form>
  `;
}

function renderBakeSaleReceipt(saleReady) {
  const recipeLabel = saleReady.recipeName.toLowerCase();
  const singularLabel = getRecipeSingularLabel(saleReady.recipeName);
  const imperfectBake = saleReady.itemsMade < saleReady.totalPossibleItems;

  return `
    <div class="receipt-card bake-sale-receipt">
      <strong class="bake-sale-receipt-title">${saleReady.recipeIcon} Fresh ${escapeHtml(saleReady.recipeName)}</strong>
      <div class="bake-sale-receipt-lines">
        <div class="bake-sale-receipt-line">
          <span>Baked:</span>
          <span>${saleReady.itemsMade} of ${saleReady.totalPossibleItems} ${escapeHtml(recipeLabel)}</span>
        </div>
        <div class="bake-sale-receipt-line">
          <span>Price:</span>
          <span>${renderCoinIcon("coin-icon-sm")} ${saleReady.pricePerItem} per ${escapeHtml(singularLabel)}</span>
        </div>
        <div class="bake-sale-receipt-line">
          <span>Subtotal:</span>
          <span>${renderCoinIcon("coin-icon-sm")} ${saleReady.saleRevenue}</span>
        </div>
        ${
          saleReady.streakBonus > 0
            ? `
              <div class="bake-sale-receipt-line">
                <span>Streak bonus:</span>
                <span>${renderCoinIcon("coin-icon-sm")} ${saleReady.streakBonus}</span>
              </div>
            `
            : ""
        }
        <div class="bake-sale-receipt-rule" aria-hidden="true"></div>
        <div class="bake-sale-receipt-line bake-sale-receipt-total">
          <span>Total:</span>
          <span>${renderCoinIcon("coin-icon-sm")} ${saleReady.revenue}</span>
        </div>
      </div>
      <p class="bake-sale-sprinkles">✨ ${saleReady.sprinklesEarned} sprinkles earned</p>
      <p class="${imperfectBake ? "bake-sale-note bake-sale-note-warning" : "bake-sale-note bake-sale-note-success"}">
        ${
          imperfectBake
            ? "Some treats didn't make it — more right answers next time means a fuller tray."
            : "⭐ Perfect bake! Every treat made it to the counter."
        }
      </p>
    </div>
  `;
}

function getRecipeSingularLabel(recipeName) {
  const singularMap = {
    Cupcakes: "cupcake",
    Cookies: "cookie",
    Donuts: "donut",
    Muffins: "muffin",
    Brownies: "brownie",
    "Sugar Cookies": "sugar cookie",
    Cake: "cake",
    "Cinnamon Rolls": "cinnamon roll",
    Macarons: "macaron",
    "Ice Cream Sandwiches": "ice cream sandwich",
    "Cheesecake Slices": "cheesecake slice",
    Pies: "pie",
  };

  return singularMap[recipeName] ?? recipeName.toLowerCase();
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
        <span class="story-ticket-pill story-ticket-pill-soft">Question ${(question.orderQuestionIndex ?? 0) + 1}/${question.questionsPerBake ?? QUESTIONS_PER_BAKE}</span>
        <span class="story-ticket-pill story-ticket-pill-soft">${escapeHtml(question.type === "cost" ? "Coin Job" : question.type === "fraction" ? "Fair Share" : question.type === "business" ? "Bakery Business" : "Story Math")}</span>
      </div>
      <div class="story-ticket-grid">
        <div>
          <span class="story-ticket-label">Recipe</span>
          <strong>${activeRecipe ? `${activeRecipe.icon} ${escapeHtml(activeRecipe.name)}` : "Bakery order"}</strong>
        </div>
        <div>
          <span class="story-ticket-label">Station</span>
          <strong class="story-ticket-stage">
            <span class="story-ticket-stage-art">
              ${renderStageArt(currentStage, { className: "stage-art-image-ticket", altLabel: `${STAGE_META[currentStage].title} stage art` })}
            </span>
            <span>${escapeHtml(STAGE_META[currentStage].title)}</span>
          </strong>
        </div>
      </div>
    </div>
  `;
}

function renderStoryHelp(question, batchCount) {
  const mission = question.mission ?? getQuestionMission(question, batchCount);
  const strongHint = question.hint;

  return `
    <details class="story-coach-card story-coach-details">
      <summary class="story-coach-summary">
        <span class="story-coach-label">Baker Tip</span>
        <span class="story-coach-toggle">Show Tip</span>
      </summary>
      <p>${escapeHtml(mission)}</p>
      ${
        strongHint
          ? `
            <details class="story-coach-subdetails">
              <summary class="story-coach-summary story-coach-subsummary">
                <span class="story-coach-label">More Help</span>
                <span class="story-coach-toggle">Show More</span>
              </summary>
              <p>${escapeHtml(strongHint)}</p>
            </details>
          `
          : ""
      }
    </details>
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

  if (scene.kind === "array") {
    return renderArrayScene(scene);
  }

  const useGroupedLayout = groups.some((group) => Number(group.count) > 12);

  return `
    <div class="story-scene-card" aria-label="${escapeHtml(scene.label ?? "Story scene")}">
      <div class="story-scene-label">${escapeHtml(scene.label ?? "Bakery scene")}</div>
      ${scene.caption ? `<p class="story-scene-caption">${escapeHtml(scene.caption)}</p>` : ""}
      <div class="story-scene-groups ${scene.kind === "equal_groups" ? "equal-groups-scene" : "count-scene"} ${useGroupedLayout ? "grouped-story-scene" : ""}">
        ${groups
          .map((group, index) => {
            return `
              <div class="story-scene-group ${useGroupedLayout ? "grouped-scene-group" : ""}">
                ${group.frame ? `<div class="story-scene-frame">${escapeHtml(group.frame)}</div>` : ""}
                ${
                  useGroupedLayout
                    ? renderGroupedSceneTokens(group)
                    : `<div class="story-scene-tokens">${Array.from({ length: Number(group.count) || 0 }, () => renderSceneToken(group)).join("")}</div>`
                }
              </div>
              ${index < groups.length - 1 ? `<div class="story-scene-operator" aria-hidden="true">${escapeHtml(scene.operator ?? "+")}</div>` : ""}
            `;
          })
          .join("")}
      </div>
    </div>
  `;
}

function renderArrayScene(scene) {
  const groups = Array.isArray(scene.groups) ? scene.groups : [];

  return `
    <div class="story-scene-card" aria-label="${escapeHtml(scene.label ?? "Array scene")}">
      <div class="story-scene-label">${escapeHtml(scene.label ?? "Bakery array")}</div>
      ${scene.caption ? `<p class="story-scene-caption">${escapeHtml(scene.caption)}</p>` : ""}
      <div class="story-array-scene">
        ${groups
          .map(
            (group) => `
              <div class="story-array-row">
                ${group.frame ? `<div class="story-scene-frame">${escapeHtml(group.frame)}</div>` : ""}
                <div class="story-array-tokens">
                  ${Array.from({ length: Number(group.count) || 0 }, () => renderSceneToken(group)).join("")}
                </div>
              </div>
            `,
          )
          .join("")}
      </div>
    </div>
  `;
}

function renderGroupedSceneTokens(group) {
  const count = Number(group.count) || 0;
  const bundleSize = 5;
  const bundles = [];
  let remaining = count;

  while (remaining > 0) {
    const nextSize = Math.min(bundleSize, remaining);
    bundles.push(nextSize);
    remaining -= nextSize;
  }

  const visibleBundles = bundles.slice(0, 6);
  const extraBundleCount = Math.max(0, bundles.length - visibleBundles.length);
  const countLabel = group.countLabel ?? "items";

  return `
    <div class="story-scene-group-summary">${count} ${escapeHtml(countLabel)} total</div>
    <div class="story-scene-bundles">
      ${visibleBundles
        .map(
          (bundleCount) => `
            <div class="story-scene-bundle">
              <span class="story-scene-bundle-label">${bundleCount}</span>
              <div class="story-scene-bundle-tokens">
                ${Array.from({ length: bundleCount }, () => renderSceneToken(group)).join("")}
              </div>
            </div>
          `,
        )
        .join("")}
      ${extraBundleCount ? `<div class="story-scene-bundle story-scene-bundle-summary">+${extraBundleCount} more trays of 5</div>` : ""}
    </div>
  `;
}

function renderSceneToken(group) {
  const tokenClass = group.variant ? ` token-${escapeHtml(group.variant)}` : "";
  const emojiClass = group.tokenText && containsEmoji(group.tokenText) ? " token-emoji" : "";
  const tokenText = escapeHtml(group.tokenText ?? group.emoji ?? "•");
  return `<span class="story-scene-token${tokenClass}${emojiClass}">${tokenText}</span>`;
}

function containsEmoji(value) {
  return /[\u2190-\u2BFF\u{1F000}-\u{1FAFF}]/u.test(String(value ?? ""));
}

function getChoiceClass(result, choice) {
  if (!result) {
    return "";
  }

  if (String(choice) === String(result.selectedAnswer) && result.correct) {
    return "correct";
  }

  if (String(choice) === String(result.selectedAnswer) && !result.correct) {
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
