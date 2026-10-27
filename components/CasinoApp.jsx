"use client";
import { useEffect, useState } from "react";
import {
  ChevronRight,
  Headphones,
  Search,
  X,
  Heart,
  Trophy,
  ShieldCheck,
  Zap,
  Gift,
  Bitcoin,
} from "lucide-react";
import { Header, Sidebar, Footer, MobileNav } from "./SiteShell";
import Hero from "./Hero";
import GameSection, { GameCard } from "./GameSection";
import { GameArt, ObjectArt } from "./Artwork";
import Modal from "./Modal";
import Sports, { SportsPreview } from "./Sports";
import { games, originals } from "../data/content";

const allGames = [...games, ...originals];
function readLocal(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}
function saveLocal(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* Private browser mode can make storage unavailable. */
  }
}

export default function CasinoApp() {
  const [view, setView] = useState("Inicio");
  const [expanded, setExpanded] = useState(false);
  const [modal, setModal] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [user, setUser] = useState("");
  const [filter, setFilter] = useState("Todos");
  const [query, setQuery] = useState("");
  const [sport, setSport] = useState("Fútbol");
  useEffect(() => {
    const savedFavorites = readLocal("betfury-demo-favorites", []);
    setFavorites(Array.isArray(savedFavorites) ? savedFavorites : []);
    const savedUser = readLocal("betfury-demo-user", "");
    setUser(typeof savedUser === "string" ? savedUser : "");
    const syncHash = () => {
      const page = window.location.hash.slice(1);
      setView(
        page === "casino"
          ? "Casino"
          : page === "deportes"
            ? "Deportes"
            : "Inicio",
      );
    };
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, []);
  const navigate = (next, selectedSport) => {
    setView(next);
    setExpanded(false);
    if (selectedSport) setSport(selectedSport);
    window.location.hash = next === "Inicio" ? "inicio" : next.toLowerCase();
    window.scrollTo({ top: 0, behavior: "instant" });
  };
  const open = (type) => {
    if (["Casino", "Deportes"].includes(type)) return navigate(type);
    if (["Slots", "Internos"].includes(type)) {
      setFilter(type);
      return navigate("Casino");
    }
    setModal({ type });
  };
  const toggleFavorite = (id) =>
    setFavorites((previous) => {
      const next = previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id];
      saveLocal("betfury-demo-favorites", next);
      return next;
    });
  const onPlay = (game) => setModal({ type: "game", game });
  const catalog = allGames.filter(
    (game) =>
      (filter === "Todos" ||
        (filter === "Favoritos" && favorites.includes(game.id)) ||
        (filter === "Slots" && games.includes(game)) ||
        (filter === "Internos" && originals.includes(game))) &&
      `${game.title} ${game.provider}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const commonGameProps = { onPlay, favorites, onFavorite: toggleFavorite };
  return (
    <div className="site-shell">
      <a className="skip-link" href="#main">
        Saltar al contenido
      </a>
      <Header
        onNavigate={navigate}
        onAction={open}
        expanded={expanded}
        setExpanded={setExpanded}
        user={user}
      />
      <Sidebar
        expanded={expanded}
        current={view === "Inicio" ? "Casino" : view}
        onNavigate={navigate}
        onAction={open}
        onClose={() => setExpanded(false)}
      />
      <main className="main" id="main">
        {view === "Inicio" ? (
          <>
            <Hero onAction={open} />
            <div className="content">
              <section className="destinations" aria-label="Explora BetFury">
                <button
                  className="destination destination--casino"
                  onClick={() => navigate("Casino")}
                >
                  <span>
                    <strong>Casino</strong>
                    <span>
                      Disfruta de BetFury Originals y otros juegos de
                      <br className="desktop-break" /> casino de los mejores
                      proveedores.
                    </span>
                    <b>
                      Explorar casino <ChevronRight size={14} />
                    </b>
                  </span>
                  <ObjectArt kind="dice" />
                </button>
                <button
                  className="destination destination--sports"
                  onClick={() => navigate("Deportes")}
                >
                  <span>
                    <strong>Deportes</strong>
                    <span>
                      Apuesta en eventos deportivos populares con cuotas
                      <br className="desktop-break" /> altas y otras grandes
                      características.
                    </span>
                    <b>
                      Explorar deportes <ChevronRight size={14} />
                    </b>
                  </span>
                  <ObjectArt kind="ball" />
                </button>
              </section>
              <button
                className="crypto-strip"
                onClick={() => open("Cripto y Gana")}
              >
                <span className="crypto-strip__coin">₿</span>
                <strong>Cripto y Gana</strong>
                <span>
                  Haz staking cripto con hasta <b>60% APR</b>, comercia,
                  intercambia, explora NFTs y solicita préstamos.
                </span>
                <ChevronRight size={20} />
              </button>
              <section className="winners">
                <div className="section-heading">
                  <h2>
                    <span className="live-dot" /> Últimas grandes ganancias
                  </h2>
                  <span className="winners__label">VISTA DE EJEMPLO</span>
                </div>
                <div className="winners__rail">
                  {[...games, ...games.slice(0, 4)].map((game, i) => (
                    <button
                      className="winner"
                      key={`${game.id}-${i}`}
                      onClick={() => onPlay(game)}
                    >
                      <span className="winner__art">
                        <GameArt game={game} />
                        <strong>{game.title}</strong>
                      </span>
                      <span className="winner__amount">
                        <Bitcoin size={12} /> MX$
                        {
                          [
                            "82.793",
                            "20.698",
                            "69.187",
                            "31.326",
                            "41.396",
                            "165.59K",
                          ][i % 6]
                        }
                      </span>
                    </button>
                  ))}
                </div>
              </section>
              <GameSection
                title="Slots Top"
                id="slots"
                games={games}
                {...commonGameProps}
                onSeeAll={() => {
                  setFilter("Slots");
                  navigate("Casino");
                }}
              />
              <GameSection
                title="Internos"
                id="originals"
                games={originals}
                {...commonGameProps}
                onSeeAll={() => {
                  setFilter("Internos");
                  navigate("Casino");
                }}
              />
              <section className="purchase-banner">
                <h2>
                  Comprar cripto de forma rápida
                  <br /> y sencilla
                </h2>
                <div className="purchase-banner__currencies">
                  <span>₿</span>
                  <span>Ξ</span>
                  <span>₮</span>
                  <span>◈</span>
                  <span>Ł</span>
                </div>
                <button
                  className="button button--primary"
                  onClick={() => open("Cripto y Gana")}
                >
                  Comprar Cripto
                </button>
              </section>
              <SportsPreview onNavigate={navigate} />
              <section className="benefits">
                {[
                  [
                    ShieldCheck,
                    "Seguro y confiable",
                    "Una experiencia pensada para ti",
                  ],
                  [Zap, "Rápido y sencillo", "Entretenimiento a tu ritmo"],
                  [Gift, "Bonos y recompensas", "Descubre algo nuevo cada día"],
                  [
                    Trophy,
                    "La mejor selección",
                    "Tus juegos favoritos, en un lugar",
                  ],
                ].map(([Icon, title, copy]) => (
                  <article className="benefit" key={title}>
                    <Icon />
                    <h3>{title}</h3>
                    <p>{copy}</p>
                  </article>
                ))}
              </section>
              <section className="about">
                <h2>BetFury — Casino Cripto y Deportes</h2>
                <p>
                  Todo un universo de entretenimiento en un solo lugar. Descubre
                  juegos originales, explora tus slots favoritos y disfruta de
                  la emoción del deporte. Una experiencia que combina diseño,
                  tecnología y diversión.
                </p>
                <button
                  className="text-button"
                  onClick={() => open("Juego responsable")}
                >
                  Conocer más <ChevronRight size={15} />
                </button>
              </section>
            </div>
          </>
        ) : view === "Casino" ? (
          <div className="content content--page">
            <section className="catalog">
              <div className="catalog__heading">
                <div>
                  <p className="eyebrow">ENCUENTRA TU PRÓXIMO FAVORITO</p>
                  <h1>Casino</h1>
                </div>
                <span className="catalog__count">
                  {allGames.length} juegos para explorar
                </span>
              </div>
              <div className="catalog__toolbar">
                <div className="catalog__tabs">
                  {["Todos", "Slots", "Internos", "Favoritos"].map((tab) => (
                    <button
                      key={tab}
                      className={`catalog__tab ${tab === filter ? "catalog__tab--active" : ""}`}
                      onClick={() => setFilter(tab)}
                    >
                      {tab === "Favoritos" && <Heart size={16} />} {tab}
                    </button>
                  ))}
                </div>
                <label className="search">
                  <Search size={18} />
                  <input
                    aria-label="Buscar juegos"
                    placeholder="Buscar juegos o proveedores"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                  />
                  {query && (
                    <button
                      aria-label="Limpiar búsqueda"
                      onClick={() => setQuery("")}
                    >
                      <X size={16} />
                    </button>
                  )}
                </label>
              </div>
              <div className="catalog__grid">
                {catalog.map((game) => (
                  <GameCard
                    key={game.id}
                    game={game}
                    onPlay={onPlay}
                    onFavorite={toggleFavorite}
                    favorite={favorites.includes(game.id)}
                  />
                ))}
              </div>
              {!catalog.length && (
                <div className="empty-state">
                  <Search size={38} />
                  <h2>
                    {filter === "Favoritos" && !query
                      ? "Tus favoritos empiezan aquí"
                      : "No encontramos juegos"}
                  </h2>
                  <p>
                    {filter === "Favoritos" && !query
                      ? "Pulsa el corazón de cualquier juego para guardarlo."
                      : "Prueba otro nombre o selecciona otra categoría."}
                  </p>
                  <button
                    className="button button--secondary"
                    onClick={() => {
                      setFilter("Todos");
                      setQuery("");
                    }}
                  >
                    Explorar todos los juegos
                  </button>
                </div>
              )}
            </section>
          </div>
        ) : (
          <div className="content content--page">
            <Sports key={sport} initialSport={sport} />
          </div>
        )}
        <div className="content">
          <Footer onAction={open} />
        </div>
      </main>
      <button
        className="support-button"
        aria-label="Abrir ayuda"
        onClick={() => open("Ayuda")}
      >
        <Headphones size={23} />
      </button>
      <MobileNav
        current={view}
        onNavigate={navigate}
        onAction={open}
        onMenu={() => setExpanded(!expanded)}
      />
      {modal && (
        <Modal
          key={`${modal.type}-${modal.game?.id || ""}`}
          modal={modal}
          onClose={() => setModal(null)}
          user={user}
          onAuth={(alias) => {
            setUser(alias);
            saveLocal("betfury-demo-user", alias);
            setModal(null);
          }}
          onLogout={() => {
            setUser("");
            saveLocal("betfury-demo-user", "");
            setModal(null);
          }}
        />
      )}
    </div>
  );
}
