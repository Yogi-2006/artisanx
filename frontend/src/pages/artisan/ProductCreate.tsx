import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useProductStore } from '../../stores/productStore';
import { pcTranslations } from '../../i18n/productCreate';

import Step1Photo from '../../components/product/Step1Photo';
import Step2Voice from '../../components/product/Step2Voice';
import Step3ReviewAI from '../../components/product/Step3ReviewAI';
import Step4Materials from '../../components/product/Step4Materials';
import Step5Pricing from '../../components/product/Step5Pricing';
import Step6Publish from '../../components/product/Step6Publish';
import ShowMeFab from '../../components/guide-hand/ShowMeFab';
import { useState } from 'react';
import type { GuidanceWorkflow } from '../../types/guidance';
import { useGuidanceStore } from '../../stores/guidanceStore';
import api from '../../lib/api';

const ProductCreate = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const lang = user?.preferred_language || 'en';
    const t = pcTranslations[lang] || pcTranslations['en'];
    const { currentStep, reset } = useProductStore();
    const isRTL = lang === 'ur';
    const [fetchedWorkflow, setFetchedWorkflow] = useState<GuidanceWorkflow | null>(null);

    useEffect(() => {
        let mounted = true;
        const fetchGuidance = async () => {
            const { guidanceLevel, isActive, completedWorkflows, startWorkflow } = useGuidanceStore.getState();
            if (guidanceLevel === 'off') return;
            try {
                const res = await api.get('/guidance/current?screen=product_create');
                if (res.data && mounted) {
                    setFetchedWorkflow(res.data);
                    if (!isActive && !completedWorkflows.includes(res.data.id)) {
                        startWorkflow(res.data);
                    }
                }
            } catch (e) {
                console.error("Guidance fetch error:", e);
            }
        };
        fetchGuidance();
        return () => { mounted = false; };
    }, []);

    useEffect(() => {
        return () => reset(); // Clean up on unmount
    }, [reset]);

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

    return (
        <div className={`w-full pb-20 relative`} dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="w-full bg-white relative">
                {/* Header with Stepper */}
                <div className="sticky top-0 bg-white border-b border-stone-200 z-10 p-4">
                    <div className="flex justify-between items-center mb-2">
                        <h1 className="text-xl font-bold text-stone-800">Product Setup</h1>
                        <button onClick={() => navigate('/artisan')} className="text-stone-500 hover:text-stone-700">✕</button>
                    </div>
                    {/* Stepper Dots */}
                    <div className="flex gap-1 justify-between">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className={`h-2 flex-1 rounded-full ${currentStep >= i ? 'bg-brand-dark' : 'bg-stone-200'}`} />
                        ))}
                    </div>
                </div>

                <div className="p-4" data-guide-id={`product-create-step-${currentStep}`}>
                    {renderStep()}
                </div>
                
                {/* Real Workflow for Product Creation */}
                {fetchedWorkflow && (
                    <ShowMeFab workflow={fetchedWorkflow} />
                )}

            </div>
        </div>
    );
};

export default ProductCreate;
