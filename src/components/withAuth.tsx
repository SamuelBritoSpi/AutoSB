
"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';
import { getAllData } from '@/lib/idb';
import type { Demand, Vacation, Employee, MedicalCertificate } from '@/lib/types';


type AllData = {
    demands: Demand[];
    vacations: Vacation[];
    employees: Employee[];
    certificates: MedicalCertificate[];
}

const withAuth = <P extends object>(WrappedComponent: React.ComponentType<P>) => {
    const Wrapper = (props: P) => {
        const router = useRouter();
        const [user, setUser] = useState<User | null>(null);
        const [data, setData] = useState<AllData | null>(null);
        const [isLoading, setIsLoading] = useState(true);
        const [isClient, setIsClient] = useState(false);

        useEffect(() => {
          setIsClient(true);
        }, []);

        useEffect(() => {
            if (!isClient) return;

            const unsubscribe = onAuthStateChanged(auth, (user) => {
                if (user) {
                    setUser(user);
                    // User is authenticated, now load data
                    getAllData()
                        .then(initialData => {
                            setData(initialData);
                            setIsLoading(false);
                        })
                        .catch(error => {
                            console.error("Failed to load initial data", error);
                            // Handle data loading error, maybe show a toast
                            setIsLoading(false); // Stop loading even on error
                        });
                } else {
                    router.replace('/login');
                }
            });

            // Cleanup subscription on unmount
            return () => unsubscribe();
        }, [router, isClient]);

        if (!isClient || isLoading || !data) {
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
        
        const enhancedProps = { ...props, initialData: data };

        return <WrappedComponent {...enhancedProps as P} />;
    };
    
    Wrapper.displayName = `withAuth(${(WrappedComponent.displayName || WrappedComponent.name || 'Component')})`;
    
    return Wrapper;
};

export default withAuth;
