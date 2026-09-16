import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, X, Edit3 } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '../../stores/authStore';
import MessagingUI from '../../components/buyer/MessagingUI';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function BuyerQuotationDetail() {
        const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { token } = useAuthStore();
    
    const [quotation, setQuotation] = useState<any>(null);
    const [revisions, setRevisions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [changeReason, setChangeReason] = useState("");
    const [showChangeInput, setShowChangeInput] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchQuotation() {
            try {
                const res = await axios.get(`${API_URL}/quotations/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setQuotation(res.data.quotation);
                setRevisions(res.data.revisions || []);
            } catch (err: any) {
                console.error("Failed to load quotation", err);
                setError(err.response?.data?.detail || "Failed to load quotation");
            } finally {
                setLoading(false);
            }
        }
        fetchQuotation();
    }, [id, token]);

    const handleAction = async (action: 'accept' | 'reject' | 'request-changes') => {
        if (action === 'request-changes' && !changeReason.trim()) {
            return;
        }
        setActionLoading(true);
        try {
            const payload = action === 'request-changes' ? { reason: changeReason } : action === 'reject' ? { reason: changeReason } : {};
            const res = await axios.post(`${API_URL}/quotations/${id}/${action}`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (action === 'accept' && res.data.order_id) {
                navigate(`/buyer/orders/${res.data.order_id}`);
            } else {
                setQuotation({ ...quotation, status: action === 'reject' ? 'rejected' : 'changes_requested' });
                setShowChangeInput(false);
            }
        } catch (err: any) {
            console.error(`Action ${action} failed`, err);
            alert(err.response?.data?.detail || "Action failed");
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-20 min-h-screen bg-surface-container-lowest">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error || !quotation) {
        return (
            <div className="p-6 text-center text-red-500 bg-surface-container-lowest min-h-screen">
                <p>{error || "Quotation not found"}</p>
                <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 bg-primary text-white rounded">Go Back</button>
            </div>
        );
    }

    const currentRev = revisions.find(r => r.version === quotation.current_version) || revisions[0] || {};
    
    return (
        <div className="max-w-5xl mx-auto p-4 sm:p-6 pb-24 bg-surface-container-lowest min-h-screen">
            <div className="flex items-center mb-6">
                <button onClick={() => navigate(-1)} className="mr-4 w-10 h-10 bg-surface rounded-full flex items-center justify-center text-on-surface hover:bg-surface-container shadow-sm border border-outline-variant">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-on-surface">Quotation {quotation.display_id}</h1>
                    <div className="text-sm text-on-surface-variant flex items-center gap-2">
                        <span>Version {quotation.current_version}</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                            quotation.status === 'accepted' ? 'bg-green-100 text-green-700' :
                            quotation.status === 'rejected' ? 'bg-red-100 text-red-700' :
                            'bg-blue-100 text-blue-700'
                        }`}>
                            {quotation.status.replace(/_/g, ' ').toUpperCase()}
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-surface rounded-2xl p-6 shadow-sm border border-outline-variant">
                        <h2 className="text-lg font-bold mb-4">Quote Details</h2>
                        <div className="flex gap-4 mb-6 border-b border-outline-variant pb-4">
                            {quotation.products?.images?.[0]?.image_url ? (
                                <img src={quotation.products.images[0].image_url} alt="Product" className="w-20 h-20 object-cover rounded-xl" />
                            ) : (
                                <div className="w-20 h-20 bg-stone-100 rounded-xl flex items-center justify-center text-stone-400">No Image</div>
                            )}
                            <div>
                                <h3 className="font-bold">{quotation.products?.title || 'Product'}</h3>
                                <p className="text-sm text-stone-500">Artisan: {quotation.artisan?.display_name}</p>
                                {quotation.variant_snapshot && <p className="text-xs text-primary bg-primary-container inline-block px-2 py-1 rounded mt-1">{quotation.variant_snapshot.type}: {quotation.variant_snapshot.value}</p>}
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-y-4 text-sm">
                            <div><span className="text-stone-500">Quantity:</span> <br/><span className="font-bold">{currentRev.quantity} units</span></div>
                            <div><span className="text-stone-500">Unit Price:</span> <br/><span className="font-bold">₹{currentRev.unit_price}</span></div>
                            <div><span className="text-stone-500">Customization:</span> <br/><span className="font-bold">₹{currentRev.customization_cost}</span></div>
                            <div><span className="text-stone-500">Total Price:</span> <br/><span className="font-bold text-lg text-primary">₹{currentRev.total_price}</span></div>
                            <div><span className="text-stone-500">Production Time:</span> <br/><span className="font-bold">{currentRev.production_lead_time_days} days</span></div>
                            <div><span className="text-stone-500">Valid Until:</span> <br/><span className="font-bold">{currentRev.expiry_date ? new Date(currentRev.expiry_date).toLocaleDateString() : 'N/A'}</span></div>
                        </div>

                        {currentRev.artisan_notes && (
                            <div className="mt-6 p-4 bg-secondary-container rounded-xl text-on-secondary-container text-sm">
                                <span className="font-bold block mb-1">Artisan Notes:</span>
                                {currentRev.artisan_notes}
                            </div>
                        )}
                    </div>

                    {quotation.status === 'sent' && (
                        <div className="bg-surface rounded-2xl p-6 shadow-sm border border-outline-variant">
                            <h2 className="text-lg font-bold mb-4">Actions</h2>
                            <div className="flex flex-col gap-3">
                                <button 
                                    onClick={() => handleAction('accept')} 
                                    disabled={actionLoading}
                                    className="w-full py-3 bg-primary text-on-primary rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
                                >
                                    <Check className="w-5 h-5" /> Accept Quotation & Create Order
                                </button>
                                
                                <div className="grid grid-cols-2 gap-3">
                                    <button 
                                        onClick={() => setShowChangeInput(!showChangeInput)} 
                                        disabled={actionLoading}
                                        className="py-3 bg-surface-container text-on-surface font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-surface-container-high transition-colors"
                                    >
                                        <Edit3 className="w-4 h-4" /> Request Changes
                                    </button>
                                    <button 
                                        onClick={() => handleAction('reject')} 
                                        disabled={actionLoading}
                                        className="py-3 border border-red-500 text-red-500 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-red-50 transition-colors"
                                    >
                                        <X className="w-4 h-4" /> Decline
                                    </button>
                                </div>

                                {showChangeInput && (
                                    <div className="mt-4 p-4 border border-outline-variant rounded-xl animate-in fade-in slide-in-from-top-2">
                                        <label className="block text-sm font-bold text-stone-700 mb-2">What needs to be changed?</label>
                                        <textarea 
                                            value={changeReason}
                                            onChange={e => setChangeReason(e.target.value)}
                                            className="w-full border border-stone-300 rounded-lg p-3 text-sm min-h-[80px]"
                                            placeholder="E.g., Can we reduce the quantity to 50?"
                                        ></textarea>
                                        <div className="flex justify-end gap-2 mt-3">
                                            <button onClick={() => setShowChangeInput(false)} className="px-4 py-2 text-sm text-stone-500 hover:text-stone-700">Cancel</button>
                                            <button onClick={() => handleAction('request-changes')} disabled={!changeReason.trim() || actionLoading} className="px-4 py-2 text-sm bg-stone-800 text-white rounded-lg disabled:opacity-50">Send Request</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Messages Sidebar */}
                <div className="md:col-span-1">
                    <MessagingUI enquiryId={quotation.enquiry_id} currentUserId={quotation.buyer_id} />
                </div>
            </div>
        </div>
    );
}
