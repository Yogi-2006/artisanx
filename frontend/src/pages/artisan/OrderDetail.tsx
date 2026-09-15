import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { ArrowLeft, Package, Settings, Truck, Navigation, XCircle, CheckCircle, AlertTriangle, MessageCircle, ShieldAlert } from 'lucide-react';
import { useOrderStore } from '../../stores/orderStore';
import api from '../../lib/api';

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentOrder, history, loading, fetchOrder, updateOrderStatus, cancelOrder, decideCancellation } = useOrderStore();
  const [updating, setUpdating] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('Material unavailable');
  const [cancelNotes, setCancelNotes] = useState('');
  const [messaging, setMessaging] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeReason, setDisputeReason] = useState('quality_issue');
  const [disputeExplanation, setDisputeExplanation] = useState('');

  const handleMessageBuyer = async () => {
    if (!currentOrder) return;
    setMessaging(true);
    try {
      const res = await api.get(`/conversations/by-enquiry/${currentOrder.enquiry_id}`);
      navigate(`/artisan/conversation/${res.data.conversation.id}`);
    } catch (e) {
      console.error(e);
      alert('Could not start conversation');
    } finally {
      setMessaging(false);
    }
  };

  useEffect(() => {
    if (id) fetchOrder(id);
  }, [id, fetchOrder]);

  const handleUpdateStatus = async (status: string) => {
    if (!id) return;
    setUpdating(true);
    try {
      await updateOrderStatus(id, status);
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-surface-container-lowest"><div className="animate-pulse w-8 h-8 rounded-full bg-stone-300"></div></div>;
  }

  if (!currentOrder) {
    return <div className="min-h-screen flex items-center justify-center bg-surface-container-lowest text-on-surface">Order not found</div>;
  }

  const handleCancelOrder = async () => {
    if (!id) return;
    setUpdating(true);
    try {
      await cancelOrder(id, cancelReason, cancelNotes);
      setShowCancelModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const handleDecideCancellation = async (approved: boolean) => {
    if (!id) return;
    setUpdating(true);
    try {
      await decideCancellation(id, approved);
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const handleRaiseDispute = async () => {
    if (!id || !currentOrder) return;
    setUpdating(true);
    try {
      await api.post('/disputes/', {
        order_id: id,
        product_id: currentOrder.product_snapshot.product_id,
        reason: disputeReason,
        explanation: disputeExplanation
      });
      setShowDisputeModal(false);
      alert('Dispute raised successfully.');
    } catch (err) {
      console.error(err);
      alert('Failed to raise dispute.');
    } finally {
      setUpdating(false);
    }
  };

  const o = currentOrder;
  const isCancelled = o.status === 'cancelled' || o.status === 'cancellation_requested';
  
  // Artisan can advance state forward: confirmed -> in_production -> ready_for_dispatch -> dispatched
  const getNextActions = () => {
    if (o.status === 'confirmed') return [{ label: 'Start Production', status: 'in_production', icon: Settings, color: 'bg-purple-600' }];
    if (o.status === 'in_production') return [{ label: 'Mark Ready for Dispatch', status: 'ready_for_dispatch', icon: Package, color: 'bg-orange-600' }];
    if (o.status === 'ready_for_dispatch') return [{ label: 'Mark Dispatched', status: 'dispatched', icon: Truck, color: 'bg-indigo-600' }];
    return [];
  };
  
  const actions = getNextActions();
  const canCancel = !isCancelled && !['dispatched', 'delivered', 'completed', 'return_requested', 'returned', 'disputed'].includes(o.status);

  return (
    <div className="min-h-screen bg-surface pb-24 text-on-surface">
      <header className="bg-surface/90 backdrop-blur-md px-4 pt-10 pb-4 sticky top-0 z-20 border-b border-outline-variant/20">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/artisan/orders')} className="w-10 h-10 flex items-center justify-center -ml-2 text-on-surface hover:bg-surface-container rounded-full transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-on-surface">{o.display_id}</h1>
          </div>
          {canCancel && (
            <button onClick={() => setShowCancelModal(true)} className="text-error text-sm font-bold flex items-center gap-1 hover:underline">
              <XCircle className="w-4 h-4" /> Cancel
            </button>
          )}
        </div>
      </header>

      <div className="p-4 space-y-6 max-w-lg mx-auto">
        {/* Product Snapshot Info */}
        <div className="bg-surface-container-lowest rounded-[20px] p-4 shadow-sm border border-outline-variant/30 flex gap-4">
          <div className="w-24 h-24 rounded-2xl bg-surface-container-high overflow-hidden shrink-0 border border-outline-variant/20">
            {o.product_snapshot?.image_url ? (
              <img src={o.product_snapshot.image_url} alt="Product" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-on-surface-variant/50 text-[10px]"><Package className="w-6 h-6"/></div>
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-extrabold text-on-surface text-lg leading-tight mb-1">{o.product_snapshot?.title || 'Product'}</h3>
            <p className="text-xs text-on-surface-variant font-medium mb-2">{o.product_snapshot?.category}</p>
            {o.product_snapshot?.variant && (
              <div className="text-[10px] font-black uppercase tracking-wider text-primary bg-primary-container/50 px-2 py-1 rounded-md w-max mt-1">
                {o.product_snapshot.variant.type}: {o.product_snapshot.variant.value}
              </div>
            )}
            <div className="flex justify-between items-end mt-4">
              <div>
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Quantity</p>
                <p className="font-black text-on-surface">{o.quantity}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Unit Price</p>
                <p className="font-black text-on-surface text-base">₹{o.unit_price.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Buyer Info */}
        <div className="bg-surface-container-lowest rounded-[20px] p-4 shadow-sm border border-outline-variant/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-primary/50">
              <span className="material-symbols-outlined text-2xl">person</span>
            </div>
            <div>
              <p className="font-extrabold text-on-surface text-base">{currentOrder.buyer?.display_name}</p>
              <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mt-0.5">Buyer</p>
            </div>
          </div>
          <button 
            onClick={handleMessageBuyer}
            disabled={messaging}
            className="w-12 h-12 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center disabled:opacity-50 hover:bg-secondary-container/80 transition-colors shadow-sm"
          >
            <MessageCircle className="w-6 h-6" />
          </button>
        </div>

        {/* Financials */}
        <div className="bg-primary-container text-on-primary-container rounded-2xl p-5 border border-primary/20">
          <h3 className="font-extrabold mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">payments</span> Order Value
          </h3>
          <div className="space-y-3 text-sm font-medium">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{(o.quantity * o.unit_price).toLocaleString()}</span>
            </div>
            {o.customization_details && (
              <div className="flex justify-between">
                <span>Customization</span>
                <span>Included</span>
              </div>
            )}
            <div className="flex justify-between font-black text-xl pt-4 border-t border-primary/20 mt-4">
              <span>Total Value</span>
              <span>₹{o.total_order_value.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Timeline from History */}
        <div className="bg-surface-container-lowest rounded-[20px] p-5 shadow-sm border border-outline-variant/30">
          <h3 className="font-extrabold text-on-surface mb-6 flex items-center gap-2 text-base">
            <Navigation className="w-5 h-5 text-primary" /> Order Timeline
          </h3>
          
          <div className="relative pl-6 border-l-2 border-surface-container-high space-y-8">
            {history.map((evt: any, i: number) => {
              const isLast = i === history.length - 1;
              return (
                <div key={evt.id} className="relative">
                  <div className={`absolute -left-[33px] top-1 w-4 h-4 rounded-full border-4 border-surface-container-lowest ${isLast ? 'bg-primary animate-pulse' : 'bg-surface-container-highest'}`}></div>
                  <div className="text-sm font-extrabold text-on-surface uppercase tracking-wide">{evt.to_status.replace(/_/g, ' ')}</div>
                  <div className="text-[11px] font-bold text-on-surface-variant mt-1">{new Date(evt.created_at).toLocaleString()}</div>
                  {evt.note && <div className="mt-3 text-sm font-medium text-on-surface-variant bg-surface-container-low p-4 rounded-2xl border border-outline-variant/20 italic leading-relaxed">"{evt.note}"</div>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        {actions.length > 0 && !isCancelled && (
          <div className="grid gap-3 pt-2">
            {actions.map((act, i) => (
              <button 
                key={i}
                onClick={() => handleUpdateStatus(act.status)}
                disabled={updating}
                className={`w-full py-4 text-white font-bold rounded-full flex items-center justify-center gap-2 transition-transform active:scale-[0.98] disabled:opacity-50 shadow-md ${act.color}`}
              >
                {updating ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : (
                  <><act.icon className="w-5 h-5" /> {act.label}</>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Raise Dispute Button */}
        {!isCancelled && (
          <button 
            onClick={() => setShowDisputeModal(true)}
            className="w-full py-4 text-on-surface-variant bg-surface-container-high hover:bg-surface-container-highest font-bold rounded-full flex items-center justify-center gap-2 transition-colors mt-2 border border-outline-variant/30"
          >
            <ShieldAlert className="w-5 h-5" /> Raise Dispute
          </button>
        )}

        {/* Cancellation Review Actions */}
        {o.status === 'cancellation_requested' && (
          <div className="bg-error-container text-on-error-container rounded-[20px] p-5 border border-error/20 mt-4 space-y-4 shadow-sm">
            <h3 className="font-extrabold flex items-center gap-2 text-base">
              <AlertTriangle className="w-5 h-5" /> Buyer Requested Cancellation
            </h3>
            <p className="text-sm font-medium leading-relaxed">The buyer has requested to cancel this order. You can approve or reject this request. If rejected, the order will return to its previous status.</p>
            <div className="flex gap-3 pt-2">
              <button onClick={() => handleDecideCancellation(true)} disabled={updating} className="flex-1 bg-error text-white py-4 rounded-full font-bold active:scale-95 transition-transform flex items-center justify-center gap-2 shadow-sm">
                <CheckCircle className="w-5 h-5" /> Approve
              </button>
              <button onClick={() => handleDecideCancellation(false)} disabled={updating} className="flex-1 bg-surface text-on-surface border-2 border-outline-variant/30 py-4 rounded-full font-bold active:scale-95 transition-transform flex items-center justify-center gap-2">
                <XCircle className="w-5 h-5" /> Reject
              </button>
            </div>
          </div>
        )}

        {/* Cancel Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-surface-container-lowest w-full max-w-sm rounded-[24px] p-6 shadow-2xl relative border border-outline-variant/20 animate-in zoom-in-95 duration-200">
              <button onClick={() => setShowCancelModal(false)} className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface bg-surface-container hover:bg-surface-container-high rounded-full p-2 transition-colors">
                <XCircle className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-extrabold text-error mb-6 flex items-center gap-2">
                 <AlertTriangle className="w-6 h-6"/> Cancel Order
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Reason</label>
                  <select 
                    value={cancelReason} 
                    onChange={e => setCancelReason(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant/50 rounded-2xl px-4 py-4 text-sm font-bold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
                  >
                    <option value="Material unavailable">Material unavailable</option>
                    <option value="Unable to meet quantity">Unable to meet quantity</option>
                    <option value="Production delay">Production delay</option>
                    <option value="Buyer request">Buyer request</option>
                    <option value="Pricing disagreement">Pricing disagreement</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Notes (Optional)</label>
                  <textarea 
                    value={cancelNotes}
                    onChange={e => setCancelNotes(e.target.value)}
                    placeholder="Provide additional details..."
                    className="w-full bg-surface-container-low border border-outline-variant/50 rounded-2xl px-4 py-4 text-sm font-medium text-on-surface focus:outline-none focus:ring-2 focus:ring-primary min-h-[100px] resize-none"
                  />
                </div>
                <button 
                  onClick={handleCancelOrder}
                  disabled={updating}
                  className="w-full bg-error text-white py-4 rounded-full font-bold active:scale-95 transition-transform flex items-center justify-center mt-2 shadow-md disabled:opacity-50"
                >
                  {updating ? "Processing..." : "Confirm Cancellation"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dispute Modal */}
        {showDisputeModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-surface-container-lowest w-full max-w-sm rounded-[24px] p-6 shadow-2xl relative border border-outline-variant/20 animate-in zoom-in-95 duration-200">
              <button onClick={() => setShowDisputeModal(false)} className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface bg-surface-container hover:bg-surface-container-high rounded-full p-2 transition-colors">
                <XCircle className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-extrabold text-error mb-6 flex items-center gap-2">
                <ShieldAlert className="w-6 h-6" /> Raise Dispute
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Reason</label>
                  <select 
                    value={disputeReason} 
                    onChange={e => setDisputeReason(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant/50 rounded-2xl px-4 py-4 text-sm font-bold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
                  >
                    <option value="quality_issue">Quality Issue</option>
                    <option value="item_not_received">Item Not Received</option>
                    <option value="item_not_as_described">Item Not As Described</option>
                    <option value="shipping_damage">Shipping Damage</option>
                    <option value="payment_issue">Payment Issue</option>
                    <option value="communication_issue">Communication Issue</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Explanation</label>
                  <textarea 
                    value={disputeExplanation}
                    onChange={e => setDisputeExplanation(e.target.value)}
                    placeholder="Provide details for the facilitator..."
                    className="w-full bg-surface-container-low border border-outline-variant/50 rounded-2xl px-4 py-4 text-sm font-medium text-on-surface focus:outline-none focus:ring-2 focus:ring-primary min-h-[100px] resize-none"
                  />
                </div>
                <button 
                  onClick={handleRaiseDispute}
                  disabled={updating || !disputeExplanation.trim()}
                  className="w-full bg-error text-white py-4 rounded-full font-bold active:scale-95 transition-transform flex items-center justify-center mt-2 shadow-md disabled:opacity-50"
                >
                  {updating ? "Processing..." : "Submit Dispute"}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
