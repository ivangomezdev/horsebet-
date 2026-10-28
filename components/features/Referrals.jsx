"use client";
import { useState } from "react";
import { Check, Copy, Users, Coins, ArrowUpRight } from "lucide-react";
import {
  FeatureHero,
  RewardArt,
  FAQ,
  Breadcrumb,
  FeatureDialog,
} from "./Shared";

export default function Referrals({ onAction, onHome }) {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const [share, setShare] = useState(20);
  const [referrals, setReferrals] = useState(5);
  const [link, setLink] = useState("");
  const invite = () => {
    setLink(`${window.location.origin}/es/?ref=HORSEBET`);
    setCopied(false);
    setCopyError(false);
    setInviteOpen(true);
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setCopyError(false);
    } catch {
      setCopyError(true);
    }
  };
  return (
    <>
      <FeatureHero
        type="referral"
        description="Invita a tus amigos a HorseBet y descubre las ventajas de crecer juntos."
        button="Invitar a amigos"
        onAction={invite}
        extra={
          <ul className="referral-checks">
            <li>
              <Check size={17} /> Bonus para ti y tus amigos
            </li>
            <li>
              <Check size={17} /> Recompensas de casino y deportes
            </li>
          </ul>
        }
      >
        Bonus de <span>1500 $</span>
        <br />
        por cada referido y hasta
        <br />
        <span>30% de COMISIÓN</span>
      </FeatureHero>
      <div className="content feature-content">
        <section className="referral-stats">
          <article>
            <Users />
            <span>
              Total de referidos<strong>1 511 016</strong>
            </span>
          </article>
          <article>
            <Coins />
            <span>
              Total de recompensas<strong>MX$ 133 611 788</strong>
            </span>
          </article>
          <div>
            <span className="live-dot" /> Comunidad HorseBet
            <small>Cifras de ejemplo</small>
          </div>
        </section>
        <section className="feature-section">
          <div className="feature-section__intro">
            <h2>
              Comparte la diversión.
              <br />
              <span>Descubre las recompensas.</span>
            </h2>
            <p>Tu enlace, tus amigos y un mundo de ventajas por explorar.</p>
          </div>
          <div className="referral-benefits">
            <article>
              <RewardArt index={2} />
              <span>POR CADA AMIGO</span>
              <h3>
                Bonus de <b>1500 $</b>
              </h3>
              <p>
                Invita a tus amigos y explora las etapas del programa de
                recompensas.
              </p>
              <button className="button button--primary" onClick={invite}>
                Invitar a amigos
              </button>
            </article>
            <article>
              <RewardArt index={4} />
              <span>CRECE CON TU COMUNIDAD</span>
              <h3>
                Hasta <b>30%</b> de comisión
              </h3>
              <p>
                Descubre las recompensas del programa de referidos para casino y
                deportes.
              </p>
              <button className="button button--secondary" onClick={invite}>
                Obtener mi enlace <ArrowUpRight size={16} />
              </button>
            </article>
          </div>
        </section>
        <section className="referral-calculator">
          <div>
            <span className="feature-eyebrow">COMPARTE TUS RECOMPENSAS</span>
            <h2>
              Un bonus para ellos.
              <br />
              Más amigos para ti.
            </h2>
            <p>
              Explora cómo se repartiría una comisión ilustrativa de 100 $ por
              amigo. Puedes compartir hasta el 50%.
            </p>
            <RewardArt index={3} />
          </div>
          <div className="referral-calculator__panel">
            <label>
              Número de amigos
              <input
                type="number"
                min="1"
                max="1000"
                value={referrals}
                onChange={(event) =>
                  setReferrals(
                    Math.max(
                      1,
                      Math.min(1000, Number(event.target.value) || 1),
                    ),
                  )
                }
              />
            </label>
            <label>
              Porcentaje para tus amigos <strong>{share}%</strong>
              <input
                aria-label="Porcentaje para tus amigos"
                type="range"
                min="0"
                max="50"
                value={share}
                onChange={(event) => setShare(Number(event.target.value))}
              />
            </label>
            <div className="referral-calculator__result" aria-live="polite">
              <span>
                Para ti
                <strong>
                  {(referrals * (100 - share)).toLocaleString("es-MX")} $
                </strong>
              </span>
              <span>
                Para tus amigos
                <strong>{(referrals * share).toLocaleString("es-MX")} $</strong>
              </span>
            </div>
            <small>Simulación de reparto. No representa ingresos reales.</small>
            <button className="button button--primary" onClick={invite}>
              Compartir mi enlace
            </button>
          </div>
        </section>
        <section className="affiliate-banner">
          <RewardArt index={0} />
          <div>
            <span>PROGRAMA DE AFILIADOS</span>
            <h2>Haz crecer tu comunidad con HorseBet</h2>
            <p>
              Descubre una propuesta para creadores: hasta <b>50% RevShare</b>{" "}
              durante los dos primeros meses y niveles de hasta el 60%.
            </p>
            <button
              className="button button--secondary"
              onClick={() => onAction("Afiliados")}
            >
              Conocer el programa <ArrowUpRight size={16} />
            </button>
          </div>
        </section>
        <FAQ
          items={[
            [
              "¿Cómo invito a mis amigos?",
              "Pulsa «Invitar a amigos» para obtener un enlace de ejemplo. Puedes copiarlo y explorar su presentación; no se registra ninguna cuenta de referido.",
            ],
            [
              "¿Cómo funciona el bonus de referido?",
              "La página presenta las recompensas por etapas del diseño de referencia. Este enlace no genera premios ni comisiones.",
            ],
            [
              "¿Puedo compartir mi comisión con mis amigos?",
              "La calculadora permite comparar un reparto de entre el 0% y el 50% de una comisión ilustrativa.",
            ],
            [
              "¿Dónde veo mis referidos?",
              "En un producto real aparecerían en el panel de tu cuenta. Las cifras de esta página son ejemplos visuales.",
            ],
            [
              "¿Qué diferencia hay entre referidos y afiliados?",
              "Referidos está pensado para compartir un enlace con amigos; el programa de afiliados presenta una propuesta para creadores y comunidades.",
            ],
          ]}
        />
        <Breadcrumb name="Sistema de Referidos" onHome={onHome} />
      </div>
      {inviteOpen && (
        <FeatureDialog
          title="Invita a tus amigos"
          onClose={() => setInviteOpen(false)}
        >
          <RewardArt index={4} className="feature-dialog__reward" />
          <p>Comparte la experiencia HorseBet con este enlace de ejemplo.</p>
          <label className="invite-link">
            Tu enlace
            <input
              aria-label="Tu enlace de invitación"
              value={link}
              readOnly
              onFocus={(event) => event.target.select()}
            />
          </label>
          <button className="button button--primary" onClick={copy}>
            {copied ? <Check size={17} /> : <Copy size={17} />}{" "}
            {copied ? "Enlace copiado" : "Copiar enlace"}
          </button>
          <p role="status">
            {copyError
              ? "Selecciona el enlace y cópialo manualmente."
              : copied
                ? "Listo. El enlace ya está en tu portapapeles."
                : "Este enlace no genera comisiones ni cuentas reales."}
          </p>
        </FeatureDialog>
      )}
    </>
  );
}
