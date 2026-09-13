import { useEffect, useState } from 'react';
import { useProductStore } from '../../stores/productStore';
import { Sparkles, ExternalLink, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Step5Pricing = ({ t, isRTL }: { t: any, isRTL: boolean }) => {
  const { t: tGlobal } = useTranslation();
    const { materialsData, pricingData, setPricingData, setStep, saveDraft, fetchMarketData } = useProductStore();
    const [fetchingMarket, setFetchingMarket] = useState(false);
    
    const materialCost = materialsData.reduce((sum, m) => sum + (m.quantity * m.cost), 0);
    const laborCost = pricingData.laborHours * pricingData.laborRate;
    const baseCost = materialCost + laborCost + pricingData.packagingCost + pricingData.overheadCost + pricingData.logisticsCost;
    
    const profitAmount = baseCost * (pricingData.profitMargin / 100);
    const minSafePrice = baseCost * 1.1;
    const suggestedPrice = baseCost + profitAmount;
    
    const recommendedPrice = pricingData.marketData?.recommended_final_price || suggestedPrice;

    useEffect(() => {
        // Only fetch if not already present or unavailable
        if (!pricingData.marketData) {
            setFetchingMarket(true);
            fetchMarketData().finally(() => setFetchingMarket(false));
        }
    }, []);

    useEffect(() => {
        if (pricingData.finalPrice === 0 || pricingData.finalPriceBasis === 'cost_floor' || pricingData.finalPriceBasis === 'market_estimate') {
            if (pricingData.finalPriceBasis === 'cost_floor') {
                setPricingData({ finalPrice: suggestedPrice });
            } else if (pricingData.finalPriceBasis === 'market_estimate' && pricingData.marketData?.source === 'live_search') {
                setPricingData({ finalPrice: recommendedPrice });
            } else if (pricingData.finalPrice === 0) {
                 setPricingData({ finalPrice: suggestedPrice });
            }
        }
    }, [suggestedPrice, recommendedPrice, pricingData.finalPriceBasis]);

    const handleChange = (field: string, val: string) => {
  
        setPricingData({ [field]: parseFloat(val) || 0 });
    };

    const handleBasisChange = (basis: string) => {
  
        setPricingData({ finalPriceBasis: basis });
    };

    return (
        <div className="flex flex-col gap-6" data-guide-id="fair-price-section">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-stone-800">{t.pricingTitle}</h2>
                <button 
                    onClick={() => { setFetchingMarket(true); fetchMarketData().finally(() => setFetchingMarket(false)); }}
                    className="flex items-center gap-2 text-sm text-brand-dark font-bold hover:text-brand-dark bg-brand-neon px-3 py-1.5 rounded-full"
                    disabled={fetchingMarket}
                >
                    <RefreshCw className={`w-4 h-4 ${fetchingMarket ? 'animate-spin' : ''}`} />
                    {fetchingMarket ? 'Analyzing Market...' : 'Refresh Market Data'}
                </button>
            </div>
            
            <div className="bg-brand-bg p-4 rounded-xl border border-stone-200 grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-bold text-stone-500 uppercase">{t.runningTotal}</label>
                    <div className="text-lg font-medium text-stone-800">₹{materialCost.toFixed(2)}</div>
                </div>
                <div>
                    <label className="text-xs font-bold text-stone-500 uppercase">{t.laborHours}</label>
                    <input 
                        type="number" 
                        value={pricingData.laborHours}
                        onChange={(e) => handleChange('laborHours', e.target.value)}
                        className="w-full mt-1 p-2 rounded-2xl border border-stone-300"
                    />
                </div>
                <div>
                    <label className="text-xs font-bold text-stone-500 uppercase">{t.laborRate}</label>
                    <input 
                        type="number" 
                        value={pricingData.laborRate}
                        onChange={(e) => handleChange('laborRate', e.target.value)}
                        className="w-full mt-1 p-2 rounded-2xl border border-stone-300"
                    />
                </div>
                <div>
                    <label className="text-xs font-bold text-stone-500 uppercase">{t.packaging}</label>
                    <input 
                        type="number" 
                        value={pricingData.packagingCost}
                        onChange={(e) => handleChange('packagingCost', e.target.value)}
                        className="w-full mt-1 p-2 rounded-2xl border border-stone-300"
                    />
                </div>
                <div>
                    <label className="text-xs font-bold text-stone-500 uppercase">{t.overhead}</label>
                    <input 
                        type="number" 
                        value={pricingData.overheadCost}
                        onChange={(e) => handleChange('overheadCost', e.target.value)}
                        className="w-full mt-1 p-2 rounded-2xl border border-stone-300"
                    />
                </div>
                <div>
                    <label className="text-xs font-bold text-stone-500 uppercase">{t.logistics}</label>
                    <input 
                        type="number" 
                        value={pricingData.logisticsCost}
                        onChange={(e) => handleChange('logisticsCost', e.target.value)}
                        className="w-full mt-1 p-2 rounded-2xl border border-stone-300"
                    />
                </div>
            </div>

            <div className="mt-2">
                <div className="flex justify-between items-end mb-2">
                    <label className="text-sm font-bold text-stone-700">{t.profitMargin}</label>
                    <span className="text-lg font-bold text-brand-dark">{pricingData.profitMargin}%</span>
                </div>
                <input 
                    type="range" min="0" max="100" 
                    value={pricingData.profitMargin}
                    onChange={(e) => handleChange('profitMargin', e.target.value)}
                    className="w-full h-2 bg-stone-200 rounded-2xl appearance-none cursor-pointer accent-amber-600"
                />
            </div>

            <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-sm">
                <h3 className="font-bold text-stone-800 mb-3 text-sm uppercase tracking-wide">Production Cost Analysis</h3>
                <div className="flex justify-between items-center mb-2">
                    <span className="text-stone-500">{t.minSafePrice}</span>
                    <span className="font-medium text-stone-800">₹{minSafePrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center mb-4">
                    <span className="text-stone-800 font-bold">{t.suggestedPrice} (Cost Floor)</span>
                    <span className="text-lg font-bold text-brand-dark">₹{suggestedPrice.toFixed(2)}</span>
                </div>
                
                {suggestedPrice > 0 && (
                    <div className="w-full h-3 rounded-full flex overflow-hidden mb-2">
                        <div style={{width: `${(materialCost/suggestedPrice)*100}%`}} className="bg-blue-400 h-full"></div>
                        <div style={{width: `${(laborCost/suggestedPrice)*100}%`}} className="bg-purple-400 h-full"></div>
                        <div style={{width: `${((pricingData.packagingCost+pricingData.overheadCost+pricingData.logisticsCost)/suggestedPrice)*100}%`}} className="bg-stone-400 h-full"></div>
                        <div style={{width: `${(profitAmount/suggestedPrice)*100}%`}} className="bg-green-400 h-full"></div>
                    </div>
                )}
                <div className="flex flex-wrap gap-2 text-xs text-stone-500 justify-center mt-2">
                    <div className="flex items-center gap-1"><div className="w-2 h-2 bg-blue-400 rounded-full"></div>{tGlobal('products.materials')}</div>
                    <div className="flex items-center gap-1"><div className="w-2 h-2 bg-purple-400 rounded-full"></div>{tGlobal('products.labor')}</div>
                    <div className="flex items-center gap-1"><div className="w-2 h-2 bg-stone-400 rounded-full"></div>Other</div>
                    <div className="flex items-center gap-1"><div className="w-2 h-2 bg-green-400 rounded-full"></div>Profit</div>
                </div>
            </div>

            {/* Market Comparison Card */}
            {pricingData.marketData?.source === 'live_search' && (
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl p-5 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="font-bold text-indigo-900 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-brand-dark" /> Market Comparison
                        </h3>
                        <div className="text-right">
                            <div className="text-xs text-brand-dark/70 font-bold uppercase tracking-wider">Median Price</div>
                            <div className="text-2xl font-black text-indigo-700">₹{pricingData.marketData.price_median?.toFixed(2)}</div>
                        </div>
                    </div>
                    
                    <div className="bg-white/60 p-3 rounded-2xl border border-indigo-100/50 mb-4">
                        <p className="text-sm text-indigo-900/80 leading-relaxed">
                            {pricingData.marketData.reasoning}
                        </p>
                    </div>

                    <div className="space-y-2 mb-4">
                        <div className="text-xs font-bold text-indigo-800/60 uppercase">Real Sample Listings</div>
                        {(pricingData.marketData.listings || []).slice(0, 3).map((l, idx) => (
                            <a key={idx} href={l.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between bg-white p-2.5 rounded-2xl border border-indigo-50 hover:border-indigo-200 transition-colors group">
                                <div className="flex-1 truncate pr-3">
                                    <div className="text-sm font-medium text-stone-800 truncate">{l.title}</div>
                                    <div className="text-xs text-stone-500">{l.source}</div>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    <span className="font-bold text-stone-800">₹{l.price}</span>
                                    <ExternalLink className="w-3.5 h-3.5 text-stone-400 group-hover:text-indigo-500" />
                                </div>
                            </a>
                        ))}
                    </div>
                    <div className="text-[10px] text-center text-indigo-400">
                        Based on live marketplace listings found on Amazon India, Flipkart and Amazon Karigar-related results.
                    </div>
                </div>
            )}

            <div className="bg-white border border-stone-200 p-5 rounded-xl shadow-sm">
                <label className="text-sm font-bold text-stone-800 block mb-4">Final Pricing Decision</label>
                
                <div className="space-y-3 mb-6">
                    <label className={`flex items-center p-3 rounded-2xl border cursor-pointer transition-all ${pricingData.finalPriceBasis === 'cost_floor' ? 'bg-brand-neon border-brand-dark' : 'border-stone-200 hover:bg-brand-bg'}`}>
                        <input type="radio" name="priceBasis" checked={pricingData.finalPriceBasis === 'cost_floor'} onChange={() => handleBasisChange('cost_floor')} className="text-brand-dark focus:ring-brand-dark" />
                        <div className="ml-3">
                            <div className="text-sm font-bold text-stone-800">Use Fair Price Floor</div>
                            <div className="text-xs text-stone-500">Based entirely on your costs + margin (₹{suggestedPrice.toFixed(2)})</div>
                        </div>
                    </label>

                    {pricingData.marketData?.source === 'live_search' && (
                        <label className={`flex items-center p-3 rounded-2xl border cursor-pointer transition-all ${pricingData.finalPriceBasis === 'market_estimate' ? 'bg-indigo-50 border-indigo-500' : 'border-stone-200 hover:bg-brand-bg'}`}>
                            <input type="radio" name="priceBasis" checked={pricingData.finalPriceBasis === 'market_estimate'} onChange={() => handleBasisChange('market_estimate')} className="text-brand-dark focus:ring-indigo-500" />
                            <div className="ml-3">
                                <div className="text-sm font-bold text-stone-800">Use Market Estimate</div>
                                <div className="text-xs text-stone-500">Market median or cost floor, whichever is higher (₹{recommendedPrice.toFixed(2)})</div>
                            </div>
                        </label>
                    )}

                    <label className={`flex items-center p-3 rounded-2xl border cursor-pointer transition-all ${pricingData.finalPriceBasis === 'manual' ? 'bg-stone-100 border-stone-400' : 'border-stone-200 hover:bg-brand-bg'}`}>
                        <input type="radio" name="priceBasis" checked={pricingData.finalPriceBasis === 'manual'} onChange={() => handleBasisChange('manual')} className="text-stone-600 focus:ring-stone-500" />
                        <div className="ml-3">
                            <div className="text-sm font-bold text-stone-800">Set my own price</div>
                            <div className="text-xs text-stone-500">Manually override and set your final retail price</div>
                        </div>
                    </label>
                </div>

                <div className="relative">
                    <span className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-4' : 'left-4'} text-stone-500 font-bold`}>₹</span>
                    <input 
                        type="number" 
                        value={pricingData.finalPrice}
                        onChange={(e) => {
                            handleChange('finalPrice', e.target.value);
                            handleBasisChange('manual'); // Auto switch to manual if they type
                        }}
                        className={`w-full text-2xl font-bold text-brand-dark border-2 border-amber-300 rounded-xl py-3 ${isRTL ? 'pr-10' : 'pl-10'} focus:border-brand-dark focus:ring-0 outline-none`}
                    />
                </div>
            </div>

            <div className="mt-4 flex justify-between">
                <button onClick={() => setStep(4)} className="text-stone-500 font-medium px-4">{t.back}</button>
                <button 
                    onClick={async () => { await saveDraft(); setStep(6); }}
                    className="bg-brand-dark text-white px-8 py-3 rounded-full font-medium shadow-lg hover:bg-black"
                >
                    {t.confirmPrice}
                </button>
            </div>
        </div>
    );
};
export default Step5Pricing;
