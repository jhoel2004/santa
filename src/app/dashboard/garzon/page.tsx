
'use client';

import { ConsumptionLogger } from '@/components/ConsumptionLogger';
import { useNeonShiftStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { History, TrendingUp, Clock, Play, Power, Moon, User, Martini, ArrowRightLeft } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function GarzonDashboard() {
  const { transactions, currentUser, currentShift, startShift, endShift, hostesses, products } = useNeonShiftStore();
  
  const myRecentLogs = transactions
    .filter(t => t.waiterId === currentUser?.id && (!currentShift || t.shiftId === currentShift.id))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10);

  const mySalesToday = transactions
    .filter(t => t.waiterId === currentUser?.id && currentShift && t.shiftId === currentShift.id)
    .reduce((acc, t) => acc + t.totalPrice, 0);

  const handleStartNight = () => {
    startShift(currentUser?.id || 'unknown');
    toast({ title: "Noche Iniciada", description: "El sistema ya está listo para registrar consumos." });
  };

  const handleEndNight = () => {
    endShift();
    toast({ title: "Noche Finalizada", description: "Se ha cerrado el turno y desactivado la asistencia de las chicas." });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Card className={`neon-border ${currentShift ? 'bg-primary/5' : 'bg-destructive/5'}`}>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-full ${currentShift ? 'bg-primary/20 text-primary' : 'bg-destructive/20 text-destructive'}`}>
                <Moon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold">{currentShift ? 'Noche en curso' : 'Sistema Cerrado'}</h3>
                <p className="text-sm text-muted-foreground">
                  {currentShift 
                    ? `Iniciada a las: ${new Date(currentShift.startTime).toLocaleTimeString()}` 
                    : 'Debes iniciar la noche para registrar ventas.'}
                </p>
              </div>
            </div>
            {!currentShift ? (
              <Button size="lg" onClick={handleStartNight} className="neon-glow bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8">
                <Play className="h-5 w-5 mr-2" />
                INICIAR NOCHE
              </Button>
            ) : (
              <Button size="lg" variant="destructive" onClick={handleEndNight} className="font-bold px-8">
                <Power className="h-5 w-5 mr-2" />
                FINALIZAR NOCHE
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {currentShift && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="neon-border bg-primary/5">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Ventas de esta Noche</CardTitle>
                <TrendingUp className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">Bs. {mySalesToday.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card className="neon-border bg-secondary/10">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Último Registro</CardTitle>
                <Clock className="h-4 w-4 text-secondary" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">
                  {myRecentLogs.length > 0 ? new Date(myRecentLogs[0].timestamp).toLocaleTimeString() : 'Sin actividad'}
                </div>
              </CardContent>
            </Card>
          </div>

          <ConsumptionLogger />

          <Card className="neon-border bg-card/40">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <History className="h-5 w-5 mr-2 text-primary" />
                Mis Registros Recientes
              </CardTitle>
              <CardDescription>Últimos 10 consumos registrados esta noche.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {myRecentLogs.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground italic">Aún no hay registros en esta noche.</p>
                ) : (
                  myRecentLogs.map((tx) => {
                    const hostess = hostesses.find(h => h.id === tx.hostessId);
                    const product = products.find(p => p.id === tx.productId);
                    const related = tx.relatedHostessId ? hostesses.find(h => h.id === tx.relatedHostessId) : null;
                    return (
                      <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/50 hover:bg-white/5 transition-colors">
                        <div className="flex flex-col flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-sm text-primary flex items-center">
                              <User className="h-3 w-3 mr-1 opacity-70" />
                              {hostess?.name || 'Desconocida'}
                            </span>
                            <span className="text-xs text-muted-foreground flex items-center">
                              <Martini className="h-3 w-3 mr-1 opacity-70" />
                              {product?.name || 'Producto'}
                            </span>
                            {related && (
                              <Badge variant="outline" className="text-[9px] h-4 py-0 border-secondary/50 text-secondary flex items-center bg-secondary/5">
                                <ArrowRightLeft className="h-2 w-2 mr-1" />
                                Compartido con {related.name}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-3 mt-1">
                            <Badge variant="secondary" className="text-[10px] h-4 px-1.5 bg-primary/20 text-primary border-primary/20">
                              x{tx.quantity.toFixed(1)}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {new Date(tx.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <div className="font-bold text-sm">Bs. {tx.totalPrice.toLocaleString()}</div>
                          <div className="text-[10px] text-secondary font-medium">Com: Bs. {tx.commissionAmount.toFixed(1)}</div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
