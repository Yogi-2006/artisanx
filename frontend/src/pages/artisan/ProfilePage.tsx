import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Edit3, PlusCircle } from 'lucide-react';
import api from '../../lib/api';
import BottomNav from '../../components/BottomNav';
import { useTranslation } from 'react-i18next';

export default function ProfilePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div className="min-h-screen bg-brand-bg flex items-center justify-center">{t('common.loading')}</div>;

  return (
    <div className="w-full pb-24 font-sans text-brand-dark">
      <div className="w-full px-6 pt-10 space-y-8">
        
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold">My Profile</h1>
        </div>

        {!profile ? (
          <div className="bg-white rounded-[32px] p-6 shadow-sm border border-stone-100/50 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-brand-neon/20 text-brand-dark rounded-full flex items-center justify-center mb-4">
              <User size={32} />
            </div>
            <h2 className="text-xl font-bold mb-2">Complete Your Profile</h2>
            <p className="text-stone-500 mb-6 text-sm">
              Your profile helps buyers learn about your craft and is required to generate Product Passports.
            </p>
            <button 
              onClick={() => navigate('/artisan/setup')}
              className="w-full bg-brand-dark text-brand-neon font-bold py-4 rounded-2xl hover:bg-black transition-colors flex items-center justify-center gap-2"
            >
              <PlusCircle size={20} /> Create Profile
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-[32px] p-6 shadow-sm border border-stone-100/50 space-y-6">
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
              className="w-full border-2 border-brand-dark text-brand-dark font-bold py-3 rounded-2xl hover:bg-brand-bg transition-colors flex items-center justify-center gap-2"
            >
              <Edit3 size={18} /> Edit Profile
            </button>
          </div>
        )}

      </div>
      <BottomNav />
    </div>
  );
}
