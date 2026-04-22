'use client';

import { useNeonShiftStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Martini, Calendar } from 'lucide-react';

export default function ChicaHistoryPage() {
  const { transactions, currentUser, products } = useNeonShiftStore();
  
  // En el rol de CHICA, currentUser.id es el id de la hostess
  const myHostessId = currentUser?.id || '';
  const myLogs = transactions
    .filter(t => t.hostessId === myHostessId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold neon-text">Mi Historial de Consumos</h2>
          <p className="text-muted-foreground">Listado detallado de todas tus ganancias por bebida.</p>
        </div>
        <Badge className="bg-primary/20 text-primary border-primary/30 px-3 py-1">
          <Calendar className="h-3 w-3 mr-2" />
          Turno Actual
        </Badge>
      </div>

      <Card className="neon-border bg-card/40">
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Martini className="h-5 w-5 mr-2 text-primary" />
            Detalle de Comisiones
          </CardTitle>
          <CardDescription>Cada fila representa un servicio registrado por un mesero.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha y Hora</TableHead>
                <TableHead>Producto</TableHead>
                <TableHead>Cantidad</TableHead>
                <TableHead className="text-right">Comisión Ganada</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {myLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10 text-muted-foreground italic">Aún no tienes consumos registrados en este turno.</TableCell>
                </TableRow>
              ) : (
                myLogs.map((tx) => {
                  const product = products.find(p => p.id === tx.productId);
                  return (
                    <TableRow key={tx.id} className="hover:bg-white/5">
                      <TableCell className="text-xs opacity-70">{new Date(tx.timestamp).toLocaleString()}</TableCell>
                      <TableCell className="font-medium">{product?.name || 'Producto Desconocido'}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-secondary/20">x {tx.quantity.toFixed(1)}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-bold text-emerald-400">
                        Bs. {tx.commissionAmount.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="p-4 bg-primary/5 rounded-lg border border-primary/20 text-center">
        <p className="text-sm text-muted-foreground">
          Total de comisiones acumuladas: <span className="text-primary font-bold text-lg ml-2">Bs. {myLogs.reduce((acc, t) => acc + t.commissionAmount, 0).toLocaleString()}</span>
        </p>
      </div>
    </div>
  );
}
