
"use client";

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Download, Share } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { useToast } from '@/hooks/use-toast';

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
  const [isIOS, setIsIOS] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Detecta iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Detecta se já está instalado
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                        (window.navigator as any).standalone === true;

    console.log('PWA Debug:', {
      isIOSDevice,
      isStandalone,
      userAgent: navigator.userAgent,
      protocol: window.location.protocol
    });

    // Sempre mostra o botão se não estiver instalado
    if (!isStandalone) {
      setIsInstallable(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('beforeinstallprompt event fired!', e);
      // Previne o Chrome 67 e anteriores de mostrar o prompt automaticamente
      e.preventDefault();
      // Guarda o evento para que ele possa ser acionado mais tarde.
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    // Adiciona listener para o evento
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Verifica se o evento já foi disparado (caso raro)
    if ((window as any).deferredPrompt) {
      setDeferredPrompt((window as any).deferredPrompt);
    }

    // Timeout para forçar disponibilidade após alguns segundos (para debug)
    const timer = setTimeout(() => {
      if (!deferredPrompt && !isStandalone && !isIOSDevice) {
        console.log('Forcing installable state for debug');
        setIsInstallable(true);
      }
    }, 3000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      clearTimeout(timer);
    };
  }, [deferredPrompt]);

  const handleInstallClick = async () => {
    console.log('Install button clicked', { isIOS, deferredPrompt: !!deferredPrompt });
    
    if (isIOS) {
      // Para iOS, mostra instruções
      toast({
        title: "Instalar no iOS",
        description: "Toque no ícone de compartilhar e selecione 'Adicionar à Tela de Início'",
        duration: 5000,
      });
      return;
    }

    if (deferredPrompt) {
      try {
        console.log('Showing install prompt...');
        // Mostra o prompt de instalação
        await deferredPrompt.prompt();
        // Espera o usuário responder ao prompt
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);
        
        if (outcome === 'accepted') {
          toast({
            title: "App Instalado!",
            description: "O AutoSB foi adicionado à sua área de trabalho",
          });
        }
        
        // O prompt só pode ser usado uma vez, então limpamos o estado.
        setDeferredPrompt(null);
        setIsInstallable(false);
      } catch (error) {
        console.error('Error showing install prompt:', error);
        toast({
          title: "Erro na Instalação",
          description: "Tente usar o menu do navegador para instalar o app",
          variant: "destructive"
        });
      }
    } else {
      // Instruções específicas por navegador
      const isChrome = /Chrome/.test(navigator.userAgent);
      const isEdge = /Edg/.test(navigator.userAgent);
      
      let instructions = "Use o menu do seu navegador para adicionar este site à tela inicial";
      
      if (isChrome) {
        instructions = "Chrome: Menu (⋮) → Instalar AutoSB ou Adicionar à tela inicial";
      } else if (isEdge) {
        instructions = "Edge: Menu (⋯) → Aplicativos → Instalar este site como um aplicativo";
      }
      
      toast({
        title: "Instalar App",
        description: instructions,
        duration: 6000,
      });
    }
  };

  if (!isInstallable) {
    return null;
  }

  return (
    <TooltipProvider>
        <Tooltip>
            <TooltipTrigger asChild>
                <Button variant="secondary" size="icon" onClick={handleInstallClick}>
                    {isIOS ? <Share className="h-5 w-5" /> : <Download className="h-5 w-5" />}
                    <span className="sr-only">Instalar App</span>
                </Button>
            </TooltipTrigger>
            <TooltipContent>
                <p>{isIOS ? "Adicionar à Tela Inicial" : "Instalar App"}</p>
            </TooltipContent>
        </Tooltip>
    </TooltipProvider>
  );
}
