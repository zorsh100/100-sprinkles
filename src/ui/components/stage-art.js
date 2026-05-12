const STAGE_ART_VERSION = "20260512-101400";

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
    title: "Oven Timer",
    note: "Watch the minutes so the bake turns golden instead of rushed.",
    artKey: "timer",
  },
  finishing: {
    title: "Warm Oven",
    note: "The tray rises here before the finishing touches go on top.",
    artKey: "oven",
  },
  serving: {
    title: "Bakery Shelf",
    note: "Fresh bakes head back to the front counter ready to serve.",
    artKey: "pantry",
  },
};

export const STAGE_GALLERY_ORDER = ["prep", "mixing", "timing", "finishing"];

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
