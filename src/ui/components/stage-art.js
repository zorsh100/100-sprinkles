const STAGE_ART_VERSION = "20260517-155100";

const STAGE_ART_LIBRARY = {
  pantry: {
    imageSrc: `./assets/bakery-scenes/pantry-cupboard.png?v=${STAGE_ART_VERSION}`,
    imageAlt: "Bakery pantry shelves filled with labeled jars and baking supplies",
  },
  mixer: {
    imageSrc: `./assets/bakery-scenes/stand-mixer.png?v=${STAGE_ART_VERSION}`,
    imageAlt: "Mint stand mixer with a silver mixing bowl",
  },
  timer: {
    imageSrc: `./assets/bakery-scenes/kitchen-timer.png?v=${STAGE_ART_VERSION}`,
    imageAlt: "Mint kitchen timer with numbered dial",
  },
  oven: {
    imageSrc: `./assets/bakery-scenes/oven-cake.png?v=${STAGE_ART_VERSION}`,
    imageAlt: "Cake baking in a warm oven",
  },
  finishing: {
    imageSrc: `./assets/bakery-scenes/finishing-frosting.png?v=${STAGE_ART_VERSION}`,
    imageAlt: "Cake being frosted and finished with bakery tools and sprinkles",
  },
  serving: {
    imageSrc: `./assets/bakery-scenes/serving-desserts.png?v=${STAGE_ART_VERSION}`,
    imageAlt: "Bakery dessert table filled with finished treats ready to serve",
  },
};

export const STAGE_ART_META = {
  prep: {
    title: "Pantry Shelf",
    note: "Gather flour, sugar, eggs, and everything the bake needs first.",
    artKey: "pantry",
  },
  mixing: {
    title: "Mixing Bowl",
    note: "Batter starts here with scoops, swirls, and careful counting.",
    artKey: "mixer",
  },
  timing: {
    title: "Baking",
    note: "Watch the bake carefully while it rises in the oven.",
    artKey: "oven",
  },
  finishing: {
    title: "Finishing Touches",
    note: "Frost, swirl, and decorate the bake before it heads to the counter.",
    artKey: "finishing",
  },
  serving: {
    title: "Serving Table",
    note: "Finished treats head to the dessert table ready for smiles and coins.",
    artKey: "serving",
  },
};

export const STAGE_GALLERY_ORDER = ["prep", "mixing", "timing", "finishing", "serving"];

export function getStageArtMeta(stage) {
  const stageMeta = STAGE_ART_META[stage] ?? STAGE_ART_META.prep;
  const art = STAGE_ART_LIBRARY[stageMeta.artKey] ?? STAGE_ART_LIBRARY.pantry;
  return {
    ...stageMeta,
    ...art,
  };
}

export function renderStageArt(stage, { className = "", altLabel = "" } = {}) {
  const meta = getStageArtMeta(stage);
  const classes = ["stage-art-image", className].filter(Boolean).join(" ");
  const alt = escapeHtml(altLabel || meta.imageAlt);

  return `<img class="${classes}" src="${meta.imageSrc}" alt="${alt}" loading="lazy" decoding="async" />`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
