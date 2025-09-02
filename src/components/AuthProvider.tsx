
"use client";

import React, { useEffect, useState, type ReactNode, useContext, createContext } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { getAuthInstance, getMessagingObject } from '@/lib/firebase-client';
import { Loader2 } from 'lucide-react';
import { onMessage } from 'firebase/messaging';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
    user: User | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { toast } = useToast();

    const [user, setUser] = useState<User | null>(null);
    const [authChecked, setAuthChecked] = useState(false);
    
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

    // Determine what to render
    const isLoading = !authChecked;
    const isAuthPage = pathname === '/login';

    if (isAuthPage) {
        return <>{children}</>;
    }
    
    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-lg font-semibold">Verificando autenticação...</p>
                </div>
            </div>
        );
    }
    
    if (user) {
        return (
            <AuthContext.Provider value={{ user }}>
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
