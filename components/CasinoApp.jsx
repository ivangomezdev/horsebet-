"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  Headphones,
  Trophy,
  ShieldCheck,
  Zap,
  Gift,
} from "lucide-react";
import { Header, Sidebar, Footer, MobileNav } from "./SiteShell";
import Hero from "./Hero";
import GameSection from "./GameSection";
import CasinoLobby from "./CasinoLobby";
import FeaturePages from "./FeaturePages";
import { featurePath } from "../data/features";
import { ObjectArt } from "./Artwork";
import Modal from "./Modal";
import SupportChat from "./SupportChat";
import { useAuth } from "./auth/AuthProvider";
import AccountPage from "./account/AccountPage";
import MemberPage from "./member/MemberPage";
import { memberRoutes } from "../data/currencies";
import GameStudio from "./games/GameStudio";
import { playablePath } from "../data/playable-games";
import { bonusSlotCatalog } from "../data/bonus-slots";
import { SportsPreview } from "./Sports";
import SportsBook from "./sports/SportsBook";
import { originals } from "../data/content";

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

export default function CasinoApp({
  initialView = "Inicio",
  accountTab = "account",
  memberSection,
  gameId,
  sportsEventId,
  sportsTab = "popular",
}) {
  const router = useRouter();
  const [view, setView] = useState(initialView);
  const [expanded, setExpanded] = useState(false);
  const [modal, setModal] = useState(null);
  const [supportOpen, setSupportOpen] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const { user, openAuth } = useAuth();
  const [sport, setSport] = useState("Todos");
  useEffect(() => {
    const savedFavorites = readLocal("horsebet-demo-favorites", []);
    setFavorites(Array.isArray(savedFavorites) ? savedFavorites : []);
    try {
      localStorage.removeItem("horsebet-demo-user");
    } catch {}
    const syncHash = () => {
      const page = window.location.hash.slice(1);
      setView(
        page === "casino"
          ? "Casino"
          : page === "deportes"
            ? "Deportes"
            : initialView,
      );
    };
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, [initialView]);
  const navigate = (next, selectedSport, category) => {
    setView(next);
    setExpanded(false);
    if (selectedSport) setSport(selectedSport);
    if (next === "Casino") {
      const hash =
        category === "Slots"
          ? "#slots"
          : category === "Internos"
            ? "#originales"
            : "";
      router.push(`/es/casino/${hash}`);
    } else if (next === "Deportes") {
      router.push("/es/sports/");
    } else if (featurePath(next)) {
      router.push(featurePath(next));
    } else if (next === "Inicio") {
      router.push("/es/");
    } else {
      window.location.hash = "deportes";
    }
    window.scrollTo({ top: 0, behavior: "instant" });
  };
  const open = (type) => {
    if (type === "Ayuda") return setSupportOpen(true);
    if (["login", "register"].includes(type)) return openAuth(type);
    const memberSlug = Object.keys(memberRoutes).find(
      (key) => key === type || memberRoutes[key] === type,
    );
    if (memberSlug) {
      router.push(`/es/${memberSlug}/`);
      return;
    }
    if (type === "Cuenta") {
      router.push("/es/account/");
      return;
    }
    if (["Casino", "Deportes"].includes(type) || featurePath(type))
      return navigate(type);
    if (["Slots", "Internos"].includes(type)) {
      return navigate("Casino", undefined, type);
    }
    setModal({ type });
  };
  const toggleFavorite = (id) =>
    setFavorites((previous) => {
      const next = previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id];
      saveLocal("horsebet-demo-favorites", next);
      return next;
    });
  const onPlay = (game) => {
    const path = playablePath(game.id);
    if (!path) return;
    if (!user)
      return openAuth(
        "register",
        "Debes estar registrado para realizar apuestas.",
      );
    if (!user.onboardingCompleted) return openAuth("complete");
    router.push(path);
  };
  const commonGameProps = { onPlay, favorites, onFavorite: toggleFavorite };
  return (
    <div className={`site-shell ${view === "Juego" ? "site-shell--game" : ""}`}>
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
        current={view === "Inicio" || view === "Juego" ? "Casino" : view}
        onNavigate={navigate}
        onAction={open}
        onClose={() => setExpanded(false)}
      />
      <main className="main" id="main">
        {view === "Inicio" ? (
          <>
            <Hero onAction={open} />
            <div className="content">
              <section className="destinations" aria-label="Explora HorseBet">
                <button
                  className="destination destination--casino"
                  onClick={() => navigate("Casino")}
                >
                  <span>
                    <strong>Casino</strong>
                    <span>
                      Disfruta de HorseBet Originals y otros juegos de
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
              <GameSection
                title="Slots Top"
                id="slots"
                games={bonusSlotCatalog}
                {...commonGameProps}
                onSeeAll={() => {
                  navigate("Casino", undefined, "Slots");
                }}
              />
              <GameSection
                title="Internos"
                id="originals"
                games={originals}
                {...commonGameProps}
                onSeeAll={() => {
                  navigate("Casino", undefined, "Internos");
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
                <h2>HorseBet — Casino Cripto y Deportes</h2>
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
        ) : view === "Juego" && gameId ? (
          <GameStudio key={gameId} gameId={gameId} />
        ) : view === "Casino" ? (
          <CasinoLobby
            onAction={open}
            {...commonGameProps}
            onHome={() => navigate("Inicio")}
          />
        ) : view === "Mi espacio" ? (
          <MemberPage
            key={memberSection}
            section={memberSection}
            onSupport={() => open("Ayuda")}
          />
        ) : view === "Cuenta" ? (
          <AccountPage tab={accountTab} onHome={() => navigate("Inicio")} />
        ) : featurePath(view) ? (
          <FeaturePages
            key={view}
            view={view}
            onAction={open}
            onHome={() => navigate("Inicio")}
          />
        ) : (
          <SportsBook
            key={`${sportsEventId || "lobby"}-${sportsTab}-${sport}`}
            eventId={sportsEventId}
            initialTab={sportsTab}
            initialSport={sport}
          />
        )}
        <div className="content">
          <Footer onAction={open} sports={view === "Deportes"} />
        </div>
      </main>
      {view !== "Juego" && (
        <button
          className="support-button"
          aria-label="Abrir ayuda"
          onClick={() => open("Ayuda")}
        >
          <Headphones size={23} />
        </button>
      )}
      <MobileNav
        current={view === "Juego" ? "Casino" : view}
        onNavigate={navigate}
        onAction={open}
        onMenu={() => setExpanded(!expanded)}
      />
      {modal && (
        <Modal
          key={`${modal.type}-${modal.game?.id || ""}`}
          modal={modal}
          onClose={() => setModal(null)}
        />
      )}
      <SupportChat
        key={user?.id || "guest"}
        open={supportOpen}
        onClose={() => setSupportOpen(false)}
      />
    </div>
  );
}
