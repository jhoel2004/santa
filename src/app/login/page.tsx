'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useNeonShiftStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Key, Lock, User } from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/Logo';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get('role') || 'garzon';
  const login = useNeonShiftStore(state => state.login);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = role === 'chica' ? login(code) : login(username, password);
      
      if (user) {
        toast({ title: "¡Bienvenido de nuevo!", description: `Iniciaste sesión como ${user.username}` });
        router.push(`/dashboard/${user.role.toLowerCase()}`);
      } else {
        toast({ 
          variant: "destructive", 
          title: "Error de ingreso", 
          description: "Credenciales inválidas. Por favor intenta de nuevo." 
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const getRoleLabel = (r: string) => {
    if (r === 'admin') return 'Administrador';
    if (r === 'garzon') return 'Mesero';
    return 'Chica';
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md neon-border bg-card/60 backdrop-blur-xl">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between mb-4">
            <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <Logo className="w-16 h-16" />
          </div>
          <CardTitle className="text-3xl font-bold neon-text capitalize">Ingreso {getRoleLabel(role)}</CardTitle>
          <CardDescription>
            {role === 'chica' ? 'Ingresa tu código de 4 dígitos para acceder' : 'Ingresa tus credenciales para acceder al sistema'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {role === 'chica' ? (
              <div className="space-y-2">
                <Label htmlFor="code">Código de Acceso</Label>
                <div className="relative">
                  <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="code" 
                    type="password" 
                    placeholder="Código de 4 dígitos" 
                    maxLength={4}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="pl-10 text-center text-2xl tracking-[0.5em]"
                    required
                  />
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="username">Usuario</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="username" 
                      placeholder="Nombre de usuario" 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="password" 
                      type="password" 
                      placeholder="Tu contraseña" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </>
            )}
            <Button className="w-full neon-glow font-bold text-lg h-12" type="submit" disabled={loading}>
              {loading ? 'Verificando...' : 'Acceder al Panel'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando...</div>}>
      <LoginForm />
    </Suspense>
  );
}