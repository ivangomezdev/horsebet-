"use client";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { casinoPromotions } from "../data/casino";

export default function CasinoPromotions({ onAction }) {
  const [active, setActive] = useState(0);
  const ordered = [
    ...casinoPromotions.slice(active),
    ...casinoPromotions.slice(0, active),
  ];
  const move = (direction) =>
    setActive(
      (value) =>
        (value + direction + casinoPromotions.length) % casinoPromotions.length,
    );
  return (
    <section
      className="casino-promotions"
      aria-label="Promociones del casino"
      aria-roledescription="carrusel"
    >
      <div className="casino-promotions__track">
        {ordered.map((promotion) => (
          <button
            key={promotion.id}
            className={`casino-promo casino-promo--${promotion.art}`}
            onClick={() => onAction(promotion.action)}
            aria-label={`${promotion.title}${promotion.prize ? `, premios ${promotion.prize}` : ""}`}
          >
            <span className="casino-promo__art" aria-hidden="true" />
            {promotion.badge && (
              <span className="casino-promo__badge">{promotion.badge}</span>
            )}
            <span className="casino-promo__copy">
              <strong>{promotion.title}</strong>
              {promotion.subtitle && <small>{promotion.subtitle}</small>}
            </span>
            {promotion.prize && (
              <span className="casino-promo__prize">
                <small>PREMIOS</small> {promotion.prize}
              </span>
            )}
          </button>
        ))}
      </div>
      <div className="casino-promotions__controls">
        <button onClick={() => move(-1)} aria-label="Banners anteriores">
          <ChevronLeft size={18} />
        </button>
        {casinoPromotions.map((promotion, index) => (
          <button
            key={promotion.id}
            className={`casino-promotions__dot ${active === index ? "casino-promotions__dot--active" : ""}`}
            aria-label={`Ver banner ${index + 1}`}
            aria-pressed={active === index}
            onClick={() => setActive(index)}
          />
        ))}
        <button onClick={() => move(1)} aria-label="Banners siguientes">
          <ChevronRight size={18} />
        </button>
      </div>
    </section>
  );
}
