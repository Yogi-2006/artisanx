import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import api from '../../lib/api';
import { useAuthStore } from '../../stores/authStore';

export default function FacilitatorEnquiries() {
  const { t } = useTranslation();
  const { token } = useAuthStore();
  const navigate = useNavigate();
  
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data } = await api.get(`/facilitator/enquiries`);
        setEnquiries(data.enquiries || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (token) fetchData();
  }, [token]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-surface-container-lowest"><div className="animate-pulse w-8 h-8 rounded-full bg-stone-300"></div></div>;
  }

  return (
    <div className="w-full relative pb-24 bg-surface-container-lowest text-on-surface min-h-screen">
      <div className="bg-surface px-6 pt-12 pb-6 sticky top-0 z-10 border-b border-outline-variant/30 flex items-center gap-4">
        <button onClick={() => navigate('/facilitator')} className="p-2 -ml-2 rounded-full hover:bg-stone-100">
          <ArrowLeft className="w-6 h-6 text-on-surface" />
        </button>
        <h1 className="text-xl font-bold text-on-surface">{t('facilitator.enquiries') || 'Buyer Enquiries'}</h1>
      </div>

      <div className="p-6 space-y-8">
        <section>
          <h2 className="text-xl font-bold text-stone-800 mb-4 flex items-center gap-2 text-blue-600">
            <MessageSquare className="w-5 h-5" /> All Enquiries ({enquiries.length})
          </h2>
          <div className="space-y-4">
            {(!enquiries || enquiries.length === 0) ? (
              <div className="bg-surface p-6 rounded-3xl border border-outline-variant text-center text-stone-500">
                No buyer enquiries found.
              </div>
            ) : (
              enquiries.map((enq: any) => (
                <div key={enq.id} className="bg-surface p-4 rounded-3xl shadow-sm border border-outline-variant">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-bold text-stone-800">{enq.products?.title || 'Product Enquiry'}</div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${enq.status === 'new' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                      {enq.status}
                    </span>
                  </div>
                  <div className="text-sm text-stone-600 mb-1">
                    <span className="font-semibold">Artisan:</span> {enq.artisan?.display_name || 'Unknown'}
                  </div>
                  <div className="text-sm text-stone-600 mb-2">
                    <span className="font-semibold">Buyer:</span> {enq.buyer?.display_name || 'Unknown'}
                  </div>
                  <div className="bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/50 text-sm text-stone-700 italic">
                    "{enq.message}"
                  </div>
                  <div className="text-xs text-stone-400 mt-2">
                    {new Date(enq.created_at).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
