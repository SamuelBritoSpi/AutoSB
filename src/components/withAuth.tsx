
"use client";

import React, { useEffect, useState, ComponentType } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';
import { getAllData } from '@/lib/idb';
import { Demand, Vacation, Employee, MedicalCertificate } from '@/lib/types';


interface WithAuthProps {
    initialData: {
        demands: Demand[];
        vacations: Vacation[];
        employees: Employee[];
        certificates: MedicalCertificate[];
    };
}

const withAuth = <P extends object>(WrappedComponent: ComponentType<P & WithAuthProps>) => {
    const Wrapper = (props: P) => {
        const router = useRouter();
        const [user, setUser] = useState<User | null>(null);
        const [loading, setLoading] = useState(true);
        const [initialData, setInitialData] = useState<WithAuthProps['initialData'] | null>(null);
        const [isClient, setIsClient] = useState(false);
        
        useEffect(() => {
            setIsClient(true);
        }, []);

        useEffect(() => {
            if (!isClient) return;

            const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
                if (currentUser) {
                    setUser(currentUser);
                    try {
                        const data = await getAllData();
                        setInitialData(data);
                    } catch (error) {
                        console.error("Failed to load initial data", error);
                    } finally {
                        setLoading(false);
                    }
                } else {
                    router.replace('/login');
                }
            });

            return () => unsubscribe();
        }, [isClient, router]);

        if (!isClient || loading || !initialData) {
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
            return <WrappedComponent {...props} initialData={initialData} />;
        }

        return null;
    };

    Wrapper.displayName = `withAuth(${(WrappedComponent.displayName || WrappedComponent.name || 'Component')})`;

    return Wrapper;
};

export default withAuth;
