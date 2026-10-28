"use client";
import { useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Bitcoin,
  Gift,
  LockKeyhole,
  Check,
  ChevronDown,
} from "lucide-react";
import { GameArt } from "./Artwork";
import { casinoSlots, providers } from "../data/casino";
import Brand from "./Brand";

export function WelcomeBonuses({ onAction, title, showHeading = true }) {
  const [active, setActive] = useState(0);
  const offers = [
    { title: "PRIMER DEPÓSITO", amount: "150%", spins: 50 },
    { title: "SEGUNDO DEPÓSITO", amount: "180%", spins: 75 },
    { title: "TERCER DEPÓSITO", amount: "200%", spins: 100 },
  ];
  return (
    <section className="welcome-bonuses">
      {showHeading && (
        <div className="section-heading">
          <h2>
            {title || (
              <>
                <span>obtén BONUS</span> 590% hasta 10 500$
              </>
            )}
          </h2>
          <button
            className="text-button"
            onClick={() => onAction("Promociones")}
          >
            Ver detalles <ChevronRight size={15} />
          </button>
        </div>
      )}
      <div className="welcome-bonuses__cards">
        {offers.map((offer, index) => (
          <article
            key={offer.title}
            className={`welcome-bonus ${index === active ? "welcome-bonus--active" : ""}`}
          >
            <button
              className="welcome-bonus__select"
              onClick={() => setActive(index)}
              aria-pressed={active === index}
              aria-label={`Seleccionar ${offer.title.toLowerCase()}`}
            >
              <span className="welcome-bonus__step">
                {index === active ? (
                  <Check size={14} />
                ) : (
                  <LockKeyhole size={13} />
                )}
              </span>
              <span>{offer.title}</span>
            </button>
            <p>
              hasta <strong>{offer.amount}</strong> Bono
            </p>
            <span className="welcome-bonus__spins">
              + {offer.spins} Giros Gratis
            </span>
            <button
              className="button button--primary"
              onClick={() => onAction("register")}
            >
              Obtener bono
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

export { default as RecentWins } from "./RecentWins";

export function Providers({ onSelect }) {
  return (
    <section className="casino-providers">
      <div className="section-heading">
        <h2>Proveedores</h2>
        <button className="text-button" onClick={() => onSelect("Todos")}>
          Todo {providers.length} <ChevronRight size={16} />
        </button>
      </div>
      <div className="casino-providers__grid">
        {providers.map((provider) => (
          <button
            className={`provider provider--${provider.toLowerCase().replaceAll(" ", "-")}`}
            key={provider}
            onClick={() => onSelect(provider)}
          >
            {provider === "HORSEBET" ? (
              <Brand />
            ) : provider === "PRAGMATIC PLAY" ? (
              <span>
                PRAGMATIC <small>PLAY</small>
                <i>♔</i>
              </span>
            ) : provider === "BGAMING" ? (
              <span>
                <b>B</b>GAMING
              </span>
            ) : (
              <span>evolution</span>
            )}
          </button>
        ))}
      </div>
    </section>
  );
}

export function CasinoAbout({ onHome }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <section className="casino-about">
      <nav className="casino-about__breadcrumb" aria-label="Ruta de navegación">
        <button onClick={onHome}>HorseBet</button>
        <ChevronRight size={13} />
        <span>Casino</span>
      </nav>
      <h2>Juega a los Juegos de Casino con Bitcoin en HorseBet</h2>
      <p>
        Bienvenido al casino HorseBet. Explora una selección de slots, juegos
        originales y mesas en vivo en un mismo lugar. Descubre las distintas
        categorías, encuentra tus títulos favoritos y prueba sus vistas previas.
      </p>
      {expanded && (
        <div id="casino-more">
          <h3>Un casino, muchas formas de descubrir</h3>
          <p>
            Desde los clásicos de mesa hasta los mundos de fantasía de las
            tragamonedas: navega por categorías, filtra por proveedor o deja que
            el selector aleatorio te presente un juego diferente.
          </p>
          <h3>Originales HorseBet</h3>
          <p>
            Dice, Mines, Keno y Plinko forman parte de nuestra colección de
            originales. Nuestro caballo te acompaña en las promociones y en las
            portadas exclusivas de HorseBet.
          </p>
          <h3>Una experiencia también en móvil</h3>
          <p>
            Las filas de juegos se pueden deslizar, el buscador está siempre a
            mano y tus favoritos se guardan en este navegador.
          </p>
          <h3>Sobre los juegos</h3>
          <p>
            Las promociones, las victorias y los juegos son ejemplos visuales.
            No hay apuestas, pagos, crupieres conectados ni premios reales.
          </p>
        </div>
      )}
      <button
        className="casino-about__more"
        aria-expanded={expanded}
        aria-controls="casino-more"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? "Mostrar menos" : "Mostrar más"}
        <ChevronDown size={16} />
      </button>
    </section>
  );
}
