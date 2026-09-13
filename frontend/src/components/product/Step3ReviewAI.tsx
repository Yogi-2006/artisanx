import { useState } from 'react';
import { Sparkles, X, Plus } from 'lucide-react';
import { useProductStore } from '../../stores/productStore';
import api from '../../lib/api';
import { useTranslation } from 'react-i18next';

const Step3ReviewAI = ({ t }: { t: any }) => {
  const { t: tGlobal } = useTranslation();
    const { voiceData, catalogueData, setCatalogueData, setStep, saveDraft } = useProductStore();
    const [isLoading, setIsLoading] = useState(false);
    const [newTag, setNewTag] = useState('');

    const generateCatalogue = async () => {
        setIsLoading(true);
        try {
            const { data } = await api.post('/ai/generate-catalogue', {
                transcript: voiceData?.translated_text || ''
            });
            setCatalogueData({
                ...data,
                stock_quantity: catalogueData?.stock_quantity ?? '',
                moq: catalogueData?.moq ?? '',
                lead_time_days: catalogueData?.lead_time_days ?? ''
            });
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddTag = () => {
  
        if (newTag.trim() && catalogueData) {
            setCatalogueData({ ...catalogueData, tags: [...catalogueData.tags, newTag.trim()] });
            setNewTag('');
        }
    };
    
    const removeTag = (idx: number) => {
  
        if (catalogueData) {
            const nt = [...catalogueData.tags];
            nt.splice(idx, 1);
            setCatalogueData({ ...catalogueData, tags: nt });
        }
    };

    if (!catalogueData) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center h-[50vh]">
                <Sparkles className="w-16 h-16 text-brand-dark mb-4" />
                <h3 className="text-xl font-bold text-stone-800 mb-2">Generate Details with AI</h3>
                <p className="text-stone-500 mb-8">We will use your voice transcript to automatically write the product title, description, and tags.</p>
                <button 
                    onClick={generateCatalogue}
                    disabled={isLoading}
                    className="bg-brand-dark text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-black disabled:opacity-50 flex items-center gap-2"
                >
                    {isLoading ? <span className="animate-pulse">Generating...</span> : "Generate Details"}
                </button>
                <div className="mt-8">
                    <button onClick={() => setStep(2)} className="text-stone-500 font-medium px-4">{t.back}</button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6" data-guide-id="review-section">
            <h2 className="text-2xl font-bold text-stone-800">{t.reviewAITitle}</h2>
            
            <div className="space-y-4">
                <div>
                    <label className="text-xs font-bold text-stone-500 uppercase">{tGlobal('products.title')}</label>
                    <input 
                        type="text" 
                        value={catalogueData.title}
                        onChange={(e) => setCatalogueData({...catalogueData, title: e.target.value})}
                        className="w-full mt-1 p-3 rounded-2xl border border-stone-300 focus:border-brand-dark focus:ring-1 focus:ring-brand-dark"
                    />
                </div>
                <div>
                    <label className="text-xs font-bold text-stone-500 uppercase">{tGlobal('products.description')}</label>
                    <textarea 
                        value={catalogueData.description}
                        onChange={(e) => setCatalogueData({...catalogueData, description: e.target.value})}
                        rows={4}
                        className="w-full mt-1 p-3 rounded-2xl border border-stone-300 focus:border-brand-dark focus:ring-1 focus:ring-brand-dark"
                    />
                </div>
                <div>
                    <label className="text-xs font-bold text-stone-500 uppercase">{tGlobal('products.category')}</label>
                    <input 
                        type="text" 
                        value={catalogueData.category}
                        onChange={(e) => setCatalogueData({...catalogueData, category: e.target.value})}
                        className="w-full mt-1 p-3 rounded-2xl border border-stone-300 focus:border-brand-dark focus:ring-1 focus:ring-brand-dark"
                    />
                </div>
                <div>
                    <label className="text-xs font-bold text-stone-500 uppercase">{tGlobal('products.tags')}</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {catalogueData.tags.map((tag, idx) => (
                            <div key={idx} className="flex items-center gap-1 bg-stone-100 px-3 py-1.5 rounded-full text-sm font-medium text-stone-700">
                                {tag}
                                <button onClick={() => removeTag(idx)} className="text-stone-400 hover:text-stone-600"><X className="w-3 h-3" /></button>
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-2 mt-3">
                        <input 
                            type="text" 
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                            placeholder={t.addTag}
                            className="flex-1 p-2 rounded-2xl border border-stone-300 text-sm"
                        />
                        <button onClick={handleAddTag} className="bg-stone-200 p-2 rounded-2xl hover:bg-stone-300"><Plus className="w-5 h-5 text-stone-600" /></button>
                    </div>
                </div>
            </div>
            
            <div className="pt-4 border-t border-stone-200">
                <h3 className="text-lg font-bold text-stone-800 mb-4">Production & Inventory</h3>
                
                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-stone-500 uppercase">Dimensions & Weight</label>
                        <input 
                            type="text" 
                            value={catalogueData.dimensions || ''}
                            onChange={(e) => setCatalogueData({...catalogueData, dimensions: e.target.value})}
                            placeholder="e.g. 30x10cm, 600g"
                            className="w-full mt-1 p-3 rounded-2xl border border-stone-300 focus:border-brand-dark focus:ring-1 focus:ring-brand-dark"
                        />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="text-xs font-bold text-stone-500 uppercase">Stock</label>
                            <input 
                                type="number" 
                                min="0"
                                value={catalogueData.stock_quantity === '' ? '' : catalogueData.stock_quantity}
                                onChange={(e) => setCatalogueData({...catalogueData, stock_quantity: e.target.value === '' ? '' : parseInt(e.target.value)})}
                                className="w-full mt-1 p-3 rounded-2xl border border-stone-300 focus:border-brand-dark focus:ring-1 focus:ring-brand-dark"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-stone-500 uppercase">MOQ</label>
                            <input 
                                type="number" 
                                min="1"
                                value={catalogueData.moq === '' ? '' : catalogueData.moq}
                                onChange={(e) => setCatalogueData({...catalogueData, moq: e.target.value === '' ? '' : parseInt(e.target.value)})}
                                className="w-full mt-1 p-3 rounded-2xl border border-stone-300 focus:border-brand-dark focus:ring-1 focus:ring-brand-dark"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-stone-500 uppercase">Lead Time (Days)</label>
                            <input 
                                type="number" 
                                min="0"
                                value={catalogueData.lead_time_days === '' ? '' : catalogueData.lead_time_days}
                                onChange={(e) => setCatalogueData({...catalogueData, lead_time_days: e.target.value === '' ? '' : parseInt(e.target.value)})}
                                className="w-full mt-1 p-3 rounded-2xl border border-stone-300 focus:border-brand-dark focus:ring-1 focus:ring-brand-dark"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8 flex justify-between">
                <button onClick={() => setStep(2)} className="text-stone-500 font-medium px-4">{t.back}</button>
                <button 
                    onClick={async () => { await saveDraft(); setStep(4); }}
                    className="bg-brand-dark text-white px-8 py-3 rounded-full font-medium shadow-lg hover:bg-black"
                >
                    {t.next}
                </button>
            </div>
        </div>
    );
};
export default Step3ReviewAI;
