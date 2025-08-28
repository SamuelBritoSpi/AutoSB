
"use client";

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getAllData } from '@/lib/idb';
import type { Demand, Vacation, Employee, MedicalCertificate } from '@/lib/types';
import GestaoFeriasPage from '@/components/GestaoFeriasPage';
import AppHeader from '@/components/AppHeader';
import { Loader2 } from 'lucide-react';

interface AppData {
  demands: Demand[];
  vacations: Vacation[];
  employees: Employee[];
  certificates: MedicalCertificate[];
}

export default function AuthProvider() {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<User | null>(null);
    const [data, setData] = useState<AppData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [authChecked, setAuthChecked] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setUser(user);
            setAuthChecked(true);

            if (user) {
                try {
                    const initialData = await getAllData();
                    setData(initialData);
                } catch (error) {
                    console.error("Failed to load data:", error);
                    // Handle data loading error, e.g., show a toast
                }
            }
            setIsLoading(false);
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

    const isAuthPage = pathname === '/login';
    if (isAuthPage) {
         // Let the login page render itself
        return null;
    }


    if (isLoading || !authChecked || !user || (!data && !isAuthPage)) {
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
    
    if (user && data && !isAuthPage) {
        return (
          <>
            <AppHeader />
            <div className="flex-grow container mx-auto p-4 md:p-6">
              <GestaoFeriasPage initialData={data} />
            </div>
          </>
        );
    }

    // This will render the children on auth pages like /login
    return null;
}
