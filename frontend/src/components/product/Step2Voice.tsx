import { useState, useRef, useEffect } from 'react';
import { Mic, Square, RotateCcw, CheckCircle, Keyboard, Type } from 'lucide-react';
import { useProductStore } from '../../stores/productStore';
import api from '../../lib/api';

const Step2Voice = ({ t, lang }: { t: any, lang: string }) => {
    const { voiceData, setVoiceData, setStep, saveDraft, draftId } = useProductStore();
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [timer, setTimer] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [inputMode, setInputMode] = useState<'voice'|'type'>('voice');
    const [descriptionText, setDescriptionText] = useState('');

    useEffect(() => {
        if (voiceData?.translated_text) {
            setDescriptionText(voiceData.translated_text);
        }
    }, []);

    const mediaRecorder = useRef<MediaRecorder | null>(null);
    const timerRef = useRef<number | null>(null);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            mediaRecorder.current = recorder;
            
            const chunks: BlobPart[] = [];
            recorder.ondataavailable = (e) => chunks.push(e.data);
            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'audio/webm' });
                setAudioBlob(blob);
                setAudioUrl(URL.createObjectURL(blob));
            };
            
            recorder.start();
            setIsRecording(true);
            setTimer(0);
            timerRef.current = window.setInterval(() => setTimer(t => t + 1), 1000);
        } catch (err) {
            console.error("Microphone access denied", err);
            setErrorMsg("Could not access microphone.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorder.current && isRecording) {
            mediaRecorder.current.stop();
            mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
            setIsRecording(false);
            if (timerRef.current) clearInterval(timerRef.current);
        }
    };

    const handleProcessVoice = async () => {
        if (!audioBlob) return;
        setIsProcessing(true);
        setErrorMsg('');
        
        try {
            const formData = new FormData();
            formData.append('file', audioBlob, 'recording.webm');
            if (draftId) formData.append('product_id', draftId);
            
            const uploadRes = await api.post('/voice/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const recordId = uploadRes.data.id;
            
            const transcribeRes = await api.post(`/voice/transcribe/${recordId}`);
            const text = transcribeRes.data.translated_text || transcribeRes.data.original_text;
            setDescriptionText(text);
            setVoiceData({
                record_id: recordId,
                original_text: transcribeRes.data.original_text,
                translated_text: text
            });
        } catch (err: any) {
            console.error("Voice process error:", err);
            let msg = err.response?.data?.detail || "Voice processing failed. You can type manually.";
            if (typeof msg === 'string' && (msg.includes('Bucket not found') || msg.includes('{'))) {
                msg = "Voice processing is temporarily unavailable. Please try again.";
            } else if (typeof msg === 'object') {
                msg = "Voice processing is temporarily unavailable. Please try again.";
            }
            setErrorMsg(msg);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-stone-800">{t.voiceTitle || "Product Description"}</h2>
                <span className="text-sm bg-stone-100 text-stone-600 px-3 py-1 rounded-full uppercase font-bold">{lang}</span>
            </div>

            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 shadow-sm">
                <h3 className="font-bold text-brand-dark mb-1">{t.productGuidanceTitle || 'Tell us about your product'}</h3>
                <p className="text-sm text-stone-600 mb-4">{t.productGuidanceSubtitle || "Include as many of these details as you know. It's okay if you don't know everything."}</p>
                <div className="flex flex-wrap gap-2">
                    {[
                        { k: 'productGuidanceMaterial', f: 'Material' },
                        { k: 'productGuidanceHowMade', f: "How it's made" },
                        { k: 'productGuidanceSize', f: 'Size' },
                        { k: 'productGuidanceDesign', f: 'Design' },
                        { k: 'productGuidanceSpecial', f: 'Special features' },
                        { k: 'productGuidanceUsage', f: 'Usage' },
                        { k: 'productGuidanceCare', f: 'Care instructions' }
                    ].map(item => (
                        <span key={item.k} className="bg-white border border-stone-200 text-stone-600 text-xs px-2.5 py-1 rounded-md font-medium">
                            {t[item.k] || item.f}
                        </span>
                    ))}
                </div>
            </div>

            <div data-guide-id="record-voice-button" className="space-y-6">
                <div className="flex gap-2 bg-stone-100 p-1 rounded-xl w-fit">
                <button 
                    onClick={() => setInputMode('voice')}
                    className={`px-5 py-2 rounded-2xl font-bold flex items-center gap-2 transition-all ${inputMode === 'voice' ? 'bg-white shadow-sm text-brand-dark' : 'text-stone-500 hover:text-stone-700'}`}
                >
                    <Mic className="w-4 h-4" /> Speak
                </button>
                <button 
                    onClick={() => setInputMode('type')}
                    className={`px-5 py-2 rounded-2xl font-bold flex items-center gap-2 transition-all ${inputMode === 'type' ? 'bg-white shadow-sm text-brand-dark' : 'text-stone-500 hover:text-stone-700'}`}
                >
                    <Keyboard className="w-4 h-4" /> Type
                </button>
            </div>

            {inputMode === 'voice' && !audioBlob && (
                <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-stone-300 rounded-2xl bg-brand-bg">
                    <button 
                        onClick={isRecording ? stopRecording : startRecording}
                        className={`w-20 h-20 rounded-full flex items-center justify-center text-white shadow-xl transition-all ${
                            isRecording ? 'bg-red-500 animate-pulse' : 'bg-brand-dark hover:bg-black'
                        }`}
                    >
                        {isRecording ? <Square className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
                    </button>
                    <div className="mt-6 text-center">
                        {isRecording ? (
                            <div className="text-red-500 font-mono text-xl font-bold">
                                {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <span className="text-stone-500 font-medium block">{t.recordVoice || 'Tap to speak'}</span>
                                <p className="text-xs text-stone-400 max-w-[280px] italic leading-tight">
                                    {t.productGuidanceVoiceExample || "Example: You can say 'This is a handmade wooden bottle made from neem wood. It has a natural brown finish, and can be used for storing water...'"}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {inputMode === 'voice' && audioBlob && !voiceData && (
                <div className="flex flex-col gap-4 bg-brand-bg p-6 rounded-2xl border border-stone-200">
                    <audio src={audioUrl!} controls className="w-full" />
                    
                    <div className="flex gap-4 mt-2">
                        <button 
                            onClick={() => { setAudioBlob(null); setAudioUrl(null); }}
                            className="flex-1 py-3 border border-stone-300 rounded-xl font-medium flex items-center justify-center gap-2 text-stone-600 hover:bg-stone-100"
                            disabled={isProcessing}
                        >
                            <RotateCcw className="w-5 h-5" /> {t.reRecord}
                        </button>
                        <button 
                            onClick={handleProcessVoice}
                            className="flex-1 py-3 bg-brand-dark text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-black disabled:opacity-50"
                            disabled={isProcessing}
                        >
                            {isProcessing ? (
                                <span className="animate-pulse" data-guide-id="ai-processing-loader">{t.processing}</span>
                            ) : (
                                <><CheckCircle className="w-5 h-5" /> {t.processVoice}</>
                            )}
                        </button>
                    </div>
                    {errorMsg && <div className="text-red-500 text-sm text-center">{errorMsg}</div>}
                </div>
            )}

            {(inputMode === 'type' || (inputMode === 'voice' && voiceData)) && (
                <div className="bg-brand-bg border border-stone-200 rounded-2xl p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="font-bold text-stone-800 flex items-center gap-2">
                            <Type className="w-5 h-5 text-brand-dark" /> Description
                        </h4>
                    </div>
                    
                    <textarea 
                        dir="auto"
                        placeholder={t.productGuidanceTypePlaceholder || "Example: Tell us the product name, material, how it is made, size, design and what makes it special..."}
                        className="w-full p-4 rounded-xl border-2 border-stone-200 bg-white focus:border-brand-dark focus:ring-0 text-stone-700 text-lg leading-relaxed resize-y" 
                        value={descriptionText} 
                        onChange={(e) => setDescriptionText(e.target.value)}
                        rows={5} 
                    />
                </div>
            )}

            </div>

            <div className="mt-8 flex justify-between">
                <button onClick={() => setStep(1)} className="text-stone-500 font-medium px-4">{t.back}</button>
                <button 
                    onClick={async () => { 
                        setVoiceData({ ...voiceData, translated_text: descriptionText, original_text: descriptionText });
                        await saveDraft(); 
                        setStep(3); 
                    }}
                    disabled={!descriptionText.trim()}
                    className="bg-brand-dark text-white px-8 py-3 rounded-full font-medium shadow-lg disabled:opacity-50 hover:bg-black"
                >
                    {t.next}
                </button>
            </div>
        </div>
    );
};
export default Step2Voice;
