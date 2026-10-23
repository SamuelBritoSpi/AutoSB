"use client"

import * as React from "react"
import { Moon, Sun, TreePine } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => setMounted(true), [])

  const isChristmas = mounted && theme === "christmas"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" size="icon" className="relative overflow-hidden">
          <Sun
            className={cn(
              "h-[1.2rem] w-[1.2rem] transition-all",
              isChristmas ? "-rotate-90 scale-0" : "dark:-rotate-90 dark:scale-0"
            )}
          />
          <Moon
            className={cn(
              "absolute h-[1.2rem] w-[1.2rem] transition-all",
              isChristmas ? "rotate-90 scale-0" : "rotate-90 scale-0 dark:rotate-0 dark:scale-100"
            )}
          />
          <TreePine
            className={cn(
              "absolute h-[1.2rem] w-[1.2rem] text-emerald-300 transition-all",
              isChristmas ? "rotate-0 scale-100" : "rotate-90 scale-0"
            )}
          />
          <span className="sr-only">Alternar tema</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Claro
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Escuro
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          Sistema
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => setTheme("christmas")}
          className="gap-2 font-medium text-emerald-600 dark:text-emerald-400"
        >
          <TreePine className="h-4 w-4" />
          Natal 🎄
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
