'use client';

import { useNeonShiftStore, Transaction } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { History, Search, Pencil, Trash2, AlertTriangle, ArrowRightLeft, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { useState, useMemo, Fragment } from 'react';
import { toast } from '@/hooks/use-toast';

export default function GarzonHistoryPage() {
  const { 
    transactions, 
    currentUser, 
    hostesses, 
    products, 
    currentShift,
    updateTransaction, 
    deleteService, 
    addTransaction,
    logAudit 
  } = useNeonShiftStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedServices, setExpandedServices] = useState<Record<string, boolean>>({});
  
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [editQuantity, setEditQuantity] = useState(0);

  const [splittingTx, setSplittingTx] = useState<Transaction | null>(null);
  const [targetHostessId, setTargetHostessId] = useState('');
  const [sharedUnits, setSharedUnits] = useState(0);

  const toggleService = (serviceId: string) => {
    setExpandedServices(prev => ({ ...prev, [serviceId]: !prev[serviceId] }));
  };

  const myGroupedLogs = useMemo(() => {
    if (!currentShift) return [];
    
    const myShiftTransactions = transactions.filter(t => t.waiterId === currentUser?.id && t.shiftId === currentShift.id);
    
    const groups: Record<string, Transaction[]> = {};
    myShiftTransactions.forEach(t => {
      if (!groups[t.serviceId]) groups[t.serviceId] = [];
      groups[t.serviceId].push(t);
    });

    return Object.values(groups)
      .filter(group => {
        const product = products.find(p => p.id === group[0].productId);
        const hostessNames = group.map(t => hostesses.find(h => h.id === t.hostessId)?.name || '').join(' ');
        const search = searchTerm.toLowerCase();
        return (
          product?.name.toLowerCase().includes(search) ||
          hostessNames.toLowerCase().includes(search)
        );
      })
      .sort((a, b) => new Date(b[0].timestamp).getTime() - new Date(a[0].timestamp).getTime());
  }, [transactions, currentUser, currentShift, hostesses, products, searchTerm]);

  const handleDeleteService = (serviceId: string, productName: string) => {
    deleteService(serviceId);
    logAudit(currentUser?.id || 'garzon', `ELIMINÓ SERVICIO COMPLETO: ${productName}`);
    toast({ title: "Servicio eliminado", variant: "destructive" });
  };

  const handleUpdate = () => {
    if (!editingTx) return;
    const product = products.find(p => p.id === editingTx.productId);
    if (!product || editQuantity <= 0) return;

    updateTransaction(editingTx.id, {
      quantity: editQuantity,
      totalPrice: product.price * editQuantity,
      commissionAmount: product.commission * editQuantity
    });

    logAudit(currentUser?.id || 'garzon', `EDITÓ CANTIDAD: ${product.name} a ${editQuantity}`);
    toast({ title: "Actualizado exitosamente" });
    setEditingTx(null);
  };

  const handleAdvancedSplit = () => {
    if (!splittingTx || !targetHostessId || sharedUnits <= 0) {
      toast({ variant: "destructive", title: "Error", description: "Indica la chica y las unidades compartidas." });
      return;
    }

    if (sharedUnits > splittingTx.quantity) {
      toast({ variant: "destructive", title: "Error", description: "No puedes compartir más unidades de las registradas." });
      return;
    }

    const product = products.find(p => p.id === splittingTx.productId)!;
    const originalHostess = hostesses.find(h => h.id === splittingTx.hostessId);
    const targetHostess = hostesses.find(h => h.id === targetHostessId);

    // Regla de Oro:
    // Original = (Total - Compartidas) + (Compartidas / 2)
    // Nueva = (Compartidas / 2)
    const unitsPerGirlFromShared = sharedUnits / 2;
    const exclusiveUnitsOriginal = splittingTx.quantity - sharedUnits;
    const finalUnitsOriginal = exclusiveUnitsOriginal + unitsPerGirlFromShared;
    const finalUnitsNew = unitsPerGirlFromShared;

    updateTransaction(splittingTx.id, {
      quantity: finalUnitsOriginal,
      totalPrice: product.price * finalUnitsOriginal,
      commissionAmount: product.commission * finalUnitsOriginal,
      relatedHostessId: targetHostessId
    });

    addTransaction({
      serviceId: splittingTx.serviceId,
      hostessId: targetHostessId,
      productId: splittingTx.productId,
      waiterId: currentUser?.id || 'unknown',
      quantity: finalUnitsNew,
      commissionAmount: product.commission * finalUnitsNew,
      totalPrice: product.price * finalUnitsNew,
      relatedHostessId: splittingTx.hostessId
    });

    logAudit(currentUser?.id || 'garzon', `REPARTO REGLA DE ORO: ${product.name}. ${originalHostess?.name} (previas + 50%) y ${targetHostess?.name} (50%).`);
    toast({ title: "Reparto aplicado", description: "La comitiva ha sido actualizada según la regla de oro." });
    setSplittingTx(null);
  };

  if (!currentShift) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <AlertTriangle className="h-12 w-12 text-amber-500" />
        <h2 className="text-2xl font-bold">Noche no iniciada</h2>
        <p className="text-muted-foreground">Inicia el turno para ver los registros actuales.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold neon-text">Gestión de Consumos</h2>
          <p className="text-muted-foreground">Vista agrupada por botellas servidas en esta noche.</p>
        </div>
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar por chica o bebida..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <Card className="neon-border bg-card/40">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2 text-primary" />
            Ventas de esta Noche (Agrupadas)
          </CardTitle>
          <CardDescription>Haz clic en una fila para ver el detalle de quiénes participaron.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto / Hora</TableHead>
                <TableHead>Total Botellas</TableHead>
                <TableHead className="text-right">Total Bs.</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {myGroupedLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-20 text-muted-foreground italic">No hay registros en esta noche.</TableCell>
                </TableRow>
              ) : (
                myGroupedLogs.map((group) => {
                  const first = group[0];
                  const product = products.find(p => p.id === first.productId);
                  const totalQty = group.reduce((acc, t) => acc + t.quantity, 0);
                  const totalPrice = group.reduce((acc, t) => acc + t.totalPrice, 0);
                  const sId = first.serviceId;
                  const isExpanded = !!expandedServices[sId];

                  return (
                    <Fragment key={`group-${sId}`}>
                      <TableRow className="hover:bg-white/5 cursor-pointer" onClick={() => toggleService(sId)}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            {isExpanded ? <ChevronUp className="h-4 w-4 opacity-50" /> : <ChevronDown className="h-4 w-4 opacity-50" />}
                            <div>
                              <span className="font-bold">{product?.name}</span>
                              <p className="text-[10px] opacity-60">{new Date(first.timestamp).toLocaleTimeString()}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="font-mono">{totalQty.toFixed(1)}</Badge>
                            {group.length > 1 && <Badge variant="secondary" className="text-[10px] bg-primary/20 text-primary border-none">Compartido</Badge>}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-bold text-primary">Bs. {totalPrice.toLocaleString()}</TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="neon-border border-destructive/50 bg-card/95">
                              <DialogHeader><DialogTitle className="text-destructive">¿Borrar servicio?</DialogTitle></DialogHeader>
                              <p className="py-4 text-sm opacity-80">Se eliminarán todos los registros vinculados a este consumo de {product?.name}.</p>
                              <DialogFooter>
                                <Button variant="outline">Cancelar</Button>
                                <Button variant="destructive" onClick={() => handleDeleteService(sId, product?.name || 'Producto')}>Eliminar Todo</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>

                      {isExpanded && group.map((tx) => {
                        const hostess = hostesses.find(h => h.id === tx.hostessId);
                        const otherId = group.find(g => g.id !== tx.id)?.hostessId;
                        const otherHostess = otherId ? hostesses.find(h => h.id === otherId) : null;

                        return (
                          <TableRow key={`row-${tx.id}`} className="bg-white/[0.03] border-none group">
                            <TableCell className="pl-12 py-2">
                              <div className="flex flex-col">
                                <div className="flex items-center text-xs">
                                  <span className="mr-2 opacity-50">↳</span>
                                  <span className="font-bold text-primary">{hostess?.name}</span>
                                </div>
                                {otherHostess && (
                                  <span className="text-[9px] text-muted-foreground ml-6">Compartido con: {otherHostess.name}</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="py-2 opacity-70">
                              <Badge variant="ghost" className="text-[10px] scale-90">x{tx.quantity.toFixed(1)}</Badge>
                            </TableCell>
                            <TableCell className="text-right py-2 opacity-70">
                              <span className="text-xs font-mono">Bs. {tx.totalPrice.toLocaleString()}</span>
                            </TableCell>
                            <TableCell className="text-right py-2 space-x-1" onClick={(e) => e.stopPropagation()}>
                              {group.length === 1 && (
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-6 w-6 text-secondary hover:bg-secondary/10"
                                      onClick={() => {
                                        setSplittingTx(tx);
                                        setSharedUnits(0);
                                        setTargetHostessId('');
                                      }}
                                    >
                                      <ArrowRightLeft className="h-3 w-3" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="neon-border bg-card/95">
                                    <DialogHeader><DialogTitle>Unir otra chica al consumo</DialogTitle></DialogHeader>
                                    <div className="py-4 space-y-4">
                                      <p className="text-xs text-muted-foreground bg-primary/10 p-2 rounded border border-primary/20">
                                        <strong>Regla de Oro:</strong> Las unidades que indiques se dividirán 50/50. El resto quedará 100% para {hostess?.name}.
                                      </p>
                                      <div className="space-y-2">
                                        <Label>¿Quién se une?</Label>
                                        <Select value={targetHostessId} onValueChange={setTargetHostessId}>
                                          <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                                          <SelectContent>
                                            {hostesses.filter(h => h.id !== tx.hostessId && h.active).map(h => (
                                              <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <div className="space-y-2">
                                        <Label>¿Cuántas unidades se comparten? (Máx: {tx.quantity})</Label>
                                        <Input 
                                          type="number" 
                                          step="1" 
                                          max={tx.quantity}
                                          value={isNaN(sharedUnits) ? '' : sharedUnits} 
                                          onChange={(e) => setSharedUnits(parseFloat(e.target.value) || 0)}
                                        />
                                      </div>
                                    </div>
                                    <DialogFooter>
                                      <Button variant="outline" onClick={() => setSplittingTx(null)}>Cancelar</Button>
                                      <Button className="neon-glow" onClick={handleAdvancedSplit}>Aplicar Regla de Oro</Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                              )}
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-6 w-6 text-amber-500 hover:bg-amber-500/10" onClick={() => {setEditingTx(tx); setEditQuantity(tx.quantity);}}>
                                    <Pencil className="h-3 w-3" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="neon-border bg-card/95">
                                  <DialogHeader><DialogTitle>Editar Cantidad (Manual)</DialogTitle></DialogHeader>
                                  <div className="py-4 space-y-4">
                                    <Label>Unidades para {hostess?.name}</Label>
                                    <Input type="number" step="0.5" value={isNaN(editQuantity) ? '' : editQuantity} onChange={(e) => setEditQuantity(parseFloat(e.target.value) || 0)} />
                                  </div>
                                  <DialogFooter>
                                    <Button variant="outline" onClick={() => setEditingTx(null)}>Cancelar</Button>
                                    <Button onClick={handleUpdate}>Guardar</Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
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
        </CardContent>
      </Card>
    </div>
  );
}
