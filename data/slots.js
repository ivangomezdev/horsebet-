import { themedSlots } from "./slot-collection.js";

export const slotSymbols = [
  { id: "horse", name: "Caballo", art: 0, pays: [100, 300, 1000] },
  { id: "emerald", name: "Esmeralda", art: 1, pays: [20, 80, 250] },
  { id: "ruby", name: "Rubí", art: 2, pays: [20, 80, 250] },
  { id: "diamond", name: "Diamante", art: 3, pays: [25, 100, 400] },
  { id: "seven", name: "Siete", art: 4, pays: [40, 150, 600] },
  { id: "shoe", name: "Herradura", art: 5, pays: [35, 120, 500] },
  { id: "crown", name: "Corona", art: 6, pays: [80, 250, 900] },
  { id: "bell", name: "Campana", art: 7, pays: [25, 100, 350] },
  { id: "cherry", name: "Cerezas", art: 8, pays: [15, 60, 200] },
];
export const slotThemes = {
  "horse-fortune": {
    title: "Horse Fortune",
    subtitle: "THE GOLDEN COLLECTION",
    color: "gold",
    emblem: "horse",
    weights: [1, 4, 4, 3, 2, 2, 1, 3, 4],
    tagline: "La fortuna tiene un nuevo emblema.",
  },
  "neon-gems": {
    title: "Neon Gems",
    subtitle: "LIGHT UP THE NIGHT",
    color: "violet",
    emblem: "diamond",
    weights: [1, 5, 5, 4, 1, 2, 1, 2, 3],
    tagline: "Cinco rodillos. Un universo de gemas.",
  },
  "ruby-rush": {
    title: "Ruby Rush",
    subtitle: "FEEL THE RED",
    color: "red",
    emblem: "ruby",
    weights: [1, 3, 5, 3, 3, 2, 1, 2, 4],
    tagline: "El brillo del rubí. La emoción del giro.",
  },
  ...Object.fromEntries(
    themedSlots.map((theme) => [
      theme.id,
      {
        ...theme,
        color: "gold",
        weights: slotSymbols.map((symbol) =>
          symbol.id === theme.emblem
            ? 5
            : symbol.id === "horse" || symbol.id === "crown"
              ? 1
              : 3,
        ),
        tagline: `${theme.subtitle.toLowerCase()}. Una creación de HorseBet.`,
      },
    ]),
  ),
};
export const slotCatalog = Object.entries(slotThemes).map(([id, theme]) => ({
  id,
  title: theme.title,
  provider: "HORSEBET",
  slotTheme: id,
  ...(theme.art !== undefined ? { art: theme.art, atlas: theme.atlas } : {}),
  category: "Slots",
  badge: "JUGABLE",
}));
