import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, MessageSquare, Check, X, Search, Calendar, Mic, Square, RotateCcw, CheckCircle, Keyboard } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '../../stores/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

type ResponseType = 'interested' | 'need_details' | 'cannot_fulfil' | null;

export default function EnquiryDetail() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { token } = useAuthStore();
  
  const [enq, setEnq] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [responseType, setResponseType] = useState<ResponseType>(null);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [inputMode, setInputMode] = useState<'type'|'voice'>('type');
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [voiceData, setVoiceData] = useState<any>(null);

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    async function fetchDetail() {
      try {
        const response = await axios.get(`${API_URL}/enquiries/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEnq(response.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (token && id) fetchDetail();
  }, [token, id]);

  const handleRespond = async () => {
    if (!responseType) return;
    setSubmitting(true);
    try {
      const res = await axios.put(`${API_URL}/enquiries/${id}/respond`, {
        artisan_response: responseType,
        artisan_response_note: note || null
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEnq(res.data.enquiry);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

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
          setErrorMsg(t('enquiry.voice_failed') || "Could not access microphone.");
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
          
          const uploadRes = await axios.post(`${API_URL}/voice/upload`, formData, {
              headers: { 
                  'Content-Type': 'multipart/form-data',
                  Authorization: `Bearer ${token}`
              }
          });
          const recordId = uploadRes.data.id;
          
          const transcribeRes = await axios.post(`${API_URL}/voice/transcribe/${recordId}`, null, {
              headers: { Authorization: `Bearer ${token}` }
          });
          const text = transcribeRes.data.translated_text || transcribeRes.data.original_text;
          setNote(text);
          setVoiceData(transcribeRes.data);
          setInputMode('type'); // switch back to type so they can edit
      } catch (err: any) {
          console.error("Voice process error:", err);
          setErrorMsg(t('enquiry.voice_failed') || "Voice processing failed. You can try again or type your response.");
      } finally {
          setIsProcessing(false);
      }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-brand-bg"><div className="animate-pulse w-8 h-8 rounded-full bg-stone-300"></div></div>;
  }

  if (!enq) {
    return <div className="min-h-screen flex items-center justify-center bg-brand-bg">Enquiry not found</div>;
  }

  const isResponded = enq.status === 'responded';
  const displayResponse = isResponded ? enq.artisan_response : responseType;

  return (
    <div className="min-h-screen bg-brand-bg pb-24">
      {/* Header */}
      <div className="bg-white px-4 pt-12 pb-4 sticky top-0 z-10 border-b border-stone-200">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/artisan/enquiries')} className="text-stone-600 hover:text-stone-900">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold text-stone-800">{t('enquiry.detail_title') || 'Enquiry Details'}</h1>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Product Info */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100 flex gap-4">
          <div className="w-24 h-24 rounded-xl bg-stone-200 overflow-hidden shrink-0 border border-stone-200">
            {enq.products?.images?.[0]?.image_url ? (
              <img src={enq.products.images[0].image_url} alt="Product" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-stone-400 text-xs">No Image</div>
            )}
          </div>
          <div>
            <h3 className="font-bold text-stone-800 text-lg leading-tight mb-1">{enq.products?.title || 'Product'}</h3>
            <div className="text-sm text-stone-500 mb-2 line-clamp-2">{enq.products?.description}</div>
            <div className="text-brand-dark font-bold">₹{enq.products?.price || enq.products?.suggested_price || 0}</div>
          </div>
        </div>

        {/* Buyer Request Details */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100">
          <h3 className="font-bold text-stone-800 mb-4">{t('enquiry.request_details') || 'Request Details'}</h3>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-brand-bg p-3 rounded-xl border border-stone-100">
              <div className="text-xs text-stone-500 mb-1">{t('enquiry.quantity') || 'Quantity'}</div>
              <div className="font-bold text-stone-800 text-lg">{enq.quantity}</div>
            </div>
            <div className="bg-brand-bg p-3 rounded-xl border border-stone-100">
              <div className="text-xs text-stone-500 mb-1">{t('enquiry.budget') || 'Budget/Unit'}</div>
              <div className="font-bold text-stone-800 text-lg">{enq.budget ? `₹${enq.budget}` : '-'}</div>
            </div>
          </div>

          {enq.delivery_deadline && (
            <div className="flex items-center gap-3 text-sm text-stone-700 bg-brand-neon p-3 rounded-xl border border-amber-100 mb-4">
              <Calendar className="w-5 h-5 text-brand-dark shrink-0" />
              <div>
                <span className="font-bold">{t('enquiry.deadline') || 'Delivery Deadline'}:</span> {new Date(enq.delivery_deadline).toLocaleDateString()}
              </div>
            </div>
          )}

          {enq.customisation_request && (
            <div>
              <div className="text-xs font-bold text-stone-500 mb-2 uppercase tracking-wide">{t('enquiry.customisation') || 'Customisation Request'}</div>
              <p className="text-sm text-stone-700 bg-brand-bg p-3 rounded-xl border border-stone-100 italic leading-relaxed">
                "{enq.customisation_request}"
              </p>
            </div>
          )}
        </div>

        {/* Status Timeline */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100">
          <h3 className="font-bold text-stone-800 mb-4">{t('enquiry.timeline') || 'Timeline'}</h3>
          <div className="relative pl-6 border-l-2 border-stone-100 space-y-6">
            
            <div className="relative">
              <div className="absolute -left-[33px] top-1 w-4 h-4 rounded-full border-4 border-white bg-green-500"></div>
              <div className="text-sm font-bold text-stone-800">{t('enquiry.enquiry_received') || 'Enquiry Received'}</div>
              <div className="text-xs text-stone-500 mt-1">{new Date(enq.created_at).toLocaleString()}</div>
            </div>
            
            {(enq.status === 'viewed' || enq.status === 'responded') && (
              <div className="relative">
                <div className="absolute -left-[33px] top-1 w-4 h-4 rounded-full border-4 border-white bg-blue-500"></div>
                <div className="text-sm font-bold text-stone-800">{t('enquiry.enquiry_viewed') || 'Enquiry Viewed'}</div>
              </div>
            )}

            {isResponded && (
              <div className="relative">
                <div className="absolute -left-[33px] top-1 w-4 h-4 rounded-full border-4 border-white bg-brand-dark"></div>
                <div className="text-sm font-bold text-stone-800">{t('enquiry.enquiry_responded') || 'Responded'}</div>
                <div className="text-xs text-stone-500 mt-1">{new Date(enq.responded_at).toLocaleString()}</div>
                <div className="mt-2 bg-brand-bg p-3 rounded-xl text-sm text-stone-700">
                  <span className="font-bold block mb-1">
                    {enq.artisan_response === 'interested' ? t('enquiry.opt_interested') || 'Interested' : ''}
                    {enq.artisan_response === 'need_details' ? t('enquiry.opt_need_details') || 'Need More Details' : ''}
                    {enq.artisan_response === 'cannot_fulfil' ? t('enquiry.opt_cannot_fulfil') || 'Cannot Fulfil' : ''}
                  </span>
                  {enq.artisan_response_note && <span>{enq.artisan_response_note}</span>}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Section */}
        {!isResponded && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100" data-guide-id="response-options">
            <h3 className="font-bold text-stone-800 mb-4">{t('enquiry.your_response') || 'Your Response'}</h3>
            
            <div className="space-y-3 mb-6">
              <div 
                onClick={() => setResponseType('interested')}
                className={`p-4 rounded-xl border-2 cursor-pointer flex items-center gap-3 transition-all ${displayResponse === 'interested' ? 'border-green-500 bg-green-50' : 'border-stone-100 bg-white hover:border-stone-200'}`}
              >
                <div className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 ${displayResponse === 'interested' ? 'border-green-500 bg-green-500 text-white' : 'border-stone-300'}`}>
                  {displayResponse === 'interested' && <Check className="w-4 h-4" />}
                </div>
                <div>
                  <div className={`font-bold ${displayResponse === 'interested' ? 'text-green-800' : 'text-stone-800'}`}>{t('enquiry.opt_interested') || 'Interested'}</div>
                  <div className="text-xs text-stone-500 mt-0.5">{t('enquiry.opt_interested_desc') || 'You want to accept this order.'}</div>
                </div>
              </div>

              <div 
                onClick={() => setResponseType('need_details')}
                className={`p-4 rounded-xl border-2 cursor-pointer flex items-center gap-3 transition-all ${displayResponse === 'need_details' ? 'border-blue-500 bg-blue-50' : 'border-stone-100 bg-white hover:border-stone-200'}`}
              >
                <div className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 ${displayResponse === 'need_details' ? 'border-blue-500 bg-blue-500 text-white' : 'border-stone-300'}`}>
                  {displayResponse === 'need_details' && <Search className="w-4 h-4" />}
                </div>
                <div>
                  <div className={`font-bold ${displayResponse === 'need_details' ? 'text-blue-800' : 'text-stone-800'}`}>{t('enquiry.opt_need_details') || 'Need More Details'}</div>
                  <div className="text-xs text-stone-500 mt-0.5">{t('enquiry.opt_need_details_desc') || 'You need clarification from the buyer.'}</div>
                </div>
              </div>

              <div 
                onClick={() => setResponseType('cannot_fulfil')}
                className={`p-4 rounded-xl border-2 cursor-pointer flex items-center gap-3 transition-all ${displayResponse === 'cannot_fulfil' ? 'border-red-500 bg-red-50' : 'border-stone-100 bg-white hover:border-stone-200'}`}
              >
                <div className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 ${displayResponse === 'cannot_fulfil' ? 'border-red-500 bg-red-500 text-white' : 'border-stone-300'}`}>
                  {displayResponse === 'cannot_fulfil' && <X className="w-4 h-4" />}
                </div>
                <div>
                  <div className={`font-bold ${displayResponse === 'cannot_fulfil' ? 'text-red-800' : 'text-stone-800'}`}>{t('enquiry.opt_cannot_fulfil') || 'Cannot Fulfil'}</div>
                  <div className="text-xs text-stone-500 mt-0.5">{t('enquiry.opt_cannot_fulfil_desc') || 'You are unable to take this order.'}</div>
                </div>
              </div>
            </div>

            {responseType && (
              <div className="mb-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm font-bold text-stone-700">
                    {t('enquiry.add_note') || 'Add a note to the buyer (Optional)'}
                  </label>
                  <div className="flex gap-2 bg-stone-100 p-1 rounded-xl w-fit">
                      <button 
                          onClick={() => setInputMode('type')}
                          className={`px-4 py-1.5 text-xs rounded-lg font-bold flex items-center gap-1.5 transition-all ${inputMode === 'type' ? 'bg-white shadow-sm text-brand-dark' : 'text-stone-500 hover:text-stone-700'}`}
                      >
                          <Keyboard className="w-3.5 h-3.5" /> {t('enquiry.type_response') || 'Type'}
                      </button>
                      <button 
                          onClick={() => setInputMode('voice')}
                          className={`px-4 py-1.5 text-xs rounded-lg font-bold flex items-center gap-1.5 transition-all ${inputMode === 'voice' ? 'bg-white shadow-sm text-brand-dark' : 'text-stone-500 hover:text-stone-700'}`}
                      >
                          <Mic className="w-3.5 h-3.5" /> {t('enquiry.voice_response') || 'Voice'}
                      </button>
                  </div>
                </div>

                {inputMode === 'voice' && !audioBlob && (
                    <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-stone-300 rounded-2xl bg-brand-bg mb-4">
                        <button 
                            onClick={isRecording ? stopRecording : startRecording}
                            className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-xl transition-all ${
                                isRecording ? 'bg-red-500 animate-pulse' : 'bg-brand-dark hover:bg-black'
                            }`}
                        >
                            {isRecording ? <Square className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                        </button>
                        <div className="mt-4 text-center">
                            {isRecording ? (
                                <div className="text-red-500 font-mono text-xl font-bold">
                                    {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
                                </div>
                            ) : (
                                <span className="text-stone-500 font-medium text-sm">{t('enquiry.start_recording') || 'Tap to speak'}</span>
                            )}
                        </div>
                    </div>
                )}

                {inputMode === 'voice' && audioBlob && !voiceData && (
                    <div className="flex flex-col gap-4 bg-brand-bg p-4 rounded-2xl border border-stone-200 mb-4">
                        <audio src={audioUrl!} controls className="w-full" />
                        
                        <div className="flex gap-2">
                            <button 
                                onClick={() => { setAudioBlob(null); setAudioUrl(null); }}
                                className="flex-1 py-2 text-sm border border-stone-300 rounded-xl font-medium flex items-center justify-center gap-2 text-stone-600 hover:bg-stone-100"
                                disabled={isProcessing}
                            >
                                <RotateCcw className="w-4 h-4" /> {t('enquiry.re_record') || 'Re-record'}
                            </button>
                            <button 
                                onClick={handleProcessVoice}
                                className="flex-1 py-2 text-sm bg-brand-dark text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-black disabled:opacity-50"
                                disabled={isProcessing}
                            >
                                {isProcessing ? (
                                    <span className="animate-pulse">{t('enquiry.processing_voice') || 'Processing...'}</span>
                                ) : (
                                    <><CheckCircle className="w-4 h-4" /> {t('enquiry.use_response') || 'Process Voice'}</>
                                )}
                            </button>
                        </div>
                        {errorMsg && <div className="text-red-500 text-xs text-center font-bold mt-2">{errorMsg}</div>}
                    </div>
                )}

                {voiceData && (
                  <div className="mb-4 bg-blue-50 p-3 rounded-xl border border-blue-100">
                    <p className="text-xs text-blue-800 font-bold mb-1">{t('enquiry.detected_language') || 'Detected language'}: {voiceData.original_language}</p>
                    <p className="text-sm text-stone-700 italic">"{voiceData.original_text}"</p>
                  </div>
                )}

                {inputMode === 'type' && (
                  <>
                    {voiceData && (
                        <p className="text-xs text-stone-500 font-bold mb-2 uppercase tracking-wide">{t('enquiry.english_response') || 'English response'}</p>
                    )}
                    <textarea 
                      rows={3}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder={t('enquiry.add_note_placeholder') || 'Type your message here...'}
                      className="w-full p-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-brand-dark focus:border-brand-dark outline-none transition-all resize-none text-sm"
                    ></textarea>
                  </>
                )}
              </div>
            )}

            <button 
              onClick={handleRespond}
              disabled={!responseType || submitting}
              className="w-full py-4 bg-brand-dark hover:bg-stone-800 text-white font-bold rounded-xl transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <MessageSquare className="w-5 h-5" /> 
                  {t('enquiry.send_response_btn') || 'Send Response'}
                </>
              )}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
