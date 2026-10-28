// Original HorseBet artwork; the remaining symbols use the licensed SVG set.
const illustratedSymbols = new Set([
  "horse",
  "emerald",
  "ruby",
  "diamond",
  "seven",
  "shoe",
  "crown",
  "bell",
  "cherry",
]);

const worldSymbols = [
  "dragon",
  "phoenix",
  "koi",
  "pearl",
  "ingot",
  "lion",
  "mask",
  "fan",
  "doge",
  "gondola",
  "star-shoot",
  "gargoyle",
  "chalice",
  "grand",
  "plum",
  "orange",
];
export const symbolSprite = (icon) => {
  if (icon === "seven-neon") return "seven";
  if (icon === "goldbar") icon = "ingot";
  if (icon === "gargoyle-eye") icon = "ruby";
  const index = worldSymbols.indexOf(icon);
  return index >= 0
    ? `world-${index}`
    : illustratedSymbols.has(icon)
      ? icon
      : null;
};
