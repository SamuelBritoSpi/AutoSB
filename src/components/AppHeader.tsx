
"use client";

import { Briefcase, Database, Upload, Download } from 'lucide-react';
import { Button } from './ui/button';
import { ThemeToggle } from './ThemeToggle';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface AppHeaderProps {
  onImport: () => void;
  onExport: () => void;
}


export default function AppHeader({ onImport, onExport }: AppHeaderProps) {
  const firebaseConsoleUrl = "https://console.firebase.google.com/project/gestofrias/storage/usage";

  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <Briefcase className="h-7 w-7 mr-2" />
          <h1 className="text-xl font-headline font-bold">AutoSB</h1>
        </div>
        <div className="flex items-center gap-2">
           {/* 
            Os botões de Importar/Exportar foram removidos pois com o Firebase,
            os dados são salvos na nuvem automaticamente. A funcionalidade
            de importação ainda existe no código para uma possível migração
            inicial de um backup JSON.
           */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <a href={firebaseConsoleUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="secondary" size="icon">
                      <Database className="h-5 w-5" />
                      <span className="sr-only">Monitorar Armazenamento</span>
                    </Button>
                  </a>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Monitorar Armazenamento</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
           <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
