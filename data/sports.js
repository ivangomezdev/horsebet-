const outcome = (id, label, odds) => ({ id, label, odds });
const market = (id, title, group, outcomes) => ({ id, title, group, outcomes });

function footballMarkets(home, away, odds) {
  return [
    market("winner", "Resultado del partido · 1X2", "Principal", [
      outcome("home", home, odds[0]),
      outcome("draw", "Empate", odds[1]),
      outcome("away", away, odds[2]),
    ]),
    market("double", "Doble oportunidad", "Principal", [
      outcome("1x", "1 o empate", 1.32),
      outcome("12", "1 o 2", 1.26),
      outcome("x2", "Empate o 2", 1.74),
    ]),
    market("goals", "Total de goles · 2.5", "Totales", [
      outcome("over", "Más de 2.5", 1.85),
      outcome("under", "Menos de 2.5", 1.95),
    ]),
    market("both", "Ambos equipos anotan", "Principal", [
      outcome("yes", "Sí", 1.72),
      outcome("no", "No", 2.08),
    ]),
    market("half", "1.er tiempo · Resultado", "Mitades", [
      outcome("home", home, 2.65),
      outcome("draw", "Empate", 2.15),
      outcome("away", away, 4.2),
    ]),
    market("corners", "Total de córners · 9.5", "Totales", [
      outcome("over", "Más de 9.5", 1.91),
      outcome("under", "Menos de 9.5", 1.89),
    ]),
    market("handicap", "Hándicap · Resultado", "Hándicaps", [
      outcome("home", `${home} -1.5`, 3.1),
      outcome("away", `${away} +1.5`, 1.38),
    ]),
    market("score", "Marcador exacto", "Principal", [
      outcome("10", "1 : 0", 7.5),
      outcome("11", "1 : 1", 6.2),
      outcome("21", "2 : 1", 8.5),
      outcome("20", "2 : 0", 9.8),
    ]),
  ];
}

export { sportCategories } from "./sport-categories.js";

export const sportsEvents = [
  {
    id: "parma-udinese",
    sport: "football",
    league: "Italia · Serie A",
    home: "Parma Calcio",
    away: "Udinese Calcio",
    homeCode: "PAR",
    awayCode: "UDI",
    homeColor: "#c4b27d",
    awayColor: "#ac406b",
    when: "Hoy · 20:00",
    live: false,
    score: null,
    markets: footballMarkets(
      "Parma Calcio",
      "Udinese Calcio",
      [2.1, 3.45, 3.2],
    ),
  },
  {
    id: "genoa-juventus",
    sport: "football",
    league: "Italia · Serie A",
    home: "Génova CFC",
    away: "Juventus",
    homeCode: "GEN",
    awayCode: "JUV",
    homeColor: "#477ff3",
    awayColor: "#ed505b",
    when: "67′ · 2.ª parte",
    live: true,
    score: [1, 1],
    markets: footballMarkets("Génova CFC", "Juventus", [2.65, 2.8, 2.95]),
  },
  {
    id: "milan-bologna",
    sport: "football",
    league: "Italia · Serie A",
    home: "AC Milán",
    away: "Bolonia FC",
    homeCode: "MIL",
    awayCode: "BOL",
    homeColor: "#e34855",
    awayColor: "#a9b5ca",
    when: "Mañana · 18:45",
    live: false,
    score: null,
    markets: footballMarkets("AC Milán", "Bolonia FC", [1.85, 3.6, 4.15]),
  },
  {
    id: "celtics-nets",
    sport: "basketball",
    league: "Estados Unidos · NBA",
    home: "Boston Celtics",
    away: "Brooklyn Nets",
    homeCode: "BOS",
    awayCode: "BKN",
    homeColor: "#e2b54e",
    awayColor: "#45b383",
    when: "07:32 · 3.er cuarto",
    live: true,
    score: [72, 68],
    markets: [
      market("winner", "Ganador · incluye prórroga", "Principal", [
        outcome("home", "Boston Celtics", 1.67),
        outcome("away", "Brooklyn Nets", 2.25),
      ]),
      market("total", "Total de puntos · 218.5", "Totales", [
        outcome("over", "Más de 218.5", 1.9),
        outcome("under", "Menos de 218.5", 1.9),
      ]),
      market("handicap", "Hándicap · 4.5 puntos", "Hándicaps", [
        outcome("home", "Celtics -4.5", 1.95),
        outcome("away", "Nets +4.5", 1.85),
      ]),
    ],
  },
  {
    id: "sinner-alcaraz",
    sport: "tennis",
    league: "Tenis · ATP",
    home: "Jannik Sinner",
    away: "Carlos Alcaraz",
    homeCode: "SIN",
    awayCode: "ALC",
    homeCountry: "IT",
    awayCountry: "ES",
    homeColor: "#45c0c1",
    awayColor: "#d389e0",
    when: "Hoy · 17:30",
    live: false,
    score: null,
    markets: [
      market("winner", "Ganador del partido", "Principal", [
        outcome("home", "Jannik Sinner", 1.78),
        outcome("away", "Carlos Alcaraz", 2.08),
      ]),
      market("total", "Total de juegos · 22.5", "Totales", [
        outcome("over", "Más de 22.5", 1.88),
        outcome("under", "Menos de 22.5", 1.92),
      ]),
      market("sets", "Marcador en sets", "Principal", [
        outcome("20", "Sinner 2 : 0", 2.7),
        outcome("21", "Sinner 2 : 1", 3.8),
        outcome("02", "Alcaraz 2 : 0", 3.5),
        outcome("12", "Alcaraz 2 : 1", 4.1),
      ]),
    ],
  },
  {
    id: "liquid-furia",
    sport: "esports",
    league: "Counter-Strike 2 · ESL",
    home: "Team Liquid",
    away: "FURIA Esports",
    homeCode: "TL",
    awayCode: "FUR",
    homeColor: "#f29055",
    awayColor: "#9b77e3",
    when: "Mañana · 16:00",
    live: false,
    score: null,
    markets: [
      market("winner", "Ganador de la serie", "Principal", [
        outcome("home", "Team Liquid", 1.92),
        outcome("away", "FURIA Esports", 1.88),
      ]),
      market("maps", "Total de mapas · 2.5", "Totales", [
        outcome("over", "Más de 2.5", 2.1),
        outcome("under", "Menos de 2.5", 1.7),
      ]),
      market("first", "Ganador del primer mapa", "Principal", [
        outcome("home", "Team Liquid", 1.95),
        outcome("away", "FURIA Esports", 1.85),
      ]),
    ],
  },
];

