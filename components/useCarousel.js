"use client";
import { useCallback, useEffect, useRef, useState } from "react";

export default function useCarousel(count, duration = 6000) {
  const [active, setActive] = useState(0);
  const [stopped, setStopped] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const progressRef = useRef(null);
  const elapsed = useRef(0);
  const paused = stopped || hovered || focused || hidden || reducedMotion;

  const select = useCallback(
    (index) => {
      elapsed.current = 0;
      progressRef.current?.style.setProperty("--carousel-progress", "0");
      setActive((current) => {
        const next = typeof index === "function" ? index(current) : index;
        return ((next % count) + count) % count;
      });
    },
    [count],
  );

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setReducedMotion(media.matches);
    const updateVisibility = () => setHidden(document.hidden);
    updateMotion();
    updateVisibility();
    media.addEventListener("change", updateMotion);
    document.addEventListener("visibilitychange", updateVisibility);
    return () => {
      media.removeEventListener("change", updateMotion);
      document.removeEventListener("visibilitychange", updateVisibility);
    };
  }, []);

  useEffect(() => {
    if (paused || count < 2) return;
    let frame;
    let previous = performance.now();
    const tick = (now) => {
      elapsed.current = Math.min(duration, elapsed.current + now - previous);
      previous = now;
      progressRef.current?.style.setProperty(
        "--carousel-progress",
        String(elapsed.current / duration),
      );
      if (elapsed.current >= duration) {
        select((value) => value + 1);
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [count, duration, paused, select]);

  return {
    active,
    select,
    progressRef,
    stopped,
    reducedMotion,
    toggle: () => setStopped((value) => !value),
    interactionProps: {
      onMouseEnter: () => setHovered(true),
      onMouseLeave: () => setHovered(false),
      onFocusCapture: () => setFocused(true),
      onBlurCapture: (event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          setFocused(false);
      },
    },
  };
}
