import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Search } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '../../stores/authStore';
import BottomNav from '../../components/BottomNav';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function EnquiryList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { token } = useAuthStore();
  
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'new' | 'responded'>('all');

  useEffect(() => {
    async function fetchEnquiries() {
      try {
        const response = await axios.get(`${API_URL}/enquiries/artisan`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEnquiries(response.data.enquiries);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (token) fetchEnquiries();
  }, [token]);

  const newCount = enquiries.filter(e => e.status === 'new').length;
  
  const filteredEnquiries = enquiries.filter(e => {
    if (filter === 'all') return true;
    if (filter === 'new') return e.status === 'new';
    if (filter === 'responded') return e.status === 'responded';
    return true;
  });

  return (
    <div className="min-h-screen bg-surface-container-lowest pb-24 text-on-surface">
      {/* Header */}
      <div className="bg-surface px-4 pt-12 pb-4 sticky top-0 z-10 border-b border-outline-variant/30">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate('/artisan')} className="text-stone-600 hover:text-stone-900">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold text-stone-800">{t('enquiry.list_title') || 'Enquiries'}</h1>
        </div>
        
        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          <button 
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-bold transition-colors ${filter === 'all' ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant'}`}
          >
            {t('enquiry.tab_all') || 'All'}
          </button>
          <button 
            onClick={() => setFilter('new')}
            className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-bold transition-colors flex items-center gap-2 ${filter === 'new' ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant'}`}
          >
            {t('enquiry.tab_new') || 'New'}
            {newCount > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-xs ${filter === 'new' ? 'bg-on-primary text-primary' : 'bg-primary text-on-primary'}`}>
                {newCount}
              </span>
            )}
          </button>
          <button 
            onClick={() => setFilter('responded')}
            className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-bold transition-colors ${filter === 'responded' ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant'}`}
          >
            {t('enquiry.tab_responded') || 'Responded'}
          </button>
        </div>
      </div>

      {/* List */}
      <div className="p-4 space-y-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-pulse w-8 h-8 rounded-full bg-stone-300"></div>
          </div>
        ) : filteredEnquiries.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-stone-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-stone-400" />
            </div>
            <p className="text-stone-500">{t('enquiry.no_enquiries') || 'No enquiries found.'}</p>
          </div>
        ) : (
          filteredEnquiries.map(enq => (
            <div 
              key={enq.id}
              onClick={() => navigate(`/artisan/enquiry/${enq.id}`)}
              className="bg-surface rounded-2xl p-4 shadow-sm border border-outline-variant active:scale-[0.98] transition-transform cursor-pointer"
            >
              <div className="flex gap-4">
                <div className="w-20 h-20 rounded-xl bg-stone-200 overflow-hidden shrink-0 border border-stone-200">
                  {enq.products?.images?.[0]?.image_url ? (
                    <img src={enq.products.images[0].image_url} alt="Product" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-400 text-xs">{t('common.no_image')}</div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-stone-800 line-clamp-1">{enq.products?.title || 'Product'}</h3>
                    {enq.status === 'new' && <div className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0 mt-1"></div>}
                  </div>
                  <p className="text-sm text-stone-600 mb-2">{t('enquiry.buyer') || t('auth.buyer')}: <span className="font-bold text-stone-800">{enq.buyer?.display_name || 'Anonymous'}</span></p>
                  
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-stone-500 bg-stone-100 px-2 py-1 rounded">Qty: {enq.quantity}</span>
                    
                    {enq.status === 'new' && (
                      <span className="text-blue-600 bg-blue-50 px-2 py-1 rounded-full">{t('enquiry.status_new') || 'New'}</span>
                    )}
                    {enq.status === 'viewed' && (
                      <span className="text-stone-600 bg-stone-100 px-2 py-1 rounded-full">{t('enquiry.status_viewed') || 'Viewed'}</span>
                    )}
                    {enq.status === 'responded' && (
                      <span className="text-green-600 bg-green-50 px-2 py-1 rounded-full">{t('enquiry.status_responded') || 'Responded'}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      <BottomNav />
    </div>
  );
}
