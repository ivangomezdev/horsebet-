import { currencyByCode } from "../../data/currencies.js";
// Product defaults. Only trusted server integrations award eligible points.
export const rankThresholds = [
  0n,
  1000n,
  5000n,
  15000n,
  50000n,
  100000n,
  250000n,
  500000n,
  1000000n,
  2500000n,
  5000000n,
  10000000n,
  20000000n,
  40000000n,
  80000000n,
  160000000n,
  320000000n,
  640000000n,
  1280000000n,
  2560000000n,
  5120000000n,
];
export function rankProgress(value = "0") {
  const points = BigInt(value);
  let level = 0;
  while (
    level + 1 < rankThresholds.length &&
    points >= rankThresholds[level + 1]
  )
    level++;
  const next = rankThresholds[level + 1];
  return {
    level,
    nextLevel: next ? level + 1 : null,
    percent: next
      ? Number(
          ((points - rankThresholds[level]) * 100n) /
            (next - rankThresholds[level]),
        )
      : 100,
    remaining: next ? (next - points).toString() : "0",
    points: points.toString(),
  };
}
export function parseCurrencyAmount(value, code) {
  const coin = currencyByCode[code];
  if (!coin || !/^\d{1,22}(\.\d+)?$/.test(value))
    throw new Error("Importe no válido.");
  const [whole, fraction = ""] = value.split(".");
  if (fraction.length > coin.decimals)
    throw new Error(`Máximo ${coin.decimals} decimales.`);
  const amount =
    BigInt(whole) * 10n ** BigInt(coin.decimals) +
    BigInt(fraction.padEnd(coin.decimals, "0"));
  if (amount <= 0n || amount > 10n ** 30n)
    throw new Error("Importe fuera de rango.");
  return amount.toString();
}
