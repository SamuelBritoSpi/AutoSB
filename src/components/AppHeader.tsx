import { Briefcase, Upload, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AppHeaderProps {
  onExport: () => void;
  onImport: () => void;
}

export default function AppHeader({ onExport, onImport }: AppHeaderProps) {
  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <Briefcase className="h-7 w-7 mr-2" />
          <h1 className="text-xl font-headline font-bold">AutoSB</h1>
        </div>
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onImport} 
            className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
          >
            <Upload className="mr-2 h-4 w-4" /> Importar
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onExport} 
            className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
          >
            <Download className="mr-2 h-4 w-4" /> Exportar
          </Button>
        </div>
      </div>
    </header>
  );
}
