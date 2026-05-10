const ROUTES = {
  title: "#/title",
  profile: "#/profile",
  recipe: "#/recipe",
  bake: "#/bake",
  stats: "#/stats",
  settings: "#/settings",
  unlock: "#/unlock",
};

export function getRouteFromHash(hashValue = window.location.hash) {
  const hash = hashValue;

  if (hash === ROUTES.profile) return "profile";
  if (hash === ROUTES.recipe) return "recipe";
  if (hash === ROUTES.bake) return "bake";
  if (hash === ROUTES.stats) return "stats";
  if (hash === ROUTES.settings) return "settings";
  if (hash === ROUTES.unlock) return "unlock";
  return "title";
}

export function navigate(routeName) {
  const nextHash = ROUTES[routeName] ?? ROUTES.title;

  if (window.location.hash !== nextHash) {
    window.location.hash = nextHash;
  }

  return getRouteFromHash(nextHash);
}

export function subscribeToRouteChanges(onRouteChange) {
  window.addEventListener("hashchange", () => {
    onRouteChange(getRouteFromHash());
  });
}
