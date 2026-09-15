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
    <div className="min-h-screen bg-surface pb-24 text-on-surface">
      {/* Header */}
      <header className="bg-surface/90 backdrop-blur-md px-4 pt-10 pb-2 sticky top-0 z-20 border-b border-outline-variant/20">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate('/artisan')} className="w-10 h-10 flex items-center justify-center -ml-2 text-on-surface hover:bg-surface-container rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-on-surface">{t('enquiry.list_title') || 'Enquiries'}</h1>
        </div>
        
        {/* Tabs */}
        <div className="flex space-x-2 overflow-x-auto hide-scrollbar pb-2">
          <button 
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-colors ${filter === 'all' ? 'bg-primary text-on-primary' : 'bg-surface-container-lowest border border-outline-variant/50 text-on-surface-variant hover:bg-surface-container-low'}`}
          >
            {t('enquiry.tab_all') || 'All'}
          </button>
          <button 
            onClick={() => setFilter('new')}
            className={`px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-colors flex items-center gap-2 ${filter === 'new' ? 'bg-primary text-on-primary' : 'bg-surface-container-lowest border border-outline-variant/50 text-on-surface-variant hover:bg-surface-container-low'}`}
          >
            {t('enquiry.tab_new') || 'New'}
            {newCount > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${filter === 'new' ? 'bg-on-primary text-primary' : 'bg-primary text-on-primary'}`}>
                {newCount}
              </span>
            )}
          </button>
          <button 
            onClick={() => setFilter('responded')}
            className={`px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-colors ${filter === 'responded' ? 'bg-primary text-on-primary' : 'bg-surface-container-lowest border border-outline-variant/50 text-on-surface-variant hover:bg-surface-container-low'}`}
          >
            {t('enquiry.tab_responded') || 'Responded'}
          </button>
        </div>
      </header>

      {/* List */}
      <div className="p-4 space-y-4 max-w-lg mx-auto">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-pulse w-8 h-8 rounded-full bg-surface-container-highest"></div>
          </div>
        ) : filteredEnquiries.length === 0 ? (
          <div className="text-center py-12 flex flex-col items-center">
            <div className="w-24 h-24 bg-surface-container-highest rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant/50">search</span>
            </div>
            <p className="text-on-surface-variant font-bold">{t('enquiry.no_enquiries') || 'No enquiries found.'}</p>
          </div>
        ) : (
          filteredEnquiries.map(enq => (
            <div 
              key={enq.id}
              onClick={() => navigate(`/artisan/enquiry/${enq.id}`)}
              className="bg-surface-container-lowest rounded-[20px] p-3 shadow-sm border border-outline-variant/30 active:scale-[0.98] transition-transform cursor-pointer hover:border-primary/30"
            >
              <div className="flex gap-4 items-center">
                <div className="w-24 h-24 rounded-2xl bg-surface-container-high overflow-hidden shrink-0 border border-outline-variant/20">
                  {enq.products?.images?.[0]?.image_url ? (
                    <img src={enq.products.images[0].image_url} alt="Product" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-on-surface-variant/50 text-xs font-medium">{t('common.no_image')}</div>
                  )}
                </div>
                <div className="flex-1 min-w-0 py-1">
                  <div className="flex justify-between items-start mb-0.5">
                    <h3 className="font-extrabold text-on-surface text-base truncate">{enq.products?.title || 'Product'}</h3>
                    {enq.status === 'new' && <div className="w-2.5 h-2.5 rounded-full bg-error shrink-0 mt-1.5 animate-pulse"></div>}
                  </div>
                  <p className="text-xs text-on-surface-variant font-medium mb-3 truncate">{t('enquiry.buyer') || t('auth.buyer')}: <span className="font-bold text-on-surface">{enq.buyer?.display_name || 'Anonymous'}</span></p>
                  
                  <div className="flex items-center justify-between text-xs font-bold mt-auto">
                    <span className="text-on-surface-variant bg-surface-container-high px-2 py-1 rounded-full">Qty: {enq.quantity}</span>
                    
                    {enq.status === 'new' && (
                      <span className="text-secondary bg-secondary-container px-2 py-1 rounded-full">{t('enquiry.status_new') || 'New'}</span>
                    )}
                    {enq.status === 'viewed' && (
                      <span className="text-on-surface-variant bg-surface-container px-2 py-1 rounded-full">{t('enquiry.status_viewed') || 'Viewed'}</span>
                    )}
                    {enq.status === 'responded' && (
                      <span className="text-tertiary bg-tertiary-container px-2 py-1 rounded-full">{t('enquiry.status_responded') || 'Responded'}</span>
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
