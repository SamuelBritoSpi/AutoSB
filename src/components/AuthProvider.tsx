
"use client";

import React, { useEffect, useState, type ReactNode, useContext, createContext } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { getAuthInstance, getMessagingObject } from '@/lib/firebase-client';
import { Loader2 } from 'lucide-react';
import { getAllData, addDemandStatus, deleteDemandStatus as deleteDbDemandStatus, updateDemand as updateDbDemand } from '@/lib/idb';
import type { Demand, Vacation, Employee, MedicalCertificate, DemandStatus } from '@/lib/types';
import { onMessage } from 'firebase/messaging';
import { useToast } from '@/hooks/use-toast';

interface AppData {
  demands: Demand[];
  vacations: Vacation[];
  employees: Employee[];
  certificates: MedicalCertificate[];
  demandStatuses: DemandStatus[];
}

interface AuthContextType extends AppData {
    user: User | null;
    setDemands: React.Dispatch<React.SetStateAction<Demand[]>>;
    setVacations: React.Dispatch<React.SetStateAction<Vacation[]>>;
    setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
    setCertificates: React.Dispatch<React.SetStateAction<MedicalCertificate[]>>;
    setDemandStatuses: React.Dispatch<React.SetStateAction<DemandStatus[]>>;
    addGlobalDemandStatus: (label: string, icon: string, color: string) => Promise<void>;
    deleteGlobalDemandStatus: (id: string, demands: Demand[]) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// Define the fixed statuses that should always exist.
const FIXED_STATUSES = {
  "Aberto": { order: 0, icon: "Inbox", color: "bg-blue-500" },
  "Aguardando Resposta": { order: 1, icon: "MailQuestion", color: "bg-yellow-500" },
  "Finalizado": { order: 99, icon: "CheckCircle2", color: "bg-green-500" },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { toast } = useToast();

    const [user, setUser] = useState<User | null>(null);
    const [authChecked, setAuthChecked] = useState(false);
    const [dataLoaded, setDataLoaded] = useState(false);
    
    // Data states
    const [demands, setDemands] = useState<Demand[]>([]);
    const [vacations, setVacations] = useState<Vacation[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [certificates, setCertificates] = useState<MedicalCertificate[]>([]);
    const [demandStatuses, setDemandStatuses] = useState<DemandStatus[]>([]);


    // Foreground notification handler
    useEffect(() => {
      try {
        const messaging = getMessagingObject();
        if (typeof window !== 'undefined' && messaging) {
          const unsubscribe = onMessage(messaging, (payload) => {
            console.log('Foreground message received. ', payload);
            toast({
              title: payload.notification?.title,
              description: payload.notification?.body,
            });
          });
          return unsubscribe;
        }
      } catch (error) {
        console.warn('Firebase messaging not available:', error);
      }
    }, [toast]);
    
    useEffect(() => {
        const auth = getAuthInstance();
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                try {
                    const initialData = await getAllData();
                    setDemands(initialData.demands);
                    setVacations(initialData.vacations);
                    setEmployees(initialData.employees);
                    setCertificates(initialData.certificates);

                    // Ensure fixed statuses exist
                    const existingLabels = new Set(initialData.demandStatuses.map(s => s.label));
                    let statuses = [...initialData.demandStatuses];
                    let needsUpdate = false;

                    for (const [label, props] of Object.entries(FIXED_STATUSES)) {
                        if (!existingLabels.has(label)) {
                            needsUpdate = true;
                            const newStatusData = { label, ...props };
                            const savedStatus = await addDemandStatus(newStatusData);
                            statuses.push(savedStatus);
                        }
                    }

                    if (needsUpdate) {
                       statuses.sort((a, b) => a.order - b.order);
                    }
                    
                    setDemandStatuses(statuses);
                    setDataLoaded(true);

                } catch (error) {
                    console.error("Failed to load data:", error);
                }
            } else {
                setDataLoaded(true); // No user, no data to load
            }
            setAuthChecked(true);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!authChecked) return;

        const isAuthPage = pathname === '/login';

        if (!user && !isAuthPage) {
            router.replace('/login');
        } else if (user && isAuthPage) {
            router.replace('/');
        }
    }, [user, authChecked, pathname, router]);

