import React, { useRef, useState } from 'react';
import { Camera, Image as ImageIcon, Sparkles, CheckCircle, AlertTriangle, X } from 'lucide-react';
import { useProductStore } from '../../stores/productStore';
import api from '../../lib/api';

const Step1Photo = ({ t }: { t: any }) => {
    const { photos, addPhoto, setPhotos, setStep } = useProductStore();
    const [isLoading, setIsLoading] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

    const [errorMsg, setErrorMsg] = useState('');

    const getQualityLabel = (score: number) => {
        if (score >= 8) return t.qualityGood;
        if (score >= 6) return t.qualityAcceptable;
        if (score >= 4) return t.qualityNeedsImprovement;
        return t.qualityRetake;
    };

    const getQualityColor = (score: number) => {
        if (score >= 8) return 'text-green-600';
        if (score >= 6) return 'text-amber-500';
        if (score >= 4) return 'text-orange-500';
        return 'text-red-500';
    };

    const getQualityBg = (score: number) => {
        if (score >= 8) return 'bg-green-100 text-green-700';
        if (score >= 6) return 'bg-amber-100 text-amber-700';
        if (score >= 4) return 'bg-orange-100 text-orange-700';
        return 'bg-red-100 text-red-700';
    };

    const getQualityIcon = (score: number) => {
        if (score >= 8) return <CheckCircle className="w-4 h-4 text-green-500" />;
        return <AlertTriangle className={`w-4 h-4 ${getQualityColor(score)}`} />;
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        setIsLoading(true);
        setErrorMsg('');
        try {
            let currentDraftId = useProductStore.getState().draftId;
            if (!currentDraftId) {
                await useProductStore.getState().saveDraft();
                currentDraftId = useProductStore.getState().draftId;
            }
            if (!currentDraftId) throw new Error("Failed to create draft");

            const formData = new FormData();
            formData.append('file', file);
            formData.append('product_id', currentDraftId);
            formData.append('is_main', photos.length === 0 ? 'true' : 'false');
            
            const { data } = await api.post('/images/upload', formData);
            
            let qualityData: any = { overall_score: undefined, suggestions: [] };
            
            try {
                // Perform quality check automatically
                const qRes = await api.post(`/images/quality-check/${data.id}`);
                qualityData = qRes.data;
            } catch (qError) {
                console.error("Quality check failed:", qError);
                setErrorMsg("Photo uploaded, but quality check is temporarily unavailable.");
            }
            
            addPhoto({
                id: data.id,
                image_url: data.image_url,
                original_url: data.original_url,
                is_main: photos.length === 0,
                quality_score: qualityData.overall_score,
                suggestions: qualityData.suggestions
            });
        } catch (error: any) {
            console.error("Upload error:", error);
            const detail = error?.response?.data?.detail;
            const message = typeof detail === 'string' ? detail : (error?.message || "Photo upload failed. Please try again.");
            setErrorMsg(message);
        } finally {
            setIsLoading(false);
            if (e.target) {
                e.target.value = '';
            }
        }
    };

    const enhancePhoto = async (id: string) => {
        setIsLoading(true);
        try {
            const { data } = await api.post(`/images/enhance/${id}`);
            const newPhotos = photos.map(p => p.id === id ? { ...p, enhanced_url: data.enhanced_url, image_url: data.enhanced_url, enhanced_quality: true, enhanced_quality_score: data.enhanced_quality_score } : p);
            setPhotos(newPhotos);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleEnhancedQuality = async (id: string, useEnhanced: boolean) => {
        setIsLoading(true);
        try {
            const { data } = await api.patch(`/images/${id}/use-enhanced?use_enhanced=${useEnhanced}`);
            const newPhotos = photos.map(p => p.id === id ? { ...p, enhanced_quality: useEnhanced, image_url: data.image_url } : p);
            setPhotos(newPhotos);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-6" data-guide-id="product_create">
            <h2 className="text-2xl font-bold text-stone-800">{t.photoTitle}</h2>
            
            {photos.length < 5 && (
                <div className="flex gap-4">
                    <input type="file" accept="image/*" capture="environment" className="hidden" ref={cameraInputRef} onChange={handleUpload} />
                    <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleUpload} />
                    
                    <button 
                        type="button"
                        data-guide-id="add-photo-button"
                        onClick={() => cameraInputRef.current?.click()}
                        className="flex-1 flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-stone-300 rounded-xl bg-brand-bg hover:bg-stone-100"
                        disabled={isLoading}
                    >
                        <Camera className="w-8 h-8 text-stone-400" />
                        <span className="text-sm font-medium text-stone-600">{t.takePhoto}</span>
                    </button>
                    
                    <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1 flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-stone-300 rounded-xl bg-brand-bg hover:bg-stone-100"
                        disabled={isLoading}
                    >
                        <ImageIcon className="w-8 h-8 text-stone-400" />
                        <span className="text-sm font-medium text-stone-600">{t.chooseGallery}</span>
                    </button>
                </div>
            )}

            {isLoading && <div className="text-center text-brand-dark font-medium animate-pulse" data-guide-id="image-processing-loader">Uploading...</div>}
            {errorMsg && <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 flex items-start gap-2"><AlertTriangle className="w-5 h-5 shrink-0" />{errorMsg}</div>}

            <div className="space-y-4">
                {photos.map((photo, i) => (
                    <div key={photo.id} className="relative bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm p-4 flex flex-col gap-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="font-medium text-stone-800">Photo {i+1} {photo.is_main && <span className="text-xs bg-brand-neon text-brand-dark px-2 py-1 rounded-full ml-2">Main</span>}</h4>
                                {photo.quality_score !== undefined && (!photo.original_url || !photo.enhanced_url || photo.original_url === photo.enhanced_url) && (
                                    <div className="flex flex-col gap-1 mt-1 text-sm">
                                        <div className="flex items-center gap-1 font-semibold">
                                            {getQualityIcon(photo.quality_score)}
                                            <span className={getQualityColor(photo.quality_score)}>
                                                {t.imageQuality}: {photo.quality_score}/10
                                            </span>
                                        </div>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full w-fit ${getQualityBg(photo.quality_score)}`}>
                                            {getQualityLabel(photo.quality_score)}
                                        </span>
                                    </div>
                                )}
                            </div>
                            {!photo.enhanced_url && (
                                <button 
                                    onClick={() => enhancePhoto(photo.id)}
                                    className="text-xs flex items-center gap-1 bg-purple-50 text-purple-700 px-3 py-1.5 rounded-full font-medium hover:bg-purple-100 transition-colors"
                                    disabled={isLoading}
                                >
                                    <Sparkles className="w-3 h-3" />
                                    {t.enhance}
                                </button>
                            )}
                        </div>

                        {photo.original_url && photo.enhanced_url && photo.original_url !== photo.enhanced_url ? (
                            <div className="grid grid-cols-2 gap-4 w-full">
                                <div className="flex flex-col items-center gap-2">
                                    <div 
                                        className={`relative w-full aspect-square cursor-pointer group rounded-xl overflow-hidden border-2 bg-white shadow-sm transition-colors ${photo.enhanced_quality === false ? 'border-brand-neon' : 'border-stone-200'}`} 
                                        onClick={() => toggleEnhancedQuality(photo.id, false)}
                                    >
                                        <img src={photo.original_url} alt="Original" className="w-full h-full object-contain p-2 hover:scale-105 transition-transform duration-300" />
                                        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none" />
                                        <button 
                                            className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow hover:bg-stone-100"
                                            onClick={(e) => { e.stopPropagation(); setPreviewImage(photo.original_url!); }}
                                        >
                                            <ImageIcon className="w-4 h-4 text-stone-600" />
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input type="radio" checked={photo.enhanced_quality === false} readOnly className="w-4 h-4 text-brand-dark focus:ring-brand-dark" />
                                        <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Original</span>
                                    </div>
                                    {photo.quality_score !== undefined && (
                                        <div className="flex flex-col items-center text-center">
                                            <span className={`text-xs font-semibold ${getQualityColor(photo.quality_score)}`}>
                                                {t.imageQuality}: {photo.quality_score}/10
                                            </span>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 ${getQualityBg(photo.quality_score)}`}>
                                                {getQualityLabel(photo.quality_score)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col items-center gap-2">
                                    <div 
                                        className={`relative w-full aspect-square cursor-pointer group rounded-xl overflow-hidden border-2 bg-white shadow-sm transition-colors ${photo.enhanced_quality !== false ? 'border-brand-neon' : 'border-stone-200'}`} 
                                        onClick={() => toggleEnhancedQuality(photo.id, true)}
                                    >
                                        <img src={photo.enhanced_url} alt="Enhanced" className="w-full h-full object-contain p-2 hover:scale-105 transition-transform duration-300" />
                                        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none" />
                                        <button 
                                            className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow hover:bg-stone-100"
                                            onClick={(e) => { e.stopPropagation(); setPreviewImage(photo.enhanced_url!); }}
                                        >
                                            <ImageIcon className="w-4 h-4 text-stone-600" />
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input type="radio" checked={photo.enhanced_quality !== false} readOnly className="w-4 h-4 text-brand-dark focus:ring-brand-dark" />
                                        <span className="text-[11px] font-bold text-brand-dark uppercase tracking-wider">Enhanced</span>
                                    </div>
                                    {photo.enhanced_quality_score !== undefined && (
                                        <div className="flex flex-col items-center text-center">
                                            <span className={`text-xs font-semibold ${getQualityColor(photo.enhanced_quality_score)}`}>
                                                {t.imageQuality}: {photo.enhanced_quality_score}/10
                                            </span>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 ${getQualityBg(photo.enhanced_quality_score)}`}>
                                                {getQualityLabel(photo.enhanced_quality_score)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center w-full">
                                <div className="relative w-full aspect-square cursor-pointer group rounded-xl overflow-hidden border border-stone-200 bg-white shadow-sm" onClick={() => setPreviewImage(photo.original_url || photo.image_url)}>
                                    <img src={photo.original_url || photo.image_url} alt="Original" className="w-full h-full object-contain p-4 hover:scale-105 transition-transform duration-300" />
                                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none" />
                                </div>
                            </div>
                        )}

                        {photo.suggestions && photo.suggestions.length > 0 && (
                            <ul className="text-xs text-stone-500 mt-2 list-disc list-inside">
                                {photo.suggestions.map((s, idx) => <li key={idx}>{t[s] || s}</li>)}
                            </ul>
                        )}
                    </div>
                ))}
            </div>

            <div className="mt-8 flex justify-end">
                <button 
                    onClick={() => setStep(2)}
                    disabled={photos.length === 0}
                    className="bg-brand-dark text-white px-8 py-3 rounded-full font-medium shadow-lg disabled:opacity-50 hover:bg-black"
                >
                    {t.next}
                </button>
            </div>

            {previewImage && (
                <div className="fixed inset-0 z-50 flex justify-center pointer-events-none">
                    <div className="pointer-events-auto mobile-shell-width h-full bg-black/90 flex flex-col items-center justify-center p-4 relative shadow-2xl">
                        <button 
                            className="absolute top-6 right-6 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors"
                            onClick={() => setPreviewImage(null)}
                        >
                            <X className="w-6 h-6" />
                        </button>
                        <img 
                            src={previewImage} 
                            alt="Preview" 
                            className="w-full max-h-[80vh] object-contain"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Step1Photo;
