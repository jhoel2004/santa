'use client';

import { useNeonShiftStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, CheckCircle, Clock, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';

export default function PaymentsPage() {
  const { hostesses, transactions, payments, addPayment, currentUser, logAudit } = useNeonShiftStore();
  const [searchTerm, setSearchTerm] = useState('');

  const calculatePending = (hostessId: string) => {
    const totalEarned = transactions
      .filter(t => t.hostessId === hostessId)
      .reduce((acc, t) => acc + t.commissionAmount, 0);
    
    const totalPaid = payments
      .filter(p => p.hostessId === hostessId)
      .reduce((acc, p) => acc + p.amount, 0);

    return Math.max(0, totalEarned - totalPaid);
  };

  const handlePay = (hostessId: string, amount: number) => {
    if (amount <= 0) return;
    
    addPayment({
      hostessId,
      amount,
      adminId: currentUser?.id || 'unknown'
    });

    const hostess = hostesses.find(h => h.id === hostessId);
    logAudit(currentUser?.id || 'system', `Procesado pago de Bs. ${amount} para: ${hostess?.name}`);
    
    toast({ title: "Pago procesado", description: `Se pagó exitosamente Bs. ${amount} a ${hostess?.name}.` });
  };

  const filtered = hostesses.filter(h => h.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight neon-text">Gestión de Pagos</h2>
          <p className="text-muted-foreground">Liquida comisiones pendientes y rastrea el historial de pagos.</p>
        </div>
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar chica..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 neon-border bg-card/40">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-amber-500" />
              Comisiones por Pagar
            </CardTitle>
            <CardDescription>Ver y liquidar saldos de todas las chicas.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Chica</TableHead>
                  <TableHead>Pendiente</TableHead>
                  <TableHead className="text-right">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(h => {
                  const pending = calculatePending(h.id);
                  return (
                    <TableRow key={h.id}>
                      <TableCell className="font-bold">{h.name}</TableCell>
                      <TableCell>
                        <span className={`text-lg font-bold ${pending > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
                          Bs. {pending.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          size="sm" 
                          disabled={pending <= 0}
                          onClick={() => handlePay(h.id, pending)}
                          className={pending > 0 ? 'neon-glow' : ''}
                        >
                          <DollarSign className="h-4 w-4 mr-1" />
                          Pagar Todo
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="neon-border bg-card/40 overflow-hidden">
          <CardHeader className="border-b border-border/50 bg-white/5">
            <CardTitle className="flex items-center text-emerald-500">
              <CheckCircle className="h-5 w-5 mr-2" />
              Liquidaciones Recientes
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/50 max-h-[500px] overflow-auto">
              {payments.length === 0 ? (
                <div className="p-10 text-center text-muted-foreground italic">No hay pagos registrados.</div>
              ) : (
                [...payments].reverse().slice(0, 20).map(p => {
                  const hostess = hostesses.find(h => h.id === p.hostessId);
                  return (
                    <div key={p.id} className="p-4 flex items-center justify-between hover:bg-white/5">
                      <div>
                        <p className="font-bold text-sm">{hostess?.name}</p>
                        <p className="text-[10px] text-muted-foreground uppercase">{new Date(p.timestamp).toLocaleString()}</p>
                      </div>
                      <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                        Bs. {p.amount}
                      </Badge>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
