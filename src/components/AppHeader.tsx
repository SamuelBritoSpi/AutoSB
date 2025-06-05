import { Briefcase, Upload, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AppHeaderProps {
  onExport: () => void;
  onImport: () => void;
}

export default function AppHeader({ onExport, onImport }: AppHeaderProps) {
  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Briefcase className="h-8 w-8 mr-3" />
          <h1 className="text-2xl font-headline font-bold">AutoSB</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onImport} className="bg-primary-foreground text-primary hover:bg-accent hover:text-accent-foreground">
            <Upload className="mr-2 h-4 w-4" /> Importar JSON
          </Button>
          <Button variant="outline" size="sm" onClick={onExport} className="bg-primary-foreground text-primary hover:bg-accent hover:text-accent-foreground">
            <Download className="mr-2 h-4 w-4" /> Exportar JSON
          </Button>
        </div>
      </div>
    </header>
  );
}
