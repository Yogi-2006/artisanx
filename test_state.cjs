let state = {
    pricingData: {
      laborHours: 0,
      finalPrice: 0,
      finalPriceBasis: 'cost_floor'
    }
};

const setPricingData = (payload) => {
    state = {
        pricingData: { ...state.pricingData, ...payload }
    };
};

const fetchMarketData = () => {
    const marketData = {
        source: 'live_search'
    };
    state = {
        pricingData: { ...state.pricingData, marketData }
    };
};

fetchMarketData();
console.log('After fetch:', state.pricingData.marketData?.source);
setPricingData({ finalPrice: 100 });
console.log('After effect:', state.pricingData.marketData?.source);
