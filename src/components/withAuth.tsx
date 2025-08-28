
"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';

const withAuth = <P extends object>(WrappedComponent: React.ComponentType<P>) => {
    const Wrapper = (props: P) => {
        const router = useRouter();
        const [user, setUser] = useState<User | null>(null);
        const [isAuthenticating, setIsAuthenticating] = useState(true);

        useEffect(() => {
            const unsubscribe = onAuthStateChanged(auth, (user) => {
                if (user) {
                    setUser(user);
                    setIsAuthenticating(false);
                } else {
                    router.replace('/login');
                }
            });

            // Cleanup subscription on unmount
            return () => unsubscribe();
        }, [router]);

        if (isAuthenticating) {
            return (
                <div className="flex justify-center items-center min-h-screen">
                    <div className="text-center flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-lg font-semibold">Verificando credenciais...</p>
                        <p className="text-muted-foreground">Por favor, aguarde.</p>
                    </div>
                </div>
            );
        }

        return <WrappedComponent {...props} />;
    };
    
    Wrapper.displayName = `withAuth(${(WrappedComponent.displayName || WrappedComponent.name || 'Component')})`;
    
    return Wrapper;
};

export default withAuth;
