"use client";
import { useEffect, useRef, useState } from "react";
import {
  Gamepad2,
  Spade,
  Cherry,
  CircleDot,
  Dice5,
  Search,
  X,
  Heart,
  Shuffle,
  SlidersHorizontal,
} from "lucide-react";
import CasinoPromotions from "./CasinoPromotions";
import GameSection, { GameCard } from "./GameSection";
import {
  WelcomeBonuses,
  RecentWins,
  Providers,
  CasinoAbout,
} from "./CasinoExtras";
import {
  casinoGames,
  casinoSlots,
  casinoOriginals,
  liveGames,
  tableGames,
  featuredGames,
  providers,
} from "../data/casino";

const tabs = [
  ["Lobby", Gamepad2],
  ["Originals", Spade],
  ["Slots", Cherry],
  ["En vivo", CircleDot],
  ["Mesa", Dice5],
];
const categoryHashes = {
  lobby: "Lobby",
  slots: "Slots",
  originales: "Originals",
  internos: "Originals",
  "en-vivo": "En vivo",
  mesa: "Mesa",
  favoritos: "Favoritos",
};
const normalize = (value) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

export default function CasinoLobby({
  onAction,
  onPlay,
  favorites,
  onFavorite,
  onHome,
}) {
  const [category, setCategory] = useState("Lobby");
  const [query, setQuery] = useState("");
  const [provider, setProvider] = useState("Todos");
  const [sort, setSort] = useState("popular");
  const [limit, setLimit] = useState(12);
  const toolbar = useRef(null);
  useEffect(() => {
    const readCategory = () => {
      setCategory(categoryHashes[window.location.hash.slice(1)] || "Lobby");
      setLimit(12);
    };
    readCategory();
    window.addEventListener("hashchange", readCategory);
    return () => window.removeEventListener("hashchange", readCategory);
  }, []);
  const selectCategory = (next, scroll = false) => {
    setCategory(next);
    setQuery("");
    setProvider("Todos");
    setLimit(12);
    const hash = Object.keys(categoryHashes).find(
      (key) => categoryHashes[key] === next,
    );
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${hash && next !== "Lobby" ? `#${hash}` : ""}`,
    );
    if (scroll)
      toolbar.current.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const filtered = casinoGames.filter((game) => {
    const matchesCategory =
      category === "Lobby" ||
      category === "Todos" ||
      category === game.category ||
      (category === "Favoritos" && favorites.includes(game.id)) ||
      (category === "Lo mejor" &&
        featuredGames.some((item) => item.id === game.id)) ||
      game.tags?.includes(category) ||
      (category === "Nuevos" && game.badge === "NUEVO");
    return (
      matchesCategory &&
      (provider === "Todos" || provider === game.provider) &&
      normalize(`${game.title} ${game.provider}`).includes(normalize(query))
    );
  });
  const sorted =
    sort === "az"
      ? [...filtered].sort((a, b) => a.title.localeCompare(b.title, "es"))
      : sort === "za"
        ? [...filtered].sort((a, b) => b.title.localeCompare(a.title, "es"))
        : filtered;
  const isLobby = category === "Lobby" && !query.trim() && provider === "Todos";
  const gameProps = { onPlay, favorites, onFavorite };
  const section = (title, list, target, badge, showAllCard = false) => (
    <GameSection
      key={title}
      title={title}
      games={list}
      {...gameProps}
      onSeeAll={() => selectCategory(target, true)}
      seeAllLabel={`Todo ${list.length}`}
      badge={badge}
      showAllCard={showAllCard}
    />
  );
  const selectProvider = (next) => {
    setCategory("Todos");
    setProvider(next);
    setQuery("");
    setLimit(12);
    toolbar.current.scrollIntoView({ behavior: "smooth" });
  };
  return (
    <div className="content casino-lobby">
      <h1 className="casino-lobby__title">Casino HorseBet</h1>
      <CasinoPromotions onAction={onAction} />
      <div className="casino-toolbar" ref={toolbar}>
        <nav className="casino-tabs" aria-label="Categorías del casino">
          {tabs.map(([label, Icon]) => (
            <button
              key={label}
              className={`casino-tabs__tab ${category === label ? "casino-tabs__tab--active" : ""}`}
              aria-pressed={category === label}
              onClick={() => selectCategory(label)}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </nav>
        <label className="casino-search">
          <Search size={19} />
          <input
            aria-label="Busca un juego"
            placeholder="Busca un juego"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setLimit(12);
            }}
          />
          {query && (
            <button aria-label="Limpiar búsqueda" onClick={() => setQuery("")}>
              <X size={16} />
            </button>
          )}
        </label>
      </div>
      {isLobby ? (
        <>
          {section("Slots", casinoSlots, "Slots")}
          {section(
            "Originales HorseBet",
            casinoOriginals,
            "Originals",
            "JUEGOS EXCLUSIVOS",
          )}
          {section("Lo mejor", featuredGames, "Lo mejor", null, true)}
          <WelcomeBonuses onAction={onAction} />
          <RecentWins onPlay={onPlay} />
          {section("Casino en vivo", liveGames, "En vivo")}
          <Providers onSelect={selectProvider} />
          {section(
            "Salón de los grandes apostadores",
            liveGames.filter((game) => game.tags.includes("VIP")),
            "VIP",
            null,
            true,
          )}
          {section(
            "Programas de juegos",
            liveGames.filter((game) => game.tags.includes("Programas")),
            "Programas",
            null,
            true,
          )}
          {section(
            "Ruleta",
            [...tableGames, ...liveGames].filter((game) =>
              game.tags?.includes("Ruleta"),
            ),
            "Ruleta",
            null,
            true,
          )}
          {section(
            "Blackjack",
            [...liveGames, ...tableGames].filter((game) =>
              game.tags?.includes("Blackjack"),
            ),
            "Blackjack",
          )}
          {section(
            "Nuevos lanzamientos",
            casinoSlots.filter((game) => game.badge === "NUEVO"),
            "Nuevos",
            null,
            true,
          )}
        </>
      ) : (
        <section className="casino-results" aria-label="Catálogo de juegos">
          <div className="casino-results__heading">
            <h2>
              {query.trim()
                ? `Resultados para “${query.trim()}”`
                : category === "Lobby" || category === "Todos"
                  ? "Todos los juegos"
                  : category}
              <span>{sorted.length}</span>
            </h2>
            <div className="casino-results__tools">
              <button
                className={`casino-results__favorite ${category === "Favoritos" ? "casino-results__favorite--active" : ""}`}
                aria-label="Ver favoritos"
                onClick={() => selectCategory("Favoritos")}
              >
                <Heart size={17} />
                <span>Favoritos</span>
              </button>
              <button
                className="casino-results__random"
                aria-label="Sorpréndeme con un juego"
                onClick={() =>
                  onPlay(sorted[Math.floor(Math.random() * sorted.length)])
                }
                disabled={!sorted.length}
              >
                <Shuffle size={17} />
                <span>Sorpréndeme</span>
              </button>
            </div>
          </div>
          <div className="casino-filters">
            <SlidersHorizontal size={17} />
            <label>
              Proveedor
              <select
                value={provider}
                onChange={(event) => {
                  setProvider(event.target.value);
                  setLimit(12);
                }}
              >
                <option>Todos</option>
                {providers.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <label>
              Ordenar
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
              >
                <option value="popular">Recomendados</option>
                <option value="az">Nombre: A–Z</option>
                <option value="za">Nombre: Z–A</option>
              </select>
            </label>
            <button
              className="text-button"
              onClick={() => {
                selectCategory("Lobby");
                setSort("popular");
              }}
            >
              Restablecer
            </button>
          </div>
          <div className="catalog__grid">
            {sorted.slice(0, limit).map((game) => (
              <GameCard
                key={game.id}
                game={game}
                onPlay={onPlay}
                onFavorite={onFavorite}
                favorite={favorites.includes(game.id)}
              />
            ))}
          </div>
          {sorted.length === 0 && (
            <div className="empty-state">
              <Search size={34} />
              <h3>
                {category === "Favoritos"
                  ? "Aún no tienes favoritos"
                  : "No encontramos juegos"}
              </h3>
              <p>
                {category === "Favoritos"
                  ? "Guarda tus juegos con el corazón de cada tarjeta."
                  : "Prueba otra búsqueda o cambia los filtros."}
              </p>
              <button
                className="button button--secondary"
                onClick={() => selectCategory("Lobby")}
              >
                Volver al lobby
              </button>
            </div>
          )}
          {sorted.length > limit && (
            <button
              className="casino-results__more button button--secondary"
              onClick={() => setLimit((value) => value + 12)}
            >
              Mostrar más juegos ({sorted.length - limit})
            </button>
          )}
          <p className="casino-results__count" aria-live="polite">
            Mostrando {Math.min(limit, sorted.length)} de {sorted.length} juegos
          </p>
        </section>
      )}
      <div className="casino-lobby__quick">
        <button onClick={() => selectCategory("Favoritos", true)}>
          <Heart size={17} /> Mis favoritos <span>{favorites.length}</span>
        </button>
        <button
          onClick={() =>
            onPlay(casinoGames[Math.floor(Math.random() * casinoGames.length)])
          }
        >
          <Shuffle size={17} /> Elegir un juego al azar
        </button>
      </div>
      <CasinoAbout onHome={onHome} />
    </div>
  );
}
