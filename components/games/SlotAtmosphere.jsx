"use client";
import { useEffect, useRef, useState } from "react";

// Deterministic positions keep SSR and hydration identical.
export default function SlotAtmosphere({ visual, paused, intense }) {
  const root = useRef(null);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    let intersecting = true;
    const update = () => setVisible(intersecting && !document.hidden);
    document.addEventListener("visibilitychange", update);
    const observer = new IntersectionObserver(([entry]) => {
      intersecting = entry.isIntersecting;
      update();
    });
    if (root.current) observer.observe(root.current);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, []);
  return (
    <div
      ref={root}
      aria-hidden="true"
      className={`slot-atmosphere slot-atmosphere--${visual.weather} ${paused || !visible ? "slot-atmosphere--paused" : ""} ${intense ? "slot-atmosphere--intense" : ""}`}
    >
      <div className="slot-atmosphere__scene" />
      <div className="slot-atmosphere__shade" />
      <div className="slot-atmosphere__light" />
      <div className="slot-atmosphere__mist slot-atmosphere__mist--near" />
      <div className="slot-atmosphere__mist slot-atmosphere__mist--far" />
      <div className="slot-atmosphere__particles">
        {Array.from({ length: 22 }, (_, i) => (
          <i
            key={i}
            className="slot-atmosphere__particle"
            style={{
              "--x": `${(i * 37 + 7) % 100}%`,
              "--y": `${(i * 23) % 100}%`,
              "--drift": `${(i % 2 ? -1 : 1) * (30 + i * 3)}px`,
              "--speed": `${6 + (i % 9)}s`,
              "--delay": `${-i * 0.83}s`,
              "--size": `${4 + (i % 8)}px`,
              "--turn": `${i * 47}deg`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
