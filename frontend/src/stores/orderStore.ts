import { create } from 'zustand';
import api from '../lib/api';

interface OrderState {
  orders: any[];
  currentOrder: any | null;
  history: any[];
  loading: boolean;
  error: string | null;
  fetchArtisanOrders: () => Promise<void>;
  fetchBuyerOrders: () => Promise<void>;
  fetchOrder: (id: string) => Promise<void>;
  updateOrderStatus: (id: string, status: string, note?: string) => Promise<void>;
  cancelOrder: (id: string, reason: string, notes?: string) => Promise<void>;
  decideCancellation: (id: string, approved: boolean, note?: string) => Promise<void>;
}

export const useOrderStore = create<OrderState>((set) => ({
  orders: [],
  currentOrder: null,
  history: [],
  loading: false,
  error: null,
  
  fetchArtisanOrders: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get('/orders/artisan');
      set({ orders: res.data.orders, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },
  
  fetchBuyerOrders: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get('/orders/buyer');
      set({ orders: res.data.orders, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },
  
  fetchOrder: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get(`/orders/${id}`);
      set({ currentOrder: res.data.order, history: res.data.history, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },
  
  updateOrderStatus: async (id: string, status: string, note?: string) => {
    set({ loading: true, error: null });
    try {
      await api.patch(`/orders/${id}/status`, { status, note });
      // Refresh order locally after update
      const res = await api.get(`/orders/${id}`);
      set({ currentOrder: res.data.order, history: res.data.history, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },
  
  cancelOrder: async (id: string, reason: string, notes?: string) => {
    set({ loading: true, error: null });
    try {
      await api.post(`/orders/${id}/cancel`, { reason, notes });
      const res = await api.get(`/orders/${id}`);
      set({ currentOrder: res.data.order, history: res.data.history, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  decideCancellation: async (id: string, approved: boolean, note?: string) => {
    set({ loading: true, error: null });
    try {
      await api.post(`/orders/${id}/cancel_decision`, { approved, note });
      const res = await api.get(`/orders/${id}`);
      set({ currentOrder: res.data.order, history: res.data.history, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  }
}));
