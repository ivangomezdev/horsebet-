const settings = {
  "dragons-hoard": ["embers", "fantasy", "EL DESPERTAR DEL DRAGÓN"],
  "canal-royale": ["water", "palace", "CARNAVAL DE PREMIOS"],
  "horse-fortune": ["confetti", "showtime", "LA GRAN FUNCIÓN"],
  "neon-gems": ["energy", "neon", "SOBRECARGA DE CRISTALES"],
  "ruby-rush": ["embers", "gothic", "EL CORAZÓN DEL RUBÍ"],
  aztec: ["leaves", "temple", "EL TEMPLO DESPIERTA"],
  diamond: ["snow", "ice", "AVALANCHA DE DIAMANTES"],
  sugar: ["sweets", "candy", "LLUVIA DE DULCES"],
  pepper: ["embers", "western", "¡FUEGO EN LOS RODILLOS!"],
  olympus: ["storm", "palace", "EL PODER DEL OLIMPO"],
  sugar1000: ["energy", "cosmic", "EXPLOSIÓN CÓSMICA"],
  "horse-sugar": ["sweets", "candy", "EL FESTÍN DEL CABALLO"],
  "horse-merge": ["leaves", "meadow", "LA SUERTE DE LA MANADA"],
  bass: ["bubbles", "ocean", "LA GRAN CAPTURA"],
  joker: ["confetti", "showtime", "EL SHOW DEL BUFÓN"],
  fruit: ["leaves", "orchard", "LA COSECHA DORADA"],
  vampy: ["bats", "gothic", "EL DESPERTAR DE MEDIANOCHE"],
};

export const slotVisuals = Object.fromEntries(
  Object.entries(settings).map(([id, [weather, style, bonusTitle]]) => [
    id,
    {
      image: `/images/slots/${id}.webp`,
      cover: `/images/slots/${id}-cover.webp`,
      weather,
      style,
      bonusTitle,
    },
  ]),
);
