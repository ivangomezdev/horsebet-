import { DRAGONS_HOARD } from "../lib/games/vendor/metaincognita/dragons-hoard.js";
import { CANAL_ROYALE } from "../lib/games/vendor/metaincognita/canal-royale.js";
import { RUBY_OF_GARGOYLE } from "../lib/games/vendor/metaincognita/ruby-of-gargoyle.js";
import { TEMPLE_OF_GOLD } from "../lib/games/vendor/metaincognita/temple-of-gold.js";
import { WONDER_WHEEL } from "../lib/games/vendor/metaincognita/wonder-wheel.js";
import { themedSlots } from "./slot-collection.js";
import { slotVisuals } from "./slot-visuals.js";

const families = {
  ways: {
    definition: DRAGONS_HOARD,
    label: "243 COMBINACIONES",
    description: "243 combinaciones, comodines y 8 giros gratis reactivables.",
    rules:
      "Combina símbolos en rodillos consecutivos desde la izquierda. Los WILD sustituyen símbolos normales. Tres o más SCATTER activan 8 giros gratis y pueden reactivar otros 8. La apuesta total equivale a 25 unidades; la tabla muestra premios por unidad y por combinación.",
  },
  lines: {
    definition: CANAL_ROYALE,
    label: "25 LÍNEAS · FREE SPINS",
    description: "25 líneas y 10 giros gratis con premios dobles.",
    rules:
      "25 líneas activas; combina 3, 4 o 5 símbolos desde la izquierda. Los WILD sustituyen símbolos normales. Tres o más SCATTER activan 10 giros gratis ×2 sin reactivación. La apuesta total equivale a 25 unidades; los premios de líneas se suman.",
  },
  hold: {
    definition: RUBY_OF_GARGOYLE,
    label: "HOLD & SPIN",
    description: "Atrapa 6 gemas, bloquéalas y descubre las nuevas tiradas.",
    rules:
      "25 líneas. Seis o más gemas activan Hold & Spin: quedan bloqueadas y recibes 3 nuevas tiradas. Cada gema nueva reinicia el contador. Los multiplicadores de ojo se suman y multiplican el total recogido. Completar las 15 casillas añade el GRAND demo. Los valores se muestran en fichas según la apuesta (25 unidades).",
  },
  cascade: {
    definition: TEMPLE_OF_GOLD,
    label: "CASCADAS · HASTA ×8",
    description:
      "20 símbolos, cascadas animadas y una escalera de multiplicadores.",
    rules:
      "Ocho o más símbolos iguales en cualquier posición pagan. Desaparecen y caen nuevos símbolos. Hasta 5 cascadas con multiplicadores ×1, ×2, ×3, ×5 y ×8, dentro de una sola apuesta. Seis ídolos en el tablero inicial activan el GRAND demo. La tabla expresa multiplicadores de la apuesta total.",
  },
  wheel: {
    definition: WONDER_WHEEL,
    label: "RULETA DE BONUS",
    description: "Tres rodillos y una ruleta de 24 premios.",
    rules:
      "Paga la fila central de los tres rodillos. WHEEL en la fila central del tercer rodillo activa un giro de ruleta sin otra apuesta. Siempre se juegan las 3 unidades que habilitan el bonus. Los 24 sectores tienen probabilidades distintas: sus pesos se muestran en la tabla. Cada premio de ruleta se convierte a fichas con el valor de la apuesta ÷ 3.",
  },
};
const familyById = {
  aztec: "cascade",
  diamond: "ways",
  sugar: "cascade",
  pepper: "wheel",
  olympus: "lines",
  sugar1000: "cascade",
  "horse-sugar": "lines",
  "horse-merge": "hold",
  bass: "ways",
  joker: "wheel",
  fruit: "cascade",
  vampy: "hold",
};
const iconOverrides = {
  sugar: ["cherry", "plum", "orange", "bell", "grand"],
  sugar1000: ["diamond", "ruby", "pearl", "crown", "grand"],
  fruit: ["cherry", "plum", "orange", "bell", "grand"],
  diamond: ["diamond", "ruby", "crown"],
  bass: ["koi", "goldbar", "pearl"],
  olympus: ["crown", "chalice", "fan"],
  "horse-sugar": ["cherry", "orange", "plum"],
};
const entries = [
  {
    id: "dragons-hoard",
    title: "Dragon’s Hoard",
    family: "ways",
    icon: "dragon",
    color: "red",
    accent: "#e5bd70",
    dark: "#592531",
  },
  {
    id: "canal-royale",
    title: "Canal Royale",
    family: "lines",
    icon: "gondola",
    color: "violet",
    accent: "#bea5e3",
    dark: "#3e2b63",
  },
  {
    id: "horse-fortune",
    title: "Horse Fortune",
    family: "wheel",
    icon: "wheel",
    color: "gold",
    accent: "#e5bd70",
    dark: "#594321",
  },
  {
    id: "neon-gems",
    title: "Neon Gems",
    family: "ways",
    icon: "diamond",
    color: "violet",
    accent: "#c998f1",
    dark: "#452857",
  },
  {
    id: "ruby-rush",
    title: "Ruby Rush",
    family: "hold",
    icon: "ruby",
    color: "red",
    accent: "#f1a495",
    dark: "#642535",
  },
  ...themedSlots.map((theme) => ({
    ...theme,
    icon:
      { horse: "crown", shoe: "bell", emerald: "diamond" }[theme.emblem] ||
      theme.emblem,
    family: familyById[theme.id],
    color: "gold",
  })),
];
const ending =
  " Todos los bonus pertenecen a una sola ronda demo. El saldo se liquida al completarla; salir o recargar devuelve la apuesta y descarta esa ronda. El GRAND es local a esta sesión, sin dinero real. La vista previa no afecta al saldo ni al historial.";
export const bonusSlots = Object.fromEntries(
  entries.map((theme) => {
    const family = families[theme.family];
    const definition = structuredClone(family.definition);
    const icons = iconOverrides[theme.id];
    if (icons)
      Object.keys(definition.symbols)
        .slice(0, icons.length)
        .forEach((id, index) => {
          definition.symbols[id] = { label: icons[index], icon: icons[index] };
        });
    return [
      theme.id,
      {
        ...theme,
        visual: slotVisuals[theme.id],
        definition,
        tag: theme.subtitle || family.label,
        description: family.description,
        rules: family.rules + ending,
        featureLabel: family.label,
      },
    ];
  }),
);
export const bonusSlotCatalog = Object.entries(bonusSlots).map(
  ([id, game]) => ({
    id,
    title: game.title,
    provider: "HORSEBET",
    category: "Slots",
    badge: ["dragons-hoard", "canal-royale", "ruby-rush", "aztec"].includes(id)
      ? "NUEVO"
      : "BONUS",
    bonusTheme: id,
    bonusIcon: game.emblem || game.icon,
    bonusLabel: game.featureLabel,
    bonusAccent: game.accent,
    bonusDark: game.dark,
    cover: game.visual.cover,
  }),
);
