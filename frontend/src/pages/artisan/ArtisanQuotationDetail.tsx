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
        <div className="min-h-screen bg-surface pb-24 text-on-surface">
            <header className="bg-surface/90 backdrop-blur-md px-4 pt-10 pb-4 sticky top-0 z-20 border-b border-outline-variant/20 flex items-center gap-3">
                <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center -ml-2 text-on-surface hover:bg-surface-container rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <h1 className="text-xl font-bold text-on-surface">Quote {quotation.display_id}</h1>
            </header>

            <div className="p-4 max-w-lg mx-auto space-y-6">
                <div className="bg-surface-container-lowest rounded-[20px] p-5 shadow-sm border border-outline-variant/30">
                    <div className="flex justify-between items-start mb-4 border-b border-outline-variant/20 pb-4">
                        <div className="py-1">
                            <h2 className="font-extrabold text-lg text-on-surface leading-tight mb-1">{quotation.products?.title}</h2>
                            <p className="text-xs text-on-surface-variant font-medium">Buyer: <span className="text-on-surface font-bold">{quotation.buyer?.display_name}</span></p>
                        </div>
                        <span className={`px-2 py-1 text-[10px] font-black rounded-lg uppercase tracking-wider ${
                            quotation.status === 'accepted' ? 'bg-tertiary-container text-on-tertiary-container' :
                            quotation.status === 'changes_requested' ? 'bg-primary-container text-on-primary-container' :
                            quotation.status === 'rejected' ? 'bg-error-container text-on-error-container' :
                            'bg-secondary-container text-on-secondary-container'
                        }`}>
                            {quotation.status.replace(/_/g, ' ')}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-y-4 gap-x-4 text-sm mt-4">
                        <div className="bg-surface-container-low p-3 rounded-xl border border-outline-variant/20">
                            <span className="text-on-surface-variant text-[10px] font-bold uppercase tracking-wider block mb-1">Version</span>
                            <span className="font-black text-on-surface">v{quotation.current_version}</span>
                        </div>
                        <div className="bg-surface-container-low p-3 rounded-xl border border-outline-variant/20">
                            <span className="text-on-surface-variant text-[10px] font-bold uppercase tracking-wider block mb-1">Quantity</span>
                            <span className="font-black text-on-surface">{currentRev.quantity}</span>
                        </div>
                        <div className="bg-surface-container-low p-3 rounded-xl border border-outline-variant/20">
                            <span className="text-on-surface-variant text-[10px] font-bold uppercase tracking-wider block mb-1">Unit Price</span>
                            <span className="font-black text-on-surface">₹{currentRev.unit_price}</span>
                        </div>
                        <div className="bg-surface-container-low p-3 rounded-xl border border-outline-variant/20 bg-primary/5">
                            <span className="text-on-surface-variant text-[10px] font-bold uppercase tracking-wider block mb-1">Total Price</span>
                            <span className="font-black text-primary text-base">₹{currentRev.total_price}</span>
                        </div>
                        <div className="col-span-2 bg-surface-container-low p-3 rounded-xl border border-outline-variant/20">
                            <span className="text-on-surface-variant text-[10px] font-bold uppercase tracking-wider block mb-1">Lead Time</span>
                            <span className="font-black text-on-surface">{currentRev.production_lead_time_days} days</span>
                        </div>
                    </div>
                </div>

                {quotation.status === 'draft' && (
                    <button onClick={handleSend} disabled={actionLoading} className="w-full py-4 bg-primary text-on-primary font-bold rounded-full shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50">
                        <Send className="w-5 h-5" /> Send to Buyer
                    </button>
                )}

                {quotation.status === 'changes_requested' && !showReviseForm && (
                    <button onClick={() => setShowReviseForm(true)} className="w-full py-4 bg-secondary-container text-on-secondary-container font-bold rounded-full shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all">
                        <FileText className="w-5 h-5" /> Create New Revision
                    </button>
                )}

                {showReviseForm && (
                    <div className="bg-surface-container-lowest rounded-[20px] p-5 shadow-sm border-2 border-primary animate-in fade-in slide-in-from-bottom-4">
                        <h3 className="font-extrabold text-on-surface text-base mb-6 flex items-center gap-2">
                          <FileText className="w-5 h-5 text-primary" /> Revise Quotation
                        </h3>
                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Quantity</label>
                                <input type="number" value={reviseData.quantity} onChange={e => setReviseData({...reviseData, quantity: parseInt(e.target.value)||0})} className="w-full p-4 border border-outline-variant/50 rounded-2xl bg-surface-container-low focus:ring-2 focus:ring-primary focus:border-primary focus:bg-surface outline-none font-bold text-on-surface transition-all" />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Unit Price (₹)</label>
                                <input type="number" value={reviseData.unit_price} onChange={e => setReviseData({...reviseData, unit_price: parseFloat(e.target.value)||0})} className="w-full p-4 border border-outline-variant/50 rounded-2xl bg-surface-container-low focus:ring-2 focus:ring-primary focus:border-primary focus:bg-surface outline-none font-bold text-on-surface transition-all" />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Customization Cost (₹)</label>
                                <input type="number" value={reviseData.customization_cost} onChange={e => setReviseData({...reviseData, customization_cost: parseFloat(e.target.value)||0})} className="w-full p-4 border border-outline-variant/50 rounded-2xl bg-surface-container-low focus:ring-2 focus:ring-primary focus:border-primary focus:bg-surface outline-none font-bold text-on-surface transition-all" />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Production Lead Time (Days)</label>
                                <input type="number" value={reviseData.production_lead_time_days} onChange={e => setReviseData({...reviseData, production_lead_time_days: parseInt(e.target.value)||0})} className="w-full p-4 border border-outline-variant/50 rounded-2xl bg-surface-container-low focus:ring-2 focus:ring-primary focus:border-primary focus:bg-surface outline-none font-bold text-on-surface transition-all" />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Notes to Buyer</label>
                                <textarea value={reviseData.artisan_notes} onChange={e => setReviseData({...reviseData, artisan_notes: e.target.value})} className="w-full p-4 border border-outline-variant/50 rounded-2xl bg-surface-container-low focus:ring-2 focus:ring-primary focus:border-primary focus:bg-surface outline-none font-medium text-on-surface transition-all min-h-[80px] resize-none" />
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setShowReviseForm(false)} className="flex-1 py-4 border border-outline-variant/50 bg-surface text-on-surface-variant font-bold rounded-full transition-colors hover:bg-surface-container-low">Cancel</button>
                            <button onClick={handleRevise} disabled={actionLoading} className="flex-[2] py-4 bg-primary text-on-primary font-bold rounded-full flex justify-center items-center gap-2 shadow-md active:scale-95 transition-all disabled:opacity-50">
                                <Check className="w-5 h-5"/> Submit Revision
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
