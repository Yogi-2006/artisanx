import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, AlertTriangle, Package, MessageSquare, Star, CheckCircle, XCircle } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '../../stores/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function FacilitatorHome() {
  const { t } = useTranslation();
  const { token } = useAuthStore();
  
  const [stats, setStats] = useState<any>(null);
  const [artisans, setArtisans] = useState<any[]>([]);
  const [issues, setIssues] = useState<any[]>([]);
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [reviewStatus, setReviewStatus] = useState<'approved' | 'needs_changes'>('approved');
  const [reviewNotes, setReviewNotes] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [statsRes, artisansRes, issuesRes, enqRes] = await Promise.all([
          axios.get(`${API_URL}/facilitator/stats`, { headers }),
          axios.get(`${API_URL}/facilitator/artisans`, { headers }),
          axios.get(`${API_URL}/facilitator/products/issues`, { headers }),
          axios.get(`${API_URL}/facilitator/enquiries`, { headers })
        ]);
        
        setStats(statsRes.data);
        setArtisans(artisansRes.data.artisans);
        setIssues(issuesRes.data.issues);
        setEnquiries(enqRes.data.enquiries.slice(0, 5)); // Just recent ones
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (token) fetchData();
  }, [token]);

  const handleSubmitReview = async () => {
    if (!selectedProduct) return;
    setSubmittingReview(true);
    try {
      await axios.post(`${API_URL}/facilitator/review/${selectedProduct.product_id}`, {
        review_status: reviewStatus,
        notes: reviewNotes || null
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(t('facilitator.review_success') || 'Review submitted successfully!');
      setSelectedProduct(null);
      setReviewNotes('');
      // Refresh issues list
      const issuesRes = await axios.get(`${API_URL}/facilitator/products/issues`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIssues(issuesRes.data.issues);
    } catch (err) {
      console.error(err);
      alert(t('facilitator.review_error') || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-brand-bg"><div className="animate-pulse w-8 h-8 rounded-full bg-stone-300"></div></div>;
  }

  return (
    <div className="w-full relative pb-24">
      <div className="bg-white px-6 pt-12 pb-6 sticky top-0 z-10 border-b border-stone-200">
        <h1 className="text-2xl font-bold text-stone-800">{t('facilitator.dashboard') || 'Facilitator Dashboard'}</h1>
      </div>

      <div className="p-6 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-stone-100 flex flex-col justify-between">
            <div className="flex items-center gap-2 text-stone-500 mb-2">
              <Users className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wide">{t('facilitator.total_artisans') || 'Total Artisans'}</span>
            </div>
            <div className="text-3xl font-bold text-stone-800">{stats?.total_artisans || 0}</div>
            {stats?.incomplete_profiles > 0 && (
              <div className="text-xs text-red-500 mt-2 font-bold bg-red-50 w-max px-2 py-1 rounded">
                {stats.incomplete_profiles} {t('facilitator.incomplete_profiles') || 'Incomplete Profiles'}
              </div>
            )}
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-sm border border-stone-100 flex flex-col justify-between">
            <div className="flex items-center gap-2 text-stone-500 mb-2">
              <Package className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wide">{t('facilitator.draft_products') || 'Draft Products'}</span>
            </div>
            <div className="text-3xl font-bold text-stone-800">{stats?.draft_products || 0}</div>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-sm border border-stone-100 flex flex-col justify-between">
            <div className="flex items-center gap-2 text-stone-500 mb-2">
              <MessageSquare className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wide">{t('facilitator.pending_enquiries') || 'Pending Enquiries'}</span>
            </div>
            <div className="text-3xl font-bold text-stone-800">{stats?.pending_enquiries || 0}</div>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-sm border border-stone-100 flex flex-col justify-between">
            <div className="flex items-center gap-2 text-stone-500 mb-2">
              <Star className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wide">{t('facilitator.avg_readiness') || 'Avg Readiness'}</span>
            </div>
            <div className="text-3xl font-bold text-stone-800">{stats?.avg_readiness || 0}%</div>
          </div>
        </div>

        {/* Needs Attention */}
        <section>
          <h2 className="text-xl font-bold text-stone-800 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-brand-dark" /> {t('facilitator.needs_attention') || 'Needs Attention'}
          </h2>
          
          <div className="space-y-4">
            {issues.length === 0 ? (
              <div className="bg-white p-6 rounded-2xl border border-stone-100 text-center text-stone-500">
                {t('facilitator.no_issues') || 'No products require attention.'}
              </div>
            ) : (
              issues.map(issue => (
                <div 
                  key={issue.product_id}
                  onClick={() => setSelectedProduct(issue)}
                  className="bg-white p-4 rounded-2xl shadow-sm border border-stone-100 flex gap-4 cursor-pointer hover:border-brand-dark transition-all"
                >
                  <div className="w-20 h-20 rounded-xl bg-stone-200 overflow-hidden shrink-0">
                    {issue.image ? (
                      <img src={issue.image} alt="Product" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-400 text-xs">No Img</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-stone-800 leading-tight">{issue.title || 'Untitled'}</h3>
                    <div className="text-sm text-stone-500 mb-2">{issue.artisan_name || 'Unknown Artisan'}</div>
                    
                    {/* Readiness Bar */}
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${issue.readiness_score < 50 ? 'bg-red-500' : 'bg-brand-neon0'}`} 
                          style={{ width: `${Math.max(issue.readiness_score, 5)}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-bold text-stone-600">{issue.readiness_score}%</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {issue.missing.map((m: string) => (
                        <span key={m} className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-red-50 text-red-600">
                          {t(`facilitator.missing_${m}`) || m.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Recent Enquiries */}
        <section>
          <h2 className="text-xl font-bold text-stone-800 mb-4">{t('facilitator.recent_enquiries') || 'Recent Enquiries'}</h2>
          <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
            {enquiries.length === 0 ? (
               <div className="p-6 text-center text-stone-500">{t('facilitator.no_enquiries') || 'No enquiries yet.'}</div>
            ) : (
              <div className="divide-y divide-stone-100">
                {enquiries.map(enq => (
                  <div key={enq.id} className="p-4">
                    <div className="flex justify-between items-start mb-1">
                      <div className="font-bold text-stone-800 text-sm">{enq.products?.title || 'Product'}</div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        enq.status === 'new' ? 'bg-red-100 text-red-700' : 
                        enq.status === 'responded' ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-700'
                      }`}>
                        {t(`facilitator.enq_status_${enq.status}`) || enq.status}
                      </span>
                    </div>
                    <div className="text-xs text-stone-500">
                      {t('facilitator.buyer') || t('auth.buyer')}: {enq.buyer?.display_name || 'Unknown'} → {t('facilitator.artisan') || t('auth.artisan')}: {enq.artisan?.display_name || 'Unknown'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Artisan Overview Table */}
        <section>
          <h2 className="text-xl font-bold text-stone-800 mb-4">{t('facilitator.artisan_overview') || 'Artisan Overview'}</h2>
          <div className="space-y-3">
            {artisans.map(art => (
              <div key={art.id} className="bg-white rounded-2xl shadow-sm border border-stone-100 p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-stone-200 overflow-hidden shrink-0">
                      {art.photo ? <img src={art.photo} alt="P" className="w-full h-full object-cover" /> : null}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-stone-800">{art.name || 'Unnamed'}</div>
                      <div className="text-xs text-stone-500">{art.craft || 'Unknown Craft'}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-1 rounded bg-stone-100 text-stone-600 shrink-0">
                    {art.status ? (t(`facilitator.status_${art.status}`) || art.status) : 'Unknown'}
                  </span>
                </div>
                <div className="flex justify-between items-center bg-stone-50 rounded-xl p-3 border border-stone-100">
                  <div className="flex-1 text-center">
                    <div className="text-[10px] uppercase text-stone-500 font-bold mb-1">{t('facilitator.products') || 'Products'}</div>
                    <div className="text-sm font-bold text-stone-800">{art.product_count}</div>
                  </div>
                  <div className="w-px h-8 bg-stone-200"></div>
                  <div className="flex-1 text-center">
                    <div className="text-[10px] uppercase text-stone-500 font-bold mb-1">{t('facilitator.readiness') || 'Avg Readiness'}</div>
                    <div className="text-sm font-bold text-stone-800">{art.avg_readiness}%</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Review Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-[calc(100%-24px)] max-w-[406px] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-stone-100">
              <h2 className="text-xl font-bold text-stone-800">{t('facilitator.review_product') || 'Review Product'}</h2>
              <button onClick={() => setSelectedProduct(null)} className="text-stone-400 hover:text-stone-600">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6">
              <h3 className="font-bold text-stone-800 mb-2">{selectedProduct.title || 'Untitled'}</h3>
              <div className="text-sm text-stone-500 mb-4">{t('facilitator.artisan') || t('auth.artisan')}: {selectedProduct.artisan_name}</div>
              
              <div className="space-y-4 mb-6">
                <div 
                  onClick={() => setReviewStatus('approved')}
                  className={`p-4 rounded-xl border-2 cursor-pointer flex items-center gap-3 transition-all ${reviewStatus === 'approved' ? 'border-green-500 bg-green-50' : 'border-stone-100 hover:border-stone-200'}`}
                >
                  <CheckCircle className={`w-5 h-5 ${reviewStatus === 'approved' ? 'text-green-500' : 'text-stone-400'}`} />
                  <span className={`font-bold ${reviewStatus === 'approved' ? 'text-green-800' : 'text-stone-700'}`}>{t('facilitator.approved') || 'Approved'}</span>
                </div>
                <div 
                  onClick={() => setReviewStatus('needs_changes')}
                  className={`p-4 rounded-xl border-2 cursor-pointer flex items-center gap-3 transition-all ${reviewStatus === 'needs_changes' ? 'border-brand-dark bg-brand-neon' : 'border-stone-100 hover:border-stone-200'}`}
                >
                  <AlertTriangle className={`w-5 h-5 ${reviewStatus === 'needs_changes' ? 'text-brand-dark' : 'text-stone-400'}`} />
                  <span className={`font-bold ${reviewStatus === 'needs_changes' ? 'text-brand-dark' : 'text-stone-700'}`}>{t('facilitator.needs_changes') || 'Needs Changes'}</span>
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-bold text-stone-700 mb-2">{t('facilitator.review_notes') || 'Review Notes'}</label>
                <textarea 
                  rows={4}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="w-full p-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-brand-dark outline-none resize-none"
                  placeholder={t('facilitator.notes_placeholder') || 'What needs to be fixed?'}
                ></textarea>
              </div>
              
              <button 
                onClick={handleSubmitReview}
                disabled={submittingReview}
                className="w-full py-4 bg-brand-dark hover:bg-stone-800 text-white font-bold rounded-xl transition-all shadow-md disabled:opacity-50 flex justify-center items-center"
              >
                {submittingReview ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  t('facilitator.submit_review') || 'Submit Review'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reusing BottomNav for visual completeness, assuming facilitator has similar nav or we just omit it. The requirements say "Clean dashboard layout". I'll include BottomNav with role="facilitator" if it supports it, else omit. Wait, App.tsx dummy component didn't have it. I'll just omit it to be safe, or I can see what BottomNav supports. */}
    </div>
  );
}
