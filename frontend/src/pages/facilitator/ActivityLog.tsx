import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Activity, User, FileText } from 'lucide-react';
import api from '../../lib/api';
import { useAuthStore } from '../../stores/authStore';

export default function ActivityLog() {
  const { t } = useTranslation();
  const { token } = useAuthStore();
  const navigate = useNavigate();
  
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data } = await api.get(`/facilitator/activity`);
        setActivities(data.activities);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (token) fetchData();
  }, [token]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-surface-container-lowest"><div className="animate-pulse w-8 h-8 rounded-full bg-stone-300"></div></div>;
  }

  return (
    <div className="w-full relative pb-24 bg-surface-container-lowest text-on-surface min-h-screen">
      <div className="bg-surface px-6 pt-12 pb-6 sticky top-0 z-10 border-b border-outline-variant/30 flex items-center gap-4">
        <button onClick={() => navigate('/facilitator')} className="p-2 -ml-2 rounded-full hover:bg-stone-100">
          <ArrowLeft className="w-6 h-6 text-on-surface" />
        </button>
        <h1 className="text-xl font-bold text-on-surface">{t('facilitator.activity_log') || 'Activity Log'}</h1>
      </div>

      <div className="p-6 space-y-4">
        {activities.length === 0 ? (
          <div className="bg-surface p-6 rounded-3xl border border-outline-variant text-center text-stone-500">
            No activity found.
          </div>
        ) : (
          activities.map((act) => (
            <div key={act.id} className="bg-surface p-4 rounded-3xl shadow-sm border border-outline-variant flex gap-4">
              <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 shrink-0">
                <Activity className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <div className="font-bold text-stone-800 text-sm">
                    {act.action.replace(/_/g, ' ')}
                  </div>
                  <div className="text-[10px] text-stone-500 font-medium">
                    {new Date(act.created_at).toLocaleString()}
                  </div>
                </div>
                
                {act.entity_type && act.entity_id && (
                  <div className="text-xs text-stone-500 mb-2 flex items-center gap-1">
                    <FileText className="w-3 h-3" /> {act.entity_type} {act.entity_id.slice(0, 8)}
                  </div>
                )}
                
                {act.notes && (
                  <div className="text-sm text-stone-700 bg-stone-50 p-2 rounded-lg border border-stone-100">
                    {act.notes}
                  </div>
                )}
                
                <div className="text-xs text-stone-400 mt-2 flex items-center gap-1">
                  <User className="w-3 h-3" /> {act.facilitator?.display_name || 'System'}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
