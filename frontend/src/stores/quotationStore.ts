import { create } from 'zustand';
import api from '../lib/api';

interface QuotationState {
  quotations: any[];
  currentQuotation: any | null;
  revisions: any[];
  loading: boolean;
  error: string | null;
  fetchArtisanQuotations: () => Promise<void>;
  fetchBuyerQuotations: () => Promise<void>;
  fetchQuotation: (id: string) => Promise<void>;
  createQuotation: (data: any) => Promise<any>;
  reviseQuotation: (id: string, data: any) => Promise<any>;
  sendQuotation: (id: string) => Promise<void>;
  acceptQuotation: (id: string) => Promise<any>;
  rejectQuotation: (id: string, note?: string) => Promise<void>;
  requestChanges: (id: string, note?: string) => Promise<void>;
}

export const useQuotationStore = create<QuotationState>((set) => ({
  quotations: [],
  currentQuotation: null,
  revisions: [],
  loading: false,
  error: null,
  
  fetchArtisanQuotations: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get('/quotations/artisan');
      set({ quotations: res.data.quotations, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },
  
  fetchBuyerQuotations: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get('/quotations/buyer');
      set({ quotations: res.data.quotations, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },
  
  fetchQuotation: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get(`/quotations/${id}`);
      set({ currentQuotation: res.data.quotation, revisions: res.data.revisions, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },
  
  createQuotation: async (data: any) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post('/quotations/', data);
      set({ loading: false });
      return res.data;
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },
  
  reviseQuotation: async (id: string, data: any) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post(`/quotations/${id}/revise`, data);
      set({ loading: false });
      return res.data;
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },
  
  sendQuotation: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await api.post(`/quotations/${id}/send`);
      set({ loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },
  
  acceptQuotation: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post(`/quotations/${id}/accept`);
      set({ loading: false });
      return res.data;
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },
  
  rejectQuotation: async (id: string, note?: string) => {
    set({ loading: true, error: null });
    try {
      await api.post(`/quotations/${id}/reject`, { note });
      set({ loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },
  
  requestChanges: async (id: string, note?: string) => {
    set({ loading: true, error: null });
    try {
      await api.post(`/quotations/${id}/request-changes`, { note });
      set({ loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  }
}));