    const addGlobalDemandStatus = async (label: string, icon: string, color: string) => {
      const newOrder = demandStatuses.length > 0 ? Math.max(...demandStatuses.filter(s => s.label !== 'Finalizado').map(s => s.order)) + 1 : 0;
      const tempId = `temp-status-${Date.now()}`;
      const newStatusData = { label, icon, color, order: newOrder };
      
      const optimisticStatus: DemandStatus = { ...newStatusData, id: tempId };
      setDemandStatuses(prev => [...prev, optimisticStatus].sort((a, b) => a.order - b.order));

      try {
        const savedStatus = await addDemandStatus(newStatusData);
        setDemandStatuses(prev => prev.map(s => s.id === tempId ? savedStatus : s).sort((a,b) => a.order - b.order));
        toast({ title: "Status Adicionado", description: `"${label}" foi adicionado com sucesso.` });
      } catch (error) {
        toast({ variant: 'destructive', title: "Erro", description: "Não foi possível adicionar o status." });
        setDemandStatuses(prev => prev.filter(s => s.id !== tempId));
      }
    };

    const deleteGlobalDemandStatus = async (id: string, demands: Demand[]) => {
      const statusToDelete = demandStatuses.find(s => s.id === id);
      if (!statusToDelete) return;
      
      if (demandStatuses.length <= 1) {
        toast({ variant: 'destructive', title: "Ação não permitida", description: "Deve haver pelo menos um status." });
        return;
      }
      
      const originalStatuses = [...demandStatuses];
      const demandsToUpdate = demands.filter(d => d.status === statusToDelete.label);
      const newStatusLabel = demandStatuses.filter(s => s.id !== id)[0]?.label || 'Aberto';

      setDemandStatuses(prev => prev.filter(s => s.id !== id));
      if (demandsToUpdate.length > 0) {
        setDemands(prev => prev.map(d => d.status === statusToDelete.label ? { ...d, status: newStatusLabel } : d));
      }
      
      try {
        if (demandsToUpdate.length > 0) {
          const updatePromises = demandsToUpdate.map(d => updateDbDemand({ ...d, status: newStatusLabel }));
          await Promise.all(updatePromises);
        }
        await deleteDbDemandStatus(id);
        toast({ title: "Status Removido", description: `"${statusToDelete.label}" foi removido.`});
      } catch (error) {
        toast({ variant: 'destructive', title: "Erro de Sincronização", description: 'Não foi possível remover o status.' });
        setDemandStatuses(originalStatuses);
        // Revert demand statuses if needed
         if (demandsToUpdate.length > 0) {
           setDemands(prev => prev.map(d => {
              const originalDemand = demandsToUpdate.find(upd => upd.id === d.id);
              return originalDemand ? { ...d, status: originalDemand.status } : d;
           }));
         }
      }
    };


    // Determine what to render
    const isLoading = !authChecked || !dataLoaded;
    const isAuthPage = pathname === '/login';

    if (isAuthPage) {
        return <>{children}</>;
    }
    
    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-lg font-semibold">Carregando dados...</p>
                    <p className="text-muted-foreground">Por favor, aguarde.</p>
                </div>
            </div>
        );
    }
    
    if (user) {
        return (
            <AuthContext.Provider value={{
                user,
                demands, setDemands,
                vacations, setVacations,
                employees, setEmployees,
                certificates, setCertificates,
                demandStatuses, setDemandStatuses,
                addGlobalDemandStatus,
                deleteGlobalDemandStatus,
            }}>
                {children}
            </AuthContext.Provider>
        );
    }

    // This case handles the brief moment of redirection if not on /login
    return (
       <div className="flex justify-center items-center min-h-screen">
         <div className="text-center flex flex-col items-center gap-2">
           <Loader2 className="h-8 w-8 animate-spin text-primary" />
           <p className="text-lg font-semibold">Redirecionando...</p>
         </div>
       </div>
    );
}

    

    