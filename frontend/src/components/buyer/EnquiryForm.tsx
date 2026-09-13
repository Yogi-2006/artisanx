import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '../../stores/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface EnquiryFormProps {
  productId: string;
  moq: number;
  onClose: () => void;
}

export default function EnquiryForm({ productId, moq, onClose }: EnquiryFormProps) {
  const { t } = useTranslation();
  const { token, isAuthenticated, user } = useAuthStore();
  
  const [quantity, setQuantity] = useState(moq > 0 ? moq : 1);
  const [budget, setBudget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [customisation, setCustomisation] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || user?.role !== 'buyer') {
      setError(t('enquiry.must_be_buyer') || 'You must be logged in as a buyer to send an enquiry.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await axios.post(
        `${API_URL}/enquiries/`,
        {
          product_id: productId,
          quantity: Number(quantity),
          budget: budget ? Number(budget) : null,
          delivery_deadline: deadline ? new Date(deadline).toISOString() : null,
          customisation_request: customisation || null
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || t('enquiry.error_submitting') || 'Failed to submit enquiry.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-xl w-[calc(100%-24px)] max-w-[406px] p-8 text-center relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-stone-400 hover:text-stone-600">
            <X className="w-5 h-5" />
          </button>
          <div className="flex justify-center mb-4">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-stone-800 mb-2">{t('enquiry.success_title') || 'Enquiry Sent!'}</h2>
          <p className="text-stone-600 mb-6">{t('enquiry.success_message') || 'The artisan will review your request and respond soon.'}</p>
          <button 
            onClick={onClose}
            className="w-full py-3 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-full transition-colors"
          >
            {t('enquiry.close') || 'Close'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-xl w-[calc(100%-24px)] max-w-[406px] overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b border-stone-100">
          <h2 className="text-xl font-bold text-stone-800">{t('enquiry.form_title') || 'Send Enquiry'}</h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-1">
                {t('enquiry.quantity') || 'Quantity'} *
              </label>
              <input 
                type="number" 
                required 
                min={moq > 0 ? moq : 1}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full p-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-brand-dark focus:border-brand-dark outline-none transition-all"
              />
              {moq > 1 && <p className="text-xs text-stone-500 mt-1">Minimum order quantity is {moq}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-1">
                {t('enquiry.budget') || 'Budget per unit (Optional)'}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3.5 text-stone-500">₹</span>
                <input 
                  type="number" 
                  min="0"
                  step="0.01"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full p-3 pl-8 border border-stone-200 rounded-xl focus:ring-2 focus:ring-brand-dark focus:border-brand-dark outline-none transition-all"
                  placeholder="0.00"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-1">
                {t('enquiry.deadline') || 'Delivery Deadline (Optional)'}
              </label>
              <input 
                type="date" 
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full p-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-brand-dark focus:border-brand-dark outline-none transition-all"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-1">
                {t('enquiry.customisation') || 'Customisation Request (Optional)'}
              </label>
              <textarea 
                rows={3}
                value={customisation}
                onChange={(e) => setCustomisation(e.target.value)}
                placeholder={t('enquiry.customisation_placeholder') || 'Describe any specific changes or requirements...'}
                className="w-full p-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-brand-dark focus:border-brand-dark outline-none transition-all resize-none"
              ></textarea>
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full mt-2 py-4 bg-brand-dark hover:bg-stone-800 text-white font-bold rounded-xl transition-all shadow-md disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                t('enquiry.send_btn') || 'Send Enquiry'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
