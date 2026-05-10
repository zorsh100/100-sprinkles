const ROUTES = {
  title: "#/title",
  profile: "#/profile",
  recipe: "#/recipe",
  bake: "#/bake",
  stats: "#/stats",
  settings: "#/settings",
  unlock: "#/unlock",
};

function routeFromHash(hashValue) {
  const hash = hashValue || window.location.hash;

  if (hash === ROUTES.profile) return "profile";
  if (hash === ROUTES.recipe) return "recipe";
  if (hash === ROUTES.bake) return "bake";
  if (hash === ROUTES.stats) return "stats";
  if (hash === ROUTES.settings) return "settings";
  if (hash === ROUTES.unlock) return "unlock";
  return "title";
}

export function syncRouteFromState(gameState) {
  const currentRoute = routeFromHash();
  const desiredRoute = getAllowedRoute(gameState, currentRoute);
  const desiredHash = ROUTES[desiredRoute];

  if (window.location.hash !== desiredHash) {
    window.location.hash = desiredHash;
  }

  return desiredRoute;
}

export function navigate(routeName) {
  const nextHash = ROUTES[routeName] ?? ROUTES.title;

  if (window.location.hash !== nextHash) {
    window.location.hash = nextHash;
  }

  return routeFromHash(nextHash);
}

export function subscribeToRouteChanges(onRouteChange) {
  window.addEventListener("hashchange", () => {
    onRouteChange(routeFromHash());
  });
}

function getAllowedRoute(gameState, requestedRoute) {
  if (requestedRoute === "title") {
    return "title";
  }

  if (requestedRoute === "settings") {
    return "settings";
  }

  if (!gameState.player) {
    return requestedRoute === "profile" ? "profile" : "title";
  }

  if (gameState.session.order || gameState.session.saleReady) {
    return "bake";
  }

  if (gameState.session.pendingRecipeUnlocks?.length) {
    return requestedRoute === "stats" ? "stats" : "unlock";
  }

  if (gameState.session.recentSale) {
    if (requestedRoute === "stats" || requestedRoute === "recipe") {
      return requestedRoute;
    }

    return "stats";
  }

  if (requestedRoute === "profile") {
    return "profile";
  }

  return "recipe";
}
