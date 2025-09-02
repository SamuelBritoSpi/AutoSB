
"use client";

import React, { useEffect, useState, type ReactNode, useContext, createContext } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { getAuthInstance, getMessagingObject } from '@/lib/firebase-client';
import { Loader2 } from 'lucide-react';
import { getAllData } from '@/lib/idb';
import type { Demand, Vacation, Employee, MedicalCertificate, DemandStatus } from '@/lib/types';
import { onMessage } from 'firebase/messaging';
import { useToast } from '@/hooks/use-toast';
import { ThemeProvider } from '@/components/ThemeProvider';

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

function AuthProvider({ children }: { children: React.ReactNode }) {
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
                    setDemandStatuses(initialData.demandStatuses);
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
                demandStatuses, setDemandStatuses
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


export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      <AuthProvider>
        {children}
      </AuthProvider>
    </ThemeProvider>
  );
}
