import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import api from '../../lib/api';
import { useAuthStore } from '../../stores/authStore';

export default function SupportRequestDetail() {
  const { id } = useParams<{id: string}>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [request, setRequest] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  const conversationId = request?.conversations?.[0]?.id;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const reqRes = await api.get(`/support-requests/${id}`);
        setRequest(reqRes.data.support_request);
        
        const convId = reqRes.data.support_request.conversations?.[0]?.id;
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

  const handleStatusUpdate = async (status: string) => {
    setUpdating(true);
    try {
      await api.put(`/support-requests/${id}`, { status });
      setRequest({ ...request, status });
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="min-h-screen flex justify-center items-center"><div className="animate-pulse w-8 h-8 bg-stone-300 rounded-full"></div></div>;
  if (!request) return <div>Not Found</div>;

  return (
    <div className="min-h-screen flex flex-col bg-surface-container-lowest">
      <div className="bg-surface px-6 pt-12 pb-6 sticky top-0 z-10 border-b border-outline-variant/30 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-stone-100">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold">{request.issue_summary}</h1>
        </div>
        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${request.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
          {request.status.replace('_', ' ')}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
        {/* Detail Card */}
        <div className="bg-surface p-4 rounded-3xl border border-outline-variant shadow-sm text-sm text-stone-700">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-xs text-stone-500 font-bold uppercase">Artisan</div>
              <div className="font-bold">{request.artisan?.display_name || 'Unknown'}</div>
            </div>
            <div>
              <div className="text-xs text-stone-500 font-bold uppercase">Category</div>
              <div className="font-bold capitalize">{request.category.replace('_', ' ')}</div>
            </div>
          </div>
          <div>
            <div className="text-xs text-stone-500 font-bold uppercase mb-1">Description</div>
            <p className="whitespace-pre-wrap">{request.description}</p>
          </div>
          
          {user?.role === 'facilitator' && request.status !== 'resolved' && (
            <div className="mt-4 flex gap-2">
              <button 
                onClick={() => handleStatusUpdate('in_progress')}
                disabled={updating}
                className="px-4 py-2 bg-stone-100 font-bold rounded-xl text-stone-700 hover:bg-stone-200 text-xs flex-1"
              >
                Mark In Progress
              </button>
              <button 
                onClick={() => handleStatusUpdate('resolved')}
                disabled={updating}
                className="px-4 py-2 bg-green-500 font-bold rounded-xl text-white hover:bg-green-600 text-xs flex-1"
              >
                Mark Resolved
              </button>
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 flex flex-col gap-4">
          {messages.map(msg => {
            const isMe = msg.sender_id === user?.id;
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
      {request.status !== 'resolved' && (
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
