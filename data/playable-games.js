import { bonusSlots } from "./bonus-slots.js";
export const playableGames = {
  ...Object.fromEntries(
    Object.entries(bonusSlots).map(([id, { definition, ...game }]) => [
      id,
      { ...game, kind: "bonus-slot" },
    ]),
  ),
  dice: {
    title: "Dice",
    tag: "ENCUENTRA TU NÚMERO",
    color: "mint",
    description: "Tú eliges el límite. El dado decide el resto.",
    rules:
      "Elige una probabilidad entre 5% y 95% y tira un número entre 0.00 y 99.99. «Menor que» gana por debajo del límite; «Mayor o igual» gana desde el límite. El retorno incluye la apuesta. Retorno teórico: 97%, antes del redondeo a centésimas.",
  },
  mines: {
    title: "Mines",
    tag: "DESCUBRE LO EXTRAORDINARIO",
    color: "violet",
    description: "Encuentra las gemas. Decide cuándo recogerlas.",
    rules:
      "El tablero tiene 25 casillas. Elige de 1 a 10 minas antes de empezar. Cada gema aumenta el multiplicador. Recoge el retorno después de descubrir al menos una gema; una mina termina la ronda sin retorno. Al descubrir todas las gemas, el retorno se recoge automáticamente. La ubicación de las minas se fija al comenzar.",
  },
  plinko: {
    title: "Plinko",
    tag: "DEJA QUE CAIGA LA SUERTE",
    color: "red",
    description: "Ocho niveles. Nueve destinos. Una caída única.",
    rules:
      "Cada uno de los ocho rebotes tiene un 50% de probabilidad de ir a izquierda o derecha. El multiplicador final depende de la casilla de llegada y del riesgo elegido. Las casillas centrales son más probables. Retorno teórico: 97.890625% en bajo y 98.75% en alto, antes del redondeo. La animación representa el recorrido sorteado.",
  },
  coin: {
    title: "Coin Flip",
    tag: "DOS CARAS. TU ELECCIÓN.",
    color: "gold",
    description: "Caballo o herradura. Elige tu lado.",
    rules:
      "Elige caballo o herradura. Cada cara tiene la misma probabilidad: 50%. Si aciertas recibes 1.94 veces la apuesta, incluyendo las fichas apostadas. Retorno teórico: 97%, antes del redondeo.",
  },
};
export function playablePath(id) {
  return playableGames[id] ? `/es/casino/${id}/` : null;
}
