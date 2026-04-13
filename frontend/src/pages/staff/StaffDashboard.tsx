import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Clock,
  CheckCircle,
  XCircle,
  Package,
  RefreshCw,
  Search,
  Printer,
  ChevronDown,
  ChevronUp,
  Smartphone,
  Monitor,
  CreditCard,
  DollarSign,
  AlertCircle,
  BarChart3,
  Timer,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { toast } from '../../utils/toastWithSound';
import api from '../../services/api';
import { playNotificationSound, isSoundEnabled, setSoundEnabled } from '../../utils/sound';

// --- Types ---
interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  options?: any; // ✅ selected options (object or JSON string)
}

interface Order {
  id: number;
  customer_name: string;
  customer_phone: string;
  total: number;
  status: 'pending' | 'processing' | 'prepared' | 'completed' | 'cancelled';
  payment_method: string;
  source: string;
  pickup_time: string | null;
  order_date: string;
  items: OrderItem[];
}

interface Metrics {
  pending: number;
  processing: number;
  prepared: number;
  completed_today: number;
  avg_prep_time: number;
  total_orders_today: number;
}

// Helper to format options (supports JSON string or object)
const formatOptions = (options: any): string => {
  if (!options) return '';
  let parsed = options;
  if (typeof options === 'string') {
    try {
      parsed = JSON.parse(options);
    } catch {
      return '';
    }
  }
  const optionNames = Object.values(parsed).map((opt: any) => opt.name).filter(Boolean);
  return optionNames.length > 0 ? ` (${optionNames.join(', ')})` : '';
};

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  processing: 'bg-blue-100 text-blue-800 border-blue-300',
  prepared: 'bg-purple-100 text-purple-800 border-purple-300',
  completed: 'bg-green-100 text-green-800 border-green-300',
  cancelled: 'bg-red-100 text-red-800 border-red-300',
};

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  processing: 'Processing',
  prepared: 'Ready for Pickup',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const statusOrder = ['pending', 'processing', 'prepared', 'completed'];

