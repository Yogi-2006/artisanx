import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { ArrowLeft, FileText, Clock } from 'lucide-react';
import { useQuotationStore } from '../../stores/quotationStore';

export default function Quotations() {
  const navigate = useNavigate();
  const { quotations, loading, fetchArtisanQuotations } = useQuotationStore();

  useEffect(() => {
    fetchArtisanQuotations();
  }, [fetchArtisanQuotations]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-stone-200 text-stone-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'changes_requested': return 'bg-orange-100 text-orange-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-stone-100 text-stone-600';
    }
  };

  return (
    <div className="min-h-screen bg-surface-container-lowest pb-24 text-on-surface">
      <div className="bg-surface px-4 pt-12 pb-4 sticky top-0 z-10 border-b border-outline-variant/30">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/artisan')} className="text-stone-600 hover:text-stone-900">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold text-stone-800">Quotations</h1>
        </div>
      </div>

      <div className="p-4 max-w-lg mx-auto">
        {loading ? (
          <div className="flex justify-center p-8"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div></div>
        ) : quotations.length === 0 ? (
          <div className="text-center p-8 bg-surface rounded-2xl border border-outline-variant text-stone-500">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="font-bold">No quotations yet</p>
            <p className="text-sm mt-1">Quotations you create will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {quotations.map((q: any) => (
              <div 
                  key={q.id} 
                  onClick={() => navigate(`/artisan/quotations/${q.id}`)}
                  className="bg-surface rounded-2xl p-4 shadow-sm border border-outline-variant relative cursor-pointer hover:bg-stone-50 transition-colors"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-stone-800">{q.display_id}</h3>
                    <p className="text-sm font-medium text-stone-500">{q.products?.title}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${getStatusColor(q.status)}`}>
                    {q.status.replace('_', ' ')}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 mb-3 bg-stone-50 p-2 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-stone-200 overflow-hidden shrink-0">
                     {q.products?.images?.[0]?.image_url ? (
                        <img src={q.products.images[0].image_url} alt="Product" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-400 text-[10px]"><FileText className="w-4 h-4"/></div>
                      )}
                  </div>
                  <div className="text-xs text-stone-600">
                    <span className="font-bold text-stone-800">{q.buyer?.display_name || 'Buyer'}</span> requested quotation.
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-stone-500 font-medium">
                  <Clock className="w-3.5 h-3.5" /> {new Date(q.created_at).toLocaleDateString()}
                  <span className="ml-auto font-bold text-primary">v{q.current_version}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
