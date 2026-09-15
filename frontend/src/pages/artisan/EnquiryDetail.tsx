import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, MessageSquare, Check, X, Search, Calendar, FileText } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '../../stores/authStore';
import { useQuotationStore } from '../../stores/quotationStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

type ResponseType = 'interested' | 'need_details' | 'cannot_fulfil' | null;

export default function EnquiryDetail() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const { createQuotation, sendQuotation } = useQuotationStore();
  
  const [enq, setEnq] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [messaging, setMessaging] = useState(false);
  
  const [responseType, setResponseType] = useState<ResponseType>(null);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Quote form state
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [quoteData, setQuoteData] = useState({
    quantity: 0,
    unit_price: 0,
    customization_cost: 0,
    production_lead_time_days: 7,
    artisan_notes: ''
  });

  const handleMessageBuyer = async () => {
    setMessaging(true);
    try {
      const res = await axios.get(`${API_URL}/conversations/by-enquiry/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate(`/artisan/conversation/${res.data.conversation.id}`);
    } catch (e) {
      console.error(e);
      alert('Could not start conversation');
    } finally {
      setMessaging(false);
    }
  };

  useEffect(() => {
    async function fetchDetail() {
      try {
        const response = await axios.get(`${API_URL}/enquiries/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEnq(response.data);
        setQuoteData(prev => ({
          ...prev, 
          quantity: response.data.quantity,
          unit_price: response.data.products?.price || response.data.products?.suggested_price || 0
        }));
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

  const handleCreateQuote = async () => {
    setSubmitting(true);
    try {
      const quoteRes = await createQuotation({
        enquiry_id: id,
        ...quoteData
      });
      await sendQuotation(quoteRes.quotation.id);
      
      // Update local state to show quote sent
      setEnq({ ...enq, status: 'quote_sent' });
      setShowQuoteForm(false);
    } catch (err) {
      console.error("Failed to create quote", err);
    } finally {
      setSubmitting(false);
    }
  };



  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-surface-container-lowest"><div className="animate-pulse w-8 h-8 rounded-full bg-stone-300"></div></div>;
  }

  if (!enq) {
    return <div className="min-h-screen flex items-center justify-center bg-surface-container-lowest text-on-surface">{t('common.enquiry_not_found')}</div>;
  }

  const isResponded = enq.status !== 'new' && enq.status !== 'viewed';
  const displayResponse = isResponded ? enq.artisan_response : responseType;

  return (
    <div className="min-h-screen bg-surface pb-24 text-on-surface">
      {/* Header */}
      <header className="bg-surface/90 backdrop-blur-md px-4 pt-10 pb-4 sticky top-0 z-20 border-b border-outline-variant/20">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/artisan/enquiries')} className="w-10 h-10 flex items-center justify-center -ml-2 text-on-surface hover:bg-surface-container rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-on-surface">{t('enquiry.detail_title') || 'Enquiry Details'}</h1>
        </div>
      </header>

      <div className="p-4 space-y-6 max-w-lg mx-auto">
        {/* Product Info */}
        <div className="bg-surface-container-lowest rounded-[20px] p-4 shadow-sm border border-outline-variant/30 flex gap-4">
          <div className="w-24 h-24 rounded-2xl bg-surface-container-high overflow-hidden shrink-0 border border-outline-variant/20">
            {enq.products?.images?.[0]?.image_url ? (
              <img src={enq.products.images[0].image_url} alt="Product" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-on-surface-variant/50 text-xs font-medium">{t('common.no_image')}</div>
            )}
          </div>
          <div className="flex-1 py-1">
            <h3 className="font-extrabold text-on-surface text-lg leading-tight mb-1">{enq.products?.title || 'Product'}</h3>
            <div className="text-xs text-on-surface-variant font-medium mb-3 line-clamp-2 leading-relaxed">{enq.products?.description}</div>
            <div className="text-primary font-black text-lg">₹{enq.products?.price || enq.products?.suggested_price || 0}</div>
          </div>
        </div>

        {/* Buyer Request Details */}
        <div className="bg-surface-container-lowest rounded-[20px] p-5 shadow-sm border border-outline-variant/30">
          <h3 className="font-extrabold text-on-surface text-base mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" /> {t('enquiry.request_details') || 'Request Details'}
          </h3>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/20">
              <div className="text-[11px] uppercase tracking-wider font-bold text-on-surface-variant mb-1">{t('enquiry.quantity') || 'Quantity'}</div>
              <div className="font-black text-on-surface text-2xl">{enq.quantity}</div>
            </div>
            <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/20">
              <div className="text-[11px] uppercase tracking-wider font-bold text-on-surface-variant mb-1">{t('enquiry.budget') || 'Budget/Unit'}</div>
              <div className="font-black text-primary text-2xl">{enq.budget ? `₹${enq.budget}` : '-'}</div>
            </div>
          </div>

          {enq.delivery_deadline && (
            <div className="flex items-center gap-3 text-sm text-on-secondary-container bg-secondary-container/50 p-4 rounded-2xl mb-4 border border-secondary-container">
              <Calendar className="w-5 h-5 text-secondary shrink-0" />
              <div>
                <span className="font-bold">{t('enquiry.deadline') || 'Delivery Deadline'}:</span> {new Date(enq.delivery_deadline).toLocaleDateString()}
              </div>
            </div>
          )}

          {enq.customisation_request && (
            <div className="mt-4">
              <div className="text-[11px] uppercase tracking-wider font-bold text-on-surface-variant mb-2">{t('enquiry.customisation') || 'Customisation Request'}</div>
              <p className="text-sm text-on-surface font-medium bg-surface-container-low p-4 rounded-2xl border border-outline-variant/20 italic leading-relaxed">
                "{enq.customisation_request}"
              </p>
            </div>
          )}

          {enq.requested_variant && (
            <div className="mt-4">
              <div className="text-[11px] uppercase tracking-wider font-bold text-on-surface-variant mb-2">Requested Option / Variant</div>
              <div className="text-sm text-on-surface bg-surface-container-low p-4 rounded-2xl border border-outline-variant/20 flex flex-col gap-1">
                <span className="font-extrabold text-on-surface">{enq.requested_variant.type.toUpperCase()}: {enq.requested_variant.value}</span>
                {enq.requested_variant.price_adjustment > 0 && (
                   <span className="text-xs text-primary font-bold">Price impact: +₹{enq.requested_variant.price_adjustment} per unit</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Status Timeline */}
        <div className="bg-surface-container-lowest rounded-[20px] p-5 shadow-sm border border-outline-variant/30">
          <h3 className="font-extrabold text-on-surface text-base mb-6">{t('enquiry.timeline') || 'Timeline'}</h3>
          <div className="relative pl-6 border-l-2 border-surface-container-high space-y-8">
            
            <div className="relative">
              <div className="absolute -left-[33px] top-1 w-4 h-4 rounded-full border-4 border-surface-container-lowest bg-tertiary"></div>
              <div className="text-sm font-extrabold text-on-surface">{t('enquiry.enquiry_received') || 'Enquiry Received'}</div>
              <div className="text-[11px] font-bold text-on-surface-variant mt-1">{new Date(enq.created_at).toLocaleString()}</div>
            </div>

            {isResponded && (
              <div className="relative">
                <div className="absolute -left-[33px] top-1 w-4 h-4 rounded-full border-4 border-surface-container-lowest bg-primary"></div>
                <div className="text-sm font-extrabold text-on-surface">{t('enquiry.enquiry_responded') || 'Responded'}</div>
                <div className="text-[11px] font-bold text-on-surface-variant mt-1">{new Date(enq.responded_at || enq.updated_at).toLocaleString()}</div>
                <div className="mt-3 bg-surface-container-low p-4 rounded-2xl text-sm text-on-surface border border-outline-variant/20">
                  <span className="font-bold block mb-1">
                    {enq.artisan_response === 'interested' ? t('enquiry.opt_interested') || 'Interested' : ''}
                    {enq.artisan_response === 'need_details' ? t('enquiry.opt_need_details') || 'Need More Details' : ''}
                    {enq.artisan_response === 'cannot_fulfil' ? t('enquiry.opt_cannot_fulfil') || 'Cannot Fulfil' : ''}
                  </span>
                  {enq.artisan_response_note && <span className="text-on-surface-variant leading-relaxed">{enq.artisan_response_note}</span>}
                </div>
              </div>
            )}
            
            {(enq.status === 'quote_sent' || enq.status === 'accepted') && (
              <div className="relative">
                <div className="absolute -left-[33px] top-1 w-4 h-4 rounded-full border-4 border-surface-container-lowest bg-secondary"></div>
                <div className="text-sm font-extrabold text-on-surface">Quotation Sent</div>
              </div>
            )}

            {enq.status === 'accepted' && (
              <div className="relative">
                <div className="absolute -left-[33px] top-1 w-4 h-4 rounded-full border-4 border-surface-container-lowest bg-tertiary"></div>
                <div className="text-sm font-extrabold text-on-surface">Quotation Accepted (Order Created)</div>
              </div>
            )}
          </div>
        </div>

        {/* Quote Form */}
        {isResponded && enq.artisan_response === 'interested' && enq.status === 'responded' && !showQuoteForm && (
          <div className="flex gap-2">
            <button 
              onClick={handleMessageBuyer}
              disabled={messaging}
              className="flex-1 bg-secondary-container hover:bg-secondary-container/80 text-on-secondary-container font-bold py-3 px-4 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[20px]">chat</span>
              {messaging ? 'Opening...' : 'Message Buyer'}
            </button>
            <button 
              onClick={() => setShowQuoteForm(true)}
              className="flex-1 bg-primary hover:bg-primary-container text-on-primary font-bold py-3 px-4 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">request_quote</span>
              {t('enquiry_detail.create_quote') || 'Create Quotation'}
            </button>
          </div>
        )}

        {showQuoteForm && (
          <div className="bg-surface-container-lowest rounded-[20px] p-5 shadow-sm border-2 border-primary animate-in fade-in slide-in-from-bottom-4">
            <h3 className="font-extrabold text-on-surface text-base mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" /> Create Quotation
            </h3>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Quantity</label>
                <input 
                  type="number" 
                  value={quoteData.quantity}
                  onChange={e => setQuoteData({...quoteData, quantity: parseInt(e.target.value) || 0})}
                  className="w-full p-4 border border-outline-variant/50 rounded-2xl bg-surface-container-low focus:ring-2 focus:ring-primary focus:border-primary focus:bg-surface outline-none font-bold text-on-surface transition-all" 
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Unit Price (₹)</label>
                <input 
                  type="number" 
                  value={quoteData.unit_price}
                  onChange={e => setQuoteData({...quoteData, unit_price: parseFloat(e.target.value) || 0})}
                  className="w-full p-4 border border-outline-variant/50 rounded-2xl bg-surface-container-low focus:ring-2 focus:ring-primary focus:border-primary focus:bg-surface outline-none font-bold text-on-surface transition-all" 
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Customization Cost (₹) (Optional)</label>
                <input 
                  type="number" 
                  value={quoteData.customization_cost}
                  onChange={e => setQuoteData({...quoteData, customization_cost: parseFloat(e.target.value) || 0})}
                  className="w-full p-4 border border-outline-variant/50 rounded-2xl bg-surface-container-low focus:ring-2 focus:ring-primary focus:border-primary focus:bg-surface outline-none font-bold text-on-surface transition-all" 
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Production Lead Time (Days)</label>
                <input 
                  type="number" 
                  value={quoteData.production_lead_time_days}
                  onChange={e => setQuoteData({...quoteData, production_lead_time_days: parseInt(e.target.value) || 0})}
                  className="w-full p-4 border border-outline-variant/50 rounded-2xl bg-surface-container-low focus:ring-2 focus:ring-primary focus:border-primary focus:bg-surface outline-none font-bold text-on-surface transition-all" 
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Notes to Buyer</label>
                <textarea 
                  rows={2}
                  value={quoteData.artisan_notes}
                  onChange={e => setQuoteData({...quoteData, artisan_notes: e.target.value})}
                  className="w-full p-4 border border-outline-variant/50 rounded-2xl bg-surface-container-low focus:ring-2 focus:ring-primary focus:border-primary focus:bg-surface outline-none font-medium text-on-surface transition-all resize-none" 
                />
              </div>
              
              <div className="bg-primary-container text-on-primary-container p-5 rounded-2xl border border-primary/20">
                <div className="flex justify-between text-sm mb-1 font-medium">
                  <span>Subtotal ({quoteData.quantity} × ₹{quoteData.unit_price})</span>
                  <span>₹{(quoteData.quantity * quoteData.unit_price).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm mb-3 font-medium">
                  <span>Customization</span>
                  <span>₹{quoteData.customization_cost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-black text-xl pt-3 border-t border-primary/20">
                  <span>Total Order Value</span>
                  <span>₹{((quoteData.quantity * quoteData.unit_price) + quoteData.customization_cost).toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setShowQuoteForm(false)}
                className="flex-1 py-3 border border-outline-variant text-stone-700 font-bold rounded-xl"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateQuote}
                disabled={submitting || quoteData.quantity <= 0 || quoteData.unit_price <= 0}
                className="flex-[2] py-3 bg-primary text-on-primary font-bold rounded-xl disabled:opacity-50"
              >
                {submitting ? 'Sending...' : 'Send Quotation'}
              </button>
            </div>
          </div>
        )}

        {/* Action Section (if not responded) */}
        {!isResponded && (
          <div className="bg-surface-container-lowest rounded-[20px] p-5 shadow-sm border border-outline-variant/30" data-guide-id="response-options">
            <h3 className="font-extrabold text-on-surface text-base mb-4">{t('enquiry.your_response') || 'Your Response'}</h3>
            
            <div className="space-y-3 mb-6">
              <div 
                onClick={() => setResponseType('interested')}
                className={`p-4 rounded-2xl border-2 cursor-pointer flex items-center gap-4 transition-all ${displayResponse === 'interested' ? 'border-tertiary bg-tertiary-container' : 'border-outline-variant/30 bg-surface hover:border-tertiary/50'}`}
              >
                <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 ${displayResponse === 'interested' ? 'border-tertiary bg-tertiary text-on-tertiary' : 'border-outline-variant'}`}>
                  {displayResponse === 'interested' && <Check className="w-5 h-5" />}
                </div>
                <div>
                  <div className={`font-bold text-base ${displayResponse === 'interested' ? 'text-on-tertiary-container' : 'text-on-surface'}`}>{t('enquiry.opt_interested') || 'Interested'}</div>
                  <div className={`text-xs mt-0.5 ${displayResponse === 'interested' ? 'text-on-tertiary-container/80' : 'text-on-surface-variant'}`}>{t('enquiry.opt_interested_desc') || 'You want to accept this order.'}</div>
                </div>
              </div>

              <div 
                onClick={() => setResponseType('need_details')}
                className={`p-4 rounded-2xl border-2 cursor-pointer flex items-center gap-4 transition-all ${displayResponse === 'need_details' ? 'border-secondary bg-secondary-container' : 'border-outline-variant/30 bg-surface hover:border-secondary/50'}`}
              >
                <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 ${displayResponse === 'need_details' ? 'border-secondary bg-secondary text-on-secondary' : 'border-outline-variant'}`}>
                  {displayResponse === 'need_details' && <Search className="w-5 h-5" />}
                </div>
                <div>
                  <div className={`font-bold text-base ${displayResponse === 'need_details' ? 'text-on-secondary-container' : 'text-on-surface'}`}>{t('enquiry.opt_need_details') || 'Need More Details'}</div>
                  <div className={`text-xs mt-0.5 ${displayResponse === 'need_details' ? 'text-on-secondary-container/80' : 'text-on-surface-variant'}`}>{t('enquiry.opt_need_details_desc') || 'You need clarification from the buyer.'}</div>
                </div>
              </div>

              <div 
                onClick={() => setResponseType('cannot_fulfil')}
                className={`p-4 rounded-2xl border-2 cursor-pointer flex items-center gap-4 transition-all ${displayResponse === 'cannot_fulfil' ? 'border-error bg-error-container' : 'border-outline-variant/30 bg-surface hover:border-error/50'}`}
              >
                <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 ${displayResponse === 'cannot_fulfil' ? 'border-error bg-error text-on-error' : 'border-outline-variant'}`}>
                  {displayResponse === 'cannot_fulfil' && <X className="w-5 h-5" />}
                </div>
                <div>
                  <div className={`font-bold text-base ${displayResponse === 'cannot_fulfil' ? 'text-on-error-container' : 'text-on-surface'}`}>{t('enquiry.opt_cannot_fulfil') || 'Cannot Fulfil'}</div>
                  <div className={`text-xs mt-0.5 ${displayResponse === 'cannot_fulfil' ? 'text-on-error-container/80' : 'text-on-surface-variant'}`}>{t('enquiry.opt_cannot_fulfil_desc') || 'You are unable to take this order.'}</div>
                </div>
              </div>
            </div>

            {responseType && (
              <div className="mb-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm font-bold text-on-surface">
                    {t('enquiry.add_note') || 'Add a note to the buyer (Optional)'}
                  </label>
                </div>
                <textarea 
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={t('enquiry.add_note_placeholder') || 'Type your message here...'}
                  className="w-full p-4 border border-outline-variant/50 rounded-2xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all resize-none text-sm bg-surface-container-low text-on-surface font-medium"
                ></textarea>
              </div>
            )}

            <button 
              onClick={handleRespond}
              disabled={!responseType || submitting}
              className="w-full py-4 bg-primary hover:bg-primary/90 text-on-primary font-bold rounded-full transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
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
