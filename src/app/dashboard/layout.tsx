'use client';

import { useNeonShiftStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { LayoutDashboard, Users, Martini, History, DollarSign, LogOut, FileText } from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/Logo';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { currentUser, logout } = useNeonShiftStore();
  const router = useRouter();

  useEffect(() => {
    if (!currentUser) {
      router.push('/');
    }
  }, [currentUser, router]);

  if (!currentUser) return null;

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const menuItems = {
    ADMIN: [
      { icon: LayoutDashboard, label: 'Resumen', href: '/dashboard/admin' },
      { icon: DollarSign, label: 'Pagos', href: '/dashboard/admin/payments' },
      { icon: Martini, label: 'Inventario', href: '/dashboard/admin/products' },
      { icon: Users, label: 'Personal', href: '/dashboard/admin/users' },
      { icon: FileText, label: 'Auditoría', href: '/dashboard/admin/audit' },
    ],
    GARZON: [
      { icon: LayoutDashboard, label: 'Registros', href: '/dashboard/garzon' },
      { icon: Users, label: 'Asistencia', href: '/dashboard/garzon/attendance' },
      { icon: History, label: 'Historial Turno', href: '/dashboard/garzon/history' },
    ],
    CHICA: [
      { icon: LayoutDashboard, label: 'Mi Rendimiento', href: '/dashboard/chica' },
      { icon: Martini, label: 'Consumos', href: '/dashboard/chica/history' },
    ]
  };

  const currentRoleItems = menuItems[currentUser.role] || [];

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background/50">
        <Sidebar className="neon-border bg-card/80 border-r-0 backdrop-blur-xl">
          <SidebarHeader className="p-4 border-b border-border/50">
            <Link href="/" className="flex flex-col items-center space-y-2">
              <Logo className="w-24 h-24" />
              <span className="text-lg font-bold tracking-tighter neon-text">Santa Night Club</span>
            </Link>
            <div className="mt-2 px-2 py-1 bg-primary/10 rounded-full border border-primary/20 text-center">
              <span className="text-[10px] uppercase font-bold text-primary tracking-widest">{currentUser.role}</span>
            </div>
          </SidebarHeader>
          <SidebarContent className="p-4">
            <SidebarMenu>
              {currentRoleItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton asChild tooltip={item.label} className="h-12 hover:bg-primary/10 hover:text-primary transition-all">
                    <Link href={item.href} className="flex items-center space-x-3">
                      <item.icon className="h-5 w-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-4 border-t border-border/50">
            <div className="mb-4 px-4">
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Conectado como</p>
              <p className="text-sm font-bold truncate">{currentUser.username}</p>
            </div>
            <SidebarMenuButton onClick={handleLogout} className="text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors">
              <LogOut className="h-5 w-5 mr-3" />
              <span>Cerrar Sesión</span>
            </SidebarMenuButton>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset className="bg-transparent">
          <header className="flex h-16 shrink-0 items-center justify-between px-6 border-b border-border/30 sticky top-0 bg-background/60 backdrop-blur-md z-40">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="md:hidden" />
              <h1 className="text-lg font-bold">Panel de Control</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-muted-foreground hidden md:block">
                Turno: <span className="text-foreground font-mono">{new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-4 md:p-8">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}