import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { ArrowLeft, Package, Clock } from 'lucide-react';
import { useOrderStore } from '../../stores/orderStore';

export default function Orders() {
  const navigate = useNavigate();
  const { orders, loading, fetchArtisanOrders } = useOrderStore();

  useEffect(() => {
    fetchArtisanOrders();
  }, [fetchArtisanOrders]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-primary-container text-on-primary-container border-primary/20';
      case 'in_production': return 'bg-secondary-container text-on-secondary-container border-secondary/20';
      case 'ready_for_dispatch': return 'bg-tertiary-container text-on-tertiary-container border-tertiary/20';
      case 'dispatched': return 'bg-primary text-on-primary border-primary/20';
      case 'delivered': 
      case 'completed': return 'bg-secondary text-on-secondary border-secondary/20';
      case 'cancelled': 
      case 'cancellation_requested': return 'bg-error-container text-on-error-container border-error/20';
      default: return 'bg-surface-container text-on-surface-variant border-outline-variant/30';
    }
  };

  return (
    <div className="min-h-screen bg-surface pb-24 text-on-surface">
      <header className="bg-surface/90 backdrop-blur-md px-4 pt-10 pb-4 sticky top-0 z-20 border-b border-outline-variant/20">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/artisan')} className="w-10 h-10 flex items-center justify-center -ml-2 text-on-surface hover:bg-surface-container rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-on-surface">Orders</h1>
        </div>
      </header>

      <div className="p-4 max-w-lg mx-auto">
        {loading ? (
          <div className="flex justify-center p-8"><div className="w-8 h-8 rounded-full bg-surface-container-highest animate-pulse"></div></div>
        ) : orders.length === 0 ? (
          <div className="text-center p-12 bg-surface-container-lowest rounded-[20px] border border-outline-variant/30 text-on-surface-variant flex flex-col items-center">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="font-extrabold text-on-surface">No orders yet</p>
            <p className="text-sm mt-1">When buyers accept your quotations, they will appear here as orders.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((o: any) => (
              <div 
                key={o.id} 
                className="bg-surface-container-lowest rounded-[20px] p-4 shadow-sm border border-outline-variant/30 relative cursor-pointer hover:border-primary/30 transition-colors active:scale-[0.98]"
                onClick={() => navigate(`/artisan/order/${o.id}`)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-extrabold text-on-surface text-lg">{o.display_id}</h3>
                    <p className="text-xs font-bold text-on-surface-variant mt-0.5 line-clamp-1">{o.product_snapshot?.title || 'Product'}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${getStatusColor(o.status)}`}>
                    {o.status.replace(/_/g, ' ')}
                  </span>
                </div>
                
                <div className="flex items-center gap-4 mb-4 bg-surface-container-low p-3 rounded-2xl border border-outline-variant/20">
                  <div className="w-14 h-14 rounded-2xl bg-surface-container-high overflow-hidden shrink-0 border border-outline-variant/30">
                     {o.product_snapshot?.image_url ? (
                        <img src={o.product_snapshot.image_url} alt="Product" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-on-surface-variant/50 text-[10px]"><Package className="w-5 h-5"/></div>
                      )}
                  </div>
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wide">Quantity</p>
                      <p className="font-black text-on-surface">{o.quantity}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wide">Total Value</p>
                      <p className="font-black text-primary text-base">₹{o.total_order_value.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-on-surface-variant font-bold pt-3 border-t border-outline-variant/30">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> {new Date(o.order_date).toLocaleDateString()}
                  </span>
                  <span>Buyer: <span className="font-black text-on-surface">{o.buyer?.display_name || 'Buyer'}</span></span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
