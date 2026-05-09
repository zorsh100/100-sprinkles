import { INGREDIENT_COSTS } from "../../game/data.js";

export function renderShopScreen(player) {
  return `
    <section class="panel">
      <div class="section-head">
        <div>
          <p class="eyebrow">Routing screen</p>
          <h2>Ingredient Shop</h2>
          <p class="muted">Pantry mode turns on at SR 300, but you can start collecting now.</p>
        </div>
        <div class="badge">${player.bank} coins ready</div>
      </div>
      <div class="shop-grid">
        ${Object.entries(INGREDIENT_COSTS)
          .map(
            ([ingredient, cost]) => `
            <article class="shop-card">
              <h3>${ingredient}</h3>
              <div class="ingredient-list">
                <span>Cost ${cost} coins</span>
                <span>Owned ${player.pantry[ingredient]}</span>
              </div>
              <button class="shop-button" type="button" data-buy="${ingredient}">Buy 1</button>
            </article>
          `,
          )
          .join("")}
      </div>
    </section>
  `;
}
