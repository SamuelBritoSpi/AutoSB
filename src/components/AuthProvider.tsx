
"use client";

import React, { useEffect, useState, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';

interface AuthProviderProps {
    children: ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<User | null>(null);
    const [authChecked, setAuthChecked] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
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

    const isAuthPage = pathname === '/login';

    // While checking auth, show a loader unless it's the login page itself
    if (!authChecked) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-lg font-semibold">Verificando credenciais...</p>
                </div>
            </div>
        );
    }
    
    // If it's the login page, or the user is authenticated, render the children
    if (isAuthPage || user) {
        return <>{children}</>;
    }

    // If no user and not on login page (and auth is checked),
    // show loader while redirecting
    return (
       <div className="flex justify-center items-center min-h-screen">
         <div className="text-center flex flex-col items-center gap-2">
           <Loader2 className="h-8 w-8 animate-spin text-primary" />
           <p className="text-lg font-semibold">Redirecionando...</p>
         </div>
       </div>
    );
}
