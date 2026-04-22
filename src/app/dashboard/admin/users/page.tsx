'use client';

import { useState } from 'react';
import { useNeonShiftStore, Role } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { UserPlus, Trash2, Shield, User, Lock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function UsersPage() {
  const { users, addUser, deleteUser, currentUser, logAudit } = useNeonShiftStore();
  const [isAddOpen, setIsAddOpen] = useState(false);
  
  const [newUser, setNewUser] = useState({
    username: '',
    password: 'password',
    role: 'GARZON' as Role
  });

  const handleAddUser = () => {
    if (!newUser.username) {
      toast({ variant: "destructive", title: "Error", description: "El nombre de usuario es obligatorio." });
      return;
    }
    addUser(newUser);
    logAudit(currentUser?.id || 'admin', `Usuario creado: ${newUser.username} con rol ${newUser.role}`);
    setIsAddOpen(false);
    setNewUser({ username: '', password: 'password', role: 'GARZON' });
    toast({ title: "Usuario creado", description: `El acceso para ${newUser.username} está listo.` });
  };

  const handleDelete = (id: string, username: string) => {
    if (id === currentUser?.id) {
      toast({ variant: "destructive", title: "Error", description: "No puedes eliminar tu propia cuenta." });
      return;
    }
    deleteUser(id);
    logAudit(currentUser?.id || 'admin', `Usuario eliminado: ${username}`);
    toast({ title: "Usuario eliminado", description: `Se revocó el acceso a ${username}.` });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight neon-text">Gestión de Personal</h2>
          <p className="text-muted-foreground">Administra los accesos de Administradores y Meseros al sistema.</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="neon-glow">
              <UserPlus className="h-4 w-4 mr-2" />
              Nuevo Usuario
            </Button>
          </DialogTrigger>
          <DialogContent className="neon-border bg-card/95 backdrop-blur-xl">
            <DialogHeader>
              <DialogTitle>Registrar Nuevo Usuario</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="username">Nombre de Usuario</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="username" 
                    placeholder="Ej. juan_perez" 
                    className="pl-9"
                    value={newUser.username}
                    onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Rol en el Sistema</Label>
                <Select 
                  value={newUser.role} 
                  onValueChange={(v: Role) => setNewUser({...newUser, role: v})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Administrador</SelectItem>
                    <SelectItem value="GARZON">Mesero (Garzón)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña Temporal</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="password" 
                    type="text" 
                    className="pl-9"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground italic">Se recomienda cambiarla al primer inicio de sesión.</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancelar</Button>
              <Button onClick={handleAddUser}>Crear Usuario</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="neon-border bg-card/40 backdrop-blur-md">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>ID de Sistema</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} className="hover:bg-white/5">
                  <TableCell className="font-bold">{user.username}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Shield className={`h-3 w-3 mr-2 ${user.role === 'ADMIN' ? 'text-primary' : 'text-blue-400'}`} />
                      <span className="text-xs uppercase tracking-wider">{user.role}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-[10px] opacity-50">{user.id}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-destructive hover:bg-destructive/10"
                      disabled={user.id === currentUser?.id}
                      onClick={() => handleDelete(user.id, user.username)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
