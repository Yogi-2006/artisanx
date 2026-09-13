import { Home, Package, MessageSquare, BookOpen, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  const navItems = [
    { name: 'Home', path: '/artisan', icon: Home },
    { name: 'Products', path: '/artisan/products', icon: Package },
    { name: 'Enquiries', path: '/artisan/enquiries', icon: MessageSquare },
    { name: 'Guide', path: '/artisan/guide', icon: BookOpen },
    { name: 'Profile', path: '/artisan/profile', icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 mobile-shell-width bg-white border-t border-stone-100 px-6 py-3 flex justify-between items-center z-50 rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.04)]">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = path === item.path || (item.path !== '/artisan' && path.startsWith(item.path));
        return (
          <button
            key={item.name}
            onClick={() => navigate(item.path)}
            className="flex flex-col items-center justify-center space-y-1 w-14"
          >
            <div className={`p-2.5 rounded-2xl transition-all duration-300 ${isActive ? 'bg-brand-neon text-brand-dark' : 'text-stone-400 hover:text-stone-600'}`}>
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span className={`text-[10px] font-bold transition-colors ${isActive ? 'text-brand-dark' : 'text-stone-400'}`}>
              {item.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
