import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Edit3, PlusCircle, LogOut, LifeBuoy, X } from 'lucide-react';
import api from '../../lib/api';
import { useAuthStore } from '../../stores/authStore';
import BottomNav from '../../components/BottomNav';
import { useTranslation } from 'react-i18next';

export default function ProfilePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [showSupportModal, setShowSupportModal] = useState(false);
  const [supportCategory, setSupportCategory] = useState('technical_issue');
  const [supportSummary, setSupportSummary] = useState('');
  const [supportDescription, setSupportDescription] = useState('');
  const [submittingSupport, setSubmittingSupport] = useState(false);

  const handleCreateSupportRequest = async () => {
    if (!supportSummary || !supportDescription) return alert('Fill all fields');
    setSubmittingSupport(true);
    try {
      await api.post('/support-requests/', {
        category: supportCategory,
        issue_summary: supportSummary,
        description: supportDescription
      });
      setShowSupportModal(false);
      setSupportSummary('');
      setSupportDescription('');
      alert('Support request created successfully. A facilitator will respond soon.');
    } catch (err) {
      console.error(err);
      alert('Failed to create support request');
    } finally {
      setSubmittingSupport(false);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/artisans/me');
        setProfile(data);
      } catch (err) {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return <div className="min-h-screen bg-surface-container-lowest flex items-center justify-center">{t('common.loading')}</div>;

  return (
    <div className="w-full pb-24 font-sans text-on-surface bg-surface min-h-screen relative">
      <header className="fixed top-0 inset-x-0 mobile-shell-width z-40 bg-surface/90 backdrop-blur-md pt-safe border-b border-outline-variant/20">
        <div className="h-14 px-4 flex items-center justify-between">
          <button onClick={() => navigate('/artisan')} className="w-10 h-10 flex items-center justify-center -ml-2 rounded-full hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined text-on-surface">arrow_back</span>
          </button>
          <h1 className="text-lg font-bold text-on-surface">My Profile</h1>
          <button onClick={() => navigate('/artisan/setup')} className="w-10 h-10 flex items-center justify-center -mr-2 rounded-full hover:bg-surface-container transition-colors text-on-surface-variant">
            <span className="material-symbols-outlined">settings</span>
          </button>
        </div>
      </header>

      <div className="w-full px-5 pt-24 space-y-8 max-w-lg mx-auto">
        
        {/* Profile Header */}
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 bg-surface-container-high rounded-full flex items-center justify-center text-3xl font-bold overflow-hidden border-[3px] border-surface shadow-sm mb-3 relative">
            {profile?.profile_photo_url ? (
              <img src={profile.profile_photo_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-on-surface-variant">{profile?.artisan_name?.charAt(0) || <User className="w-10 h-10" />}</span>
            )}
            {!profile && (
              <button 
                onClick={() => navigate('/artisan/setup')}
                className="absolute inset-0 bg-black/40 flex items-center justify-center text-white"
              >
                <PlusCircle className="w-8 h-8" />
              </button>
            )}
          </div>
          <h2 className="text-2xl font-extrabold text-on-surface text-center leading-tight">
            {profile?.artisan_name || 'Complete Profile'}
          </h2>
          <p className="text-sm font-medium text-on-surface-variant mt-1 text-center">
            {profile?.business_name || profile?.craft_type || 'Set up your artisan profile'}
          </p>
        </div>

        {/* Action List */}
        <div className="bg-surface-container-lowest rounded-[24px] border border-outline-variant/30 overflow-hidden shadow-sm">
          
          <button onClick={() => navigate('/artisan/orders')} className="w-full flex items-center justify-between p-4 bg-surface-container-lowest hover:bg-surface-container-low transition-colors active:bg-surface-container">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-xl">receipt_long</span>
              <span className="font-semibold text-on-surface text-[15px]">My Orders</span>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant text-lg">chevron_right</span>
          </button>
          
          <div className="w-full h-px bg-outline-variant/20 ml-12"></div>
          
          <button onClick={() => navigate('/artisan/enquiries')} className="w-full flex items-center justify-between p-4 bg-surface-container-lowest hover:bg-surface-container-low transition-colors active:bg-surface-container">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-xl">forum</span>
              <span className="font-semibold text-on-surface text-[15px]">My Enquiries</span>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant text-lg">chevron_right</span>
          </button>
          
          <div className="w-full h-px bg-outline-variant/20 ml-12"></div>

          <button onClick={() => navigate('/artisan/reviews')} className="w-full flex items-center justify-between p-4 bg-surface-container-lowest hover:bg-surface-container-low transition-colors active:bg-surface-container">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-xl">star</span>
              <span className="font-semibold text-on-surface text-[15px]">My Reviews</span>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant text-lg">chevron_right</span>
          </button>

          <div className="w-full h-px bg-outline-variant/20 ml-12"></div>

          <button onClick={() => navigate('/artisan/analytics')} className="w-full flex items-center justify-between p-4 bg-surface-container-lowest hover:bg-surface-container-low transition-colors active:bg-surface-container">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-xl">insights</span>
              <span className="font-semibold text-on-surface text-[15px]">Business Analytics</span>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant text-lg">chevron_right</span>
          </button>

          <div className="w-full h-px bg-outline-variant/20 ml-12"></div>

          <button onClick={() => setShowSupportModal(true)} className="w-full flex items-center justify-between p-4 bg-surface-container-lowest hover:bg-surface-container-low transition-colors active:bg-surface-container">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-xl">support_agent</span>
              <span className="font-semibold text-on-surface text-[15px]">Help & Support</span>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant text-lg">chevron_right</span>
          </button>
          
          <div className="w-full h-px bg-outline-variant/20 ml-12"></div>

          <button onClick={() => navigate('/language')} className="w-full flex items-center justify-between p-4 bg-surface-container-lowest hover:bg-surface-container-low transition-colors active:bg-surface-container">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-xl">language</span>
              <span className="font-semibold text-on-surface text-[15px]">App Language</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium text-on-surface-variant mr-1">English</span>
              <span className="material-symbols-outlined text-on-surface-variant text-lg">chevron_right</span>
            </div>
          </button>
          
          <div className="w-full h-px bg-outline-variant/20 ml-12"></div>

          <button onClick={() => { logout(); navigate('/login'); }} className="w-full flex items-center justify-between p-4 bg-surface-container-lowest hover:bg-surface-container-low transition-colors active:bg-error-container">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-error text-xl">logout</span>
              <span className="font-semibold text-error text-[15px]">Logout</span>
            </div>
          </button>
          
        </div>

      </div>

      {/* Support Modal */}
      {showSupportModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface w-full max-w-sm rounded-3xl p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setShowSupportModal(false)} className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface bg-surface-container rounded-full p-1">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">support_agent</span> Contact Support
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-on-surface mb-1">Category</label>
                <select 
                  value={supportCategory} 
                  onChange={e => setSupportCategory(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary text-on-surface"
                >
                  <option value="technical_issue">Technical Issue</option>
                  <option value="payment_issue">Payment Issue</option>
                  <option value="shipping_issue">Shipping Issue</option>
                  <option value="account_issue">Account Issue</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-on-surface mb-1">Summary</label>
                <input 
                  type="text"
                  value={supportSummary}
                  onChange={e => setSupportSummary(e.target.value)}
                  placeholder="Briefly describe the issue..."
                  className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-on-surface font-medium placeholder:text-on-surface-variant/50"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-on-surface mb-1">Description</label>
                <textarea 
                  value={supportDescription}
                  onChange={e => setSupportDescription(e.target.value)}
                  placeholder="Provide detailed explanation..."
                  className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary min-h-[80px] text-on-surface font-medium placeholder:text-on-surface-variant/50"
                />
              </div>
              <button 
                onClick={handleCreateSupportRequest}
                disabled={submittingSupport || !supportSummary || !supportDescription}
                className="w-full bg-primary text-on-primary py-4 rounded-xl font-bold active:scale-95 transition-transform flex items-center justify-center disabled:opacity-50 mt-2"
              >
                {submittingSupport ? "Sending..." : "Submit Request"}
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
