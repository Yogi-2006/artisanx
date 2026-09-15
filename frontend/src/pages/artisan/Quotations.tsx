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
      case 'draft': return 'bg-surface-container-high text-on-surface';
      case 'sent': return 'bg-secondary-container text-on-secondary-container';
      case 'changes_requested': return 'bg-primary-container text-on-primary-container';
      case 'accepted': return 'bg-tertiary-container text-on-tertiary-container';
      case 'rejected': return 'bg-error-container text-on-error-container';
      default: return 'bg-surface-container text-on-surface-variant';
    }
  };

  return (
    <div className="min-h-screen bg-surface pb-24 text-on-surface">
      <header className="bg-surface/90 backdrop-blur-md px-4 pt-10 pb-4 sticky top-0 z-20 border-b border-outline-variant/20">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/artisan')} className="w-10 h-10 flex items-center justify-center -ml-2 text-on-surface hover:bg-surface-container rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-on-surface">Quotations</h1>
        </div>
      </header>

      <div className="p-4 max-w-lg mx-auto">
        {loading ? (
          <div className="flex justify-center p-8"><div className="w-8 h-8 rounded-full bg-surface-container-highest animate-pulse"></div></div>
        ) : quotations.length === 0 ? (
          <div className="text-center p-12 bg-surface-container-lowest rounded-[20px] border border-outline-variant/30 text-on-surface-variant flex flex-col items-center">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="font-extrabold text-on-surface">No quotations yet</p>
            <p className="text-sm mt-1">Quotations you create will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {quotations.map((q: any) => (
              <div 
                  key={q.id} 
                  onClick={() => navigate(`/artisan/quotations/${q.id}`)}
                  className="bg-surface-container-lowest rounded-[20px] p-4 shadow-sm border border-outline-variant/30 relative cursor-pointer hover:border-primary/30 transition-colors active:scale-[0.98]"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-extrabold text-on-surface">{q.display_id}</h3>
                    <p className="text-xs font-bold text-on-surface-variant line-clamp-1">{q.products?.title}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${getStatusColor(q.status)}`}>
                    {q.status.replace('_', ' ')}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 mb-3 bg-surface-container-low p-2.5 rounded-xl border border-outline-variant/20">
                  <div className="w-8 h-8 rounded-full bg-surface-container-high overflow-hidden shrink-0 border border-outline-variant/30">
                     {q.products?.images?.[0]?.image_url ? (
                        <img src={q.products.images[0].image_url} alt="Product" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-on-surface-variant/50 text-[10px]"><FileText className="w-4 h-4"/></div>
                      )}
                  </div>
                  <div className="text-xs text-on-surface-variant font-medium">
                    <span className="font-bold text-on-surface">{q.buyer?.display_name || 'Buyer'}</span> requested quotation.
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-on-surface-variant font-bold">
                  <Clock className="w-3.5 h-3.5" /> {new Date(q.created_at).toLocaleDateString()}
                  <span className="ml-auto font-black text-primary bg-primary-container text-on-primary-container px-2 py-0.5 rounded-md">v{q.current_version}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
