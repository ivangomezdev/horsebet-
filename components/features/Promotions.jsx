"use client";
import { useState } from "react";
import {
  Megaphone,
  Spade,
  Volleyball,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import { WelcomeBonuses } from "../CasinoExtras";
import { FeatureDialog, Breadcrumb } from "./Shared";
import { promoCards } from "../../data/features";

export default function Promotions({ onAction, onHome }) {
  const [category, setCategory] = useState("Todas las promociones");
  const [status, setStatus] = useState("Activo");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const filtered = promoCards.filter(
    (item) =>
      (category === "Todas las promociones" || item.category === category) &&
      item.status === status,
  );
  const pages = Math.max(1, Math.ceil(filtered.length / 6));
  const openPromo = (promo) => {
    setSelected(promo);
    setCode("");
    setMessage("");
  };
  return (
    <div className="content promotions-page">
      <h1>Promociones</h1>
      <WelcomeBonuses onAction={onAction} showHeading={false} />
      <div className="promotions-page__toolbar">
        <div className="feature-tabs">
          {[
            [Megaphone, "Todas las promociones"],
            [Spade, "Casino"],
            [Volleyball, "Deportes"],
          ].map(([Icon, label]) => (
            <button
              key={label}
              className={`feature-tabs__tab ${category === label ? "feature-tabs__tab--active" : ""}`}
              aria-pressed={category === label}
              onClick={() => {
                setCategory(label);
                setPage(1);
              }}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>
        <label className="feature-select">
          <span className="feature-select__hidden">Estado de promociones</span>
          <select
            aria-label="Estado de promociones"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
          >
            <option>Activo</option>
            <option>Finalizado</option>
          </select>
        </label>
      </div>
      <div className="promotion-grid">
        {filtered.slice((page - 1) * 6, page * 6).map((promo) => (
          <button
            className={`promotion-card promotion-card--${promo.art}`}
            key={promo.id}
            onClick={() => openPromo(promo)}
          >
            <span className="promotion-card__art" aria-hidden="true" />
            <span className="promotion-card__tags">
              <span>
                {promo.status === "Activo" ? "EVENTO ESPECIAL" : "FINALIZADO"}
              </span>
              {promo.badge && <b>{promo.badge}</b>}
            </span>
            <strong>{promo.title}</strong>
            <small>{promo.subtitle}</small>
            <span className="promotion-card__arrow">
              <ChevronRight size={16} />
            </span>
          </button>
        ))}
      </div>
      {filtered.length === 0 && (
        <div className="empty-state">
          <h2>No hay promociones en esta categoría</h2>
          <p>Cambia el estado o selecciona otra categoría.</p>
        </div>
      )}
      <nav className="pagination" aria-label="Páginas de promociones">
        <button
          aria-label="Página anterior"
          disabled={page <= 1}
          onClick={() => setPage((value) => value - 1)}
        >
          <ChevronLeft size={17} />
        </button>
        {Array.from({ length: pages }, (_, index) => (
          <button
            key={index}
            className={
              page === index + 1
                ? "pagination__page pagination__page--active"
                : "pagination__page"
            }
            aria-label={`Página ${index + 1}`}
            aria-current={page === index + 1 ? "page" : undefined}
            onClick={() => setPage(index + 1)}
          >
            {index + 1}
          </button>
        ))}
        <button
          aria-label="Página siguiente"
          disabled={page >= pages}
          onClick={() => setPage((value) => value + 1)}
        >
          <ChevronRight size={17} />
        </button>
      </nav>
      <Breadcrumb name="Promociones" onHome={onHome} />
      {selected && (
        <FeatureDialog title={selected.title} onClose={() => setSelected(null)}>
          <div
            className={`promotion-dialog-art promotion-card--${selected.art}`}
          >
            <span className="promotion-card__art" />
          </div>
          <h3>{selected.subtitle}</h3>
          <p>
            {selected.category} · {selected.status}. Esta es una promoción
            ilustrativa de HorseBet.
          </p>
          {selected.code ? (
            <form
              className="feature-form"
              onSubmit={(event) => {
                event.preventDefault();
                setMessage(
                  code.trim().toUpperCase() === "HORSEBET"
                    ? "Código de ejemplo reconocido. No se ha añadido saldo real."
                    : "Código no reconocido. Prueba el código de ejemplo HORSEBET.",
                );
              }}
            >
              <label>
                Código promocional
                <input
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  placeholder="Prueba HORSEBET"
                  required
                  maxLength={30}
                />
              </label>
              <button className="button button--primary" type="submit">
                Aplicar código
              </button>
              <p role="status">{message}</p>
            </form>
          ) : (
            <button
              className="button button--primary"
              onClick={() => {
                const action = selected.action || "register";
                setSelected(null);
                onAction(action);
              }}
            >
              {selected.action ? "Descubrir" : "Explorar promoción"}
            </button>
          )}
        </FeatureDialog>
      )}
    </div>
  );
}
