import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Send, FileText } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '../../stores/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function ArtisanQuotationDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { token } = useAuthStore();
        
    const [quotation, setQuotation] = useState<any>(null);
    const [revisions, setRevisions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [showReviseForm, setShowReviseForm] = useState(false);

    const [reviseData, setReviseData] = useState({
        quantity: 0,
        unit_price: 0,
        customization_cost: 0,
        production_lead_time_days: 7,
        artisan_notes: ''
    });

    useEffect(() => {
        fetchQuotation();
    }, [id, token]);

    async function fetchQuotation() {
        try {
            const res = await axios.get(`${API_URL}/quotations/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setQuotation(res.data.quotation);
            setRevisions(res.data.revisions || []);
            
            const currentRev = res.data.revisions.find((r: any) => r.version === res.data.quotation.current_version) || res.data.revisions[0];
            if (currentRev) {
                setReviseData({
                    quantity: currentRev.quantity,
                    unit_price: currentRev.unit_price,
                    customization_cost: currentRev.customization_cost,
                    production_lead_time_days: currentRev.production_lead_time_days,
                    artisan_notes: currentRev.artisan_notes || ''
                });
            }
        } catch (err: any) {
            console.error("Failed to load quotation", err);
        } finally {
            setLoading(false);
        }
    }

    const handleSend = async () => {
        setActionLoading(true);
        try {
            await axios.post(`${API_URL}/quotations/${id}/send`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchQuotation();
        } catch (err) {
            console.error(err);
            alert("Failed to send quotation");
        } finally {
            setActionLoading(false);
        }
    };

    const handleRevise = async () => {
        setActionLoading(true);
        try {
            await axios.post(`${API_URL}/quotations/${id}/revise`, reviseData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setShowReviseForm(false);
            
            // Now send it immediately so buyer sees it
            await axios.post(`${API_URL}/quotations/${id}/send`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            fetchQuotation();
        } catch (err: any) {
            console.error(err);
            alert(err.response?.data?.detail || "Failed to revise quotation");
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return <div className="flex justify-center p-20"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div></div>;
    if (!quotation) return <div className="p-6 text-center">Quotation not found</div>;

    const currentRev = revisions.find(r => r.version === quotation.current_version) || revisions[0] || {};

    return (
        <div className="min-h-screen bg-surface-container-lowest pb-24 text-on-surface">
            <div className="bg-surface px-4 pt-12 pb-4 sticky top-0 z-10 border-b border-outline-variant/30 flex items-center gap-3">
                <button onClick={() => navigate(-1)} className="text-stone-600 hover:text-stone-900">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <h1 className="text-2xl font-bold text-stone-800">Quote {quotation.display_id}</h1>
            </div>

            <div className="p-4 max-w-lg mx-auto space-y-6">
                <div className="bg-surface rounded-2xl p-5 shadow-sm border border-outline-variant">
                    <div className="flex justify-between items-start mb-4 border-b border-stone-100 pb-4">
                        <div>
                            <h2 className="font-bold text-lg">{quotation.products?.title}</h2>
                            <p className="text-sm text-stone-500">Buyer: {quotation.buyer?.display_name}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-bold rounded uppercase tracking-wider ${
                            quotation.status === 'accepted' ? 'bg-green-100 text-green-700' :
                            quotation.status === 'changes_requested' ? 'bg-orange-100 text-orange-700' :
                            quotation.status === 'rejected' ? 'bg-red-100 text-red-700' :
                            'bg-blue-100 text-blue-700'
                        }`}>
                            {quotation.status.replace(/_/g, ' ')}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-y-4 text-sm">
                        <div><span className="text-stone-500 text-xs block">Version</span><span className="font-bold">v{quotation.current_version}</span></div>
                        <div><span className="text-stone-500 text-xs block">Quantity</span><span className="font-bold">{currentRev.quantity}</span></div>
                        <div><span className="text-stone-500 text-xs block">Unit Price</span><span className="font-bold">₹{currentRev.unit_price}</span></div>
                        <div><span className="text-stone-500 text-xs block">Total Price</span><span className="font-bold text-primary">₹{currentRev.total_price}</span></div>
                        <div><span className="text-stone-500 text-xs block">Lead Time</span><span className="font-bold">{currentRev.production_lead_time_days} days</span></div>
                    </div>
                </div>

                {quotation.status === 'draft' && (
                    <button onClick={handleSend} disabled={actionLoading} className="w-full py-3 bg-primary text-white font-bold rounded-xl flex items-center justify-center gap-2">
                        <Send className="w-4 h-4" /> Send to Buyer
                    </button>
                )}

                {quotation.status === 'changes_requested' && !showReviseForm && (
                    <button onClick={() => setShowReviseForm(true)} className="w-full py-3 bg-secondary-container text-on-secondary-container font-bold rounded-xl">
                        Create New Revision
                    </button>
                )}

                {showReviseForm && (
                    <div className="bg-surface rounded-2xl p-5 shadow-sm border border-primary animate-in fade-in slide-in-from-bottom-4">
                        <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
                          <FileText className="w-5 h-5 text-primary" /> Revise Quotation
                        </h3>
                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-1">Quantity</label>
                                <input type="number" value={reviseData.quantity} onChange={e => setReviseData({...reviseData, quantity: parseInt(e.target.value)||0})} className="w-full p-3 border border-outline-variant rounded-xl bg-surface focus:ring-2 focus:ring-primary outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-1">Unit Price (₹)</label>
                                <input type="number" value={reviseData.unit_price} onChange={e => setReviseData({...reviseData, unit_price: parseFloat(e.target.value)||0})} className="w-full p-3 border border-outline-variant rounded-xl bg-surface focus:ring-2 focus:ring-primary outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-1">Customization Cost (₹)</label>
                                <input type="number" value={reviseData.customization_cost} onChange={e => setReviseData({...reviseData, customization_cost: parseFloat(e.target.value)||0})} className="w-full p-3 border border-outline-variant rounded-xl bg-surface focus:ring-2 focus:ring-primary outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-1">Production Lead Time (Days)</label>
                                <input type="number" value={reviseData.production_lead_time_days} onChange={e => setReviseData({...reviseData, production_lead_time_days: parseInt(e.target.value)||0})} className="w-full p-3 border border-outline-variant rounded-xl bg-surface focus:ring-2 focus:ring-primary outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-1">Notes to Buyer</label>
                                <textarea value={reviseData.artisan_notes} onChange={e => setReviseData({...reviseData, artisan_notes: e.target.value})} className="w-full p-3 border border-outline-variant rounded-xl bg-surface focus:ring-2 focus:ring-primary outline-none min-h-[80px]" />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setShowReviseForm(false)} className="flex-1 py-3 text-stone-600 font-bold border rounded-xl">Cancel</button>
                            <button onClick={handleRevise} disabled={actionLoading} className="flex-1 py-3 bg-primary text-white font-bold rounded-xl flex justify-center items-center gap-2">
                                <Check className="w-4 h-4"/> Submit Revision
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
