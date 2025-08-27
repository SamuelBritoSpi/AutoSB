"use client";

import { Briefcase, Upload, Download } from 'lucide-react';
import { Button } from './ui/button';
import { ThemeToggle } from './ThemeToggle';

interface AppHeaderProps {
  onImport: () => void;
  onExport: () => void;
}


export default function AppHeader({ onImport, onExport }: AppHeaderProps) {
  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <Briefcase className="h-7 w-7 mr-2" />
          <h1 className="text-xl font-headline font-bold">AutoSB</h1>
        </div>
        <div className="flex items-center gap-2">
           <Button variant="secondary" size="sm" onClick={onImport}>
             <Upload className="mr-2 h-4 w-4" /> Importar
           </Button>
           <Button variant="secondary" size="sm" onClick={onExport}>
             <Download className="mr-2 h-4 w-4" /> Exportar
           </Button>
           <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