function demoMatch(id, sport, league, home, away, options = {}) {
  const {
    homeCountry,
    awayCountry,
    total = 2.5,
    unit = "puntos",
    odds = [1.85, 1.95],
  } = options;
  return {
    id,
    sport,
    league,
    home,
    away,
    homeCountry,
    awayCountry,
    homeCode: home.slice(0, 3).toUpperCase(),
    awayCode: away.slice(0, 3).toUpperCase(),
    when: "Mañana · 19:00",
    live: false,
    score: null,
    markets: [
      market("winner", "Ganador del encuentro", "Principal", [
        outcome("home", home, odds[0]),
        outcome("away", away, odds[1]),
      ]),
      market("total", `Total de ${unit} · ${total}`, "Totales", [
        outcome("over", `Más de ${total}`, 1.9),
        outcome("under", `Menos de ${total}`, 1.9),
      ]),
    ],
  };
}
// Real participant identities; fixtures, schedules, scores and prices are demo data.
sportsEvents.push(
  {
    ...demoMatch(
      "venezia-inter",
      "football",
      "Italia · Serie A",
      "Venecia",
      "Inter Milán",
    ),
    markets: footballMarkets("Venecia", "Inter Milán", [7.8, 5.4, 1.35]),
  },
  {
    ...demoMatch(
      "monza-napoli",
      "football",
      "Italia · Serie A",
      "AC Monza",
      "SSC Nápoles",
    ),
    markets: footballMarkets("AC Monza", "SSC Nápoles", [4.3, 3.95, 1.76]),
  },
  demoMatch(
    "lakers-blazers",
    "basketball",
    "Estados Unidos · NBA",
    "Los Angeles Lakers",
    "Portland Trail Blazers",
    { total: 225.5 },
  ),
  demoMatch(
    "lions-bears",
    "american-football",
    "Fútbol americano · Exhibición virtual",
    "Detroit Lions (E)",
    "Chicago Bears (E)",
    { total: 44.5 },
  ),
  demoMatch(
    "jets-panthers",
    "ice-hockey",
    "Estados Unidos · NHL",
    "Winnipeg Jets",
    "Florida Panthers",
    { total: 5.5, unit: "goles" },
  ),
  demoMatch(
    "japan-usa-baseball",
    "baseball",
    "Béisbol · Internacional",
    "Japón",
    "Estados Unidos",
    { homeCountry: "JP", awayCountry: "US", total: 8.5, unit: "carreras" },
  ),
  demoMatch(
    "psg-atletico-esoccer",
    "esoccer",
    "eSoccer · Copa Internacional",
    "Paris Saint-Germain FC",
    "Atlético Madrid",
    { total: 3.5, unit: "goles" },
  ),
  demoMatch(
    "celtics-lakers-ebasketball",
    "ebasketball",
    "eBasketball · NBA 2K",
    "Boston Celtics",
    "Los Angeles Lakers",
    { total: 118.5 },
  ),
  demoMatch(
    "milan-inter-volta",
    "esoccer-volta",
    "eSoccer Volta · Italia",
    "AC Milán",
    "Inter Milán",
    { total: 5.5, unit: "goles" },
  ),
  demoMatch(
    "nz-south-africa",
    "rugby",
    "Rugby · Internacional",
    "Nueva Zelanda",
    "Sudáfrica",
    { homeCountry: "NZ", awayCountry: "ZA", total: 46.5 },
  ),
  demoMatch(
    "brazil-italy-volleyball",
    "volleyball",
    "Voleibol · Internacional",
    "Brasil",
    "Italia",
    { homeCountry: "BR", awayCountry: "IT", total: 3.5, unit: "sets" },
  ),
  demoMatch(
    "canelo-mbilli",
    "boxing",
    "Boxeo · Supermediano",
    "Saúl Álvarez",
    "Christian Mbilli",
    { homeCountry: "MX", awayCountry: "FR", total: 9.5, unit: "asaltos" },
  ),
  demoMatch(
    "france-denmark-handball",
    "handball",
    "Balonmano · Internacional",
    "Francia",
    "Dinamarca",
    { homeCountry: "FR", awayCountry: "DK", total: 57.5, unit: "goles" },
  ),
  demoMatch(
    "india-australia-cricket",
    "cricket",
    "Cricket · Internacional T20",
    "India",
    "Australia",
    { homeCountry: "IN", awayCountry: "AU", total: 320.5, unit: "carreras" },
  ),
  demoMatch(
    "makhachev-oliveira",
    "mma",
    "MMA · Combate de exhibición",
    "Islam Makhachev",
    "Charles Oliveira",
    { homeCountry: "RU", awayCountry: "BR", total: 2.5, unit: "asaltos" },
  ),
  demoMatch(
    "long-zhendong",
    "table-tennis",
    "Tenis de mesa · Internacional",
    "Ma Long",
    "Fan Zhendong",
    { homeCountry: "CN", awayCountry: "CN", total: 4.5, unit: "sets" },
  ),
  demoMatch(
    "carlsen-nakamura",
    "chess",
    "Ajedrez · Partida rápida",
    "Magnus Carlsen",
    "Hikaru Nakamura",
    { homeCountry: "NO", awayCountry: "US", total: 40.5, unit: "movimientos" },
  ),
  demoMatch(
    "littler-humphries",
    "darts",
    "Dardos · PDC",
    "Luke Littler",
    "Luke Humphries",
    { homeCountry: "GB", awayCountry: "GB", total: 9.5, unit: "legs" },
  ),
  demoMatch(
    "brazil-spain-futsal",
    "futsal",
    "Fútbol sala · Internacional",
    "Brasil",
    "España",
    { homeCountry: "BR", awayCountry: "ES", total: 5.5, unit: "goles" },
  ),
  demoMatch(
    "axelsen-shi",
    "badminton",
    "Bádminton · Individual masculino",
    "Viktor Axelsen",
    "Shi Yu Qi",
    { homeCountry: "DK", awayCountry: "CN", total: 2.5, unit: "sets" },
  ),
  demoMatch(
    "osullivan-trump",
    "snooker",
    "Snooker · World Snooker Tour",
    "Ronnie O’Sullivan",
    "Judd Trump",
    { homeCountry: "GB", awayCountry: "GB", total: 9.5, unit: "frames" },
  ),
  demoMatch(
    "spain-croatia-waterpolo",
    "water-polo",
    "Waterpolo · Internacional",
    "España",
    "Croacia",
    { homeCountry: "ES", awayCountry: "HR", total: 21.5, unit: "goles" },
  ),
);
const headToHead = (
  id,
  sport,
  league,
  home,
  away,
  homeCountry,
  awayCountry,
) => {
  const event = demoMatch(id, sport, league, home, away, {
    homeCountry,
    awayCountry,
  });
  event.markets = [
    market("winner", "Cara a cara · Mejor posición final", "Principal", [
      outcome("home", home, 1.8),
      outcome("away", away, 2.05),
    ]),
  ];
  return event;
};
sportsEvents.push(
  headToHead(
    "city-of-troy-auguste-rodin",
    "horse-racing",
    "Hípica · Cara a cara",
    "City of Troy",
    "Auguste Rodin",
  ),
  headToHead(
    "verstappen-norris",
    "formula-1",
    "Automovilismo · Fórmula 1",
    "Max Verstappen",
    "Lando Norris",
    "NL",
    "GB",
  ),
  headToHead(
    "scheffler-mcilroy",
    "golf",
    "Golf · Cara a cara",
    "Scottie Scheffler",
    "Rory McIlroy",
    "US",
    "GB",
  ),
  headToHead(
    "pogacar-vingegaard",
    "cycling",
    "Ciclismo · Cara a cara",
    "Tadej Pogačar",
    "Jonas Vingegaard",
    "SI",
    "DK",
  ),
);

export const findSportsEvent = (id) =>
  sportsEvents.find((event) => event.id === id);
export const sportsEventPath = (id) => `/es/sports/${id}/`;
