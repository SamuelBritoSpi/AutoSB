
"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const withAuth = <P extends object>(WrappedComponent: React.ComponentType<P>) => {
    const Wrapper = (props: P) => {
        const router = useRouter();
        const [isAuthenticating, setIsAuthenticating] = useState(true);

        useEffect(() => {
            const isAuthenticated = localStorage.getItem('isAuthenticated');
            if (isAuthenticated !== 'true') {
                router.replace('/login');
            } else {
                setIsAuthenticating(false);
            }
        }, [router]);

        if (isAuthenticating) {
            return (
                <div className="flex justify-center items-center min-h-screen">
                    <div className="text-center">
                        <p className="text-lg font-semibold">Verificando credenciais...</p>
                        <p className="text-muted-foreground">Por favor, aguarde.</p>
                    </div>
                </div>
            );
        }

        return <WrappedComponent {...props} />;
    };
    return Wrapper;
};

export default withAuth;
