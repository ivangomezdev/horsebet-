"use client";
import { useEffect, useState } from "react";
import { ChevronRight, Clock3, Filter, CheckCircle2 } from "lucide-react";
import { FeatureHero, FAQ, FeatureDialog, Breadcrumb } from "./Shared";
import { GameArt } from "../Artwork";
import { missions, missionFaqs } from "../../data/features";

export default function Missions({ onAction, onHome }) {
  const [category, setCategory] = useState("Todo");
  const [limit, setLimit] = useState(9);
  const [selected, setSelected] = useState(null);
  const [active, setActive] = useState([]);
  useEffect(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("horsebet-missions") || "[]",
      );
      if (Array.isArray(saved)) setActive(saved);
    } catch {}
  }, []);
  const visible = missions.filter(
    (mission) =>
      category === "Todo" ||
      category === mission.category ||
      (category === "VIP" && mission.vip) ||
      (category === "En curso" && active.includes(mission.id)),
  );
  const toggle = (id) => {
    const next = active.includes(id)
      ? active.filter((item) => item !== id)
      : [...active, id];
    setActive(next);
    try {
      localStorage.setItem("horsebet-missions", JSON.stringify(next));
    } catch {}
    setSelected(null);
  };
  return (
    <>
      <FeatureHero
        type="missions"
        description="Completa misiones y desbloquea bonus mientras juegas."
        onAction={() => onAction("register")}
      >
        <span>Completa misiones</span>
        <br />
        Obtén recompensas.
      </FeatureHero>
      <div className="content feature-content">
        <div className="feature-heading">
          <h2>Misiones</h2>
          <label className="feature-select">
            <span>Categoría</span>
            <span>
              <Filter size={14} />
              <select
                aria-label="Categoría de misiones"
                value={category}
                onChange={(event) => {
                  setCategory(event.target.value);
                  setLimit(9);
                }}
              >
                {["Todo", "Slots", "Originals", "VIP", "En curso"].map(
                  (item) => (
                    <option key={item}>{item}</option>
                  ),
                )}
              </select>
            </span>
          </label>
        </div>
        <div className="mission-grid">
          {visible.slice(0, limit).map((mission) => (
            <button
              key={mission.id}
              className={`mission-card ${mission.vip ? "mission-card--vip" : ""} ${active.includes(mission.id) ? "mission-card--active" : ""}`}
              onClick={() => setSelected(mission)}
            >
              <span className="mission-card__art">
                <GameArt game={mission} />
                <small>{mission.category.toUpperCase()}</small>
              </span>
              <span className="mission-card__body">
                <span className="mission-card__tags">
                  <span>
                    <Clock3 size={10} />
                    {mission.duration}
                  </span>
                  {mission.vip && <b>VIP</b>}
                  {active.includes(mission.id) && <em>EN CURSO</em>}
                </span>
                <strong>{mission.title}</strong>
                <span className="mission-card__reward">
                  <b>{mission.category === "Slots" ? "FS" : "◆"}</b>
                  <span>
                    <small>Recompensa:</small>
                    <strong>{mission.reward}</strong>
                  </span>
                </span>
              </span>
              <ChevronRight className="mission-card__chevron" size={15} />
            </button>
          ))}
        </div>
        {!visible.length && (
          <div className="empty-state">
            <CheckCircle2 size={30} />
            <h3>No tienes misiones en curso</h3>
            <p>Abre una misión y actívala para explorar la experiencia.</p>
            <button
              className="button button--secondary"
              onClick={() => setCategory("Todo")}
            >
              Ver todas las misiones
            </button>
          </div>
        )}
        {visible.length > limit && (
          <button
            className="feature-load button button--secondary"
            onClick={() => setLimit((value) => value + 9)}
          >
            Mostrar más
          </button>
        )}
        <FAQ items={missionFaqs} />
        <Breadcrumb name="Misiones" onHome={onHome} />
      </div>
      {selected && (
        <FeatureDialog title={selected.title} onClose={() => setSelected(null)}>
          <div className="mission-detail">
            <span className="mission-detail__art">
              <GameArt game={selected} />
            </span>
            <div>
              <p>
                {selected.category} · {selected.duration}
              </p>
              <h3>{selected.reward}</h3>
              <span>Recompensa de ejemplo</span>
            </div>
          </div>
          <p>
            Activa esta misión para probar su seguimiento. El seguimiento local no registra
            apuestas ni entrega premios reales.
          </p>
          <div className="mission-detail__progress">
            <span>Progreso de la misión</span>
            <b>0%</b>
            <progress value="0" max="100" />
          </div>
          <button
            className="button button--primary"
            onClick={() => toggle(selected.id)}
          >
            {active.includes(selected.id)
              ? "Cancelar misión"
              : "Activar misión"}
          </button>
        </FeatureDialog>
      )}
    </>
  );
}
