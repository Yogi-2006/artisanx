import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, CheckCircle } from 'lucide-react';
import api from '../../lib/api';
import { useAuthStore } from '../../stores/authStore';

export default function DisputeDetail() {
  const { id } = useParams<{id: string}>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [dispute, setDispute] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [showResolution, setShowResolution] = useState(false);
  const [resolutionSummary, setResolutionSummary] = useState('');
  
  const conversationId = dispute?.conversations?.[0]?.id;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await api.get(`/disputes/${id}`);
        setDispute(res.data.dispute);
        
        const convId = res.data.dispute.conversations?.[0]?.id;
        if (convId) {
          const msgRes = await api.get(`/conversations/${convId}/messages`);
          setMessages(msgRes.data.messages || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !conversationId) return;
    try {
      const res = await api.post(`/conversations/${conversationId}/messages`, { content: newMessage });
      setMessages([...messages, { ...res.data.message, sender: { display_name: user?.full_name || 'Me' }, sender_id: user?.id }]);
      setNewMessage('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusUpdate = async (status: string, extra: any = {}) => {
    try {
      await api.put(`/disputes/${id}`, { status, ...extra });
      setDispute({ ...dispute, status, ...extra });
      if (status === 'resolved') {
        setShowResolution(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const submitResolution = () => {
    if (!resolutionSummary.trim()) return alert("Summary required");
    handleStatusUpdate('resolved', { resolution_summary: resolutionSummary });
  };

  if (loading) return <div className="min-h-screen flex justify-center items-center"><div className="animate-pulse w-8 h-8 bg-stone-300 rounded-full"></div></div>;
  if (!dispute) return <div>Not Found</div>;

  return (
    <div className="min-h-screen flex flex-col bg-surface-container-lowest">
      <div className="bg-surface px-6 pt-12 pb-4 sticky top-0 z-10 border-b border-outline-variant/30 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-stone-100">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold capitalize">{dispute.reason.replace(/_/g, ' ')}</h1>
          </div>
        </div>
        <div className="flex justify-between items-center ml-10">
          <span className="text-[10px] font-bold text-stone-500 bg-stone-100 px-2 py-1 rounded">
            ORDER #{dispute.order_id.split('-')[0].toUpperCase()}
          </span>
          <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${dispute.status === 'resolved' || dispute.status === 'closed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {dispute.status.replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
        {/* Detail Card */}
        <div className="bg-surface p-5 rounded-3xl border border-outline-variant shadow-sm text-sm text-stone-700">
          <div className="grid grid-cols-2 gap-4 mb-4 border-b border-stone-100 pb-4">
            <div>
              <div className="text-xs text-stone-500 font-bold uppercase">Buyer</div>
              <div className="font-bold">{dispute.buyer?.display_name || 'Unknown'}</div>
            </div>
            <div>
              <div className="text-xs text-stone-500 font-bold uppercase">Artisan</div>
              <div className="font-bold">{dispute.artisan?.display_name || 'Unknown'}</div>
            </div>
          </div>
          
          <div className="mb-4">
            <div className="text-xs text-stone-500 font-bold uppercase mb-1">Explanation ({dispute.raised_by_role})</div>
            <p className="whitespace-pre-wrap bg-stone-50 p-3 rounded-xl border border-stone-100">
              {dispute.raised_by_role === 'buyer' ? dispute.buyer_explanation : dispute.artisan_explanation}
            </p>
          </div>

          <div className="mb-4">
            <div className="text-xs text-stone-500 font-bold uppercase mb-1">Real Order Timeline</div>
            <div className="bg-stone-50 p-3 rounded-xl border border-stone-100 text-xs font-mono text-stone-600">
              {dispute.order ? (
                <>
                  <div>Created: {new Date(dispute.order.created_at).toLocaleString()}</div>
                  <div>Status: {dispute.order.status}</div>
                  <div>Amount: ${dispute.order.total_price}</div>
                </>
              ) : 'Order details not available'}
            </div>
          </div>

          {dispute.resolution_summary && (
            <div className="mb-4">
              <div className="text-xs text-green-600 font-bold uppercase mb-1 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Resolution
              </div>
              <p className="whitespace-pre-wrap bg-green-50 p-3 rounded-xl border border-green-100 text-green-800">
                {dispute.resolution_summary}
              </p>
            </div>
          )}
          
          {user?.role === 'facilitator' && dispute.status !== 'resolved' && dispute.status !== 'closed' && (
            <div className="mt-4 flex flex-wrap gap-2">
              {!showResolution ? (
                <>
                  <button 
                    onClick={() => handleStatusUpdate('under_review')}
                    className="px-3 py-2 bg-stone-100 font-bold rounded-xl text-stone-700 hover:bg-stone-200 text-xs flex-1 text-center"
                  >
                    Under Review
                  </button>
                  <button 
                    onClick={() => handleStatusUpdate('waiting_for_buyer')}
                    className="px-3 py-2 bg-stone-100 font-bold rounded-xl text-stone-700 hover:bg-stone-200 text-xs flex-1 text-center"
                  >
                    Wait Buyer
                  </button>
                  <button 
                    onClick={() => handleStatusUpdate('waiting_for_artisan')}
                    className="px-3 py-2 bg-stone-100 font-bold rounded-xl text-stone-700 hover:bg-stone-200 text-xs flex-1 text-center"
                  >
                    Wait Artisan
                  </button>
                  <button 
                    onClick={() => setShowResolution(true)}
                    className="px-3 py-2 bg-green-500 font-bold rounded-xl text-white hover:bg-green-600 text-xs w-full text-center mt-2"
                  >
                    Record Resolution
                  </button>
                </>
              ) : (
                <div className="w-full flex flex-col gap-2">
                  <textarea
                    className="w-full p-2 border border-outline-variant rounded-xl text-sm"
                    rows={3}
                    placeholder="Describe how this was resolved..."
                    value={resolutionSummary}
                    onChange={(e) => setResolutionSummary(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <button onClick={() => setShowResolution(false)} className="flex-1 py-2 bg-stone-100 text-stone-700 rounded-xl font-bold text-xs">Cancel</button>
                    <button onClick={submitResolution} className="flex-1 py-2 bg-green-500 text-white rounded-xl font-bold text-xs">Resolve</button>
                  </div>
                </div>
              )}
            </div>
          )}
          {user?.role === 'facilitator' && dispute.status === 'resolved' && (
            <button 
              onClick={() => handleStatusUpdate('closed')}
              className="px-3 py-2 bg-stone-800 mt-4 font-bold rounded-xl text-white hover:bg-stone-900 text-xs w-full text-center"
            >
              Close Dispute
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="text-center text-xs font-bold text-stone-400 uppercase tracking-wide border-b border-stone-200 pb-2">
            Dispute Discussion
          </div>
          {messages.map(msg => {
            const isMe = msg.sender_id === user?.id;
            // Differentiate participants by color slightly if needed, but keeping it simple
            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[85%] ${isMe ? 'self-end' : 'self-start'}`}>
                <div className={`p-3 rounded-2xl ${isMe ? 'bg-primary text-on-primary rounded-br-none' : 'bg-surface border border-outline-variant rounded-bl-none text-on-surface'}`}>
                  {msg.content}
                </div>
                <div className="text-[10px] text-stone-400 mt-1 px-1">
                  {msg.sender?.display_name || 'System'} • {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      {dispute.status !== 'resolved' && dispute.status !== 'closed' && (
        <div className="bg-surface p-4 border-t border-outline-variant/30 pb-safe">
          <div className="flex items-center gap-2 bg-surface-container-lowest border border-outline-variant/50 rounded-full p-1 pl-4">
            <input 
              type="text" 
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
              placeholder={t('facilitator.type_message') || "Type a message..."}
              className="flex-1 bg-transparent outline-none py-2 text-sm"
            />
            <button 
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary disabled:opacity-50 shrink-0"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
