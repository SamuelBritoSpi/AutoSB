
"use client";

import React, { useEffect, useState, useContext, createContext } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { getAuthInstance, getMessagingObject } from '@/lib/firebase-client';
import { Loader2 } from 'lucide-react';
import { onMessage } from 'firebase/messaging';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
    user: Partial<User> | null;
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

    const [user, setUser] = useState<Partial<User> | null>(null);
    const [authChecked, setAuthChecked] = useState(false);
    
    // Foreground notification handler
    useEffect(() => {
      try {
        const messaging = getMessagingObject();
        if (typeof window !== 'undefined' && messaging) {
          const unsubscribe = onMessage(messaging, (payload) => {
            toast({
              title: payload.notification?.title || 'Nova Notificação',
              description: payload.notification?.body,
            });
          });
          return unsubscribe;
        }
      } catch (error) {
        // Silencioso
      }
    }, [toast]);
    
    useEffect(() => {
        const auth = getAuthInstance();
        
        // Verifica se existe um bypass ativo (sessão local de teste)
        const isBypass = sessionStorage.getItem('auth_bypass') === 'true';
        if (isBypass) {
            const bypassUser = JSON.parse(sessionStorage.getItem('auth_bypass_user') || 'null');
            if (bypassUser) {
                setUser(bypassUser);
                setAuthChecked(true);
                return;
            }
        }

        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
            } else if (!isBypass) {
                setUser(null);
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

    const isAuthPage = pathname === '/login';

    if (isAuthPage) {
        return <>{children}</>;
    }
    
    if (!authChecked) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-background">
                <div className="text-center flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-lg font-semibold">Verificando acesso...</p>
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

    return (
       <div className="flex justify-center items-center min-h-screen bg-background">
         <div className="text-center flex flex-col items-center gap-2">
           <Loader2 className="h-8 w-8 animate-spin text-primary" />
           <p className="text-lg font-semibold">Redirecionando...</p>
         </div>
       </div>
    );
}
