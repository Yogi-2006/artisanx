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
import Step6Inventory from '../../components/product/Step6Inventory';
import Step7Publish from '../../components/product/Step7Publish';

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
    const [reviewStatus, setReviewStatus] = useState('');
    const [reviewNotes, setReviewNotes] = useState('');
    const [reviewFlags, setReviewFlags] = useState<string[]>([]);

    useEffect(() => {
        if (id) {
            const init = async () => {
                await loadProduct(id);
                try {
                    const { data } = await api.get(`/products/${id}`);
                    setStatus(data.status);
                    setReviewStatus(data.review_status || '');
                    setReviewNotes(data.review_notes || '');
                    setReviewFlags(data.review_flags || []);
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
            case 4: return <Step4Materials t={t} />;
            case 5: return <Step5Pricing t={t} isRTL={isRTL} />;
            case 6: return <Step6Inventory t={t} />;
            case 7: return <Step7Publish t={t} />;
            default: return <Step1Photo t={t} />;
        }
    };

    if (loading) {
        return <div className="min-h-screen bg-surface flex items-center justify-center text-on-surface-variant font-medium">{tGlobal('common.loading')}</div>;
    }

    return (
        <div className="w-full min-h-screen bg-surface flex flex-col relative" dir={isRTL ? 'rtl' : 'ltr'}>
            <header className="fixed top-0 inset-x-0 mobile-shell-width z-50 pt-safe bg-surface/95 backdrop-blur-md border-b border-outline-variant/20">
                <div className="h-14 px-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => navigate('/artisan/products')}
                            className="w-10 h-10 flex items-center justify-center -ml-2 text-on-surface rounded-full hover:bg-surface-container transition-colors"
                        >
                            <span className="material-symbols-outlined text-[24px]">close</span>
                        </button>
                        <div className="flex flex-col ml-1">
                            <h1 className="font-bold text-lg text-on-surface tracking-tight truncate leading-tight">
                                {tGlobal('products.update')}
                            </h1>
                            {status === 'published' && (
                                <span className="text-[10px] text-tertiary font-bold uppercase tracking-wider">{tGlobal('products.published')}</span>
                            )}
                        </div>
                    </div>
                    {status === 'published' && (
                        <button onClick={handleUnpublish} className="px-3 py-1.5 text-xs font-bold text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-full transition-colors">
                            {tGlobal('products.unpublish')}
                        </button>
                    )}
                </div>
            </header>

            <main className="flex-1 flex flex-col relative w-full max-w-lg mx-auto pt-16 pb-safe bg-surface px-5">
                <div className="flex flex-col w-full pb-10 pt-4">
                    
                    {/* Visual Step Progress Track */}
                    <section className="w-full pb-6">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs text-primary font-bold tracking-wider uppercase">Step {currentStep} of 7</span>
                        </div>
                        
                        <div className="flex gap-1.5 items-center w-full">
                            {[1, 2, 3, 4, 5, 6, 7].map((stepId) => {
                                const isCompleted = stepId < currentStep;
                                const isActive = stepId === currentStep;
                                
                                return (
                                    <div key={stepId} className={`flex-1 h-2 rounded-full overflow-hidden transition-all duration-300 ${isCompleted ? 'bg-primary' : isActive ? 'bg-primary' : 'bg-surface-container-high'}`}>
                                        {isActive && <div className="w-full h-full bg-white/40 animate-pulse"></div>}
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {reviewStatus === 'needs_changes' && (
                        <div className="mb-6 p-4 bg-error-container text-on-error-container border border-error/20 rounded-[20px] shadow-sm">
                            <h3 className="font-bold flex items-center gap-2 mb-2">
                                <span className="material-symbols-outlined text-xl">error</span> 
                                {tGlobal('facilitator.needs_changes') || 'Correction Requested'}
                            </h3>
                            {reviewNotes && <p className="text-sm opacity-90 mb-3">{reviewNotes}</p>}
                            {reviewFlags.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mb-2">
                                    {reviewFlags.map(f => (
                                        <span key={f} className="text-[10px] font-bold px-2 py-1 bg-surface/50 rounded text-on-error-container border border-error/10">
                                            {tGlobal(`facilitator.flag_${f}`) || f}
                                        </span>
                                    ))}
                                </div>
                            )}
                            <div className="mt-3 text-xs opacity-70 italic font-medium">
                                Editing any field will automatically mark this product as resubmitted for review.
                            </div>
                        </div>
                    )}

                    <div data-guide-id={`product-edit-step-${currentStep}`}>
                        {renderStep()}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ProductEdit;
