/**
 * Adapted from johakr/html5-slot-machine/src/js/Reel.js (MIT).
 * Copyright (c) 2017 Johannes Kronmüller.
 * Pinned source: 347fc31ddd227674d8dc93e238d6664784e1872d.
 * Full notice: public/licenses/html5-slot-machine.txt.
 * HorseBet changes: injectable symbols, bounded timings, reduced motion,
 * cancellation/disposal, responsive positioning and React-owned mount points.
 */
export default class Reel {
  constructor(
    reelContainer,
    index,
    initialSymbols,
    createSymbol,
    randomSymbol,
  ) {
    this.reelContainer = reelContainer;
    this.idx = index;
    this.createSymbol = createSymbol;
    this.randomSymbol = randomSymbol;
    this.symbolContainer = document.createElement("div");
    this.symbolContainer.className = "slot-reel__strip";
    this.reelContainer.appendChild(this.symbolContainer);
    initialSymbols.forEach((symbol) =>
      this.symbolContainer.appendChild(createSymbol(symbol)),
    );
  }
  get factor() {
    return 1 + Math.pow(this.idx / 2, 2);
  }
  renderSymbols(nextSymbols) {
    const fragment = document.createDocumentFragment();
    this.travel = Math.floor(this.factor) * 6;
    for (let i = 0; i < this.travel; i++)
      fragment.appendChild(
        this.createSymbol(
          i >= this.travel - 3
            ? nextSymbols[i - (this.travel - 3)]
            : this.randomSymbol(),
        ),
      );
    this.symbolContainer.appendChild(fragment);
  }
  spin({ turbo = false, reduced = false } = {}) {
    const duration = reduced
      ? 30
      : turbo
        ? 280 + this.idx * 80
        : 850 + this.idx * 220;
    const distance = (this.travel * this.reelContainer.clientHeight) / 3;
    this.animation = this.symbolContainer.animate(
      [
        { top: "0px", filter: "blur(0)" },
        { filter: reduced ? "blur(0)" : "blur(2px)", offset: 0.45 },
        { top: `-${distance}px`, filter: "blur(0)" },
      ],
      { duration, easing: "cubic-bezier(.15,.55,.25,1)", fill: "forwards" },
    );
    return new Promise((resolve) => {
      this.resolve = resolve;
      const finish = () => {
        if (this.disposed) return;
        clearTimeout(this.timer);
        while (this.symbolContainer.children.length > 3)
          this.symbolContainer.firstChild.remove();
        this.animation.onfinish = null;
        this.animation.cancel();
        this.resolve = null;
        resolve(true);
      };
      this.animation.onfinish = finish;
      this.timer = setTimeout(finish, duration + 100);
    });
  }
  dispose() {
    this.disposed = true;
    clearTimeout(this.timer);
    if (this.animation) {
      this.animation.onfinish = null;
      this.animation.cancel();
    }
    this.resolve?.(false);
    this.resolve = null;
    this.symbolContainer.remove();
  }
}
