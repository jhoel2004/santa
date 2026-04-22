'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn, UserCircle, Briefcase } from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/Logo';

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8 animate-in fade-in slide-in-from-top duration-1000">
        <div className="flex flex-col items-center justify-center mb-6">
          <Logo className="w-56 h-56 mb-2" />
          <h1 className="text-7xl font-extrabold tracking-tighter neon-comet" data-text="Santa Night Club">
            Santa Night Club
          </h1>
        </div>
        <p className="text-muted-foreground text-xl max-w-md mx-auto font-medium">
          Sistema de Gestión Inteligente. Precisión y control en cada detalle de la noche.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
        <Card className="neon-border bg-card/50 backdrop-blur-md hover:scale-105 transition-transform cursor-pointer group">
          <Link href="/login?role=admin">
            <CardHeader>
              <Briefcase className="h-8 w-8 text-secondary mb-2 group-hover:rotate-12 transition-transform" />
              <CardTitle>Administración</CardTitle>
              <CardDescription>Control total del sistema, finanzas y analíticas profundas.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full border-secondary text-secondary hover:bg-secondary/10">Ingreso Admin</Button>
            </CardContent>
          </Link>
        </Card>

        <Card className="neon-border bg-card/50 backdrop-blur-md hover:scale-105 transition-transform cursor-pointer group">
          <Link href="/login?role=garzon">
            <CardHeader>
              <LogIn className="h-8 w-8 text-primary mb-2 group-hover:rotate-12 transition-transform" />
              <CardTitle>Mesero</CardTitle>
              <CardDescription>Registro rápido de consumos y gestión de asistencia del personal.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary/10">Ingreso Mesero</Button>
            </CardContent>
          </Link>
        </Card>

        <Card className="neon-border bg-card/50 backdrop-blur-md hover:scale-105 transition-transform cursor-pointer group">
          <Link href="/login?role=chica">
            <CardHeader>
              <UserCircle className="h-8 w-8 text-accent mb-2 group-hover:rotate-12 transition-transform" />
              <CardTitle>Chica / Hostess</CardTitle>
              <CardDescription>Panel de ganancias personales y seguimiento de rendimiento.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full border-accent text-accent hover:bg-accent/10">Ingreso Chica</Button>
            </CardContent>
          </Link>
        </Card>
      </div>

      <footer className="mt-20 text-muted-foreground text-sm opacity-50">
        &copy; {new Date().getFullYear()} Santa Night Club. Diseñado para brillar en la oscuridad.
      </footer>
    </div>
  );
}