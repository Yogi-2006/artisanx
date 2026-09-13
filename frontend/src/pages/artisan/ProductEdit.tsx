import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useProductStore } from '../../stores/productStore';
import { pcTranslations } from '../../i18n/productCreate';
import { useTranslation } from 'react-i18next';
import api from '../../lib/api';

import Step1Photo from '../../components/product/Step1Photo';
import Step2Voice from '../../components/product/Step2Voice';
import Step3ReviewAI from '../../components/product/Step3ReviewAI';
import Step4Materials from '../../components/product/Step4Materials';
import Step5Pricing from '../../components/product/Step5Pricing';
import Step6Publish from '../../components/product/Step6Publish';

const ProductEdit = () => {
    const { id } = useParams<{id: string}>();
    const navigate = useNavigate();
    const { t: tGlobal } = useTranslation();
    const { language } = useAuthStore();
    const lang = language || 'en';
    const t = pcTranslations[lang] || pcTranslations['en'];
    const { currentStep, loadProduct, reset } = useProductStore();
    const isRTL = lang === 'ur';
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('draft');

    useEffect(() => {
        if (id) {
            const init = async () => {
                await loadProduct(id);
                try {
                    const { data } = await api.get(`/products/${id}`);
                    setStatus(data.status);
                } catch (e) {
                    console.error(e);
                }
                setLoading(false);
            };
            init();
        }
        return () => reset();
    }, [id, loadProduct, reset]);

    const handleUnpublish = async () => {
        if (!id) return;
        try {
            await api.put(`/products/${id}/unpublish`);
            setStatus('draft');
        } catch (e) {
            console.error(e);
        }
    };

    const renderStep = () => {
        switch(currentStep) {
            case 1: return <Step1Photo t={t} />;
            case 2: return <Step2Voice t={t} lang={lang} />;
            case 3: return <Step3ReviewAI t={t} />;
            case 4: return <Step4Materials t={t} isRTL={isRTL} />;
            case 5: return <Step5Pricing t={t} isRTL={isRTL} />;
            case 6: return <Step6Publish t={t} />;
            default: return <Step1Photo t={t} />;
        }
    };

    if (loading) {
        return <div className="min-h-screen bg-brand-bg flex items-center justify-center">{tGlobal('common.loading')}</div>;
    }

    return (
        <div className={`w-full pb-20 relative`} dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="w-full bg-white relative">
                <div className="sticky top-0 bg-white border-b border-stone-200 z-10 p-4">
                    <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-bold text-stone-800">{tGlobal('products.update')}</h1>
                            {status === 'published' && (
                                <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">{tGlobal('products.published')}</span>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {status === 'published' && (
                                <button onClick={handleUnpublish} className="text-xs font-bold text-stone-500 hover:text-stone-700 underline">
                                    {tGlobal('products.unpublish')}
                                </button>
                            )}
                            <button onClick={() => navigate('/artisan/products')} className="text-stone-500 hover:text-stone-700 ml-2">✕</button>
                        </div>
                    </div>
                    <div className="flex gap-1 justify-between">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className={`h-2 flex-1 rounded-full ${currentStep >= i ? 'bg-brand-dark' : 'bg-stone-200'}`} />
                        ))}
                    </div>
                </div>

                <div className="p-4">
                    {renderStep()}
                </div>
            </div>
        </div>
    );
};

export default ProductEdit;
