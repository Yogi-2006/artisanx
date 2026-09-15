import { create } from 'zustand';
import api from '../lib/api';

export interface DashboardMetrics {
  total_products: number;
  published_products: number;
  new_enquiries: number;
  pending_quotations: number;
  orders: {
    active: number;
    completed: number;
    cancelled: number;
    returned: number;
    total_value: number;
    completion_rate: number;
    cancellation_rate: number;
    on_time_rate: number;
  };
  recent_activity: any[];
}

interface DashboardState {
  metrics: DashboardMetrics | null;
  loading: boolean;
  error: string | null;
  fetchMetrics: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  metrics: null,
  loading: false,
  error: null,
  fetchMetrics: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get('/dashboard/artisan');
      set({ metrics: res.data, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  }
}));
