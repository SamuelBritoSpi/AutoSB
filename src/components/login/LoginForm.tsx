'use client';

import { useState } from 'react';
import { getAuthInstance } from '@/lib/firebase-client';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const auth = getAuthInstance();
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/'); // Redireciona para a página inicial após o login
    } catch (error: any) {
      console.error('Erro no login:', error);
      setError('Email ou senha incorretos');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <Input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <Button type="submit" className="w-full">
          Entrar
        </Button>
      </form>
    </div>
  );
}
