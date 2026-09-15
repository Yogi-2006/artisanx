import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LifeBuoy, ArrowLeft } from 'lucide-react';
import api from '../../lib/api';
import { useNavigate } from 'react-router-dom';

export default function SupportRequestsList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRequests() {
      try {
        const res = await api.get('/support-requests/');
        setRequests(res.data.support_requests || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchRequests();
  }, []);

  return (
    <div className="min-h-screen bg-surface-container-lowest text-on-surface">
      <div className="bg-surface px-6 pt-12 pb-4 sticky top-0 z-10 border-b border-outline-variant/30 flex flex-col gap-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-stone-100 transition-colors">
              <ArrowLeft className="w-6 h-6 text-stone-500 hover:text-stone-800" />
            </button>
            <h1 className="text-2xl font-bold">
              {t('facilitator.support_reqs') || 'Support Requests'}
            </h1>
          </div>
          <div className="flex items-center gap-4 text-stone-500">
            <LifeBuoy className="w-5 h-5 text-blue-500" />
          </div>
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="animate-pulse flex flex-col gap-4">
            {[1, 2, 3].map(i => <div key={i} className="h-24 bg-stone-200 rounded-2xl"></div>)}
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center p-12 text-stone-500">
            {t('common.no_data') || 'No support requests found.'}
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map(req => (
              <div 
                key={req.id} 
                onClick={() => navigate(`/facilitator/support/${req.id}`)}
                className="bg-surface p-4 rounded-3xl shadow-sm border border-outline-variant cursor-pointer hover:border-primary transition-all flex flex-col gap-2"
              >
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold uppercase tracking-wide text-stone-500">
                    {req.category.replace('_', ' ')}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                    req.status === 'open' ? 'bg-red-100 text-red-700' :
                    req.status === 'resolved' ? 'bg-green-100 text-green-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {req.status.replace('_', ' ')}
                  </span>
                </div>
                <h3 className="font-bold text-stone-800">{req.issue_summary}</h3>
                <div className="text-sm text-stone-500">
                  {t('auth.artisan') || 'Artisan'}: {req.artisan?.display_name || 'Unknown'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
