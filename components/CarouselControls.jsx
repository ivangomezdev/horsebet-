import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

export default function CarouselControls({
  carousel,
  count,
  label = "promoción",
  className = "",
}) {
  const { active, select, progressRef, stopped, toggle, reducedMotion } =
    carousel;
  return (
    <div className={`carousel-controls ${className}`} ref={progressRef}>
      <button
        className="carousel-controls__arrow"
        aria-label={`${label} anterior`}
        onClick={() => select((value) => value - 1)}
      >
        <ChevronLeft size={18} />
      </button>
      {Array.from({ length: count }, (_, index) => (
        <button
          key={index}
          className={`carousel-controls__indicator ${index === active ? "carousel-controls__indicator--active" : index < active ? "carousel-controls__indicator--complete" : ""}`}
          aria-label={`Ver ${label.toLowerCase()} ${index + 1}`}
          aria-pressed={active === index}
          onClick={() => select(index)}
        >
          <span className="carousel-controls__fill" aria-hidden="true" />
        </button>
      ))}
      <button
        className="carousel-controls__arrow"
        aria-label={`${label} siguiente`}
        onClick={() => select((value) => value + 1)}
      >
        <ChevronRight size={18} />
      </button>
      {!reducedMotion && (
        <button
          className="carousel-controls__pause"
          onClick={toggle}
          aria-label={stopped ? "Reanudar carrusel" : "Pausar carrusel"}
          aria-pressed={stopped}
        >
          {stopped ? <Play size={12} /> : <Pause size={12} />}
        </button>
      )}
    </div>
  );
}
