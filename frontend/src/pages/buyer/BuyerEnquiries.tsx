import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Clock, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '../../stores/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function BuyerEnquiries() {
    const navigate = useNavigate();
    const { token } = useAuthStore();
    const [enquiries, setEnquiries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchEnquiries() {
            try {
                const res = await axios.get(`${API_URL}/enquiries/buyer`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setEnquiries(res.data.enquiries || []);
            } catch (error) {
                console.error("Failed to fetch enquiries", error);
            } finally {
                setLoading(false);
            }
        }
        
        fetchEnquiries();
    }, [token]);

    return (
        <div className="max-w-5xl mx-auto p-4 sm:p-6 pb-24">
            <h1 className="text-2xl font-bold text-on-surface mb-6 flex items-center gap-2">
                <Mail className="w-6 h-6 text-primary" />
                My Enquiries
            </h1>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : enquiries.length > 0 ? (
                <div className="space-y-4">
                    {enquiries.map((enq) => (
                        <div 
                            key={enq.id} 
                            onClick={() => navigate(`/buyer/enquiry/${enq.id}`)}
                            className="bg-surface rounded-2xl p-5 border border-outline-variant shadow-sm flex flex-col sm:flex-row gap-4 sm:items-center cursor-pointer hover:shadow-md transition-shadow group"
                        >
                            <div className="w-16 h-16 bg-stone-100 rounded-xl overflow-hidden shrink-0">
                                {enq.products?.images?.[0]?.image_url ? (
                                    <img src={enq.products.images[0].image_url} alt="Product" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-stone-400">
                                        <Mail className="w-6 h-6 opacity-50" />
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="font-bold text-on-surface group-hover:text-primary transition-colors">{enq.products?.title || 'Unknown Product'}</h3>
                                    <span className={`text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shrink-0 ${
                                        enq.status === 'responded' ? 'bg-secondary-container text-on-secondary-container' : 'bg-surface-container-high text-on-surface-variant'
                                    }`}>
                                        {enq.status === 'responded' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                        {enq.status === 'responded' ? 'Responded' : 'Pending'}
                                    </span>
                                </div>
                                <div className="text-sm text-on-surface-variant">
                                    Artisan: <span className="font-medium text-on-surface">{enq.artisan?.display_name || 'Artisan'}</span>
                                </div>
                                <div className="text-xs text-on-surface-variant mt-2 flex gap-3">
                                    <span>Qty: {enq.quantity}</span>
                                    {enq.budget && <span>Budget: ₹{enq.budget}</span>}
                                    <span className="text-stone-400">{new Date(enq.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-surface rounded-3xl border border-outline-variant mt-4">
                    <Mail className="w-16 h-16 text-on-surface-variant/30 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-on-surface mb-2">No Enquiries Yet</h2>
                    <p className="text-on-surface-variant mb-6 max-w-md mx-auto">You haven't sent any product enquiries to artisans.</p>
                    <button onClick={() => navigate('/buyer/catalogue')} className="px-6 py-3 bg-primary text-on-primary font-bold rounded-full hover:bg-primary/90 transition-colors">
                        Browse Catalogue
                    </button>
                </div>
            )}
        </div>
    );
}
