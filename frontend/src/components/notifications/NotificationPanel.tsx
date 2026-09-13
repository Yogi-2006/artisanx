
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useNotifications, type Notification } from '../../hooks/useNotifications';
import { X, Bell, Package, MessageSquare, CheckCircle, Info } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

interface NotificationPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

export function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { notifications, markAsRead, markAllAsRead, unreadCount } = useNotifications();

    if (!isOpen) return null;

    const getIcon = (type: string) => {
        switch (type) {
            case 'enquiry_new':
            case 'enquiry_response':
                return <MessageSquare className="w-5 h-5 text-blue-500" />;
            case 'product_published':
                return <Package className="w-5 h-5 text-green-500" />;
            case 'profile_verified':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            default:
                return <Info className="w-5 h-5 text-gray-500" />;
        }
    };

    const handleNotificationClick = async (notification: Notification) => {
        if (!notification.is_read) {
            await markAsRead(notification.id);
        }

        const { type, metadata } = notification;
        if (type === 'enquiry_new' || type === 'enquiry_response') {
            if (user?.role === 'artisan') {
                navigate(`/artisan/enquiry/${metadata?.enquiry_id}`);
            } else if (user?.role === 'buyer') {
                navigate(`/buyer/enquiry/${metadata?.enquiry_id}`); 
            }
        } else if (type === 'product_published') {
            navigate(`/artisan/products/${metadata?.product_id}/edit`);
        } else if (type === 'profile_verified') {
            navigate(`/artisan/profile`);
        }
        
        onClose();
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
        
        if (diffInSeconds < 60) return t('notifications.just_now', 'Just now');
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return `${Math.floor(diffInSeconds / 86400)}d ago`;
    };

    return (
        <div className="absolute inset-0 z-50 bg-brand-bg flex flex-col animate-in slide-in-from-right-full duration-300">
            <div className="flex items-center justify-between p-4 border-b bg-white shadow-sm">
                <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-gray-900">{t('notifications.title', 'Notifications')}</h2>
                    {unreadCount > 0 && (
                        <span className="bg-brand-accent text-brand-dark px-2 py-0.5 rounded-full text-xs font-bold">
                            {unreadCount}
                        </span>
                    )}
                </div>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                    <X className="w-6 h-6 text-brand-dark" />
                </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {notifications.length > 0 && unreadCount > 0 && (
                    <button 
                        onClick={markAllAsRead}
                        className="text-sm font-semibold text-brand-dark hover:underline w-full text-right"
                    >
                        {t('notifications.mark_all_read', 'Mark all as read')}
                    </button>
                )}

                {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                        <Bell className="w-12 h-12 mb-4 opacity-50" />
                        <p>{t('notifications.empty', 'No notifications yet')}</p>
                    </div>
                ) : (
                    notifications.map(notification => (
                        <div 
                            key={notification.id}
                            onClick={() => handleNotificationClick(notification)}
                            className={`p-4 rounded-xl border flex gap-3 cursor-pointer transition-colors ${
                                notification.is_read 
                                    ? 'bg-white border-gray-100' 
                                    : 'bg-stone-50 border-brand-accent shadow-sm'
                            }`}
                        >
                            <div className="mt-1">
                                {getIcon(notification.type)}
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h3 className={`text-sm ${notification.is_read ? 'font-medium text-gray-700' : 'font-bold text-gray-900'}`}>
                                        {notification.type === 'enquiry_response' ? t('notifications.artisan_replied', 'Artisan replied to your enquiry') : notification.title}
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        {!notification.is_read ? (
                                            <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">New</span>
                                        ) : (
                                            <span className="bg-stone-100 text-stone-500 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">Viewed</span>
                                        )}
                                        <span className="text-xs text-gray-400 whitespace-nowrap">
                                            {formatDate(notification.created_at)}
                                        </span>
                                    </div>
                                </div>
                                {notification.type === 'enquiry_response' ? (
                                    <div className="mt-1">
                                        <p className="text-xs text-gray-500 font-medium mb-0.5">
                                            {notification.metadata?.product_title}
                                        </p>
                                        <p className={`text-sm ${notification.is_read ? 'text-gray-500' : 'text-gray-700 font-medium'}`}>
                                            "{notification.metadata?.response_preview}"
                                        </p>
                                    </div>
                                ) : (
                                    <p className={`text-sm mt-1 ${notification.is_read ? 'text-gray-500' : 'text-gray-700 font-medium'}`}>
                                        {notification.message}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
