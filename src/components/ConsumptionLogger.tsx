
'use client';

import { useState, useEffect } from 'react';
import { useNeonShiftStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Martini, Plus, Minus, Send, Users, Clock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export function ConsumptionLogger() {
  const { products, hostesses, currentUser, addTransaction, logAudit } = useNeonShiftStore();
  
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [selectedHostesses, setSelectedHostesses] = useState<string[]>([]);
  const [globalQuantity, setGlobalQuantity] = useState(1);
  const [hostessQuantities, setHostessQuantities] = useState<Record<string, number>>({});
  const [isManualMode, setIsManualMode] = useState(false);

  const activeHostesses = hostesses.filter(h => h.active);

  useEffect(() => {
    const newQuantities = { ...hostessQuantities };
    selectedHostesses.forEach(id => {
      if (!newQuantities[id]) newQuantities[id] = 1;
    });
    Object.keys(newQuantities).forEach(id => {
      if (!selectedHostesses.includes(id)) delete newQuantities[id];
    });
    setHostessQuantities(newQuantities);
    
    if (selectedHostesses.length > 1) {
      setIsManualMode(true);
    } else {
      setIsManualMode(false);
    }
  }, [selectedHostesses]);

  const handleToggleHostess = (id: string) => {
    setSelectedHostesses(prev => 
      prev.includes(id) ? prev.filter(hid => hid !== id) : [...prev, id]
    );
  };

  const updateHostessQuantity = (id: string, delta: number) => {
    setHostessQuantities(prev => ({
      ...prev,
      [id]: Math.max(0.5, (prev[id] || 0) + delta)
    }));
  };

  const handleSubmit = async () => {
    if (!selectedProduct || selectedHostesses.length === 0) {
      toast({ variant: "destructive", title: "Registro incompleto", description: "Selecciona al menos un producto y una chica." });
      return;
    }

    const product = products.find(p => p.id === selectedProduct)!;
    
    if (isManualMode) {
      selectedHostesses.forEach(hId => {
        const qty = hostessQuantities[hId] || 0;
        if (qty > 0) {
          // Si son 2, marcar la relación
          const otherHostessId = selectedHostesses.length === 2 ? selectedHostesses.find(id => id !== hId) : undefined;
          
          addTransaction({
            hostessId: hId,
            productId: selectedProduct,
            waiterId: currentUser?.id || 'unknown',
            quantity: qty,
            commissionAmount: product.commission * qty,
            totalPrice: product.price * qty,
            relatedHostessId: otherHostessId
          });
        }
      });
      logAudit(currentUser?.id || 'system', `Registro manual: ${product.name} entre ${selectedHostesses.length} chicas.`);
    } else {
      const splitQuantity = globalQuantity / selectedHostesses.length;
      const splitCommission = (product.commission * globalQuantity) / selectedHostesses.length;
      const splitTotal = (product.price * globalQuantity) / selectedHostesses.length;

      selectedHostesses.forEach(hId => {
        const otherHostessId = selectedHostesses.length === 2 ? selectedHostesses.find(id => id !== hId) : undefined;
        
        addTransaction({
          hostessId: hId,
          productId: selectedProduct,
          waiterId: currentUser?.id || 'unknown',
          quantity: splitQuantity,
          commissionAmount: splitCommission,
          totalPrice: splitTotal,
          relatedHostessId: otherHostessId
        });
      });
      logAudit(currentUser?.id || 'system', `Registrado ${globalQuantity} x ${product.name} para: ${selectedHostesses.length} chicas.`);
    }

    toast({ title: "Consumo registrado", description: `Se guardó el consumo para ${selectedHostesses.length} chicas.` });
    
    setSelectedHostesses([]);
    setGlobalQuantity(1);
    setSelectedProduct('');
    setHostessQuantities({});
  };

  return (
    <Card className="neon-border bg-card/40 backdrop-blur-md">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Martini className="h-6 w-6 mr-2 text-primary" />
          Registro de Consumo
        </CardTitle>
        <CardDescription>Selecciona los productos y las chicas para asignar comisiones.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label className="text-xs uppercase font-bold text-muted-foreground">1. Producto</Label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {products.map(p => (
              <Button 
                key={p.id}
                variant={selectedProduct === p.id ? 'default' : 'outline'}
                onClick={() => setSelectedProduct(p.id)}
                className={`h-16 flex flex-col items-center justify-center transition-all ${selectedProduct === p.id ? 'neon-glow border-primary scale-105' : 'hover:border-primary/50'}`}
              >
                <span className="font-bold text-xs truncate w-full px-1">{p.name}</span>
                <span className="text-[10px] opacity-70 font-mono">Bs. {p.price}</span>
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs uppercase font-bold text-muted-foreground">2. Chicas</Label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {activeHostesses.map(h => (
              <Button
                key={h.id}
                variant={selectedHostesses.includes(h.id) ? 'default' : 'outline'}
                onClick={() => handleToggleHostess(h.id)}
                className={`h-12 text-xs font-bold transition-all ${selectedHostesses.includes(h.id) ? 'bg-secondary text-secondary-foreground border-secondary neon-glow-pink scale-105' : ''}`}
              >
                {h.name}
              </Button>
            ))}
          </div>
        </div>

        {selectedHostesses.length > 1 && (
          <div className="space-y-4 p-4 bg-primary/5 rounded-xl border border-primary/20">
            <div className="flex items-center justify-between">
              <Label className="text-primary font-bold flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Distribución por Chica
              </Label>
              <Button variant="ghost" size="sm" className="text-[10px]" onClick={() => setIsManualMode(!isManualMode)}>
                {isManualMode ? "Cambiar a Equitativo" : "Cambiar a Manual"}
              </Button>
            </div>
            
            {isManualMode ? (
              <div className="space-y-3">
                {selectedHostesses.map(id => {
                  const h = hostesses.find(host => host.id === id);
                  return (
                    <div key={id} className="flex items-center justify-between bg-background/40 p-2 rounded-lg border border-border/50">
                      <span className="text-sm font-medium">{h?.name}</span>
                      <div className="flex items-center space-x-3">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => updateHostessQuantity(id, -0.5)}><Minus className="h-3 w-3" /></Button>
                        <span className="text-sm font-bold w-10 text-center">{hostessQuantities[id] || 0}</span>
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => updateHostessQuantity(id, 0.5)}><Plus className="h-3 w-3" /></Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center justify-between p-2">
                <span className="text-sm text-muted-foreground">Cantidad total a dividir:</span>
                <div className="flex items-center space-x-4">
                  <Button size="icon" variant="outline" onClick={() => setGlobalQuantity(Math.max(1, globalQuantity - 1))}><Minus className="h-4 w-4" /></Button>
                  <span className="text-xl font-bold w-8 text-center">{globalQuantity}</span>
                  <Button size="icon" variant="outline" onClick={() => setGlobalQuantity(globalQuantity + 1)}><Plus className="h-4 w-4" /></Button>
                </div>
              </div>
            )}
          </div>
        )}

        {selectedHostesses.length === 1 && (
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
            <Label className="font-bold">Cantidad de Bebidas:</Label>
            <div className="flex items-center space-x-4">
              <Button size="icon" variant="outline" onClick={() => setGlobalQuantity(Math.max(1, globalQuantity - 1))}><Minus className="h-4 w-4" /></Button>
              <span className="text-2xl font-bold w-8 text-center">{globalQuantity}</span>
              <Button size="icon" variant="outline" onClick={() => setGlobalQuantity(globalQuantity + 1)}><Plus className="h-4 w-4" /></Button>
            </div>
          </div>
        )}

        <div className="pt-2">
          <Button 
            className="w-full h-14 px-8 neon-glow font-bold text-lg"
            onClick={handleSubmit}
            disabled={!selectedProduct || selectedHostesses.length === 0}
          >
            <Send className="h-5 w-5 mr-2" />
            {isManualMode ? 'Registrar Reparto Manual' : 'Registrar Consumo'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
