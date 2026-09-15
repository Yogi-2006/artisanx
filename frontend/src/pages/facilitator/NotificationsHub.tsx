import { useState } from 'react';
import { ArrowLeft, Filter, AlertTriangle, ShieldCheck, MessageSquare, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function NotificationsHub() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');

  // Dummy notifications to match design
  const notifications = [
    { id: 1, type: 'support', title: 'New support request', desc: 'from Ravi Kumar', time: '2 hours ago', unread: true },
    { id: 2, type: 'dispute', title: 'New dispute raised', desc: '#DP-0036', time: '4 hours ago', unread: true },
    { id: 3, type: 'product', title: 'Product resubmitted', desc: 'by Meera Devi', time: '6 hours ago', unread: true },
    { id: 4, type: 'buyer', title: 'Buyer responded', desc: 'in dispute #DP-0028', time: '1 day ago', unread: false },
    { id: 5, type: 'support', title: 'Artisan response', desc: 'in support #SR-0010', time: '1 day ago', unread: false },
    { id: 6, type: 'verification', title: 'New artisan review', desc: 'for Sunita Devi', time: '2 days ago', unread: false },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'support': return <MessageSquare className="w-5 h-5 text-blue-500" />;
      case 'dispute': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'product': return <Package className="w-5 h-5 text-purple-500" />;
      case 'buyer': return <MessageSquare className="w-5 h-5 text-green-500" />;
      case 'verification': return <ShieldCheck className="w-5 h-5 text-blue-500" />;
      default: return <MessageSquare className="w-5 h-5 text-stone-500" />;
    }
  };
  
  const getBg = (type: string) => {
    switch (type) {
      case 'support': return 'bg-blue-100';
      case 'dispute': return 'bg-red-100';
      case 'product': return 'bg-purple-100';
      case 'buyer': return 'bg-green-100';
      case 'verification': return 'bg-blue-100';
      default: return 'bg-stone-100';
    }
  };

  const filtered = notifications.filter(n => filter === 'All' ? true : n.unread);

  return (
    <div className="min-h-screen bg-surface-container-lowest text-on-surface">
      <div className="sticky top-0 z-10 bg-surface px-6 pt-12 pb-4 flex flex-col gap-4 shadow-sm border-b border-outline-variant/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-stone-500 hover:text-stone-800 rounded-full hover:bg-stone-100 transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold">Notifications</h1>
          </div>
          <div className="flex items-center gap-4 text-stone-500">
            <Filter className="w-5 h-5 cursor-pointer hover:text-primary" />
          </div>
        </div>
        
        <div className="flex gap-2">
          {['All', 'Unread (3)'].map(tab => (
            <button 
              key={tab}
              onClick={() => setFilter(tab)}
              className={`flex-1 py-2 rounded-full whitespace-nowrap text-sm font-bold transition-all ${
                filter === tab 
                  ? 'bg-primary text-on-primary' 
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      
      <div className="p-4 space-y-2">
        {filtered.map(n => (
          <div key={n.id} className="bg-surface rounded-2xl p-4 flex gap-4 items-start shadow-sm border border-outline-variant/30">
            <div className={`w-10 h-10 rounded-full ${getBg(n.type)} flex items-center justify-center shrink-0`}>
              {getIcon(n.type)}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-stone-800 text-sm">{n.title}</h4>
              <p className="text-stone-500 text-xs">{n.desc}</p>
              <p className="text-stone-400 text-[10px] mt-1">{n.time}</p>
            </div>
            {n.unread && <div className="w-2.5 h-2.5 bg-primary rounded-full mt-1 shrink-0"></div>}
          </div>
        ))}
      </div>
    </div>
  );
}
