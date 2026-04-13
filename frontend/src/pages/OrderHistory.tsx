import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Clock, MapPin, Package, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { ordersService, itemsService } from '../services/api';
import { toast } from '../utils/toastWithSound';

interface Order {
  id: string;
  date: string;
  items: { 
    name: string; 
    quantity: number; 
    price: number; 
    menu_item_id: number;
    options?: any;  // ✅ add options field
  }[];
  total: number;
  status: 'completed' | 'cancelled' | 'in-progress';
  pickupLocation: string;
  orderNumber: string;
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

export function OrderHistory() {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [filter, setFilter] = useState<'all' | 'completed' | 'cancelled'>('all');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersService.getOrders().then(data => {
      const mappedOrders = data.map((order: any) => ({
        id: order.id.toString(),
        date: order.order_date,
        items: order.items.map((item: any) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          menu_item_id: item.menu_item_id,
          options: typeof item.options === 'string' ? JSON.parse(item.options) : item.options,
        })),
        total: order.total,
        status: order.status === 'completed' ? 'completed' : order.status === 'cancelled' ? 'cancelled' : 'in-progress',
        pickupLocation: 'Main Campus Deli',
        orderNumber: `ORD-${order.id}`,
      }));
      setOrders(mappedOrders);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filteredOrders = orders.filter((order) => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  const handleReorder = async (order: Order) => {
    for (const orderItem of order.items) {
      const menuItem = await itemsService.getItem(orderItem.menu_item_id);
      if (menuItem) {
        // Pass selectedOptions from the stored order item (if any)
        addItem(menuItem, orderItem.options || {});
      }
    }
    toast.success(`${order.items.length} item${order.items.length > 1 ? 's' : ''} added to cart!`);
    navigate('/cart');
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'in-progress':
        return <Package className="h-5 w-5 text-blue-600" />;
    }
  };

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Cancelled</Badge>;
      case 'in-progress':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">In Progress</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    }).format(date);
  };

  if (loading) return <div className="text-center py-20">Loading orders...</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Order History</h1>
        <p className="text-gray-600">View and track all your past orders</p>
      </div>

      <Tabs defaultValue="all" className="space-y-6" onValueChange={(value) => setFilter(value as any)}>
        <TabsList>
          <TabsTrigger value="all">All Orders</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="space-y-4">
          {filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                <p className="text-gray-600 mb-4">You haven't placed any orders yet</p>
                <Button onClick={() => navigate('/menu')}>Browse Menu</Button>
              </CardContent>
            </Card>
          ) : (
            filteredOrders.map((order) => (
              <Card key={order.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(order.status)}
                      <div>
                        <CardTitle className="text-lg">Order #{order.orderNumber}</CardTitle>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{formatDate(order.date)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span>{order.pickupLocation}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                        <div>
                          <p className="font-medium text-gray-900">
                            {item.name}
                            {/* ✅ Display selected options */}
                            <span className="text-sm text-gray-500 font-normal">
                              {formatOptions(item.options)}
                            </span>
                          </p>
                          <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                        </div>
                        <p className="font-medium text-gray-900">${item.price.toFixed(2)}</p>
                      </div>
                    ))}

                    <div className="flex items-center justify-between pt-3 border-t-2">
                      <p className="font-bold text-gray-900">Total</p>
                      <p className="font-bold text-gray-900 text-lg">${order.total.toFixed(2)}</p>
                    </div>

                    <div className="flex space-x-3 pt-4">
                      {order.status === 'completed' && (
                        <>
                          <Button variant="outline" className="flex-1" onClick={() => handleReorder(order)}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Reorder
                          </Button>
                          <Button variant="outline" className="flex-1">View Receipt</Button>
                        </>
                      )}
                      {order.status === 'cancelled' && (
                        <Button variant="outline" className="flex-1" onClick={() => handleReorder(order)}>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Reorder
                        </Button>
                      )}
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