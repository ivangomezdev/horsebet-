"use client";
import { useEffect, useState } from "react";
import { formatCredits } from "../../lib/games/engine.js";

export default function SlotWin({ amount, ratio, preview, visual }) {
  const [count, setCount] = useState(amount);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / 1400, 1);
      setCount(Math.floor(amount * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [amount]);
  return (
    <div
      className={`slot-win slot-win--${visual.weather} ${ratio > 1 ? "slot-win--profit" : ""}`}
      role="status"
      aria-label={`Retorno ${formatCredits(amount)} fichas demo`}
    >
      {ratio > 1 && (
        <div className="slot-win__burst" aria-hidden="true">
          {Array.from({ length: 18 }, (_, i) => (
            <i
              key={i}
              style={{
                "--angle": `${i * 20}deg`,
                "--distance": `${70 + (i % 4) * 22}px`,
                "--delay": `${(i % 5) * 0.08}s`,
              }}
            />
          ))}
        </div>
      )}
      <span>
        {ratio >= 20
          ? "¡PREMIO ÉPICO!"
          : ratio >= 5
            ? "¡GRAN PREMIO!"
            : ratio > 1
              ? "¡PREMIO!"
              : "RETORNO"}
      </span>
      <strong aria-hidden="true">{formatCredits(count)}</strong>
      <small>FICHAS DEMO {preview ? "· VISTA PREVIA" : ""}</small>
    </div>
  );
}
