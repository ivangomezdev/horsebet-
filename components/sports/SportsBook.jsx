"use client";
import { useEffect, useState } from "react";
import {
  Star,
  Ticket,
  Search,
  Radio,
  Crown,
  Clock3,
  ChevronRight,
  Trophy,
} from "lucide-react";
import {
  sportsEvents,
  sportCategories,
  findSportsEvent,
} from "../../data/sports";
import { sanitizePicks, togglePick, slipTotals } from "../../lib/sports/slip";
import useCarousel from "../useCarousel";
import CarouselControls from "../CarouselControls";
import { ObjectArt } from "../Artwork";
import { EventCard, SportIcon } from "./SportsUI";
import BetSlip from "./BetSlip";
import EventDetail from "./EventDetail";
import SportsNavigation from "./SportsNavigation";
import { useAuth, apiRequest } from "../auth/AuthProvider";

const campaigns = [
  [
    "HORSEBET SPORTS",
    "TU PARTIDO.\nTU MOMENTO.",
    "Explora los mercados y prepara tu cupón.",
  ],
  [
    "EL DEPORTE NO SE DETIENE",
    "CADA JUGADA\nCUENTA.",
    "Fútbol, baloncesto, tenis y eSports en un mismo lugar.",
  ],
  [
    "CONOCE EL BETSLIP",
    "UNA SELECCIÓN.\nMUCHAS POSIBILIDADES.",
    "Selecciona tus mercados para apuestas directas y combinadas.",
  ],
];
const storageKey = "horsebet-sports-slip-v3";

