"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { Gift, TreePine } from "lucide-react";
import { useTheme } from "next-themes";

type Flake = {
  left: number;
  size: number;
  duration: number;
  delay: number;
  drift: number;
  opacity: number;
};

type Star = {
  left: number;
  top: number;
  size: number;
  duration: number;
  delay: number;
};

/**
 * Valores determinísticos (sem Math.random) para não quebrar a hidratação
 * e manter a neve/estrelas sempre no mesmo lugar a cada render.
 */
const FLAKES: Flake[] = Array.from({ length: 55 }, (_, i) => ({
  left: (i * 47 + 7) % 100,
  size: 3 + ((i * 7) % 5),
  duration: 8 + ((i * 13) % 10),
  delay: -((i * 17) % 18),
  drift: (i % 2 === 0 ? 1 : -1) * (12 + ((i * 11) % 46)),
  opacity: 0.35 + (i % 5) * 0.13,
}));

const STARS: Star[] = Array.from({ length: 28 }, (_, i) => ({
  left: (i * 37 + 11) % 100,
  top: (i * 53 + 5) % 88,
  size: 1 + ((i * 3) % 3),
  duration: 2.4 + (i % 7) * 0.45,
  delay: -((i * 0.37) % 4),
}));

/**
 * Camada decorativa do tema Natal: neve, estrelas, pisca-pisca,
 * faixa de balas, enfeites nos cantos e saudação.
 *
 * Não renderiza absolutamente nada fora do tema "Christmas", então
 * os temas Claro/Escuro permanecem 100% intactos.
 */
export function ChristmasEffects() {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isChristmas =
    mounted && (theme === "christmas" || resolvedTheme === "christmas");

  // Ajusta a cor da barra do navegador/PWA enquanto o tema estiver ativo.
  useEffect(() => {
    if (!isChristmas) return;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) return;
    const previous = meta.getAttribute("content") || "#3F51B5";
    meta.setAttribute("content", "#8f1226");
    return () => meta.setAttribute("content", previous);
  }, [isChristmas]);

  if (!isChristmas) return null;

  return (
    <>
      {/* Faixa de balas no topo da janela */}
      <div aria-hidden="true" className="christmas-candy-strip" />

      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[55] overflow-hidden"
      >
        {/* Estrelas piscando ao fundo */}
        {STARS.map((star, index) => (
          <span
            key={`star-${index}`}
            className="christmas-star"
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
              width: star.size,
              height: star.size,
              animationDuration: `${star.duration}s`,
              animationDelay: `${star.delay}s`,
            }}
          />
        ))}

        {/* Neve caindo */}
        {FLAKES.map((flake, index) => (
          <span
            key={`flake-${index}`}
            className="christmas-snowflake"
            style={
              {
                left: `${flake.left}%`,
                width: flake.size,
                height: flake.size,
                opacity: flake.opacity,
                animationDuration: `${flake.duration}s`,
                animationDelay: `${flake.delay}s`,
                "--drift": `${flake.drift}px`,
              } as CSSProperties
            }
          />
        ))}

        {/* Enfeites nos cantos (telas maiores) */}
        <span className="christmas-corner hidden text-6xl lg:block left-4 bottom-24">
          🎄
        </span>
        <span
          className="christmas-corner hidden text-5xl lg:block right-5 bottom-28"
          style={{ animationDelay: "-1.6s" }}
        >
          🎁
        </span>
        <span
          className="christmas-corner hidden text-4xl xl:block right-7 top-24"
          style={{ animationDelay: "-2.8s" }}
        >
          ⭐
        </span>

        {/* Saudação que aparece e some sozinha */}
        <div className="christmas-greeting">
          <span className="christmas-greeting__badge">
            <TreePine className="h-4 w-4 text-emerald-300" />
            Feliz Natal!
            <Gift className="h-4 w-4 text-red-300" />
          </span>
        </div>
      </div>
    </>
  );
}
