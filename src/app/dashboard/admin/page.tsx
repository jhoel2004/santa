'use client';

import { useState, useMemo, Fragment } from 'react';
import { useNeonShiftStore, Transaction } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { DollarSign, TrendingUp, Users, Moon, Calendar as CalendarIcon, Filter, User, Search, ArrowRight, ArrowRightLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const chartConfig = {
  value: {
    label: "Ingresos",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export default function AdminDashboard() {
  const { transactions, hostesses, products, shifts } = useNeonShiftStore();
  
  const [filterDate, setFilterDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedHostess, setSelectedHostess] = useState<string>('all');
  const [expandedServices, setExpandedServices] = useState<Record<string, boolean>>({});

  const toggleService = (serviceId: string) => {
    setExpandedServices(prev => ({ ...prev, [serviceId]: !prev[serviceId] }));
  };

  const filteredData = useMemo(() => {
    return transactions.filter(t => {
      const txDate = new Date(t.timestamp).toISOString().split('T')[0];
      const matchesDate = !filterDate || txDate === filterDate;
      const matchesHostess = selectedHostess === 'all' || t.hostessId === selectedHostess || t.relatedHostessId === selectedHostess;
      return matchesDate && matchesHostess;
    });
  }, [transactions, filterDate, selectedHostess]);

  const groupedServices = useMemo(() => {
    const groups: Record<string, Transaction[]> = {};
    filteredData.forEach(t => {
      if (!groups[t.serviceId]) groups[t.serviceId] = [];
      groups[t.serviceId].push(t);
    });
    return Object.values(groups).sort((a, b) => new Date(b[0].timestamp).getTime() - new Date(a[0].timestamp).getTime());
  }, [filteredData]);

  const stats = useMemo(() => {
    const revenue = filteredData.reduce((acc, t) => acc + t.totalPrice, 0);
    const commissions = filteredData.reduce((acc, t) => acc + t.commissionAmount, 0);
    return {
      revenue,
      commissions,
      utility: revenue - commissions,
      count: filteredData.length
    };
  }, [filteredData]);

  const hostessRanking = useMemo(() => {
    const map = new Map();
    filteredData.forEach(t => {
      const hostess = hostesses.find(h => h.id === t.hostessId);
      const name = hostess?.name || 'Desconocida';
      map.set(name, (map.get(name) || 0) + t.totalPrice);
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [filteredData, hostesses]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <Card className="neon-border bg-card/60 backdrop-blur-md sticky top-20 z-30">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 space-y-2">
              <label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center">
                <CalendarIcon className="h-3 w-3 mr-1" /> Seleccionar Fecha
              </label>
              <Input 
                type="date" 
                value={filterDate} 
                onChange={(e) => setFilterDate(e.target.value)}
                className="bg-background/40"
              />
            </div>
            <div className="flex-1 space-y-2">
              <label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center">
                <User className="h-3 w-3 mr-1" /> Filtrar por Chica
              </label>
              <Select value={selectedHostess} onValueChange={setSelectedHostess}>
                <SelectTrigger className="bg-background/40">
                  <SelectValue placeholder="Todas las chicas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las chicas</SelectItem>
                  {hostesses.map(h => (
                    <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Badge variant="outline" className="h-10 px-4 border-primary/30 bg-primary/5 text-primary">
              <Filter className="h-3 w-3 mr-2" />
              {filteredData.length} registros encontrados
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="neon-border bg-gradient-to-br from-primary/10 to-transparent border-primary/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Venta Bruta (Filtro)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold neon-text">Bs. {stats.revenue.toLocaleString()}</div>
            <p className="text-[10px] text-muted-foreground mt-1">Total recaudado en el periodo</p>
          </CardContent>
        </Card>
        <Card className="neon-border bg-gradient-to-br from-secondary/10 to-transparent border-secondary/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Comisiones Generadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-secondary">Bs. {stats.commissions.toLocaleString()}</div>
            <p className="text-[10px] text-muted-foreground mt-1">Monto a liquidar a las chicas</p>
          </CardContent>
        </Card>
        <Card className="neon-border bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Utilidad Neta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-400">Bs. {stats.utility.toLocaleString()}</div>
            <p className="text-[10px] text-muted-foreground mt-1">Beneficio real para el club</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="neon-border bg-card/40">
          <CardHeader>
            <CardTitle className="text-lg">Ranking de Consumo</CardTitle>
            <CardDescription>Principales generadoras de ingresos para la selección actual.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {hostessRanking.length > 0 ? (
              <ChartContainer config={chartConfig}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hostessRanking}>
                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `Bs.${v}`} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="value" fill="var(--color-value)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground italic text-sm">
                No hay datos para graficar en esta selección.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="neon-border bg-card/40 overflow-hidden">
          <CardHeader className="bg-white/5 border-b border-border/50">
            <CardTitle className="text-lg">Movimientos Agrupados</CardTitle>
            <CardDescription>Servicios completos registrados. Haz clic para ver quiénes participaron.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[350px] overflow-auto">
              <Table>
                <TableHeader className="bg-background/60 sticky top-0 z-10">
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead>Participantes</TableHead>
                    <TableHead className="text-right">Total Bs.</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groupedServices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-20 text-muted-foreground italic">
                        No se encontraron registros.
                      </TableCell>
                    </TableRow>
                  ) : (
                    groupedServices.map((group) => {
                      const first = group[0];
                      const product = products.find(p => p.id === first.productId);
                      const totalQty = group.reduce((acc, t) => acc + t.quantity, 0);
                      const totalPrice = group.reduce((acc, t) => acc + t.totalPrice, 0);
                      const sId = first.serviceId;
                      const isExpanded = !!expandedServices[sId];

                      return (
                        <Fragment key={`group-${sId}`}>
                          <TableRow className="cursor-pointer hover:bg-white/5" onClick={() => toggleService(sId)}>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                {isExpanded ? <ChevronUp className="h-4 w-4 opacity-50" /> : <ChevronDown className="h-4 w-4 opacity-50" />}
                                <div>
                                  <p className="font-bold">{product?.name}</p>
                                  <p className="text-[10px] opacity-60">{new Date(first.timestamp).toLocaleTimeString()}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                <Badge variant="secondary" className="text-[10px] font-mono">x{totalQty.toFixed(1)}</Badge>
                                {group.length > 1 && (
                                  <Badge variant="outline" className="text-[10px] border-primary/30 text-primary bg-primary/5">
                                    <ArrowRightLeft className="h-2 w-2 mr-1" /> Compartido
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-bold text-primary">
                              Bs. {totalPrice.toLocaleString()}
                            </TableCell>
                          </TableRow>
                          {isExpanded && group.map((item) => {
                            const hostess = hostesses.find(h => h.id === item.hostessId);
                            const otherId = group.find(g => g.id !== item.id)?.hostessId;
                            const otherHostess = otherId ? hostesses.find(h => h.id === otherId) : null;
                            
                            return (
                              <TableRow key={`row-${item.id}`} className="bg-white/[0.02] border-none">
                                <TableCell className="pl-10 py-2 opacity-70">
                                  <div className="flex flex-col">
                                    <span className="text-xs font-bold text-primary">→ {hostess?.name}</span>
                                    {otherHostess && (
                                      <span className="text-[9px] text-muted-foreground">Vínculo con: {otherHostess.name}</span>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="py-2 opacity-70">
                                  <Badge variant="ghost" className="text-[10px]">x{item.quantity.toFixed(1)}</Badge>
                                </TableCell>
                                <TableCell className="text-right py-2 opacity-70">
                                  <span className="text-xs">Bs. {item.totalPrice.toLocaleString()}</span>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </Fragment>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="neon-border bg-card/40">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Moon className="h-5 w-5 mr-2 text-accent" />
            Cierres de Noche Recientes
          </CardTitle>
          <CardDescription>Resumen de las últimas jornadas finalizadas por los garzones.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {shifts.slice().reverse().slice(0, 6).map((shift) => {
              const shiftTx = transactions.filter(t => t.shiftId === shift.id);
              const revenue = shiftTx.reduce((acc, t) => acc + t.totalPrice, 0);
              
              return (
                <div key={shift.id} className="p-4 rounded-xl border border-border/50 bg-white/5 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        {format(new Date(shift.startTime), "eeee d 'de' MMMM", { locale: es })}
                      </p>
                      <p className="text-[10px] opacity-60">Inicio: {new Date(shift.startTime).toLocaleTimeString()}</p>
                    </div>
                    <Badge variant={shift.status === 'ABIERTO' ? 'default' : 'secondary'} className={shift.status === 'ABIERTO' ? 'bg-emerald-500' : ''}>
                      {shift.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-end pt-2 border-t border-white/5">
                    <div>
                      <p className="text-[10px] text-muted-foreground">Venta Noche</p>
                      <p className="text-lg font-bold">Bs. {revenue.toLocaleString()}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-primary opacity-50" />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
