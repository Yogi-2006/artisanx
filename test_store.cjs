const { create } = require('zustand/vanilla');

const useStore = create((set, get) => ({
    pricingData: {
      laborHours: 0, 
      finalPrice: 0, 
      finalPriceBasis: 'cost_floor'
    },
    setPricingData: (pricingData) => set((state) => ({ pricingData: { ...state.pricingData, ...pricingData } })),
    fetchMarketData: () => {
        const marketData = {
            source: 'live_search',
        };
        set((s) => ({
            pricingData: { ...s.pricingData, marketData }
        }));
    }
}));

const store = useStore;
console.log('Initial:', store.getState().pricingData);
store.getState().fetchMarketData();
console.log('After fetch:', store.getState().pricingData);
store.getState().setPricingData({ finalPrice: 100 });
console.log('After effect:', store.getState().pricingData);
