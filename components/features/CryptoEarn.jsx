"use client";
import { useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ArrowDownUp,
  ArrowUpRight,
  LockKeyhole,
} from "lucide-react";
import { FeatureHero, FAQ, Breadcrumb, FeatureDialog } from "./Shared";
import { cryptoCoins } from "../../data/features";
import { lootboxes } from "../../data/lootboxes";

function Coin({ coin }) {
  return (
    <span
      className="crypto-coin"
      style={{ "--coin-color": coin.color }}
      aria-hidden="true"
    >
      {coin.icon}
    </span>
  );
}
function CryptoRail({ title, description, children }) {
  const ref = useRef(null);
  return (
    <section className="feature-section">
      <div className="feature-heading">
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        <div className="rail-controls">
          <button
            className="button button--arrow"
            aria-label={`Anterior: ${title}`}
            onClick={() =>
              ref.current.scrollBy({
                left: -ref.current.clientWidth * 0.75,
                behavior: "smooth",
              })
            }
          >
            <ChevronLeft size={18} />
          </button>
          <button
            className="button button--arrow"
            aria-label={`Siguiente: ${title}`}
            onClick={() =>
              ref.current.scrollBy({
                left: ref.current.clientWidth * 0.75,
                behavior: "smooth",
              })
            }
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
      <div className="crypto-rail" ref={ref}>
        {children}
      </div>
    </section>
  );
}
export default function CryptoEarn({ onAction, onHome }) {
  const [selected, setSelected] = useState(null);
  const [amount, setAmount] = useState("100");
  const [from, setFrom] = useState("BTC");
  const [to, setTo] = useState("USDT");
  const [swapAmount, setSwapAmount] = useState("0.01");
  const [swapOpen, setSwapOpen] = useState(false);
  const [loot, setLoot] = useState(null);
  const fromCoin = cryptoCoins.find((coin) => coin.symbol === from);
  const toCoin = cryptoCoins.find((coin) => coin.symbol === to);
  const swapValue = (
    (Math.max(0, Number(swapAmount) || 0) * fromCoin.price) /
    toCoin.price
  ).toLocaleString("es-MX", { maximumFractionDigits: 8 });
  return (
    <>
      <FeatureHero
        type="crypto"
        description="Un universo de posibilidades cripto. Explora el staking, el intercambio, los futuros y las colecciones NFT en HorseBet."
        onAction={() => onAction("register")}
      >
        Cripto <span>y Gana</span>
      </FeatureHero>
      <div className="content feature-content">
        <CryptoRail
          title="Staking cripto"
          description="Descubre los planes y explora sus condiciones."
        >
          {cryptoCoins.map((coin) => (
            <button
              className="staking-card"
              key={coin.symbol}
              onClick={() => {
                setSelected(coin);
                setAmount("100");
              }}
            >
              <div className="staking-card__top">
                <Coin coin={coin} />
                <span>
                  <strong>{coin.symbol}</strong>
                  <small>{coin.name}</small>
                </span>
                <ChevronRight size={18} />
              </div>
              <span className="staking-card__label">Hasta</span>
              <strong className="staking-card__rate">
                {coin.rate}% <small>APR</small>
              </strong>
              <div className="staking-card__bottom">
                <span>
                  Duración<strong>{coin.duration}</strong>
                </span>
                <span className="staking-card__cta">
                  Explorar <ChevronRight size={14} />
                </span>
              </div>
            </button>
          ))}
        </CryptoRail>
        <p className="crypto-demo-note">
          Tasas, cotizaciones y productos ilustrativos.
        </p>
        <section className="crypto-swap">
          <div className="crypto-swap__body">
            <span className="feature-eyebrow">INTERCAMBIO CRIPTO</span>
            <h2>
              Tu cripto.
              <br />
              <span>Más posibilidades.</span>
            </h2>
            <p>
              Una experiencia de intercambio rápida y sencilla, con tus monedas
              favoritas en un solo lugar.
            </p>
            <button
              className="button button--primary"
              onClick={() => setSwapOpen(true)}
            >
              Explorar intercambio <ArrowDownUp size={16} />
            </button>
          </div>
          <div className="crypto-swap__coins" aria-hidden="true">
            {[cryptoCoins[2], cryptoCoins[5], cryptoCoins[3]].map((coin) => (
              <Coin key={coin.symbol} coin={coin} />
            ))}
            <ArrowDownUp size={34} />
          </div>
        </section>
        <CryptoRail
          title="Futuros cripto"
          description="Explora los mercados y una vista previa de la interfaz."
        >
          {cryptoCoins.slice(1, 5).map((coin) => (
            <button
              className="futures-card"
              key={coin.symbol}
              onClick={() => {
                setSelected({ ...coin, futures: true });
                setAmount("100");
              }}
            >
              <div>
                <Coin coin={coin} />
                <strong>{coin.symbol}/USDT</strong>
                <span>1000×</span>
              </div>
              <strong>{coin.price.toLocaleString("es-MX")} $</strong>
              <small>Cotización de ejemplo</small>
              <svg
                className="futures-card__chart"
                viewBox="0 0 240 60"
                aria-hidden="true"
              >
                <path
                  d="M0 52L12 47 23 50 38 31 50 35 64 20 79 34 88 28 105 30 120 14 135 22 148 19 167 27 182 8 195 18 214 9 229 14 240 3"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
              <span className="futures-card__link">
                Ver mercado <ArrowUpRight size={15} />
              </span>
            </button>
          ))}
        </CryptoRail>
        <CryptoRail
          title="NFT Lootboxes"
          description="Descubre colecciones, objetos y nuevas sorpresas."
        >
          {lootboxes.map((box) => (
            <button
              className="loot-card"
              key={box.id}
              onClick={() => setLoot(box)}
            >
              <img
                className="loot-card__art"
                src={`/images/lootboxes/${box.id}.png`}
                alt=""
                width="512"
                height="512"
                loading="lazy"
              />
              <h3>{box.name}</h3>
              <p>{box.collection}</p>
              <span>
                Coming soon <ChevronRight size={14} />
              </span>
            </button>
          ))}
        </CryptoRail>
        <FAQ
          items={[
            [
              "¿Qué puedo hacer en Cripto y Gana?",
              "Puedes consultar los planes de staking, calcular una conversión entre monedas y descubrir las próximas colecciones.",
            ],
            [
              "¿Las tasas y precios son actuales?",
              "No. Todas las tasas, precios y resultados son ejemplos estáticos de diseño y no constituyen una oferta real.",
            ],
            [
              "¿Puedo conectar una wallet o depositar?",
              "Esta sección no conecta wallets ni permite depósitos, inversiones, operaciones o retiradas.",
            ],
            [
              "¿Cuándo estarán disponibles las lootboxes?",
              "Las colecciones están en preparación. Por ahora puedes consultar sus detalles; todavía no se pueden comprar ni abrir.",
            ],
          ]}
        />
        <Breadcrumb name="Cripto y Gana" onHome={onHome} />
      </div>
      {selected && (
        <FeatureDialog
          title={`${selected.futures ? "Mercado" : "Staking"} ${selected.symbol}`}
          onClose={() => setSelected(null)}
        >
          <Coin coin={selected} />
          {selected.futures ? (
            <>
              <h3>
                {selected.symbol}/USDT ·{" "}
                {selected.price.toLocaleString("es-MX")} $
              </h3>
              <p>
                Vista de mercado ilustrativa. Los precios son estáticos y esta
                sección no ejecuta operaciones.
              </p>
              <button
                className="button button--secondary"
                onClick={() => setSelected(null)}
              >
                Volver a explorar
              </button>
            </>
          ) : (
            <>
              <p>
                Calculadora de ejemplo con una tasa anual simple de{" "}
                {selected.rate}%. No representa un rendimiento garantizado.
              </p>
              <div className="feature-form">
                <label>
                  Importe de ejemplo ({selected.symbol})
                  <input
                    type="number"
                    min="0"
                    max="100000000"
                    step="any"
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                  />
                </label>
                <div className="crypto-estimate" aria-live="polite">
                  <span>Estimación anual</span>
                  <strong>
                    {(
                      (Math.max(0, Number(amount) || 0) * selected.rate) /
                      100
                    ).toLocaleString("es-MX", {
                      maximumFractionDigits: 6,
                    })}{" "}
                    {selected.symbol}
                  </strong>
                </div>
                <span className="crypto-demo-note">
                  <LockKeyhole size={14} /> No se solicitan fondos ni se realiza
                  staking.
                </span>
              </div>
            </>
          )}
        </FeatureDialog>
      )}
      {swapOpen && (
        <FeatureDialog
          title="Calculadora de intercambio"
          onClose={() => setSwapOpen(false)}
        >
          <p>Compara una conversión con precios de ejemplo.</p>
          <div className="feature-form">
            <label>
              Cantidad
              <input
                type="number"
                min="0"
                step="any"
                value={swapAmount}
                onChange={(event) => setSwapAmount(event.target.value)}
              />
            </label>
            <div className="crypto-swap__selectors">
              <label>
                De
                <select
                  value={from}
                  onChange={(event) => setFrom(event.target.value)}
                >
                  {cryptoCoins.map((coin) => (
                    <option key={coin.symbol}>{coin.symbol}</option>
                  ))}
                </select>
              </label>
              <button
                className="button button--icon"
                aria-label="Invertir monedas"
                onClick={() => {
                  setFrom(to);
                  setTo(from);
                }}
              >
                <ArrowDownUp size={18} />
              </button>
              <label>
                A
                <select
                  value={to}
                  onChange={(event) => setTo(event.target.value)}
                >
                  {cryptoCoins.map((coin) => (
                    <option key={coin.symbol}>{coin.symbol}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="crypto-estimate" aria-live="polite">
              <span>Conversión ilustrativa</span>
              <strong>
                {swapValue} {to}
              </strong>
            </div>
            <small>No se ejecuta ninguna operación.</small>
          </div>
        </FeatureDialog>
      )}
      {loot && (
        <FeatureDialog title={loot.name} onClose={() => setLoot(null)}>
          <img
            className="loot-dialog__art"
            src={`/images/lootboxes/${loot.id}.png`}
            alt={loot.name}
            width="512"
            height="512"
          />
          <h3>{loot.collection}</h3>
          <p>
            Próximamente en HorseBet. Esta colección todavía no está disponible
            para comprar o abrir.
          </p>
          <button
            className="button button--primary"
            onClick={() => setLoot(null)}
          >
            Volver a las colecciones
          </button>
        </FeatureDialog>
      )}
    </>
  );
}
