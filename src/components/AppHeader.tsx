
"use client";

import { Briefcase, Database, LogOut, Bell } from 'lucide-react';
import { Button } from './ui/button';
import { ThemeToggle } from './ThemeToggle';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { auth, messaging, VAPID_KEY } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { getToken } from 'firebase/messaging';
import { useAuth } from './AuthProvider';
import { updateEmployee } from '@/lib/idb';

export default function AppHeader() {
  const firebaseConsoleUrl = "https://console.firebase.google.com/project/gestofrias/storage/usage";
  const router = useRouter();
  const { toast } = useToast();
  const { user, employees, setEmployees } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({ title: 'Logout efetuado com sucesso!'});
      router.push('/login');
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao sair', description: 'Não foi possível fazer logout. Tente novamente.'});
    }
  };

  const handleEnableNotifications = async () => {
    if (!messaging || !user) {
        toast({ variant: 'destructive', title: 'Erro', description: 'Serviço de mensagens não está disponível ou usuário não logado.' });
        return;
    }

    try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            const currentToken = await getToken(messaging, { vapidKey: VAPID_KEY });
            if (currentToken) {
                // For this example, we'll associate the token with the first employee
                // In a real app, you'd have a more sophisticated user/employee mapping
                const firstEmployee = employees?.[0];
                if (firstEmployee) {
                  const updatedTokens = Array.from(new Set([...(firstEmployee.fcmTokens || []), currentToken]));
                  
                  if (JSON.stringify(updatedTokens) !== JSON.stringify(firstEmployee.fcmTokens)) {
                    const updatedEmployee = { ...firstEmployee, fcmTokens: updatedTokens };
                    
                    await updateEmployee(updatedEmployee);

                    // Update local state
                    if (setEmployees) {
                      setEmployees(prev => prev.map(e => e.id === updatedEmployee.id ? updatedEmployee : e));
                    }
                    
                    toast({ title: 'Notificações Ativadas!', description: 'Você receberá atualizações importantes.' });
                  } else {
                     toast({ title: 'Notificações Já Ativas', description: 'Este dispositivo já está configurado para receber notificações.' });
                  }

                } else {
                   toast({ variant: 'destructive', title: 'Nenhum Funcionário Encontrado', description: 'Não foi possível associar o dispositivo a um funcionário.' });
                }
            } else {
                toast({ variant: 'destructive', title: 'Falha ao obter token', description: 'Não foi possível configurar as notificações. Tente novamente.' });
            }
        } else {
            toast({ variant: 'destructive', title: 'Permissão Negada', description: 'Você precisa permitir notificações para usar este recurso.' });
        }
    } catch (error) {
        console.error('An error occurred while enabling notifications. ', error);
        toast({ variant: 'destructive', title: 'Erro de Notificação', description: 'Ocorreu um erro inesperado.' });
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
                   <Button variant="secondary" size="icon" onClick={handleEnableNotifications}>
                      <Bell className="h-5 w-5" />
                      <span className="sr-only">Ativar Notificações</span>
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Ativar Notificações</p>
                </TooltipContent>
              </Tooltip>
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
