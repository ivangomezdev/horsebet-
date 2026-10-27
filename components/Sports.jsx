"use client";
import { useState } from "react";
import { Volleyball, Trophy, CircleDot, Activity } from "lucide-react";
import { sports } from "../data/content";
import { ObjectArt } from "./Artwork";
export function SportsPreview({ onNavigate }) {
  return (
    <section className="sports-preview">
      <div className="section-heading">
        <h2>Deportes TOP</h2>
        <button className="text-button" onClick={() => onNavigate("Deportes")}>
          Ir a Deportes <span>›</span>
        </button>
      </div>
      <div className="sports-preview__grid">
        {sports.map((sport, index) => (
          <button
            className="sport-card"
            key={sport}
            onClick={() => onNavigate("Deportes", sport)}
          >
            {index < 4 && <span className="game-card__badge">CALIENTE</span>}
            {index === 2 || index === 3 ? (
              <ObjectArt kind="ball" />
            ) : index === 0 ? (
              <Activity />
            ) : index === 1 ? (
              <Trophy />
            ) : (
              <CircleDot />
            )}
            <strong>{sport}</strong>
          </button>
        ))}
      </div>
    </section>
  );
}
export default function Sports({ initialSport = "Fútbol" }) {
  const [selected, setSelected] = useState(initialSport);
  const [selection, setSelection] = useState(null);
  const teams =
    selected === "Tenis"
      ? [
          ["Alcaraz", "Sinner"],
          ["Medvedev", "Zverev"],
        ]
      : selected === "Fútbol" || selected === "Esoccer"
        ? [
            ["Madrid", "Barcelona"],
            ["Manchester", "Liverpool"],
            ["Milán", "Inter"],
          ]
        : selected === "Béisbol"
          ? [
              ["Los Ángeles", "New York"],
              ["San Diego", "Boston"],
            ]
          : [
              ["Lakers", "Bulls"],
              ["Celtics", "Warriors"],
            ];
  return (
    <section className="sports-page">
      <div className="catalog__heading">
        <div>
          <p className="eyebrow">EL JUEGO SE VIVE AQUÍ</p>
          <h1>Deportes</h1>
        </div>
        <Volleyball size={40} />
      </div>
      <div className="catalog__tabs">
        {sports.map((sport) => (
          <button
            key={sport}
            className={
              sport === selected
                ? "catalog__tab catalog__tab--active"
                : "catalog__tab"
            }
            onClick={() => {
              setSelected(sport);
              setSelection(null);
            }}
          >
            {sport}
          </button>
        ))}
      </div>
      <div className="sports-page__heading">
        <h2>{selected} · Eventos destacados</h2>
        <span className="demo-label">DATOS DE EJEMPLO</span>
      </div>
      <div className="sports-page__events">
        {teams.map(([home, away], index) => (
          <article className="event-card" key={home}>
            <p>
              <Trophy size={14} /> Liga de demostración{" "}
              <span>Hoy · {18 + index}:00</span>
            </p>
            <div className="event-card__teams">
              <span>{home.slice(0, 1)}</span>
              <strong>{home}</strong>
              <b>VS</b>
              <strong>{away}</strong>
              <span>{away.slice(0, 1)}</span>
            </div>
            <div className="event-card__odds">
              {["1", "X", "2"].map((outcome, i) => (
                <button
                  key={outcome}
                  aria-pressed={selection === `${home}-${outcome}`}
                  className={
                    selection === `${home}-${outcome}`
                      ? "event-card__odd event-card__odd--selected"
                      : "event-card__odd"
                  }
                  onClick={() => setSelection(`${home}-${outcome}`)}
                >
                  <span>{outcome}</span>
                  <b>{[1.85, 3.4, 2.1][i].toFixed(2)}</b>
                </button>
              ))}
            </div>
          </article>
        ))}
      </div>
      <p className="sports-page__notice" role="status">
        {selection
          ? "Selección marcada como vista previa. No se ha realizado ninguna apuesta."
          : "Eventos ilustrativos. Selecciona una cuota para probar la interfaz."}
      </p>
    </section>
  );
}
