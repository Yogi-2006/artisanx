import { useState } from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import { NotificationPanel } from './NotificationPanel';

export function NotificationBell() {
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const { unreadCount } = useNotifications();

    return (
        <>
            <button 
                onClick={() => setIsPanelOpen(true)}
                className="w-10 h-10 rounded-full flex items-center justify-center relative transition-colors shadow-sm bg-surface-container-highest text-on-surface-variant hover:bg-surface-container-high"
            >
                <Bell size={20} className="text-current" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 w-4 h-4 bg-error text-on-error text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-surface">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>
            <NotificationPanel isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)} />
        </>
    );
}