const nextStatus: Record<string, string[]> = {
  pending: ['processing', 'cancelled'],
  processing: ['prepared', 'cancelled'],
  prepared: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

export function StaffDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSource, setFilterSource] = useState<string>('all');
  const [filterPayment, setFilterPayment] = useState<string>('all');
  const [expandedOrders, setExpandedOrders] = useState<Set<number>>(new Set());
  const [notificationPermission, setNotificationPermission] = useState(false);
  const previousOrderCount = useRef<number>(0);
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(perm => {
        setNotificationPermission(perm === 'granted');
      });
    } else if ('Notification' in window && Notification.permission === 'granted') {
      setNotificationPermission(true);
    }
  }, []);

  // Fetch metrics
  const fetchMetrics = useCallback(async () => {
    try {
      const response = await api.staff.getMetrics();
      setMetrics(response);
    } catch (error) {
      console.error('Failed to fetch metrics', error);
    }
  }, []);

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    try {
      const response = await api.staff.getOrders();
      // Ensure options are parsed if they come as strings
      const ordersWithParsedOptions = response.map((order: Order) => ({
        ...order,
        items: order.items.map((item: OrderItem) => ({
          ...item,
          options: typeof item.options === 'string' ? JSON.parse(item.options) : item.options,
        })),
      }));
      setOrders(ordersWithParsedOptions);
      // Check for new orders
      if (ordersWithParsedOptions.length > previousOrderCount.current && isSoundEnabled()) {
        playNotificationSound();
        if (notificationPermission) {
          new Notification('New Order!', {
            body: `There are ${ordersWithParsedOptions.length - previousOrderCount.current} new order(s) waiting.`,
            icon: '/favicon.ico',
          });
        }
        toast.info('New order received!', { duration: 3000 });
      }
      previousOrderCount.current = ordersWithParsedOptions.length;
    } catch (error) {
      console.error('Failed to fetch orders', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [notificationPermission]);

  // Combined fetch
  const refreshData = useCallback(async () => {
    await Promise.all([fetchOrders(), fetchMetrics()]);
  }, [fetchOrders, fetchMetrics]);

  // Polling every 10 seconds
  useEffect(() => {
    refreshData();
    pollingInterval.current = setInterval(refreshData, 10000);
    return () => {
      if (pollingInterval.current) clearInterval(pollingInterval.current);
    };
  }, [refreshData]);

  // Update order status
  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await api.staff.updateOrderStatus(orderId, newStatus);
      toast.success(`Order #${orderId} marked as ${statusLabels[newStatus]}`);
      refreshData();
    } catch (error) {
      console.error('Failed to update status', error);
      toast.error('Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  // Print order ticket (include options)
  const printTicket = (order: Order) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const itemsHtml = order.items.map(item => `
      <tr>
        <td>${item.quantity}x</td>
        <td>${item.name}${formatOptions(item.options)}</td>
        <td>$${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `).join('');
    const pickupTime = order.pickup_time ? new Date(order.pickup_time).toLocaleString() : 'ASAP';
    printWindow.document.write(`
      <html>
      <head><title>Order #${order.id} Ticket</title>
      <style>
        body { font-family: monospace; padding: 20px; }
        h1 { font-size: 18px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { text-align: left; padding: 5px; border-bottom: 1px dashed #ccc; }
        .total { font-weight: bold; margin-top: 10px; }
      </style>
      </head>
      <body>
        <h1>MarryShow Mealhouse</h1>
        <p><strong>Order #${order.id}</strong><br>${new Date(order.order_date).toLocaleString()}</p>
        <p><strong>Customer:</strong> ${order.customer_name}<br><strong>Phone:</strong> ${order.customer_phone}</p>
        <p><strong>Pickup:</strong> ${pickupTime}</p>
        <hr/>
        <table>
          <thead><tr><th>Qty</th><th>Item</th><th>Price</th></tr></thead>
          <tbody>${itemsHtml}</tbody>
        </table>
        <div class="total">Total: $${order.total.toFixed(2)}</div>
        <hr/>
        <p>Thank you for ordering!</p>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  // Toggle expand order items
  const toggleExpand = (orderId: number) => {
    setExpandedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) newSet.delete(orderId);
      else newSet.add(orderId);
      return newSet;
    });
  };

  // Calculate age of order in minutes
  const getOrderAge = (orderDate: string): number => {
    const created = new Date(orderDate);
    const now = new Date();
    return Math.floor((now.getTime() - created.getTime()) / 60000);
  };

  const getAgeColor = (minutes: number): string => {
    if (minutes > 20) return 'bg-red-100 text-red-800';
    if (minutes > 10) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = searchTerm === '' || 
      order.id.toString().includes(searchTerm) || 
      order.customer_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesSource = filterSource === 'all' || order.source === filterSource;
    const matchesPayment = filterPayment === 'all' || order.payment_method === filterPayment;
    return matchesSearch && matchesStatus && matchesSource && matchesPayment;
  });

  const ordersByStatus: Record<string, Order[]> = {
    pending: filteredOrders.filter(o => o.status === 'pending'),
    processing: filteredOrders.filter(o => o.status === 'processing'),
    prepared: filteredOrders.filter(o => o.status === 'prepared'),
    completed: filteredOrders.filter(o => o.status === 'completed'),
    cancelled: filteredOrders.filter(o => o.status === 'cancelled'),
  };

  const renderColumn = (status: string) => {
    const columnOrders = ordersByStatus[status];
    if (status === 'cancelled') return null;
    return (
      <div key={status} className="flex-1 min-w-[280px] bg-gray-50 rounded-lg p-3">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-gray-700 flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${status === 'pending' ? 'bg-yellow-500' : status === 'processing' ? 'bg-blue-500' : status === 'prepared' ? 'bg-purple-500' : 'bg-green-500'}`}></span>
            {statusLabels[status]}
          </h3>
          <Badge variant="secondary">{columnOrders.length}</Badge>
        </div>
        <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
          {columnOrders.map(order => renderOrderCard(order))}
          {columnOrders.length === 0 && <p className="text-center text-gray-400 text-sm py-4">No orders</p>}
        </div>
      </div>
    );
  };

  const renderOrderCard = (order: Order) => {
    const age = getOrderAge(order.order_date);
    const isExpanded = expandedOrders.has(order.id);
    const displayItems = isExpanded ? order.items : order.items.slice(0, 2);
    const hasMore = order.items.length > 2;

    return (
      <Card key={order.id} className={`overflow-hidden border-l-4 ${order.status === 'pending' ? 'border-l-yellow-500' : order.status === 'processing' ? 'border-l-blue-500' : order.status === 'prepared' ? 'border-l-purple-500' : 'border-l-green-500'} shadow-sm`}>
        <CardContent className="p-3">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-base">Order #{order.id}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full ${getAgeColor(age)}`}>
                  <Timer className="inline w-3 h-3 mr-1" />{age} min ago
                </span>
              </div>
              <p className="text-sm font-medium">{order.customer_name}</p>
              <p className="text-xs text-gray-500">{order.customer_phone}</p>
              <div className="flex gap-2 mt-1 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  {order.source === 'web' ? <Monitor className="w-3 h-3" /> : <Smartphone className="w-3 h-3" />}
                  {order.source === 'web' ? 'Web' : 'Kiosk'}
                </span>
                <span className="flex items-center gap-1">
                  {order.payment_method === 'wallet' ? <CreditCard className="w-3 h-3" /> : <DollarSign className="w-3 h-3" />}
                  {order.payment_method === 'wallet' ? 'Wallet' : 'Cash'}
                </span>
              </div>
            </div>
            <Badge className={statusColors[order.status]}>{statusLabels[order.status]}</Badge>
          </div>

          <div className="mt-2 border-t pt-2">
            <div className="space-y-1 text-sm">
              {displayItems.map(item => (
                <div key={item.id} className="flex justify-between">
                  <span>
                    {item.quantity}x {item.name}
                    {/* ✅ Display selected options */}
                    <span className="text-xs text-gray-500 ml-1">
                      {formatOptions(item.options)}
                    </span>
                  </span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              {hasMore && (
                <button onClick={() => toggleExpand(order.id)} className="text-xs text-blue-500 flex items-center gap-1">
                  {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  {isExpanded ? 'Show less' : `+ ${order.items.length - 2} more`}
                </button>
              )}
            </div>
            <div className="flex justify-between font-bold mt-2 pt-1 border-t">
              <span>Total</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {order.pickup_time ? `Pickup: ${new Date(order.pickup_time).toLocaleTimeString()}` : 'ASAP'}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-3">
            {nextStatus[order.status]?.map(next => (
              <Button
                key={next}
                size="sm"
                variant={next === 'cancelled' ? 'destructive' : 'default'}
                onClick={() => updateOrderStatus(order.id, next)}
                disabled={updatingId === order.id}
                className="gap-1 text-xs h-8"
              >
                {next === 'processing' && <Package className="w-3 h-3" />}
                {next === 'prepared' && <CheckCircle className="w-3 h-3" />}
                {next === 'completed' && <CheckCircle className="w-3 h-3" />}
                {next === 'cancelled' && <XCircle className="w-3 h-3" />}
                {statusLabels[next]}
              </Button>
            ))}
            <Button size="sm" variant="outline" onClick={() => printTicket(order)} className="gap-1 text-xs h-8">
              <Printer className="w-3 h-3" /> Print
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) return <div className="text-center py-20">Loading dashboard...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* Metrics Cards */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card><CardContent className="p-3 flex justify-between items-center"><div><p className="text-xs text-gray-500">Pending</p><p className="text-2xl font-bold">{metrics.pending}</p></div><Clock className="w-8 h-8 text-yellow-500" /></CardContent></Card>
          <Card><CardContent className="p-3 flex justify-between items-center"><div><p className="text-xs text-gray-500">Processing</p><p className="text-2xl font-bold">{metrics.processing}</p></div><Package className="w-8 h-8 text-blue-500" /></CardContent></Card>
          <Card><CardContent className="p-3 flex justify-between items-center"><div><p className="text-xs text-gray-500">Ready</p><p className="text-2xl font-bold">{metrics.prepared}</p></div><CheckCircle className="w-8 h-8 text-purple-500" /></CardContent></Card>
          <Card><CardContent className="p-3 flex justify-between items-center"><div><p className="text-xs text-gray-500">Completed Today</p><p className="text-2xl font-bold">{metrics.completed_today}</p></div><BarChart3 className="w-8 h-8 text-green-500" /></CardContent></Card>
          <Card><CardContent className="p-3 flex justify-between items-center"><div><p className="text-xs text-gray-500">Avg Prep Time</p><p className="text-2xl font-bold">{metrics.avg_prep_time} min</p></div><Timer className="w-8 h-8 text-orange-500" /></CardContent></Card>
        </div>
      )}

      {/* Search & Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search by order # or customer..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
          </div>
          <select className="border rounded-md px-3 py-2 text-sm" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Statuses</option>
            {Object.entries(statusLabels).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
          </select>
          <select className="border rounded-md px-3 py-2 text-sm" value={filterSource} onChange={(e) => setFilterSource(e.target.value)}>
            <option value="all">All Sources</option>
            <option value="web">Web</option>
            <option value="kiosk">Kiosk</option>
          </select>
          <select className="border rounded-md px-3 py-2 text-sm" value={filterPayment} onChange={(e) => setFilterPayment(e.target.value)}>
            <option value="all">All Payments</option>
            <option value="cash">Cash</option>
            <option value="wallet">Wallet</option>
          </select>
          <Button variant="outline" onClick={refreshData} className="gap-1"><RefreshCw className="w-4 h-4" /> Refresh</Button>
          <Button variant="ghost" onClick={() => setSoundEnabled(!isSoundEnabled())} className="gap-1">{isSoundEnabled() ? '🔊 Sound On' : '🔇 Sound Off'}</Button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex flex-col lg:flex-row gap-4 overflow-x-auto pb-4">
        {statusOrder.map(status => renderColumn(status))}
      </div>

      {/* Cancelled Orders */}
      {ordersByStatus.cancelled && ordersByStatus.cancelled.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2"><AlertCircle className="w-5 h-5 text-red-500" /> Cancelled Orders</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ordersByStatus.cancelled.map(order => renderOrderCard(order))}
          </div>
        </div>
      )}
    </div>
  );
}