export default function SportsBook({
  eventId,
  initialTab = "popular",
  initialSport = "Todos",
}) {
  const [sport, setSport] = useState(
    sportCategories.find((item) => item.label === initialSport)?.id || "all",
  );
  const [tab, setTab] = useState(initialTab);
  const [search, setSearch] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [keys, setKeys] = useState([]);
  const [mode, setMode] = useState("single");
  const [stake, setStake] = useState("10");
  const [format, setFormat] = useState("decimal");
  const [open, setOpen] = useState(false);
  const { user, loading, openAuth, refresh } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [ready, setReady] = useState(false);
  const carousel = useCarousel(campaigns.length);
  const campaign = campaigns[carousel.active];
  const event = findSportsEvent(eventId);

  useEffect(() => {
    const requestedTab = new URLSearchParams(window.location.search).get("tab");
    if (["favorites", "tickets", "live"].includes(requestedTab))
      setTab(requestedTab);
    const requestedSport = new URLSearchParams(window.location.search).get(
      "sport",
    );
    if (sportCategories.some((item) => item.id === requestedSport))
      setSport(requestedSport);
    try {
      const saved = JSON.parse(sessionStorage.getItem(storageKey));
      if (saved) {
        const valid = sanitizePicks(saved.keys);
        setKeys(valid);
        setOpen(valid.length > 0);
        setMode(saved.mode === "combo" ? "combo" : "single");
        setFormat(saved.format === "american" ? "american" : "decimal");
        if (typeof saved.stake === "string") setStake(saved.stake.slice(0, 12));
        if (Array.isArray(saved.favorites))
          setFavorites(saved.favorites.filter((id) => findSportsEvent(id)));
      }
    } catch {
      /* Storage is optional. */
    }
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try {
      sessionStorage.setItem(
        storageKey,
        JSON.stringify({ keys, mode, stake, format, favorites }),
      );
    } catch {}
  }, [keys, mode, stake, format, favorites, ready]);

  const onPick = (key) => {
    setKeys((current) => togglePick(current, key));
    setOpen(true);
    setSubmitError("");
  };
  const onFavorite = (id) =>
    setFavorites((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  useEffect(() => {
    setSubmitError("");
  }, [user?.id]);
  const onPlaceBet = async () => {
    if (loading || submitting) return;
    if (!user) {
      setSubmitError("Debes estar registrado para realizar apuestas.");
      openAuth("register");
      return;
    }
    if (!slipTotals(keys, stake, mode) || (mode === "combo" && keys.length < 2))
      return;
    setSubmitting(true);
    setSubmitError("");
    try {
      await apiRequest("/api/sports/bets/", { selections: keys, stake, mode });
    } catch (error) {
      setSubmitError(error.message);
      if (error.status === 401) {
        await refresh();
        openAuth("login");
      }
    } finally {
      setSubmitting(false);
    }
  };
  const filtered = sportsEvents.filter(
    (item) =>
      (sport === "all" || item.sport === sport) &&
      (tab !== "live" || item.live) &&
      (tab !== "upcoming" || !item.live) &&
      (tab !== "favorites" || favorites.includes(item.id)) &&
      `${item.home} ${item.away} ${item.league}`
        .toLocaleLowerCase("es")
        .includes(search.toLocaleLowerCase("es")),
  );
  const tabs = [
    ["popular", Crown, "Popular"],
    ["live", Radio, "En vivo"],
    ["upcoming", Clock3, "Próximamente"],
    ["favorites", Star, "Favoritos"],
    ["tickets", Ticket, "Mis apuestas"],
  ];
  const changeTab = (id) => {
    setTab(id);
    setSearch("");
  };

  return (
    <section className="sports-book" aria-label="Deportes HorseBet">
      <SportsNavigation
        event={event}
        sport={sport}
        onTab={changeTab}
        onSelect={(id) => {
          setSport(id);
          setTab("popular");
          setSearch("");
        }}
      />
      <div className="sports-book__content">
        <p className="sports-book__availability" role="status">
          Las apuestas deportivas todavía no están disponibles. Los mercados
          están pendientes de habilitación.
        </p>
        {event ? (
          <EventDetail
            key={event.id}
            {...{ event, onPick, format }}
            picks={keys}
          />
        ) : (
          <>
            <div className="sports-book__toolbar">
              <div className="sports-book__tabs">
                {tabs.map(([id, Icon, label]) => (
                  <button
                    key={id}
                    className={
                      tab === id
                        ? "sports-pill sports-pill--active"
                        : "sports-pill"
                    }
                    aria-pressed={tab === id}
                    onClick={() => changeTab(id)}
                  >
                    <Icon size={15} />
                    {label}
                  </button>
                ))}
              </div>
              <label className="sports-search">
                <Search size={16} />
                <input
                  aria-label="Buscar evento"
                  placeholder="Buscar evento"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </label>
            </div>
            {tab === "popular" && !search && sport === "all" && (
              <section
                className={`sports-hero sports-hero--${carousel.active}`}
                {...carousel.interactionProps}
                aria-label="Novedades deportivas"
                aria-roledescription="carrusel"
              >
                <div className="sports-hero__lights" aria-hidden="true" />
                <div className="sports-hero__copy" key={carousel.active}>
                  <span>{campaign[0]}</span>
                  <h1>{campaign[1]}</h1>
                  <p>{campaign[2]}</p>
                </div>
                <div className="sports-hero__art" aria-hidden="true">
                  <ObjectArt kind="ball" />
                  <b>
                    HORSE<span>BET</span>
                  </b>
                  <small>SPORTS</small>
                </div>
                <CarouselControls
                  carousel={carousel}
                  count={campaigns.length}
                  label="Promoción deportiva"
                  className="sports-hero__controls"
                />
              </section>
            )}
            {tab === "tickets" ? (
              <section className="sports-tickets">
                <h2>Mis apuestas</h2>
                <div className="sports-empty">
                  <Ticket size={36} />
                  <h3>
                    {user
                      ? "Apuestas no disponibles"
                      : "Debes estar registrado para realizar apuestas"}
                  </h3>
                  <p>
                    {user
                      ? "El servicio de apuestas deportivas todavía no está habilitado."
                      : "Regístrate o inicia sesión para acceder a tus apuestas."}
                  </p>
                  {!user && (
                    <button
                      className="button button--primary"
                      disabled={loading}
                      onClick={() => openAuth("register")}
                    >
                      Regístrate
                    </button>
                  )}
                </div>
              </section>
            ) : (
              <>
                <div className="sports-book__heading">
                  <h2>
                    <Trophy size={19} />
                    {tab === "live"
                      ? "En vivo"
                      : tab === "upcoming"
                        ? "Próximos encuentros"
                        : tab === "favorites"
                          ? "Tus favoritos"
                          : sport !== "all"
                            ? sportCategories.find((item) => item.id === sport)
                                ?.label
                            : "Eventos destacados"}
                  </h2>
                  <span>
                    {filtered.length}{" "}
                    {filtered.length === 1 ? "evento" : "eventos"}
                  </span>
                </div>
                <div className="sports-cards">
                  {filtered.map((item) => (
                    <EventCard
                      key={item.id}
                      event={item}
                      picks={keys}
                      {...{ onPick, format, onFavorite }}
                      favorite={favorites.includes(item.id)}
                    />
                  ))}
                </div>
                {!filtered.length && (
                  <div className="sports-empty">
                    <Search size={32} />
                    <h3>No hay eventos en esta selección</h3>
                    <button
                      className="button button--secondary"
                      onClick={() => {
                        setSearch("");
                        setSport("all");
                        setTab("popular");
                      }}
                    >
                      Ver todos los eventos
                    </button>
                  </div>
                )}
                <div className="sports-leagues">
                  <h2>Competiciones</h2>
                  {sportCategories
                    .filter(
                      (item) =>
                        item.id !== "all" &&
                        sportsEvents.some((event) => event.sport === item.id),
                    )
                    .map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setSport(item.id);
                          setTab("popular");
                          setSearch("");
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                      >
                        <SportIcon sport={item.id} />
                        <span>
                          {item.label}
                          <small>
                            {
                              sportsEvents.filter(
                                (event) => event.sport === item.id,
                              ).length
                            }{" "}
                            eventos
                          </small>
                        </span>
                        <ChevronRight size={16} />
                      </button>
                    ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
      <BetSlip
        {...{
          keys,
          open,
          setOpen,
          mode,
          setMode,
          stake,
          setStake,
          format,
          setFormat,
          onPlaceBet,
          user,
          loading,
          submitting,
          submitError,
          openAuth,
        }}
        onRemove={(key) =>
          setKeys((current) => current.filter((item) => item !== key))
        }
        onClear={() => {
          setKeys([]);
          setSubmitError("");
        }}
      />
    </section>
  );
}
