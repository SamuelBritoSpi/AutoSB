import { cn } from "@/lib/utils";

/**
 * Chapeuzinho de Papai Noel desenhado em CSS.
 * Fica invisível por padrão e só aparece no tema "Christmas".
 */
export function SantaHat({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "santa-hat pointer-events-none absolute z-20 h-4 w-5",
        className
      )}
    >
      <span className="santa-hat__cone" />
      <span className="santa-hat__brim" />
      <span className="santa-hat__pom" />
    </span>
  );
}
