import { Briefcase } from 'lucide-react';

export default function AppHeader() {
  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <Briefcase className="h-7 w-7 mr-2" />
          <h1 className="text-xl font-headline font-bold">AutoSB</h1>
        </div>
        <div className="flex items-center gap-1">
         {/* Botões de Importar/Exportar removidos */}
        </div>
      </div>
    </header>
  );
}
