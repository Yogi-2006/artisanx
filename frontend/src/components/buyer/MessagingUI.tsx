import { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '../../stores/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface Message {
    id: string;
    sender_id: string;
    message: string;
    created_at: string;
}

export default function MessagingUI({ enquiryId, currentUserId }: { enquiryId: string, currentUserId: string }) {
    const { token } = useAuthStore();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        async function fetchMessages() {
            try {
                // Fetch the conversation by enquiry_id
                // Our backend might need to get conversation ID first
                const convRes = await axios.get(`${API_URL}/conversations/`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                // Find the conversation for this enquiry
                const conv = convRes.data.conversations.find((c: any) => c.enquiry_id === enquiryId);
                
                if (conv) {
                    const msgRes = await axios.get(`${API_URL}/conversations/${conv.id}/messages`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setMessages(msgRes.data.messages || []);
                }
            } catch (err) {
                console.error("Failed to load messages", err);
            } finally {
                setLoading(false);
            }
        }
        
        if (enquiryId) fetchMessages();
    }, [enquiryId, token]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            // Check if conversation exists
            let convRes = await axios.get(`${API_URL}/conversations/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            let conv = convRes.data.conversations.find((c: any) => c.enquiry_id === enquiryId);
            
            // Send message
            if (conv) {
                const res = await axios.post(`${API_URL}/conversations/${conv.id}/messages`, {
                    message: newMessage
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMessages([...messages, res.data.message]);
                setNewMessage("");
            }
        } catch (err) {
            console.error("Failed to send message", err);
        }
    };

    return (
        <div className="bg-surface rounded-2xl flex flex-col h-[350px] shadow-sm border border-outline-variant overflow-hidden">
            <div className="bg-surface-container-high px-4 py-3 flex items-center gap-2 border-b border-outline-variant">
                <MessageCircle className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-on-surface">Conversation</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50">
                {loading ? (
                    <div className="flex justify-center"><div className="animate-pulse w-6 h-6 bg-stone-300 rounded-full"></div></div>
                ) : messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-stone-400">
                        <MessageCircle className="w-10 h-10 mb-2 opacity-20" />
                        <p className="text-sm">No messages yet.</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMe = msg.sender_id === currentUserId;
                        return (
                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                                    isMe ? 'bg-primary text-on-primary rounded-tr-none' : 'bg-surface text-on-surface border border-outline-variant rounded-tl-none'
                                }`}>
                                    <div className="break-words">{msg.message}</div>
                                    <div className={`text-[10px] mt-1 text-right ${isMe ? 'text-primary-container/80' : 'text-stone-400'}`}>
                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={sendMessage} className="p-3 bg-surface border-t border-outline-variant flex gap-2 items-end">
                <textarea 
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-surface-container rounded-xl px-3 py-2 text-sm border-none focus:ring-1 focus:ring-primary min-h-[40px] max-h-[100px] resize-none"
                    rows={1}
                />
                <button 
                    type="submit" 
                    disabled={!newMessage.trim()}
                    className="w-10 h-10 bg-primary text-on-primary rounded-full flex items-center justify-center disabled:opacity-50 hover:bg-primary/90 transition-colors shrink-0"
                >
                    <Send className="w-4 h-4" />
                </button>
            </form>
        </div>
    );
}
