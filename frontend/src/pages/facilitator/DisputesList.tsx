import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import api from '../../lib/api';
import { useNavigate } from 'react-router-dom';

export default function DisputesList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    async function fetchDisputes() {
      try {
        const res = await api.get('/disputes/');
        setDisputes(res.data.disputes || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchDisputes();
  }, []);

  const filteredDisputes = filter === 'all' ? disputes : disputes.filter(d => d.status === filter);

  const filters = [
    { value: 'all', label: 'All' },
    { value: 'open', label: 'Open' },
    { value: 'under_review', label: 'Under Review' },
    { value: 'waiting_for_buyer', label: 'Waiting for Buyer' },
    { value: 'waiting_for_artisan', label: 'Waiting for Artisan' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'closed', label: 'Closed' },
  ];

  return (
    <div className="min-h-screen bg-surface-container-lowest text-on-surface pb-6">
      <div className="bg-surface px-6 pt-12 pb-4 sticky top-0 z-10 border-b border-outline-variant/30 flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-stone-100">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-red-500" />
            {t('facilitator.disputes') || 'Disputes'}
          </h1>
        </div>
        
        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {filters.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                filter === f.value ? 'bg-stone-800 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="animate-pulse flex flex-col gap-4">
            {[1, 2, 3].map(i => <div key={i} className="h-24 bg-stone-200 rounded-2xl"></div>)}
          </div>
        ) : filteredDisputes.length === 0 ? (
          <div className="text-center p-12 text-stone-500">
            {t('common.no_data') || 'No disputes found.'}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDisputes.map(d => (
              <div 
                key={d.id} 
                onClick={() => navigate(`/facilitator/disputes/${d.id}`)}
                className="bg-surface p-4 rounded-3xl shadow-sm border border-outline-variant cursor-pointer hover:border-red-500 transition-all flex flex-col gap-2"
              >
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold text-stone-500 bg-stone-100 px-2 py-1 rounded">
                    ORDER #{d.order_id.split('-')[0].toUpperCase()}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                    d.status === 'open' ? 'bg-red-100 text-red-700' :
                    d.status === 'resolved' || d.status === 'closed' ? 'bg-green-100 text-green-700' :
                    'bg-orange-100 text-orange-700'
                  }`}>
                    {d.status.replace(/_/g, ' ')}
                  </span>
                </div>
                
                <h3 className="font-bold text-stone-800 capitalize mt-1">
                  {d.reason.replace(/_/g, ' ')}
                </h3>
                
                <div className="text-xs text-stone-500 flex justify-between mt-2 pt-2 border-t border-stone-100">
                  <span>A: {d.artisan?.display_name || 'Unknown'}</span>
                  <span>B: {d.buyer?.display_name || 'Unknown'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
