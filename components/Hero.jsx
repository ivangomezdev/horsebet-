"use client";
import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Send,
  ShieldCheck,
  Wallet,
  Diamond,
} from "lucide-react";
import { promotions } from "../data/content";

export default function Hero({ onAction }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;
    const timer = setInterval(
      () => setActive((value) => (value + 1) % promotions.length),
      8000,
    );
    return () => clearInterval(timer);
  }, [paused]);
  const promotion = promotions[active];
  const advance = (step) =>
    setActive(
      (value) => (value + step + promotions.length) % promotions.length,
    );
  return (
    <section
      className={`hero hero--${active}`}
      aria-label="Promociones destacadas"
      aria-roledescription="carrusel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <img
        className="hero__art"
        src="/images/hero.png"
        alt="Mapache con sudadera roja junto a una máquina de casino y monedas doradas"
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
      <div className="hero__controls">
        <button aria-label="Promoción anterior" onClick={() => advance(-1)}>
          <ChevronLeft size={18} />
        </button>
        {promotions.map((_, index) => (
          <button
            key={index}
            className={`hero__dot ${active === index ? "hero__dot--active" : ""}`}
            aria-label={`Ver promoción ${index + 1}`}
            aria-pressed={active === index}
            onClick={() => setActive(index)}
          />
        ))}
        <button aria-label="Promoción siguiente" onClick={() => advance(1)}>
          <ChevronRight size={18} />
        </button>
      </div>
    </section>
  );
}
