import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';

export default function Conversations() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await api.get('/conversations');
        setConversations(res.data.conversations || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, []);

  return (
    <div className="w-full min-h-screen bg-surface flex flex-col pb-safe">
      <header className="fixed top-0 inset-x-0 mobile-shell-width z-40 bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] pt-safe">
        <div className="h-16 px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => navigate('/artisan')}
              className="min-w-[44px] min-h-[44px] -ml-2 flex items-center justify-center text-on-surface rounded-full hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined text-[24px]">arrow_back</span>
            </button>
            <h1 className="font-bold text-lg text-on-surface tracking-tight truncate ml-1">Messages</h1>
          </div>
        </div>
      </header>

      <main className="flex-1 px-6 pt-24 pb-8 w-full max-w-lg mx-auto space-y-4">
        {loading ? (
          <div className="flex justify-center p-8"><span className="text-on-surface-variant font-medium">Loading...</span></div>
        ) : conversations.length === 0 ? (
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-[20px] p-8 flex flex-col items-center text-center shadow-sm">
            <div className="w-16 h-16 bg-surface-container-high rounded-full flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-on-surface-variant text-3xl">chat_bubble_outline</span>
            </div>
            <h3 className="text-lg font-bold text-on-surface mb-2">No messages yet</h3>
            <p className="text-sm text-on-surface-variant">When buyers send you a message, it will appear here.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {conversations.map(conv => (
              <div 
                key={conv.id} 
                onClick={() => navigate(`/artisan/conversation/${conv.id}`)}
                className="bg-surface-container-lowest border border-outline-variant/30 rounded-[20px] p-4 flex items-center gap-4 cursor-pointer hover:bg-surface-container-low transition-colors shadow-sm relative active:scale-[0.98]"
              >
                {conv.unread_count > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-error text-on-error rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm">
                    {conv.unread_count}
                  </span>
                )}
                
                <div className="w-12 h-12 bg-primary-container text-on-primary-container rounded-full flex items-center justify-center shrink-0 text-lg font-bold">
                  {conv.buyer?.display_name?.charAt(0) || 'B'}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-on-surface truncate">{conv.buyer?.display_name || 'Buyer'}</h3>
                    <span className="text-[10px] font-medium text-on-surface-variant whitespace-nowrap ml-2">
                      {new Date(conv.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-on-surface-variant truncate font-medium">
                    {conv.enquiry?.products?.title ? `Re: ${conv.enquiry.products.title}` : 'General Enquiry'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
