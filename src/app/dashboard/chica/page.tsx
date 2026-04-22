'use client';

import { useNeonShiftStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Martini, Star, Calendar, ArrowUpRight } from 'lucide-react';

export default function ChicaDashboard() {
  const { transactions, currentUser, hostesses } = useNeonShiftStore();
  
  // In CHICA role, currentUser.id is the hostess id
  const myHostessId = currentUser?.id || '';
  const myData = hostesses.find(h => h.id === myHostessId);
  const myLogs = transactions
    .filter(t => t.hostessId === myHostessId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const today = new Date().toISOString().split('T')[0];
  const earningsToday = myLogs
    .filter(t => t.timestamp.startsWith(today))
    .reduce((acc, t) => acc + t.commissionAmount, 0);

  const earningsWeek = myLogs.reduce((acc, t) => acc + t.commissionAmount, 0); // Simplified for demo
  const consumptionCount = myLogs.length;

  const weeklyGoal = 1500;
  const progress = Math.min(100, (earningsWeek / weeklyGoal) * 100);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in zoom-in duration-500">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-3xl font-bold neon-text">¡Hola, {myData?.name || 'Chica'}!</h2>
          <p className="text-muted-foreground">Aquí tienes tu rendimiento para este turno.</p>
        </div>
        <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center border border-primary/50 neon-glow">
          <Star className="h-8 w-8 text-primary" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="neon-border bg-gradient-to-br from-primary/10 to-transparent">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase tracking-widest font-bold">Ganancias de esta Noche</CardDescription>
            <CardTitle className="text-4xl font-bold flex items-baseline">
              <span className="text-xl mr-1 opacity-60 font-medium">Bs.</span>
              {earningsToday.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-emerald-500 text-sm font-bold">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              ¡Sigue así!
            </div>
          </CardContent>
        </Card>

        <Card className="neon-border bg-card/40">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase tracking-widest font-bold">Progreso Semanal</CardDescription>
            <CardTitle className="text-xl font-bold">Bs. {earningsWeek.toLocaleString()} / {weeklyGoal}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground text-right">{progress.toFixed(0)}% de tu meta alcanzada</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-secondary/10 border border-secondary/30 rounded-xl flex items-center space-x-3">
          <Martini className="h-5 w-5 text-secondary" />
          <div>
            <p className="text-xs text-muted-foreground uppercase font-bold">Bebidas Registradas</p>
            <p className="text-lg font-bold">{consumptionCount}</p>
          </div>
        </div>
        <div className="p-4 bg-muted/20 border border-border/50 rounded-xl flex items-center space-x-3">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground uppercase font-bold">Turno Actual</p>
            <p className="text-lg font-bold">{new Date().toLocaleDateString()}</p>
          </div>
        </div>
        <div className="p-4 bg-primary/10 border border-primary/30 rounded-xl flex items-center space-x-3">
          <DollarSign className="h-5 w-5 text-primary" />
          <div>
            <p className="text-xs text-muted-foreground uppercase font-bold">Prom. Comis./Bebida</p>
            <p className="text-lg font-bold">Bs. {(earningsWeek / (consumptionCount || 1)).toFixed(2)}</p>
          </div>
        </div>
      </div>

      <Card className="neon-border bg-card/40 overflow-hidden">
        <CardHeader className="bg-muted/10 border-b border-border/50">
          <CardTitle className="text-lg">Historial Reciente</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border/50">
            {myLogs.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground italic">No se encontraron registros todavía.</div>
            ) : (
              myLogs.slice(0, 10).map((tx) => (
                <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                  <div>
                    <p className="font-bold text-sm">Bebida Registrada</p>
                    <p className="text-xs text-muted-foreground">{new Date(tx.timestamp).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-primary font-bold">Bs. {tx.commissionAmount}</p>
                    <Badge variant="outline" className="text-[10px] scale-90 origin-right">Cantidad: {tx.quantity.toFixed(1)}</Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
