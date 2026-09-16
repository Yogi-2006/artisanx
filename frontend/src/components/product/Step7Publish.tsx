import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { useProductStore } from '../../stores/productStore';
import api from '../../lib/api';
import ReadinessScore from './ReadinessScore';
import { Button } from '../ui/Button';
import ProductPassport from './ProductPassport';
import { useAuthStore } from '../../stores/authStore';

const Step7Publish = ({ t }: { t: any }) => {
    const { photos, catalogueData, pricingData, setStep, saveDraft, publishProduct, draftId } = useProductStore();
    const navigate = useNavigate();
    const [isPublishing, setIsPublishing] = useState(false);
    const [success, setSuccess] = useState(false);
    
    const [readiness, setReadiness] = useState<any>(null);
    const [loadingReadiness, setLoadingReadiness] = useState(true);
    const [artisanProfile, setArtisanProfile] = useState<any>(null);
    const { user } = useAuthStore();

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
                
                try {
                    const profileRes = await api.get('/artisans/me');
                    setArtisanProfile(profileRes.data);
                } catch (e) {
                    console.log("No artisan profile found");
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
            navigate('/artisan');
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
        if (field === 'verification') {
            navigate('/artisan/profile');
            return;
        }
        
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
            care_instructions: 3
        };
        const targetStep = stepMapping[field] || 3;
        setStep(targetStep);
    };

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center bg-surface-container-lowest rounded-3xl border border-outline-variant/30 mt-4 shadow-sm" data-guide-id="publish-success">
                <div className="relative mb-6">
                    <div className="absolute inset-0 bg-secondary rounded-full animate-ping opacity-40"></div>
                    <CheckCircle className="w-24 h-24 text-secondary relative z-10 bg-surface-container-lowest rounded-full" />
                </div>
                <h2 className="text-2xl font-bold text-on-surface mb-2">{t.successMsg || 'Product Published!'}</h2>
                <p className="text-on-surface-variant max-w-[250px] mx-auto text-sm">
                    Your product is now live on the marketplace. Returning to dashboard...
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2 mt-2">
                <div className="flex items-center gap-2 px-1">
                    <span className="material-symbols-outlined text-[24px] text-primary">verified_user</span>
                    <h2 className="text-xl font-bold text-on-surface">{t.publishTitle || 'Review & Publish'}</h2>
                </div>
                <p className="text-sm text-on-surface-variant px-1 mb-2">
                    Ensure your product meets quality standards before publishing.
                </p>
            </div>
            
            <div data-guide-id="readiness-score">
                {loadingReadiness ? (
                    <div className="py-8 flex justify-center"><span className="material-symbols-outlined animate-spin text-primary text-[32px]">progress_activity</span></div>
                ) : readiness ? (
                    <ReadinessScore 
                        score={readiness.total_score} 
                        missingFields={readiness.missing_fields} 
                        onFixItem={handleFixItem} 
                    />
                ) : (
                    <div className="bg-error-container text-on-error-container p-4 rounded-xl text-sm font-medium">Failed to calculate readiness score.</div>
                )}
            </div>

            <div className="mt-4">
                <h3 className="text-[11px] font-bold text-outline uppercase tracking-wider mb-2 px-1">Product Passport Preview</h3>
                <div className="border-[4px] border-surface-container-highest rounded-[36px] overflow-hidden shadow-lg relative">
                    <div className="absolute top-0 inset-x-0 h-6 bg-surface-container-highest z-10 flex justify-center items-center">
                        <div className="w-16 h-1.5 bg-outline-variant/30 rounded-full"></div>
                    </div>
                    <div className="pt-6 bg-surface max-h-[600px] overflow-y-auto no-scrollbar">
                        <ProductPassport 
                            passportData={{
                                title: catalogueData?.title || 'Product Title',
                                images: photos.length > 0 ? photos : [{ image_url: 'https://via.placeholder.com/400x400?text=No+Photo', is_main: true }],
                                artisan_name: artisanProfile?.user?.display_name || user?.display_name || 'Artisan Name',
                                artisan_story: artisanProfile?.bio || 'Artisan story will appear here once you complete your profile.',
                                craft_location: artisanProfile?.location_city || 'Location',
                                materials: catalogueData?.materials || 'N/A',
                                care_instructions: catalogueData?.care_instructions || '',
                                price: pricingData.finalPrice || 0,
                                moq: catalogueData?.moq ? parseInt(String(catalogueData.moq)) : undefined,
                                lead_time: catalogueData?.lead_time_days ? parseInt(String(catalogueData.lead_time_days)) : undefined,
                                stock: catalogueData?.stock_quantity ? parseInt(String(catalogueData.stock_quantity)) : undefined,
                                customisation_available: true,
                                verification_status: artisanProfile?.verification_status || 'unverified'
                            }}
                            qrCodeUrl="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=preview"
                            shareableUrl="#"
                        />
                    </div>
                </div>
            </div>

            <div className="mt-4 flex flex-col gap-3">
                <Button 
                    data-guide-id="publish-button"
                    onClick={handlePublish}
                    disabled={!readiness?.is_publishable || isPublishing || loadingReadiness}
                    fullWidth
                    size="lg"
                    className="h-14 text-base"
                >
                    {isPublishing ? (
                        <span className="flex items-center gap-2">
                            <span className="material-symbols-outlined animate-spin">progress_activity</span>
                            Publishing...
                        </span>
                    ) : (
                        <><span className="material-symbols-outlined mr-2">rocket_launch</span> {t.publish || 'Publish Product'}</>
                    )}
                </Button>
                <Button 
                    variant="outline"
                    onClick={async () => { await saveDraft(); navigate('/artisan'); }}
                    disabled={isPublishing}
                    fullWidth
                    className="h-14 bg-surface-container-lowest text-base border-outline-variant/50"
                >
                    {t.saveDraft || 'Save as Draft & Exit'}
                </Button>
            </div>
            
            <div className="flex justify-center mt-2">
                <Button variant="ghost" onClick={() => setStep(6)} className="px-6">{t.back || 'Back to Inventory'}</Button>
            </div>
        </div>
    );
};
export default Step7Publish;
