import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { notificationsService } from '../services/api';
import { useAuth } from './AuthContext';

export interface Notification {
  id: string;
  type: 'order' | 'promotion' | 'system' | 'reward';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

interface NotificationsContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  unreadCount: number;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (user) {
      notificationsService.getNotifications().then(data => {
        setNotifications(data.map(n => ({
          id: n.id.toString(),
          type: n.type,
          title: n.title,
          message: n.message,
          timestamp: n.created_at,
          read: n.is_read === 1,
          actionUrl: n.action_url,
        })));
      }).catch(console.error);
    } else {
      setNotifications([]);
    }
  }, [user]);

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    // For demo, just add locally. In real app you'd call an API.
    const newNotif: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markAsRead = async (id: string) => {
    await notificationsService.markAsRead(parseInt(id));
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = async () => {
    await Promise.all(notifications.filter(n => !n.read).map(n => notificationsService.markAsRead(parseInt(n.id))));
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = async (id: string) => {
    await notificationsService.deleteNotification(parseInt(id));
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationsContext.Provider value={{ notifications, addNotification, markAsRead, markAllAsRead, deleteNotification, unreadCount }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (!context) throw new Error('useNotifications must be used within NotificationsProvider');
  return context;
}