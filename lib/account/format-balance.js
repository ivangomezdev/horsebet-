import { formatAtomic } from "./validation.js";
export function formatBalance(value, decimals) {
  return formatAtomic(value, decimals, decimals).replace(
    /(\.\d{2}.*?)0+$/,
    "$1",
  );
}
