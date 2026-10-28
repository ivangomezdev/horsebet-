"use client";
import useCarousel from "./useCarousel";
import CarouselControls from "./CarouselControls";
import { casinoPromotions } from "../data/casino";

export default function CasinoPromotions({ onAction }) {
  const carousel = useCarousel(casinoPromotions.length);
  const { active } = carousel;
  const ordered = [
    ...casinoPromotions.slice(active),
    ...casinoPromotions.slice(0, active),
  ];
  return (
    <section
      className="casino-promotions"
      {...carousel.interactionProps}
      aria-label="Promociones del casino"
      aria-roledescription="carrusel"
    >
      <div className="casino-promotions__track" key={active}>
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
      <CarouselControls
        carousel={carousel}
        count={casinoPromotions.length}
        label="Banner"
        className="casino-promotions__controls"
      />
    </section>
  );
}
