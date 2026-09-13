import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../lib/api';
import { ChevronRight, CheckCircle2, AlertCircle, MessageSquare } from 'lucide-react';
import BottomNav from '../../components/BottomNav';
import ShowMeFab from '../../components/guide-hand/ShowMeFab';
import { NotificationBell } from '../../components/notifications/NotificationBell';
import type { GuidanceWorkflow } from '../../types/guidance';
import { useGuidanceStore } from '../../stores/guidanceStore';

const homeTranslations: Record<string, any> = {
  en: { welcome: "Good morning", addProduct: "Add Product", myProducts: "My Products", enquiries: "Enquiries", totalProd: "Total Products", pubProd: "Published", pendingEnq: "Pending", nextStep: "Today's Next Step", recentEnq: "Transactions", profileIncomplete: "Profile Incomplete", completeNow: "Complete Now", noEnquiries: "No recent enquiries", nextStepDesc: "Upload photos of your latest craft to attract more buyers!", greetingPrefix: "Welcome to ArtisanX" },
  // ... other languages can be translated later, using fallback for now for simplicity of this update
};

export default function ArtisanHome() {
  const { t } = useTranslation();
  const { i18n } = useTranslation();
  const lang = i18n.language || 'en';
  const local_t = homeTranslations[lang] || homeTranslations.en;
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({ total: 0, published: 0, pending: 0 });
  const [recentEnquiry, setRecentEnquiry] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [fetchedWorkflow, setFetchedWorkflow] = useState<GuidanceWorkflow | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchGuidance = async () => {
      const { guidanceLevel, isActive, completedWorkflows, startWorkflow } = useGuidanceStore.getState();
      if (guidanceLevel === 'off') return;
      
      try {
        const res = await api.get('/guidance/current?screen=artisan_home');
        if (res.data && mounted) {
          setFetchedWorkflow(res.data);
          if (!isActive && !completedWorkflows.includes(res.data.id)) {
            startWorkflow(res.data);
          }
        }
      } catch (e) {
        console.error("Guidance fetch error:", e);
      }
    };
    fetchGuidance();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const results = await Promise.allSettled([
          api.get('/artisans/me'),
          api.get('/products/my'),
          api.get('/enquiries/artisan')
        ]);
        
        // Handle Profile
        if (results[0].status === 'fulfilled') {
          setProfile(results[0].value.data);
        } else {
          console.error("Failed to fetch profile:", results[0].reason);
        }
        
        // Handle Products
        if (results[1].status === 'fulfilled') {
          const products = results[1].value.data || [];
          setStats({
            total: products.length,
            published: products.filter((p: any) => p.status === 'published').length,
            pending: products.filter((p: any) => p.status === 'draft').length
          });
        } else {
          console.error("Failed to fetch products:", results[1].reason);
        }
        
        // Handle Enquiries
        if (results[2].status === 'fulfilled') {
          const enquiries = results[2].value.data?.enquiries || [];
          if (enquiries.length > 0) {
            setRecentEnquiry(enquiries[0]);
          }
        } else {
          console.error("Failed to fetch enquiries:", results[2].reason);
        }
      } catch (err) {
        console.error("Dashboard global fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  if (loading) return <div className="min-h-screen bg-brand-bg flex items-center justify-center">{t('common.loading')}</div>;

  const artisanName = profile?.artisan_name?.split(' ')[0] || t('auth.artisan');

  return (
    <div className="w-full pb-24 font-sans text-brand-dark">
      <div className="px-6 pt-10 space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold">{local_t.welcome || 'Good morning'}, {artisanName}</h1>
            <p className="text-stone-500 font-medium text-sm mt-1">{local_t.greetingPrefix || 'Welcome to ArtisanX'}</p>
          </div>
          <div className="text-brand-dark [&>button]:bg-white [&>button]:border-stone-100 [&>button]:w-12 [&>button]:h-12 [&>button]:shadow-sm">
            <NotificationBell />
          </div>
        </div>

        {/* Main Metric Card */}
        <div className="bg-white rounded-[32px] p-6 shadow-sm border border-stone-100/50">
          <p className="text-stone-500 font-bold mb-1">{local_t.totalProd || 'Total Products'}</p>
          <div className="flex items-end justify-between mb-8">
            <h2 className="text-5xl font-black tracking-tighter">{stats.total}</h2>
            <div className="text-right">
              <p className="text-sm font-bold text-stone-500">{local_t.pubProd || 'Published'}: <span className="text-brand-dark">{stats.published}</span></p>
              <p className="text-sm font-bold text-stone-500">{local_t.pendingEnq || 'Pending'}: <span className="text-brand-dark">{stats.pending}</span></p>
            </div>
          </div>
          <button 
            data-guide-id="add-product-button"
            id="add-product-button" 
            onClick={() => navigate('/artisan/product/create')}
            className="w-full bg-brand-dark text-white font-bold py-4 rounded-2xl hover:bg-black transition-colors"
          >
            {local_t.addProduct || 'Add Product'}
          </button>
        </div>

        {/* Horizontal Scroll Cards (Next Step / Profile Info) */}
        <div>
          <div className="flex justify-between items-end mb-4">
            <h3 className="text-lg font-bold">Your tasks</h3>
          </div>
          <div className="flex space-x-4 overflow-x-auto pb-4 hide-scrollbar">
            
            {/* Next Step Card (Neon) */}
            <div className="min-w-[200px] bg-brand-neon rounded-[28px] p-5 shadow-sm relative overflow-hidden flex flex-col justify-between h-48 cursor-pointer">
              <div className="absolute -top-4 -right-4 text-brand-dark/10">
                <AlertCircle size={100} />
              </div>
              <div className="relative z-10">
                <div className="w-10 h-10 bg-brand-dark rounded-full flex items-center justify-center mb-4 text-brand-neon">
                  <AlertCircle size={20} />
                </div>
                <h4 className="font-extrabold text-brand-dark leading-tight">{local_t.nextStep || "Today's Next Step"}</h4>
              </div>
              <p className="text-sm font-semibold text-brand-dark/80 relative z-10 line-clamp-2 mt-2">
                {local_t.nextStepDesc || 'Upload photos of your latest craft!'}
              </p>
            </div>

            {/* Profile Completion Card (Dark) */}
            <div className="min-w-[200px] bg-brand-dark rounded-[28px] p-5 shadow-sm relative overflow-hidden flex flex-col justify-between h-48 cursor-pointer" onClick={() => navigate('/artisan/setup')}>
              <div className="absolute -bottom-4 -right-4 text-white/5">
                <CheckCircle2 size={120} />
              </div>
              <div className="relative z-10">
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center mb-4 text-white">
                  <CheckCircle2 size={20} />
                </div>
                <h4 className="font-extrabold text-white leading-tight">Profile Status</h4>
              </div>
              <p className="text-sm font-semibold text-stone-400 relative z-10 mt-2">
                Tap to complete your profile details.
              </p>
            </div>
          </div>
        </div>

        {/* Recent Enquiries (List) */}
        <div>
          <div className="flex justify-between items-end mb-4">
            <h3 className="text-lg font-bold">{local_t.recentEnq || 'Recent Enquiries'}</h3>
            <button onClick={() => navigate('/artisan/enquiries')} className="text-sm font-bold text-stone-500">See all</button>
          </div>
          <div className="bg-white rounded-[32px] p-4 shadow-sm border border-stone-100/50 space-y-4">
            {recentEnquiry ? (
              <div 
                className="flex items-center justify-between p-2 cursor-pointer group"
                onClick={() => navigate(`/artisan/enquiry/${recentEnquiry.id}`)}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden bg-stone-200 border border-stone-100 shrink-0">
                    {recentEnquiry.products?.images?.[0]?.image_url ? (
                      <img src={recentEnquiry.products.images[0].image_url} alt="Product" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-400 text-xs">No Img</div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-stone-800 line-clamp-1">{recentEnquiry.products?.title || 'Product'}</h4>
                    <p className="text-xs font-semibold text-stone-500 mt-1 flex items-center gap-2">
                      <span>{recentEnquiry.buyer?.display_name || 'Anonymous'}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase ${recentEnquiry.status === 'new' ? 'bg-blue-100 text-blue-700' : 'bg-stone-100 text-stone-600'}`}>
                        {recentEnquiry.status}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="text-right pl-4">
                  <ChevronRight size={20} className="text-stone-300 group-hover:text-brand-dark transition-colors" />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-2">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-brand-bg rounded-2xl flex items-center justify-center text-stone-400">
                    <MessageSquare size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-stone-800">No enquiries yet</h4>
                    <p className="text-xs font-semibold text-stone-400 mt-1">Check back later</p>
                  </div>
                </div>
                <div className="text-right">
                  <ChevronRight size={20} className="text-stone-300" />
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
      
      {/* Real Guide Workflow for Artisan Home */}
      {fetchedWorkflow && (
        <ShowMeFab workflow={fetchedWorkflow} />
      )}

      <BottomNav />
    </div>
  );
}
