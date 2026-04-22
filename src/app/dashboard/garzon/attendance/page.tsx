'use client';

import { useState } from 'react';
import { useNeonShiftStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { UserPlus, Search, Users, ShieldCheck, ShieldAlert, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function AttendancePage() {
  const { hostesses, addHostess, toggleHostessActive, deleteHostess, logAudit, currentUser } = useNeonShiftStore();
  const [newName, setNewName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    addHostess(newName);
    logAudit(currentUser?.id || 'garzon', `REGISTRÓ NUEVA CHICA: ${newName}`);
    toast({ title: "Chica Registrada", description: `${newName} ha sido añadida a la base de datos.` });
    setNewName('');
  };

  const handleDeleteHostess = (id: string, name: string) => {
    deleteHostess(id);
    logAudit(currentUser?.id || 'garzon', `ELIMINÓ CHICA: ${name}`);
    toast({ title: "Chica eliminada", description: "Se ha quitado a la chica del listado maestro.", variant: "destructive" });
  };

  const filtered = hostesses.filter(h => h.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Card className="neon-border bg-card/40">
        <CardHeader>
          <CardTitle className="flex items-center">
            <UserPlus className="h-6 w-6 mr-2 text-primary" />
            Registrar Nueva Chica
          </CardTitle>
          <CardDescription>Añade una nueva chica al sistema y genera su código único de acceso.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="flex gap-4">
            <div className="flex-1">
              <Input 
                placeholder="Nombre Completo / Alias" 
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <Button type="submit" className="neon-glow">Registrar</Button>
          </form>
        </CardContent>
      </Card>

      <Card className="neon-border bg-card/40">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="flex items-center">
              <Users className="h-6 w-6 mr-2 text-primary" />
              Asistencia Diaria
            </CardTitle>
            <CardDescription>Marca quiénes están trabajando en el turno actual.</CardDescription>
          </div>
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar en la nómina..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.length === 0 ? (
              <p className="col-span-full text-center py-10 text-muted-foreground italic">No se encontraron resultados.</p>
            ) : (
              filtered.map(h => (
                <div key={h.id} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${h.active ? 'bg-primary/5 border-primary/40' : 'bg-muted/10 border-border/50 opacity-60'}`}>
                  <div className="flex items-center space-x-3">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold ${h.active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                      {h.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold">{h.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">CÓDIGO: {h.code}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {h.active ? <ShieldCheck className="h-4 w-4 text-emerald-500" /> : <ShieldAlert className="h-4 w-4 text-muted-foreground" />}
                      <Switch 
                        checked={h.active} 
                        onCheckedChange={() => {
                          toggleHostessActive(h.id);
                          logAudit(currentUser?.id || 'garzon', `${h.active ? 'DESACTIVÓ' : 'ACTIVÓ'} asistencia para: ${h.name}`);
                        }} 
                      />
                    </div>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="neon-border border-destructive/50 bg-card/95">
                        <DialogHeader>
                          <DialogTitle>Eliminar Chica</DialogTitle>
                        </DialogHeader>
                        <p className="text-sm opacity-80">¿Estás seguro de que deseas eliminar a <strong>{h.name}</strong>? Esto borrará su código de acceso permanentemente.</p>
                        <DialogFooter>
                          <Button variant="outline">Cancelar</Button>
                          <Button variant="destructive" onClick={() => handleDeleteHostess(h.id, h.name)}>Eliminar de la Nómina</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
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
