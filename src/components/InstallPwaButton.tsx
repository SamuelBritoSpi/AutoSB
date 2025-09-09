
"use client";

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Download } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

// Define a interface para o evento, pois o TypeScript pode não conhecê-la por padrão.
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function InstallPwaButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Previne o Chrome 67 e anteriores de mostrar o prompt automaticamente
      e.preventDefault();
      // Guarda o evento para que ele possa ser acionado mais tarde.
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Mostra o prompt de instalação
      deferredPrompt.prompt();
      // Espera o usuário responder ao prompt
      const { outcome } = await deferredPrompt.userChoice;
      // Opcional: Acompanhar o resultado da instalação
      console.log(`User response to the install prompt: ${outcome}`);
      // O prompt só pode ser usado uma vez, então limpamos o estado.
      setDeferredPrompt(null);
    }
  };

  if (!deferredPrompt) {
    return null;
  }

  return (
    <TooltipProvider>
        <Tooltip>
            <TooltipTrigger asChild>
                <Button variant="secondary" size="icon" onClick={handleInstallClick}>
                    <Download className="h-5 w-5" />
                    <span className="sr-only">Instalar App</span>
                </Button>
            </TooltipTrigger>
            <TooltipContent>
                <p>Instalar App</p>
            </TooltipContent>
        </Tooltip>
    </TooltipProvider>
  );
}
