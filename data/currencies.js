export const currencies = [
  {
    code: "USDT",
    name: "Tether",
    decimals: 6,
    networks: ["Tron · TRC20", "Ethereum · ERC20"],
  },
  {
    code: "USDC",
    name: "USD Coin",
    decimals: 6,
    networks: ["Ethereum · ERC20", "Solana"],
  },
  { code: "BTC", name: "Bitcoin", decimals: 8, networks: ["Bitcoin"] },
  { code: "TRX", name: "TRON", decimals: 6, networks: ["Tron"] },
  { code: "XRP", name: "XRP", decimals: 6, networks: ["XRP Ledger"] },
  { code: "SOL", name: "Solana", decimals: 9, networks: ["Solana"] },
];
export const currencyByCode = Object.fromEntries(
  currencies.map((c) => [c.code, c]),
);
export const memberRoutes = {
  wallet: "Cartera",
  deposit: "Depósito",
  vault: "Bóveda",
  notifications: "Notificaciones",
  profile: "Perfil",
  tournaments: "Torneos",
  community: "Comunidad",
};
