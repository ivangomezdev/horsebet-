"use client";
import { useEffect, useRef, useState } from "react";
import { bonusSlots } from "../../data/bonus-slots.js";
import {
  initialBonusState,
  previewBonusState,
  pendingFeature,
  initialGrid,
  spinBonus,
  bonusRandom,
  winningCells,
} from "../../lib/games/bonus-engine.js";
import { symbolArt } from "../../lib/games/vendor/metaincognita/symbols.js";
import { symbolSprite } from "../../lib/games/symbol-art.js";
import {
  randomInt,
  stakeInCents,
  formatCredits,
} from "../../lib/games/engine.js";
import Reel from "../../lib/games/vendor/Reel.js";
import BonusSymbol from "./BonusSymbol";
import SlotAtmosphere from "./SlotAtmosphere";
import SlotWin from "./SlotWin";
import { RoundResult } from "./Shared";
import SlotConsole from "./SlotConsole";

function createCell(def, id) {
  const cell = document.createElement("span");
  cell.className = "slot-reel__cell";
  cell.dataset.symbol = id;
  const symbol = document.createElement("span");
  symbol.className = `bonus-symbol ${id === def.wildSymbol ? "bonus-symbol--wild" : ""} ${id === def.scatter?.symbol ? "bonus-symbol--scatter" : ""}`;
  symbol.setAttribute("role", "img");
  symbol.setAttribute("aria-label", def.symbols[id].label);
  const art = symbolArt(def.symbols[id].icon);
  const sprite = symbolSprite(def.symbols[id].icon);
  if (sprite) {
    const illustration = document.createElement("i");
    illustration.className = `slot-symbol slot-symbol--${sprite}`;
    illustration.setAttribute("aria-hidden", "true");
    symbol.appendChild(illustration);
  } else if (art?.kind === "svg") {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.innerHTML = art.body; // Reviewed local MIT SVG constants only.
    symbol.appendChild(svg);
  } else {
    const text = document.createElement("b");
    text.textContent =
      art?.variant === "bar"
        ? Array(Number(art.text) || 1)
            .fill("BAR")
            .join("\n")
        : art?.text || id;
    if (art?.color) text.style.color = art.color;
    if (art?.variant === "bar") text.className = "bonus-symbol__bars";
    symbol.appendChild(text);
  }
  if (id === def.wildSymbol || id === def.scatter?.symbol) {
    const badge = document.createElement("small");
    badge.textContent = id === def.wildSymbol ? "WILD" : "SCATTER";
    symbol.appendChild(badge);
  }
  cell.appendChild(symbol);
  return cell;
}
function featureText(feature, fallback) {
  if (!feature) return fallback;
  if (feature.kind === "wheel") return "RULETA DE BONUS ACTIVADA";
  if (feature.kind === "holdAndSpin")
    return `${feature.respins} TIRADAS · GEMAS BLOQUEADAS`;
  return `${feature.remaining} GIROS GRATIS · PREMIOS ×${feature.multiplier}`;
}
function Paytable({ def }) {
  if (def.family === "cascade")
    return (
      <div className="bonus-slot__paytable">
        <p>
          Multiplicadores de la apuesta total, antes de la escalera de cascadas.
        </p>
        {Object.entries(def.paytable).map(([id, tiers]) => (
          <div key={id}>
            <BonusSymbol
              icon={def.symbols[id].icon}
              label={def.symbols[id].label}
            />
            <span>{def.symbols[id].label}</span>
            {tiers.map((tier) => (
              <b key={tier.countAtLeast}>
                {tier.countAtLeast}+: {tier.pay}×
              </b>
            ))}
          </div>
        ))}
        <p>
          Escalera: {def.multiplierLadder.join("× · ")}×. GRAND:{" "}
          {def.grandTrigger} ídolos iniciales.
        </p>
      </div>
    );
  if (def.family === "wheel")
    return (
      <div className="bonus-slot__paytable">
        <p>
          Premios de línea por unidad (apuesta ÷ 3). Solo se paga la mejor
          combinación.
        </p>
        {def.paytable.map((entry) => (
          <p key={entry.id}>
            {entry.kind === "allSame"
              ? `Tres ${def.symbols[entry.symbol].label}`
              : entry.kind === "anyOf"
                ? "Tres BAR de cualquier tipo"
                : `${entry.n} cereza(s)`}
            : {entry.pay}×
          </p>
        ))}
        <p>
          Ruleta: valor en unidades y peso relativo. Las casillas del mismo
          tamaño no tienen la misma probabilidad.
        </p>
        {def.wedges.map((w, i) => (
          <span className="bonus-slot__wedge-pay" key={i}>
            {w.credits} · peso {w.weight}
          </span>
        ))}
      </div>
    );
  return (
    <div className="bonus-slot__paytable">
      <p>
        Premios por unidad (apuesta total ÷ 25); las líneas o combinaciones
        ganadoras se suman.
      </p>
      {Object.entries(def.symbols)
        .filter(([id]) => def.paytable.some((entry) => entry.symbol === id))
        .map(([id, symbol]) => (
          <div key={id}>
            <BonusSymbol icon={symbol.icon} label={symbol.label} />
            <span>{symbol.label}</span>
            {def.paytable
              .filter((entry) => entry.symbol === id)
              .map((entry) => (
                <b key={entry.id}>
                  {entry.length}: {entry.pay}×
                </b>
              ))}
          </div>
        ))}
      {def.scatter && (
        <p>
          SCATTER:{" "}
          {Object.entries(def.scatter.pays)
            .map(([count, pay]) => `${count} = ${pay}× apuesta total`)
            .join(" · ")}
        </p>
      )}
      {def.holdAndSpin && (
        <p>
          Gemas del bonus:{" "}
          {def.holdAndSpin.orbValues
            .map((v) => (v.mult ? `×${v.mult}` : `${v.credits} unidades`))
            .join(" · ")}
          . Los multiplicadores se suman; el GRAND se añade al llenar el
          tablero.
        </p>
      )}
    </div>
  );
}

