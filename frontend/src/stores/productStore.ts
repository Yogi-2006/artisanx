import { create } from 'zustand';
import { Product } from '../types/product';

interface ProductState {
    currentProduct: Partial<Product> | null;
    setCurrentProduct: (p: Partial<Product>) => void;
}

export const useProductStore = create<ProductState>((set) => ({
    currentProduct: null,
    setCurrentProduct: (p) => set({ currentProduct: p }),
}));
