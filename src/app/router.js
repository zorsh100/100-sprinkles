const ROUTES = {
  onboarding: "#/onboarding",
  bakery: "#/bakery",
  shop: "#/shop",
  learn: "#/learn",
};

function routeFromHash(hashValue) {
  const hash = hashValue || window.location.hash;

  if (hash === ROUTES.shop) return "shop";
  if (hash === ROUTES.learn) return "learn";
  if (hash === ROUTES.bakery) return "bakery";
  return "onboarding";
}

export function syncRouteFromState(gameState) {
  const currentRoute = routeFromHash();
  const desiredRoute = gameState.player
    ? currentRoute === "onboarding"
      ? "bakery"
      : currentRoute
    : "onboarding";
  const desiredHash = ROUTES[desiredRoute];

  if (window.location.hash !== desiredHash) {
    window.location.hash = desiredHash;
  }

  return desiredRoute;
}

export function navigate(routeName) {
  const nextHash = ROUTES[routeName] ?? ROUTES.onboarding;

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
