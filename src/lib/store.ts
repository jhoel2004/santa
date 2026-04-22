
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Role = 'ADMIN' | 'GARZON' | 'CHICA';

export interface User {
  id: string;
  username: string;
  role: Role;
  password?: string;
  code?: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  commission: number;
}

export interface Hostess {
  id: string;
  name: string;
  code: string;
  active: boolean;
}

export interface Shift {
  id: string;
  startTime: string;
  endTime?: string;
  waiterId: string;
  status: 'ABIERTO' | 'CERRADO';
}

export interface Transaction {
  id: string;
  serviceId: string; // ID para agrupar transacciones de un mismo servicio
  hostessId: string;
  productId: string;
  waiterId: string;
  shiftId?: string;
  quantity: number;
  commissionAmount: number;
  totalPrice: number;
  timestamp: string;
  relatedHostessId?: string;
}

export interface Payment {
  id: string;
  hostessId: string;
  amount: number;
  timestamp: string;
  adminId: string;
  shiftId?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  timestamp: string;
}

interface NeonShiftStore {
  users: User[];
  products: Product[];
  hostesses: Hostess[];
  transactions: Transaction[];
  payments: Payment[];
  auditLogs: AuditLog[];
  shifts: Shift[];
  currentShift: Shift | null;
  currentUser: User | null;

  login: (credential: string, password?: string) => User | null;
  logout: () => void;
  
  addUser: (user: Omit<User, 'id'>) => void;
  deleteUser: (id: string) => void;
  
  addProduct: (product: Omit<Product, 'id'>) => void;
  deleteProduct: (id: string) => void;
  
  addHostess: (name: string) => void;
  toggleHostessActive: (id: string) => void;
  deleteHostess: (id: string) => void;
  
  startShift: (waiterId: string) => void;
  endShift: () => void;
  
  addTransaction: (tx: Omit<Transaction, 'id' | 'timestamp' | 'shiftId' | 'serviceId'> & { serviceId?: string }) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  deleteService: (serviceId: string) => void;
  
  addPayment: (payment: Omit<Payment, 'id' | 'timestamp' | 'shiftId'>) => void;
  logAudit: (userId: string, action: string) => void;
}

export const useNeonShiftStore = create<NeonShiftStore>()(
  persist(
    (set, get) => ({
      users: [
        { id: '1', username: 'admin', role: 'ADMIN', password: 'password' },
        { id: '2', username: 'waiter1', role: 'GARZON', password: 'password' },
      ],
      products: [
        { id: 'p1', name: 'Cerveza Botella', price: 30, commission: 5 },
        { id: 'p2', name: 'Whisky Premium', price: 150, commission: 25 },
        { id: 'p3', name: 'Coctel Neon', price: 80, commission: 15 },
        { id: 'p4', name: 'Torre de Champagne', price: 1200, commission: 200 },
      ],
      hostesses: [
        { id: 'h1', name: 'Lucía', code: '1234', active: false },
        { id: 'h2', name: 'Elena', code: '5678', active: false },
      ],
      transactions: [],
      payments: [],
      auditLogs: [],
      shifts: [],
      currentShift: null,
      currentUser: null,

      login: (credential, password) => {
        const state = get();
        let user = null;
        if (password) {
          user = state.users.find(u => u.username === credential && u.password === password) || null;
        } else {
          const hostess = state.hostesses.find(h => h.code === credential);
          if (hostess) {
            user = { id: hostess.id, username: hostess.name, role: 'CHICA', code: hostess.code };
          }
        }
        if (user) {
          set({ currentUser: user });
          get().logAudit(user.id, `Inició sesión: ${user.username} (${user.role})`);
        }
        return user;
      },

      logout: () => {
        const user = get().currentUser;
        if (user) get().logAudit(user.id, `Cerró sesión: ${user.username}`);
        set({ currentUser: null });
      },

      addUser: (user) => set(state => ({
        users: [...state.users, { ...user, id: Math.random().toString(36).substr(2, 9) }]
      })),

      deleteUser: (id) => set(state => ({
        users: state.users.filter(u => u.id !== id)
      })),

      addProduct: (product) => set(state => ({
        products: [...state.products, { ...product, id: Math.random().toString(36).substr(2, 9) }]
      })),

      deleteProduct: (id) => set(state => ({
        products: state.products.filter(p => p.id !== id)
      })),

      addHostess: (name) => set(state => {
        const code = Math.floor(1000 + Math.random() * 9000).toString();
        return { hostesses: [...state.hostesses, { id: Math.random().toString(36).substr(2, 9), name, code, active: true }] };
      }),

      toggleHostessActive: (id) => set(state => ({
        hostesses: state.hostesses.map(h => h.id === id ? { ...h, active: !h.active } : h)
      })),

      deleteHostess: (id) => set(state => ({
        hostesses: state.hostesses.filter(h => h.id !== id)
      })),

      startShift: (waiterId) => set(state => {
        const newShift: Shift = {
          id: `shift-${Date.now()}`,
          startTime: new Date().toISOString(),
          waiterId,
          status: 'ABIERTO'
        };
        get().logAudit(waiterId, "INICIÓ UNA NUEVA NOCHE DE TRABAJO");
        return { currentShift: newShift, shifts: [...state.shifts, newShift] };
      }),

      endShift: () => set(state => {
        if (!state.currentShift) return {};
        const updatedShift: Shift = { ...state.currentShift, endTime: new Date().toISOString(), status: 'CERRADO' };
        get().logAudit(state.currentUser?.id || 'system', "FINALIZÓ LA NOCHE DE TRABAJO");
        return {
          currentShift: null,
          shifts: state.shifts.map(s => s.id === updatedShift.id ? updatedShift : s),
          hostesses: state.hostesses.map(h => ({ ...h, active: false }))
        };
      }),

      addTransaction: (tx) => set(state => {
        const serviceId = tx.serviceId || Math.random().toString(36).substr(2, 9);
        return {
          transactions: [...state.transactions, { 
            ...tx, 
            id: Math.random().toString(36).substr(2, 9), 
            serviceId,
            timestamp: new Date().toISOString(),
            shiftId: state.currentShift?.id
          }]
        };
      }),

      updateTransaction: (id, updates) => set(state => ({
        transactions: state.transactions.map(t => t.id === id ? { ...t, ...updates } : t)
      })),

      deleteTransaction: (id) => set(state => ({
        transactions: state.transactions.filter(t => t.id !== id)
      })),

      deleteService: (serviceId) => set(state => ({
        transactions: state.transactions.filter(t => t.serviceId !== serviceId)
      })),

      addPayment: (payment) => set(state => ({
        payments: [...state.payments, { 
          ...payment, 
          id: Math.random().toString(36).substr(2, 9), 
          timestamp: new Date().toISOString(),
          shiftId: state.currentShift?.id
        }]
      })),

      logAudit: (userId, action) => set(state => ({
        auditLogs: [...state.auditLogs, { id: Math.random().toString(36).substr(2, 9), userId, action, timestamp: new Date().toISOString() }]
      })),
    }),
    { name: 'neonshift-storage' }
  )
);
