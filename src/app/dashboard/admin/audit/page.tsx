'use client';

import { useNeonShiftStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { History, Shield, Info } from 'lucide-react';

export default function AuditPage() {
  const { auditLogs, users } = useNeonShiftStore();

  const sortedLogs = [...auditLogs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight neon-text">Registros de Auditoría</h2>
          <p className="text-muted-foreground">Rastrea toda la actividad administrativa y de registro en el sistema.</p>
        </div>
        <Shield className="h-10 w-10 text-primary opacity-50" />
      </div>

      <Card className="neon-border bg-card/40 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="flex items-center">
            <History className="h-5 w-5 mr-2 text-primary" />
            Historial de Actividad del Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha y Hora</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Acción</TableHead>
                <TableHead className="text-right">Nivel</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10 text-muted-foreground italic">No hay registros guardados aún.</TableCell>
                </TableRow>
              ) : (
                sortedLogs.map((log) => {
                  const user = users.find(u => u.id === log.userId);
                  return (
                    <TableRow key={log.id} className="hover:bg-white/5 transition-colors">
                      <TableCell className="font-mono text-xs">{new Date(log.timestamp).toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold">{user?.username || 'Desconocido'}</span>
                          <span className="text-[10px] uppercase text-muted-foreground">{user?.role}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm opacity-90">{log.action}</TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex items-center px-2 py-1 rounded bg-blue-500/10 text-blue-400 text-[10px] font-bold">
                          <Info className="h-3 w-3 mr-1" />
                          INFO
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
