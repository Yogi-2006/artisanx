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
    <div className="w-full pb-24 font-sans text-on-surface bg-surface-container-lowest min-h-screen">
      <div className="w-full px-6 pt-10 space-y-8">
        
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold">{t('profile.my_profile')}</h1>
          <button 
            onClick={() => { logout(); navigate('/login'); }} 
            className="p-2 bg-surface rounded-full shadow-sm text-stone-600 hover:text-primary transition-colors border border-outline-variant/50" 
            title={t('common.logout')}
          >
            <LogOut size={20} />
          </button>
        </div>

        {!profile ? (
          <div className="bg-surface rounded-3xl p-6 shadow-sm border border-outline-variant flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-primary-container text-on-primary-container rounded-full flex items-center justify-center mb-4">
              <User size={32} />
            </div>
            <h2 className="text-xl font-bold mb-2">{t('profile.complete_profile')}</h2>
            <p className="text-stone-500 mb-6 text-sm">
              Your profile helps buyers learn about your craft and is required to generate Product Passports.
            </p>
            <button 
              onClick={() => navigate('/artisan/setup')}
              className="w-full bg-primary text-on-primary font-bold py-4 rounded-full hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
            >
              <PlusCircle size={20} /> Create Profile
            </button>
          </div>
        ) : (
          <div className="bg-surface rounded-3xl p-6 shadow-sm border border-outline-variant space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center text-xl font-bold overflow-hidden border border-stone-200">
                {profile.artisan_name?.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-bold">{profile.artisan_name}</h2>
                <p className="text-stone-500 text-sm">{profile.craft_type}</p>
              </div>
            </div>

            <div className="space-y-4">
               <div>
                 <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">{t('profile.business_name')}</p>
                 <p className="font-semibold text-stone-800">{profile.business_name || '-'}</p>
               </div>
               <div>
                 <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">{t('profile.location')}</p>
                 <p className="font-semibold text-stone-800">{profile.location || '-'}</p>
               </div>
               <div>
                 <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">{t('profile.craft_story')}</p>
                 <p className="font-semibold text-stone-800 text-sm">{profile.craft_story || '-'}</p>
               </div>
            </div>

            <button 
              onClick={() => navigate('/artisan/setup')}
              className="w-full border-2 border-primary text-primary font-bold py-3 rounded-full hover:bg-surface-container transition-colors flex items-center justify-center gap-2"
            >
              <Edit3 size={18} /> Edit Profile
            </button>
            <button 
              onClick={() => setShowSupportModal(true)}
              className="w-full border-2 border-stone-200 text-stone-700 font-bold py-3 rounded-full hover:bg-stone-100 transition-colors flex items-center justify-center gap-2"
            >
              <LifeBuoy size={18} /> Contact Support
            </button>
          </div>
        )}

      </div>

      {/* Support Modal */}
      {showSupportModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface w-full max-w-sm rounded-3xl p-6 shadow-2xl relative">
            <button onClick={() => setShowSupportModal(false)} className="absolute top-4 right-4 text-stone-400 hover:text-stone-600">
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold text-stone-800 mb-4 flex items-center gap-2">
              <LifeBuoy className="w-5 h-5 text-blue-500" /> Contact Support
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-1">Category</label>
                <select 
                  value={supportCategory} 
                  onChange={e => setSupportCategory(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="technical_issue">Technical Issue</option>
                  <option value="payment_issue">Payment Issue</option>
                  <option value="shipping_issue">Shipping Issue</option>
                  <option value="account_issue">Account Issue</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-1">Summary</label>
                <input 
                  type="text"
                  value={supportSummary}
                  onChange={e => setSupportSummary(e.target.value)}
                  placeholder="Briefly describe the issue..."
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-1">Description</label>
                <textarea 
                  value={supportDescription}
                  onChange={e => setSupportDescription(e.target.value)}
                  placeholder="Provide detailed explanation..."
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary min-h-[80px]"
                />
              </div>
              <button 
                onClick={handleCreateSupportRequest}
                disabled={submittingSupport || !supportSummary || !supportDescription}
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold active:scale-95 transition-transform flex items-center justify-center disabled:opacity-50"
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
