"use client";
import { useState } from "react";
import {
  Crown,
  Gift,
  Rocket,
  Check,
  MessageCircle,
  Headphones,
  Mail,
} from "lucide-react";
import {
  FeatureHero,
  BenefitsGrid,
  RewardArt,
  FAQ,
  Breadcrumb,
  FeatureDialog,
} from "./Shared";
import { vipBenefits, vipExtraBenefits } from "../../data/features";

const rankBenefits = (rank) => ({
  name:
    rank >= 15
      ? "SUPER VIP"
      : rank >= 10
        ? "VIP"
        : rank >= 5
          ? "GOLD"
          : "SILVER",
  cashback: Math.min(25, 5 + rank),
  levelBonus: rank >= 15 ? "80 000 $" : rank >= 10 ? "20 000 $" : "1 000 $",
  regular: rank >= 10 ? 10 : 6,
});
export default function VipClub({ onAction, onHome }) {
  const [tab, setTab] = useState("Premios especiales");
  const [rank, setRank] = useState(10);
  const [showRanks, setShowRanks] = useState(false);
  const [selected, setSelected] = useState(null);
  const perks = rankBenefits(rank);
  return (
    <>
      <FeatureHero
        type="vip"
        description="Desbloquea bonificaciones, asciende en ranks VIP y disfruta de un gestor personal dedicado."
        onAction={() => onAction("register")}
      >
        Reclama tus{" "}
        <span>
          VIP
          <br />
          Recompensas
        </span>
      </FeatureHero>
      <div className="content feature-content">
        <section>
          <div className="feature-heading vip-heading">
            <div>
              <h2>
                Desbloquea beneficios <span>VIP.</span>
              </h2>
              <p>
                Disfruta de un servicio premium y de increíbles recompensas a
                partir del <b>Rank 10</b> en HorseBet.
              </p>
            </div>
            <div className="feature-tabs">
              {[
                [Gift, "Premios especiales"],
                [Rocket, "Ventajas adicionales"],
              ].map(([Icon, label]) => (
                <button
                  key={label}
                  className={
                    tab === label
                      ? "feature-tabs__tab feature-tabs__tab--active"
                      : "feature-tabs__tab"
                  }
                  aria-pressed={tab === label}
                  onClick={() => setTab(label)}
                >
                  <Icon size={15} />
                  {label}
                </button>
              ))}
            </div>
          </div>
          <BenefitsGrid
            items={
              tab === "Premios especiales" ? vipBenefits : vipExtraBenefits
            }
            onSelect={setSelected}
          />
        </section>
        <section className="vip-ranks">
          <RewardArt index={0} className="vip-ranks__crown" />
          <div className="feature-section__intro">
            <h2>
              Sistema de Ranks:
              <br />
              Desbloquea el total de las recompensas
            </h2>
            <p>
              Explora los niveles. El Club VIP comienza en el rank 10 y Super
              VIP en el rank 15.
            </p>
          </div>
          <div className="vip-ranks__selector">
            <span>Rank 1</span>
            <label>
              <span>
                RANK {rank} · {perks.name}
              </span>
              <input
                aria-label="Explorar rank VIP"
                type="range"
                min="1"
                max="20"
                value={rank}
                onChange={(event) => setRank(Number(event.target.value))}
              />
            </label>
            <span>Rank 20</span>
          </div>
          <div className="vip-ranks__stats">
            <article>
              <RewardArt index={2} />
              <p>Cashback</p>
              <strong>Hasta un {perks.cashback}%</strong>
            </article>
            <article>
              <RewardArt index={4} />
              <p>Bonos de subida de nivel</p>
              <strong>{perks.levelBonus}</strong>
            </article>
            <article>
              <RewardArt index={3} />
              <p>Bonificaciones regulares</p>
              <strong>{perks.regular} ventajas</strong>
            </article>
          </div>
          <button
            className="feature-load button button--secondary"
            aria-expanded={showRanks}
            onClick={() => setShowRanks(!showRanks)}
          >
            {showRanks ? "Ocultar ranks" : "Ver todos los Ranks"}
          </button>
          {showRanks && (
            <div className="vip-ranks__table">
              <table>
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Estado</th>
                    <th>Cashback</th>
                    <th>Gestor VIP</th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 5, 10, 15, 20].map((value) => (
                    <tr key={value}>
                      <td>{value}</td>
                      <td>{rankBenefits(value).name}</td>
                      <td>Hasta {rankBenefits(value).cashback}%</td>
                      <td>{value >= 10 ? <Check size={16} /> : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <small>Niveles y beneficios ilustrativos de la demo.</small>
            </div>
          )}
        </section>
        <section className="vip-transfer">
          <div>
            <span>PROGRAMA DE TRANSFERENCIA VIP</span>
            <h2>
              OBTÉN TODAS LAS
              <br />
              VENTAJAS VIP AL INSTANTE
            </h2>
            <p>
              Empieza por lo más alto. Descubre el Club VIP de HorseBet y sus
              beneficios de bienvenida.
            </p>
            <div>
              <button
                className="button button--secondary"
                onClick={() => onAction("Referidos")}
              >
                Invitar a un amigo VIP
              </button>
              <button
                className="button button--primary"
                onClick={() => onAction("register")}
              >
                Hazte VIP
              </button>
            </div>
          </div>
          <RewardArt index={4} />
        </section>
        <section className="feature-section">
          <div className="feature-section__intro">
            <h2>
              Consulta las ventajas <span>Super VIP</span>
            </h2>
            <p>
              Alcanza el Rank 15 para descubrir una selección de ventajas
              premium.
            </p>
          </div>
          <BenefitsGrid
            items={[
              {
                title: "Sala Súper VIP",
                description:
                  "Un espacio exclusivo para miembros del nivel superior.",
                art: 0,
              },
              {
                title: "Bonus Súper VIP",
                description: "Una selección especial de recompensas del club.",
                art: 2,
              },
              {
                title: "Bonus instantáneos",
                description: "Consulta tus recompensas en un mismo lugar.",
                art: 3,
              },
              {
                title: "Conserje VIP",
                description: "Atención personal para acompañar tu experiencia.",
                art: 4,
              },
              {
                title: "Bonus más altos",
                description: "Descubre los beneficios asociados a cada nivel.",
                art: 5,
              },
              {
                title: "Impulsor de Rakeback",
                description: "Explora todas las ventajas de tu rank.",
                art: 1,
              },
            ]}
            onSelect={setSelected}
          />
        </section>
        <section className="vip-contact">
          <h3>¡Mantente en contacto!</h3>
          <p>Estamos aquí para ayudarte a conocer la experiencia HorseBet.</p>
          <div>
            {[
              [MessageCircle, "Comunidad VIP"],
              [Mail, "Consultas VIP"],
              [Headphones, "Soporte 24/7"],
            ].map(([Icon, label]) => (
              <button
                key={label}
                className="button button--secondary"
                onClick={() => onAction("Ayuda")}
              >
                <Icon size={17} />
                {label}
              </button>
            ))}
          </div>
        </section>
        <FAQ
          items={[
            [
              "¿Por qué hacerme VIP en HorseBet?",
              "El club organiza beneficios y atención por niveles. En esta demo puedes explorar todas sus secciones sin una cuenta real.",
            ],
            [
              "¿Cómo se desbloquea el Club VIP?",
              "El diseño presenta el acceso VIP desde el rank 10 y Super VIP desde el 15. El selector permite comparar sus beneficios ilustrativos.",
            ],
            [
              "¿Qué es un gestor VIP?",
              "Es un punto de atención personal para los miembros del club. Los botones de contacto de esta demo abren información local.",
            ],
            [
              "¿Cuál es la diferencia entre VIP y Super VIP?",
              "Super VIP presenta una selección ampliada de beneficios. Puedes comparar los niveles en la tabla de ranks.",
            ],
            [
              "¿Qué es la transferencia VIP?",
              "Es la sección que presenta la incorporación al club desde otro programa. En esta recreación no se solicitan documentos ni se transfieren cuentas.",
            ],
            [
              "¿Los bonus mostrados son reales?",
              "No. Los importes y condiciones pertenecen a una demostración de interfaz.",
            ],
          ]}
        />
        <Breadcrumb name="Club VIP" onHome={onHome} />
      </div>
      {selected && (
        <FeatureDialog title={selected.title} onClose={() => setSelected(null)}>
          <RewardArt index={selected.art} className="feature-dialog__reward" />
          <p>{selected.description}</p>
          <p>
            Beneficio ilustrativo de HorseBet. Explora los ranks para conocer
            cómo se presentan las ventajas del club.
          </p>
          <button
            className="button button--primary"
            onClick={() => setSelected(null)}
          >
            Continuar explorando
          </button>
        </FeatureDialog>
      )}
    </>
  );
}
