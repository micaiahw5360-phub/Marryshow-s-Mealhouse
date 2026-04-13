import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Bell, Package, Tag, Gift, AlertCircle, CheckCircle, Trash2 } from 'lucide-react';
import { useNotifications } from '../contexts/NotificationsContext';

export function Notifications() {
  const navigate = useNavigate();
  const { notifications, markAsRead, markAllAsRead, deleteNotification, unreadCount } = useNotifications();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredNotifications = notifications.filter((notif) => {
    if (filter === 'unread') return !notif.read;
    return true;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <Package className="h-5 w-5" />;
      case 'promotion':
        return <Tag className="h-5 w-5" />;
      case 'reward':
        return <Gift className="h-5 w-5" />;
      case 'system':
        return <AlertCircle className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'order':
        return 'text-blue-600 bg-blue-100';
      case 'promotion':
        return 'text-orange-600 bg-orange-100';
      case 'reward':
        return 'text-green-600 bg-green-100';
      case 'system':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleAction = (notif: any) => {
    if (notif.actionUrl) {
      markAsRead(notif.id);
      navigate(notif.actionUrl);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
            <p className="text-gray-600">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" onClick={markAllAsRead}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark All Read
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-6" onValueChange={(value) => setFilter(value as any)}>
        <TabsList>
          <TabsTrigger value="all">
            All Notifications
            <Badge className="ml-2 bg-gray-200 text-gray-900 hover:bg-gray-200">
              {notifications.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="unread">
            Unread
            {unreadCount > 0 && (
              <Badge className="ml-2 bg-[#074af2] text-white hover:bg-[#074af2]">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No notifications</h3>
                <p className="text-gray-600">
                  {filter === 'unread'
                    ? 'You have no unread notifications'
                    : 'You have no notifications at this time'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredNotifications.map((notification) => (
              <Card
                key={notification.id}
                className={`hover:shadow-md transition-shadow ${
                  !notification.read ? 'border-l-4 border-l-[#074af2] bg-blue-50' : ''
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getIconColor(notification.type)}`}>
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-bold text-gray-900">{notification.title}</h3>
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="text-gray-400 hover:text-red-600 transition-colors ml-2"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-gray-700 mb-2">{notification.message}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-500">
                          {formatTimestamp(notification.timestamp)}
                        </p>
                        <div className="flex space-x-2">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                            >
                              Mark as Read
                            </Button>
                          )}
                          {notification.actionUrl && (
                            <Button size="sm" variant="outline" onClick={() => handleAction(notification)}>
                              View
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
