
"use client";

import { Briefcase, Database, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { ThemeToggle } from './ThemeToggle';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export default function AppHeader() {
  const firebaseConsoleUrl = "https://console.firebase.google.com/project/gestofrias/storage/usage";
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({ title: 'Logout efetuado com sucesso!'});
      router.push('/login');
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao sair', description: 'Não foi possível fazer logout. Tente novamente.'});
    }
  };

  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <Briefcase className="h-7 w-7 mr-2" />
          <h1 className="text-xl font-headline font-bold">AutoSB</h1>
        </div>
        <div className="flex items-center gap-2">
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
           <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="secondary" size="icon" onClick={handleLogout}>
                    <LogOut className="h-5 w-5" />
                    <span className="sr-only">Sair</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Sair</p>
                </TooltipContent>
              </Tooltip>
           </TooltipProvider>
        </div>
      </div>
    </header>
  );
}
