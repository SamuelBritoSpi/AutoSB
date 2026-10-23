"use client";

import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/components/AuthProvider";
import { ChristmasEffects } from "@/components/christmas/ChristmasEffects";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      themes={["light", "dark", "christmas"]}
      disableTransitionOnChange
    >
      <AuthProvider>
        {children}
      </AuthProvider>
      <ChristmasEffects />
    </ThemeProvider>
  );
}
