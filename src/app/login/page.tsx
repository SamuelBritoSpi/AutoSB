
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { Briefcase, LogIn, Loader2 } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { getAuthInstance } from '@/lib/firebase-client';


export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('samuel.brito@example.com');
  const [password, setPassword] = useState('Sam1421,');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    const auth = getAuthInstance();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: 'Login bem-sucedido!',
        description: 'Bem-vindo de volta!',
      });
      router.push('/');
    } catch (error: any) {
      let errorMessage = 'Ocorreu um erro desconhecido.';
      switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          errorMessage = 'Email ou senha inválidos. Por favor, tente novamente.';
          break;
        case 'auth/invalid-email':
           errorMessage = 'O formato do email é inválido.';
           break;
        default:
           errorMessage = 'Não foi possível fazer login. Verifique sua conexão ou tente mais tarde.';
      }
       toast({
        variant: 'destructive',
        title: 'Erro de Login',
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-sm shadow-2xl">
        <CardHeader className="text-center">
            <div className="flex justify-center items-center mb-4">
                 <Briefcase className="h-10 w-10 text-primary" />
            </div>
          <CardTitle className="text-2xl font-bold">AutoSB</CardTitle>
          <CardDescription>Bem-vindo! Por favor, faça login para continuar.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email"
              placeholder="Digite seu email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input 
              id="password" 
              type="password" 
              placeholder="Digite sua senha" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              disabled={isLoading}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleLogin} disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
            {isLoading ? 'Entrando...' : 'Entrar'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
