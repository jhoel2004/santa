'use client';

import { useState } from 'react';
import { useNeonShiftStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Martini, Plus, Trash2, Search, DollarSign, Percent } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function ProductsPage() {
  const { products, addProduct, deleteProduct, currentUser, logAudit } = useNeonShiftStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: 0,
    commission: 0
  });

  const handleAddProduct = () => {
    if (!newProduct.name || newProduct.price <= 0) {
      toast({ variant: "destructive", title: "Datos inválidos", description: "El nombre y el precio son obligatorios." });
      return;
    }
    addProduct(newProduct);
    logAudit(currentUser?.id || 'admin', `Producto añadido: ${newProduct.name}`);
    setIsAddOpen(false);
    setNewProduct({ name: '', price: 0, commission: 0 });
    toast({ title: "Producto creado", description: "El inventario ha sido actualizado." });
  };

  const handleDelete = (id: string, name: string) => {
    deleteProduct(id);
    logAudit(currentUser?.id || 'admin', `Producto eliminado: ${name}`);
    toast({ title: "Producto eliminado", description: `${name} fue quitado del catálogo.` });
  };

  const filtered = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight neon-text">Gestión de Inventario</h2>
          <p className="text-muted-foreground">Configura los productos, precios y comisiones por venta.</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar producto..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="neon-glow">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Producto
              </Button>
            </DialogTrigger>
            <DialogContent className="neon-border bg-card/95 backdrop-blur-xl">
              <DialogHeader>
                <DialogTitle>Añadir Nuevo Producto</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre del Producto</Label>
                  <Input 
                    id="name" 
                    placeholder="Ej. Gin Tonic Premium" 
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Precio (Bs.)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="price" 
                        type="number" 
                        className="pl-9"
                        value={isNaN(newProduct.price) ? '' : newProduct.price}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          setNewProduct({...newProduct, price: isNaN(val) ? 0 : val});
                        }}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="comm">Comisión (Bs.)</Label>
                    <div className="relative">
                      <Percent className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="comm" 
                        type="number" 
                        className="pl-9"
                        value={isNaN(newProduct.commission) ? '' : newProduct.commission}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          setNewProduct({...newProduct, commission: isNaN(val) ? 0 : val});
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancelar</Button>
                <Button onClick={handleAddProduct}>Guardar Producto</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="neon-border bg-card/40 backdrop-blur-md">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead>Precio de Venta</TableHead>
                <TableHead>Comisión Chica</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10 text-muted-foreground italic">No se encontraron productos.</TableCell>
                </TableRow>
              ) : (
                filtered.map((product) => (
                  <TableRow key={product.id} className="hover:bg-white/5">
                    <TableCell>
                      <div className="flex items-center">
                        <Martini className="h-4 w-4 mr-2 text-primary opacity-70" />
                        <span className="font-bold">{product.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>Bs. {product.price.toLocaleString()}</TableCell>
                    <TableCell className="text-primary font-medium">Bs. {product.commission.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(product.id, product.name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}