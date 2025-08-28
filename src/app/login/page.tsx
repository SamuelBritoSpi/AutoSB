
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { Briefcase, LogIn } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [login, setLogin] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    // ATENÇÃO: Autenticação hardcoded apenas para fins de desenvolvimento.
    // Substituir por um sistema de autenticação real (ex: Firebase Auth).
    if (login === 'Samuel Brito' && senha === 'Sam1421,') {
      localStorage.setItem('isAuthenticated', 'true');
      toast({
        title: 'Login bem-sucedido!',
        description: 'Bem-vindo de volta, Samuel!',
      });
      router.push('/');
    } else {
      setError('Login ou senha inválidos.');
       toast({
        variant: 'destructive',
        title: 'Erro de Login',
        description: 'Login ou senha inválidos. Por favor, tente novamente.',
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-sm shadow-2xl">
        <CardHeader className="text-center">
            <div className="flex justify-center items-center mb-4">
                 <Briefcase className="h-10 w-10 mr-2 text-primary" />
            </div>
          <CardTitle className="text-2xl font-bold">AutoSB</CardTitle>
          <CardDescription>Bem-vindo! Por favor, faça login para continuar.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="login">Login</Label>
            <Input 
              id="login" 
              placeholder="Digite seu login" 
              value={login}
              onChange={(e) => setLogin(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="senha">Senha</Label>
            <Input 
              id="senha" 
              type="password" 
              placeholder="Digite sua senha" 
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleLogin}>
            <LogIn className="mr-2 h-4 w-4" /> Entrar
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
