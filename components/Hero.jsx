"use client";
import useCarousel from "./useCarousel";
import CarouselControls from "./CarouselControls";
import { Send, ShieldCheck, Wallet, Diamond } from "lucide-react";
import { promotions } from "../data/content";

export default function Hero({ onAction }) {
  const carousel = useCarousel(promotions.length);
  const { active } = carousel;
  const promotion = promotions[active];
  return (
    <section
      className={`hero hero--${active}`}
      aria-label="Promociones destacadas"
      aria-roledescription="carrusel"
      {...carousel.interactionProps}
    >
      <img
        className="hero__art"
        src="/images/hero.png"
        alt="Caballo con sudadera roja junto a una máquina de casino y monedas doradas"
        fetchPriority="high"
      />
      <div className="hero__content" key={active}>
        <p className="hero__eyebrow">{promotion.eyebrow}</p>
        <h1>
          <span>{promotion.accent}</span>
          <br />
          {promotion.title}
        </h1>
        <p className="hero__subtitle">{promotion.subtitle}</p>
        <div className="hero__actions">
          <button
            className="button button--primary"
            onClick={() =>
              onAction(
                active === 0
                  ? "register"
                  : active === 1
                    ? "Promociones"
                    : "Club VIP",
              )
            }
          >
            {promotion.cta}
          </button>
          <span className="hero__or">o</span>
          <div className="hero__socials">
            {[
              ["Google", null],
              ["MetaMask", Wallet],
              ["Telegram", Send],
              ["TON", Diamond],
              ["Trust Wallet", ShieldCheck],
            ].map(([name, Icon]) => (
              <button
                key={name}
                className="button button--icon"
                aria-label={`Continuar con ${name}`}
                onClick={() => onAction("register")}
              >
                {Icon ? <Icon size={20} /> : <b>G</b>}
              </button>
            ))}
          </div>
        </div>
      </div>
      <CarouselControls
        carousel={carousel}
        count={promotions.length}
        label="Promoción"
        className="hero__controls"
      />
    </section>
  );
}