export default function BonusSlotGame({ gameId, wallet, sound }) {
  const theme = bonusSlots[gameId],
    def = theme.definition,
    baseGrid = initialGrid(def),
    cols = baseGrid.length,
    rows = baseGrid[0].length;
  const mounts = useRef([]),
    engines = useRef([]),
    session = useRef(null),
    machine = useRef(initialBonusState(def)),
    active = useRef(true),
    locked = useRef(false),
    waits = useRef(new Map()),
    wheelAngle = useRef(0);
  const [stake, setStake] = useState("10.00"),
    [spinning, setSpinning] = useState(false),
    [outcome, setOutcome] = useState(null),
    [feature, setFeature] = useState(null),
    [total, setTotal] = useState(0),
    [result, setResult] = useState(null),
    [preview, setPreview] = useState(false),
    [notice, setNotice] = useState(null),
    [error, setError] = useState(""),
    [table, setTable] = useState(false),
    [frame, setFrame] = useState(null),
    [lockBoard, setLockBoard] = useState(null),
    [angle, setAngle] = useState(0),
    [wedge, setWedge] = useState(null),
    [motionPaused, setMotionPaused] = useState(false),
    [meter, setMeter] = useState(machine.current.progressive?.value || 0);
  const delay = (ms) =>
    new Promise((resolve) => {
      const timer = setTimeout(() => {
        waits.current.delete(timer);
        resolve(true);
      }, ms);
      waits.current.set(timer, resolve);
    });
  useEffect(() => {
    active.current = true;
    if (def.family !== "cascade")
      engines.current = mounts.current.map(
        (node, index) =>
          new Reel(
            node,
            index,
            initialGrid(def)[index],
            (id) => createCell(def, id),
            () => {
              const strip = (def.strips || def.physicalStrips)[index];
              return strip[randomInt(strip.length)];
            },
          ),
      );
    return () => {
      active.current = false;
      engines.current.forEach((engine) => engine.dispose());
      waits.current.forEach((resolve, timer) => {
        clearTimeout(timer);
        resolve(false);
      });
      waits.current.clear();
    };
  }, [def]);
  const showPreview = () => {
    if (locked.current || session.current || wallet.pending) return;
    const state = previewBonusState(def);
    session.current = {
      preview: true,
      state,
      stake: stakeInCents(stake) || 1000,
      total: 0,
    };
    setPreview(true);
    setResult(null);
    setTotal(0);
    setOutcome(null);
    setWedge(null);
    setFrame(null);
    setFeature(structuredClone(pendingFeature(state)));
    setLockBoard(
      state.videoFeature?.locked ? [...state.videoFeature.locked] : null,
    );
    setNotice(`VISTA PREVIA · ${theme.featureLabel}`);
  };
  const play = async () => {
    if (locked.current) return;
    if (!session.current) {
      const round = wallet.start(stakeInCents(stake), gameId);
      if (!round)
        return setError("Revisa la apuesta y las fichas disponibles.");
      session.current = {
        round,
        stake: round.stake,
        total: 0,
        state: structuredClone(machine.current),
        preview: false,
      };
      setPreview(false);
      setTotal(0);
      setResult(null);
      setLockBoard(null);
      setWedge(null);
    }
    const current = session.current,
      reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    locked.current = true;
    setSpinning(true);
    setOutcome(null);
    setNotice(null);
    setError("");
    sound("start");
    try {
      const previous = current.state.videoFeature;
      let draws = 0;
      const sample =
        current.preview && def.family === "cascade"
          ? () => {
              const i = draws++;
              return i < 8
                ? 0.1
                : i < 12
                  ? 0.4
                  : i < 16
                    ? 0.65
                    : i < 20
                      ? 0.85
                      : bonusRandom();
            }
          : bonusRandom;
      const next = spinBonus(def, current.state, sample);
      if (def.family === "cascade") {
        for (const [index, step] of next.cascadeSteps.entries()) {
          setFrame({ ...step, index });
          if (!(await delay(reduced ? 40 : step.wins.length ? 850 : 450)))
            return;
        }
      } else if (next.gameKind === "wheel") {
        const hit = next.featureEvents.find(
          (event) => event.type === "wheel-landed",
        ).wedgeIndex;
        const target = (360 - ((hit + 0.5) * 360) / def.wedges.length) % 360;
        wheelAngle.current =
          Math.ceil(wheelAngle.current / 360) * 360 + 5 * 360 + target;
        setAngle(wheelAngle.current);
        if (!(await delay(reduced ? 80 : 2800))) return;
        setWedge(hit);
      } else if (next.gameKind === "respin") {
        setLockBoard([...previous.locked]);
        if (!(await delay(reduced ? 40 : 900))) return;
      } else {
        if (!(await delay(0))) return;
        engines.current.forEach((engine, index) =>
          engine.renderSymbols(next.grid[index]),
        );
        const done = await Promise.all(
          engines.current.map((engine) => engine.spin({ reduced })),
        );
        if (done.some((value) => !value)) return;
      }
      if (!active.current) return;
      current.total += next.totalPayout;
      setTotal(Math.floor((current.total * current.stake) / def.maxCoins));
      setOutcome({ ...next, stake: current.stake });
      const nextFeature = pendingFeature(current.state);
      setFeature(structuredClone(nextFeature));
      if (current.state.videoFeature?.locked)
        setLockBoard([...current.state.videoFeature.locked]);
      const bonus = next.featureEvents.find((event) =>
        [
          "free-spins-triggered",
          "free-spins-retriggered",
          "wheel-armed",
        ].includes(event.type),
      );
      if (
        bonus ||
        (next.gameKind === "base" && nextFeature?.kind === "holdAndSpin")
      )
        setNotice(featureText(nextFeature, theme.featureLabel));
      if (!nextFeature) {
        if (!current.preview) {
          setResult(
            wallet.finish(
              current.round.id,
              current.total / def.maxCoins,
              "Ronda completa con sus bonus",
            ),
          );
          machine.current = structuredClone(current.state);
          setMeter(machine.current.progressive?.value || 0);
        }
        session.current = null;
      }
      sound(
        bonus || next.totalPayout > def.maxCoins
          ? "win"
          : next.totalPayout > 0
            ? "gem"
            : "lose",
      );
    } catch {
      if (active.current) {
        if (!current.preview)
          wallet.finish(
            current.round.id,
            1,
            "Ronda cancelada: fichas devueltas",
          );
        session.current = null;
        setFeature(null);
        setError("La ronda no pudo completarse; se devolvió la apuesta en fichas.");
      }
    } finally {
      if (active.current) {
        locked.current = false;
        setSpinning(false);
      }
    }
  };
  const hits = winningCells(def, outcome),
    grid = frame?.grid || baseGrid,
    stakeValue =
      session.current?.stake || outcome?.stake || stakeInCents(stake) || 1000;
  useEffect(() => {
    const won = winningCells(def, outcome);
    engines.current.forEach((engine, col) => {
      [...engine.symbolContainer.children].forEach((cell, row) => {
        cell.classList.toggle(
          "slot-reel__cell--winner",
          !spinning && won.has(`${col}-${row}`),
        );
      });
    });
  }, [outcome, spinning, def]);
  const buttonText = spinning
    ? "Girando…"
    : feature?.kind === "wheel"
      ? "Girar ruleta de bonus"
      : feature?.kind === "holdAndSpin"
        ? "Jugar nueva tirada"
        : feature
          ? "Jugar giro gratis"
          : "Girar rodillos";
  return (
    <div
      className={`game-layout slot-layout slot-layout--integrated bonus-slot bonus-slot--${gameId} slot-world slot-world--${theme.visual.style} slot-world--${theme.family} ${spinning ? "slot-world--spinning" : ""} ${feature ? "bonus-slot--feature" : ""} ${motionPaused ? "slot-world--paused" : ""}`}
      style={{
        "--slot-gold": theme.accent,
        "--slot-dark": theme.dark,
        "--slot-line": theme.accent,
        "--slot-title": theme.accent,
        "--scene-image": `url("${theme.visual.image}")`,
      }}
    >
      <section
        className="game-stage slot-stage"
        aria-label={`Slot ${theme.title}`}
      >
        <SlotAtmosphere
          visual={theme.visual}
          paused={motionPaused}
          intense={Boolean(feature)}
        />
        <header className="slot-stage__title">
          <span>HORSEBET COLLECTION</span>
          <h2>{theme.title}</h2>
          <small>{theme.tag}</small>
        </header>
        <div
          className={`bonus-slot__feature-bar ${feature ? "bonus-slot__feature-bar--active" : ""}`}
          aria-live="polite"
        >
          {featureText(
            feature,
            frame
              ? `CASCADA ${Math.min(frame.chain, def.maxTumbles)} · ×${frame.chainMult}`
              : theme.featureLabel,
          )}
        </div>
        {def.progressive && (
          <p className="bonus-slot__meter">
            GRAND LOCAL{" "}
            <strong>
              {formatCredits(Math.floor((meter * stakeValue) / def.maxCoins))}
            </strong>
          </p>
        )}
        {def.family === "wheel" && (
          <div
            className="bonus-wheel"
            aria-label={
              wedge !== null
                ? `Ruleta: ${def.wedges[wedge].credits} unidades`
                : "Ruleta de 24 premios"
            }
          >
            <i className="bonus-wheel__pointer" />
            <div
              className="bonus-wheel__disc"
              style={{ transform: `rotate(${angle}deg)` }}
            >
              {def.wedges.map((value, index) => (
                <span
                  key={index}
                  style={{ transform: `rotate(${(index + 0.5) * 15}deg)` }}
                >
                  <b>{value.credits}</b>
                </span>
              ))}
            </div>
            <div className="bonus-wheel__hub">
              HORSE
              <br />
              BET
            </div>
          </div>
        )}
        <div className="slot-cabinet">
          <div className="slot-world__frame" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </div>
          {def.family === "cascade" ? (
            <div
              className="bonus-grid"
              key={frame?.index}
              style={{ "--bonus-cols": cols }}
              role="group"
              aria-label="Tablero de cascadas de veinte símbolos"
            >
              {Array.from({ length: rows }, (_, row) =>
                grid.map((column, col) => (
                  <div
                    key={`${col}-${row}`}
                    className={`bonus-grid__cell ${frame?.wins.some((win) => win.symbols.includes(column[row])) ? "bonus-grid__cell--shatter" : ""}`}
                  >
                    <BonusSymbol
                      icon={def.symbols[column[row]].icon}
                      label={def.symbols[column[row]].label}
                    />
                  </div>
                )),
              )}
            </div>
          ) : (
            <>
              <div
                className="slot-board"
                style={{
                  gridTemplateColumns: `repeat(${cols},1fr)`,
                  display: lockBoard ? "none" : undefined,
                }}
                role="group"
                aria-label={`${cols} rodillos de tres símbolos`}
              >
                {Array.from({ length: cols }, (_, index) => (
                  <div
                    className="slot-reel"
                    key={index}
                    ref={(node) => {
                      mounts.current[index] = node;
                    }}
                  />
                ))}
                {!spinning && outcome?.grid.length > 0 && (
                  <div
                    className="slot-board__highlights"
                    style={{ gridTemplateColumns: `repeat(${cols},1fr)` }}
                    aria-hidden="true"
                  >
                    {Array.from({ length: cols * 3 }, (_, index) => (
                      <span
                        key={index}
                        className={
                          hits.has(
                            `${index % cols}-${Math.floor(index / cols)}`,
                          )
                            ? "slot-board__hit"
                            : ""
                        }
                      />
                    ))}
                  </div>
                )}
              </div>
              {lockBoard && (
                <div
                  className={`bonus-grid bonus-grid--locks ${spinning ? "bonus-grid--spinning" : ""}`}
                  style={{ "--bonus-cols": 5 }}
                  role="group"
                  aria-label="Gemas bloqueadas del bonus"
                >
                  {Array.from({ length: 3 }, (_, row) =>
                    Array.from({ length: 5 }, (_, col) => {
                      const cell = lockBoard[col * 3 + row];
                      return (
                        <div
                          key={`${col}-${row}`}
                          className={`bonus-grid__cell ${cell ? "bonus-grid__cell--locked" : "bonus-grid__cell--empty"}`}
                        >
                          {cell ? (
                            <>
                              <BonusSymbol
                                icon={
                                  "mult" in cell
                                    ? "gargoyle-eye"
                                    : def.symbols[def.holdAndSpin.orbSymbol]
                                        .icon
                                }
                                label="Gema bloqueada"
                              />
                              <strong>
                                {"mult" in cell
                                  ? `×${cell.mult}`
                                  : formatCredits(
                                      Math.floor(
                                        (cell.credits * stakeValue) /
                                          def.maxCoins,
                                      ),
                                    )}
                              </strong>
                            </>
                          ) : (
                            <span>✧</span>
                          )}
                        </div>
                      );
                    }),
                  )}
                </div>
              )}
            </>
          )}
          <div className="slot-cabinet__base">
            <span>{theme.featureLabel}</span>
            <span>HORSEBET</span>
            <span>{preview ? "VISTA PREVIA" : "FICHAS VIRTUALES"}</span>
          </div>
          {notice && (
            <div className="bonus-slot__celebration" role="status">
              <div className="slot-world__bonus-rays" aria-hidden="true" />
              <BonusSymbol icon={theme.icon} label="Bonus" />
              <span>{theme.visual.bonusTitle}</span>
              <strong>{notice}</strong>
              <button
                onClick={() => setNotice(null)}
                className="button button--primary"
              >
                Continuar
              </button>
            </div>
          )}
        </div>
        {!spinning && outcome?.totalPayout > 0 && (
          <SlotWin
            amount={Math.floor(
              (outcome.totalPayout * outcome.stake) / def.maxCoins,
            )}
            ratio={outcome.totalPayout / def.maxCoins}
            preview={preview}
            visual={theme.visual}
          />
        )}
        {!preview && (
          <RoundResult
            result={result}
            pending={Boolean(wallet.pending)}
            idle="Descubre el bonus de este juego"
          />
        )}
        <SlotConsole
          wallet={wallet}
          stake={stake}
          onStake={setStake}
          spinning={spinning}
          roundActive={Boolean(session.current)}
          preview={preview}
          total={total}
          buttonText={buttonText}
          onPlay={play}
          onPreview={showPreview}
          table={table}
          onTable={() => setTable(!table)}
          motionPaused={motionPaused}
          onMotion={() => setMotionPaused(!motionPaused)}
          error={error}
          variant={theme.family === "wheel" ? "arcade" : "panoramic"}
        />
        <details className="bonus-slot__credits">
          <summary>Licencia y procedencia</summary>
          <p>
            Reglas y gráficos adaptados de Metaincognita Slots, © 2026 Chris
            Schweda. Interfaz HorseBet en JSX.{" "}
            <a
              href="/licenses/metaincognita-slots.txt"
              target="_blank"
              rel="noreferrer"
            >
              Licencia MIT
            </a>
            .
          </p>
        </details>
        {table && <Paytable def={def} />}
      </section>
    </div>
  );
}
