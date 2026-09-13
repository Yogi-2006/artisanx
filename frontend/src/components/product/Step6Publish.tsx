import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { useProductStore } from '../../stores/productStore';
import api from '../../lib/api';
import ReadinessScore from './ReadinessScore';

const Step6Publish = ({ t }: { t: any }) => {
    const { photos, catalogueData, pricingData, setStep, saveDraft, publishProduct, draftId } = useProductStore();
    const navigate = useNavigate();
    const [isPublishing, setIsPublishing] = useState(false);
    const [success, setSuccess] = useState(false);
    
    const [readiness, setReadiness] = useState<any>(null);
    const [loadingReadiness, setLoadingReadiness] = useState(true);

    useEffect(() => {
        const initReadiness = async () => {
            try {
                if (!draftId) {
                    await saveDraft();
                }
                const currentDraftId = useProductStore.getState().draftId;
                if (currentDraftId) {
                    const { data } = await api.get(`/products/${currentDraftId}/readiness`);
                    setReadiness(data);
                }
            } catch (error) {
                console.error("Failed to fetch readiness", error);
            } finally {
                setLoadingReadiness(false);
            }
        };
        initReadiness();
    }, [draftId, saveDraft]);

    const handlePublish = async () => {
        setIsPublishing(true);
        try {
            // Feature guard: verify profile exists before publishing/passport generation
            try {
                await api.get('/artisans/me');
            } catch (err) {
                alert("Complete your artisan profile before generating a Product Passport.");
                navigate('/artisan/profile');
                return;
            }

            await publishProduct();
            setSuccess(true);
            setTimeout(() => {
                navigate('/artisan');
            }, 2000);
        } catch (error: any) {
            console.error(error);
            if (error.response?.data?.detail?.message === "Product not ready for publishing") {
                alert("Product is not ready for publishing. Ensure score is >= 70.");
                // Update readiness dynamically if failed on server
                setReadiness(error.response.data.detail.readiness);
            } else {
                alert("Failed to publish product.");
            }
        } finally {
            setIsPublishing(false);
        }
    };

    const handleFixItem = (field: string) => {
        const stepMapping: Record<string, number> = {
            main_image: 1,
            additional_images: 1,
            title: 3,
            description: 3,
            category: 3,
            tags: 3,
            materials: 4,
            price: 5,
            stock_quantity: 5,
            moq: 5,
            lead_time_days: 5,
            dimensions: 3,
            care_instructions: 3,
            verification: 1 // Can't really fix verification in product setup, but it redirects them anyway
        };
        const targetStep = stepMapping[field] || 3;
        setStep(targetStep);
    };

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center" data-guide-id="publish-success">
                <CheckCircle className="w-20 h-20 text-green-500 mb-4 animate-bounce" />
                <h2 className="text-2xl font-bold text-stone-800">{t.successMsg || 'Published successfully!'}</h2>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-bold text-stone-800">{t.publishTitle || 'Review & Publish'}</h2>
            
            <div data-guide-id="readiness-score">
                {loadingReadiness ? (
                    <div className="py-8 flex justify-center"><div className="animate-pulse w-8 h-8 rounded-full bg-stone-200"></div></div>
                ) : readiness ? (
                    <ReadinessScore 
                        score={readiness.total_score} 
                        missingFields={readiness.missing_fields} 
                        onFixItem={handleFixItem} 
                    />
                ) : (
                    <div className="text-red-500 text-sm">Failed to calculate readiness score.</div>
                )}
            </div>

            <div className="bg-brand-bg rounded-2xl overflow-hidden border border-stone-200 mt-2">
                <div className="h-48 bg-stone-200">
                    {photos.length > 0 ? (
                        <img src={photos[0].image_url} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-400">No Photo</div>
                    )}
                </div>
                <div className="p-4">
                    <div className="text-xs font-bold text-brand-dark uppercase mb-1">{catalogueData?.category || 'Category'}</div>
                    <h3 className="text-lg font-bold text-stone-800 line-clamp-1">{catalogueData?.title || 'Product Title'}</h3>
                    <p className="text-sm text-stone-500 line-clamp-2 mt-1">{catalogueData?.description || 'Product description will appear here...'}</p>
                    <div className="mt-4 font-bold text-xl text-stone-800">₹{pricingData.finalPrice.toFixed(2)}</div>
                </div>
            </div>

            <div className="mt-4 flex flex-col gap-3">
                <button 
                    onClick={async () => { await saveDraft(); navigate('/artisan'); }}
                    className="w-full py-3 border-2 border-brand-dark text-brand-dark rounded-full font-bold hover:bg-brand-neon"
                    disabled={isPublishing}
                >
                    {t.saveDraft || 'Save Draft'}
                </button>
                <button 
                    data-guide-id="publish-button"
                    onClick={handlePublish}
                    disabled={!readiness?.is_publishable || isPublishing || loadingReadiness}
                    className="w-full py-3 bg-brand-dark text-white rounded-full font-bold shadow-lg hover:bg-black disabled:opacity-50 transition-all"
                >
                    {isPublishing ? 'Publishing...' : t.publish || 'Publish Product'}
                </button>
            </div>
            
            <div className="flex justify-center mt-2">
                <button onClick={() => setStep(5)} className="text-stone-500 font-medium px-4">{t.back || 'Back'}</button>
            </div>
        </div>
    );
};
export default Step6Publish;
