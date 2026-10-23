import type { CSSProperties } from "react";

const BULB_COLORS = [
  "#ff2d55", // vermelho
  "#ffd166", // dourado
  "#3ddc84", // verde
  "#4cc9f0", // azul gelo
  "#ff8c42", // laranja
  "#c77dff", // roxo
];

/**
 * Pisca-pisca pendurado na borda inferior do cabeçalho.
 * Só é exibido quando o tema "Christmas" está ativo (CSS).
 */
export function ChristmasGarland({ bulbs = 18 }: { bulbs?: number }) {
  return (
    <div
      aria-hidden="true"
      className="christmas-garland pointer-events-none absolute inset-x-0 -bottom-2 z-20 flex items-start justify-between px-1 sm:px-4"
    >
      <span className="christmas-garland__wire" />
      {Array.from({ length: bulbs }).map((_, index) => (
        <span
          key={index}
          className="christmas-bulb"
          style={
            {
              "--bulb-color": BULB_COLORS[index % BULB_COLORS.length],
              animationDelay: `${(index % 6) * 0.32}s`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
