"use client";
import { useState } from "react";
import { ChevronRight } from "lucide-react";
import {
  FeatureHero,
  BenefitsGrid,
  RewardArt,
  FeatureDialog,
  Breadcrumb,
} from "./Shared";
import { WelcomeBonuses } from "../CasinoExtras";
import { regularBonuses } from "../../data/features";

export default function Bonuses({ onAction, onHome }) {
  const [selected, setSelected] = useState(null);
  return (
    <>
      <FeatureHero
        type="bonuses"
        description="Juega con placer y disfruta de una variedad de bonus para apuestas deportivas y de casino."
        button="Regístrate y consigue bonus"
        onAction={() => onAction("register")}
      >
        Beneficioso
        <br />
        Sistema de bonificación
      </FeatureHero>
      <div className="content feature-content">
        <div className="bonus-welcome">
          <WelcomeBonuses
            onAction={onAction}
            title={
              <>
                <span>Bonus de bienvenida</span> 10 000 $ + 200 giros gratis
              </>
            }
          />
        </div>
        <section className="feature-section">
          <div className="feature-section__intro">
            <h2>
              Los Bonus empiezan en el <span>rank 1</span>
            </h2>
            <p>
              Recibe recompensas desde el primer día. Descubre niveles más altos
              y nuevas bonificaciones.
            </p>
          </div>
          <BenefitsGrid items={regularBonuses} onSelect={setSelected} />
          <button
            className="feature-load button button--primary"
            onClick={() => onAction("register")}
          >
            Regístrate y consigue bonus
          </button>
        </section>
        <section className="bonus-vip">
          <div className="bonus-vip__art">
            <RewardArt index={0} />
          </div>
          <div className="bonus-vip__content">
            <h2>
              Bonus exclusivos para usuarios <span>VIP</span>
            </h2>
            <p>
              Aumenta tu rank, disfruta de varias recompensas y desbloquea
              nuevas bonificaciones.
            </p>
            <div className="bonus-vip__perks">
              {[
                [
                  "Bienvenido VIP",
                  "Tu gestor personal te acompaña en esta nueva etapa.",
                ],
                [
                  "Recompensa VIP",
                  "Explora una selección de bonificaciones cada semana.",
                ],
                ["Cumpleaños", "Celebra tu día con una sorpresa especial."],
                [
                  "VIP personal",
                  "Descubre ventajas adaptadas a tu experiencia.",
                ],
              ].map(([title, copy]) => (
                <article key={title}>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </article>
              ))}
            </div>
            <button
              className="text-button"
              onClick={() => onAction("Club VIP")}
            >
              Acerca de VIP Club <ChevronRight size={16} />
            </button>
          </div>
        </section>
        <section className="feature-section">
          <h2>Otros bonos</h2>
          <BenefitsGrid
            items={[
              {
                title: "Coindrops",
                description:
                  "Descubre las recompensas que aparecen en la comunidad.",
                art: 2,
              },
              {
                title: "Crypto Rains",
                description:
                  "Una forma de compartir la diversión con los miembros activos.",
                art: 5,
              },
              {
                title: "Propinas",
                description:
                  "Pequeños gestos para celebrar juntos la experiencia.",
                art: 3,
              },
            ]}
            onSelect={setSelected}
          />
        </section>
        <Breadcrumb name="Gabinete de Bonus" onHome={onHome} />
      </div>
      {selected && (
        <FeatureDialog title={selected.title} onClose={() => setSelected(null)}>
          <RewardArt index={selected.art} className="feature-dialog__reward" />
          <h3>{selected.tag}</h3>
          <p>{selected.description}</p>
          <p>
            Esta tarjeta muestra un beneficio de ejemplo. Los bonos no se abonan
            ni se pueden retirar por el momento.
          </p>
          <button
            className="button button--primary"
            onClick={() => setSelected(null)}
          >
            Entendido
          </button>
        </FeatureDialog>
      )}
    </>
  );
}
