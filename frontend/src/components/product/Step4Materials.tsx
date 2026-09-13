import { useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useProductStore } from '../../stores/productStore';

const Step4Materials = ({ t, isRTL }: { t: any, isRTL: boolean }) => {
    const { materialsData, setMaterialsData, catalogueData, setStep, saveDraft } = useProductStore();
    
    // Auto-populate from AI if empty
    useEffect(() => {
        if (materialsData.length === 0 && catalogueData?.materials) {
            const aiMaterials = catalogueData.materials.map((m: string, i: number) => ({
                id: `ai-${i}`,
                name: m,
                quantity: 1,
                unit: 'piece',
                cost: 0
            }));
            setMaterialsData(aiMaterials);
        }
    }, [catalogueData, materialsData.length, setMaterialsData]);

    const addMaterial = () => {
        setMaterialsData([...materialsData, { id: `custom-${Date.now()}`, name: '', quantity: 1, unit: 'piece', cost: 0 }]);
    };

    const updateMaterial = (id: string, field: string, value: any) => {
        setMaterialsData(materialsData.map(m => m.id === id ? { ...m, [field]: value } : m));
    };

    const removeMaterial = (id: string) => {
        setMaterialsData(materialsData.filter(m => m.id !== id));
    };

    const total = materialsData.reduce((sum, m) => sum + (m.quantity * m.cost), 0);

    return (
        <div className="flex flex-col gap-6" data-guide-id="material-checklist">
            <h2 className="text-2xl font-bold text-stone-800">{t.materialsTitle}</h2>
            
            <div className="space-y-4">
                {materialsData.map((mat) => (
                    <div key={mat.id} className="bg-white border border-stone-200 rounded-xl p-4 shadow-sm relative">
                        <button onClick={() => removeMaterial(mat.id)} className={`absolute top-2 ${isRTL ? 'left-2' : 'right-2'} text-stone-400 hover:text-red-500`}><Trash2 className="w-4 h-4" /></button>
                        
                        <div className="grid grid-cols-2 gap-3 mt-2">
                            <div className="col-span-2">
                                <label className="text-xs text-stone-500 uppercase">{t.name}</label>
                                <input 
                                    type="text" 
                                    value={mat.name}
                                    onChange={(e) => updateMaterial(mat.id, 'name', e.target.value)}
                                    className="w-full border-b border-stone-300 py-1 focus:border-brand-dark outline-none bg-transparent"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-stone-500 uppercase">{t.quantity}</label>
                                <input 
                                    type="number" 
                                    value={mat.quantity}
                                    onChange={(e) => updateMaterial(mat.id, 'quantity', parseFloat(e.target.value) || 0)}
                                    className="w-full border-b border-stone-300 py-1 focus:border-brand-dark outline-none bg-transparent"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-stone-500 uppercase">{t.unit}</label>
                                <input 
                                    type="text" 
                                    value={mat.unit}
                                    onChange={(e) => updateMaterial(mat.id, 'unit', e.target.value)}
                                    className="w-full border-b border-stone-300 py-1 focus:border-brand-dark outline-none bg-transparent"
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="text-xs text-stone-500 uppercase">{t.cost}</label>
                                <input 
                                    type="number" 
                                    value={mat.cost}
                                    onChange={(e) => updateMaterial(mat.id, 'cost', parseFloat(e.target.value) || 0)}
                                    className="w-full border-b border-stone-300 py-1 focus:border-brand-dark outline-none bg-transparent font-medium"
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <button 
                onClick={addMaterial}
                className="w-full py-3 border-2 border-dashed border-stone-300 rounded-xl text-stone-600 font-medium hover:bg-brand-bg flex items-center justify-center gap-2"
            >
                <Plus className="w-5 h-5" /> {t.addCustomMaterial}
            </button>

            <div className="bg-brand-neon border border-brand-dark/20 rounded-xl p-4 flex justify-between items-center mt-4">
                <span className="font-bold text-brand-dark">{t.runningTotal}</span>
                <span className="text-xl font-bold text-brand-dark">₹{total.toFixed(2)}</span>
            </div>

            <div className="mt-8 flex justify-between">
                <button onClick={() => setStep(3)} className="text-stone-500 font-medium px-4">{t.back}</button>
                <button 
                    onClick={async () => { await saveDraft(); setStep(5); }}
                    className="bg-brand-dark text-white px-8 py-3 rounded-full font-medium shadow-lg hover:bg-black"
                >
                    {t.next}
                </button>
            </div>
        </div>
    );
};
export default Step4Materials;
