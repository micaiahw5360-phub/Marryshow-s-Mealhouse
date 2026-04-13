import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Package, Calendar, DollarSign, User, Mail, Phone, Clock } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { adminService } from '../../services/api';
import { toast } from "../../utils/toastWithSound";

interface OrderItem {
  id: number;
  menu_item_id: number;
  name: string;
  quantity: number;
  price: number;
  subtotal?: number;
  options?: any; // can be object or string
}

interface Order {
  id: number;
  user_id: number;
  customer?: string;
  email?: string;
  phone?: string;
  order_date: string;
  total: number;
  status: string;
  payment_method: string;
  payment_status: string;
  pickup_time?: string;
  items: OrderItem[];
}

// Helper to parse options (supports JSON string or object)
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
  // parsed is an object like { optionId: { id, name, priceModifier } }
  const optionNames = Object.values(parsed).map((opt: any) => opt.name).filter(Boolean);
  return optionNames.length > 0 ? ` (${optionNames.join(', ')})` : '';
};

export function AdminOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrder = async () => {
      if (!id) return;
      try {
        const data = await adminService.getOrderById(parseInt(id));
        // Ensure items is an array and each item has a name
        if (data && data.items) {
          if (!Array.isArray(data.items)) {
            data.items = [];
          }
          data.items = data.items.map((item: any) => ({
            ...item,
            name: item.name || `Item #${item.menu_item_id}`,
            price: typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0,
            quantity: typeof item.quantity === 'number' ? item.quantity : parseInt(item.quantity) || 1,
            // Ensure options is parsed if it's a string
            options: typeof item.options === 'string' ? JSON.parse(item.options) : item.options,
          }));
        }
        setOrder(data);
      } catch (error) {
        console.error('Failed to load order:', error);
        toast.error('Order not found');
        navigate('/admin/orders');
      } finally {
        setLoading(false);
      }
    };
    loadOrder();
  }, [id, navigate]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'preparing': return 'bg-blue-100 text-blue-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!order) return;
    try {
      await adminService.updateOrderStatus(order.id.toString(), newStatus);
      setOrder({ ...order, status: newStatus });
      toast.success('Order status updated');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  if (loading) {
    return <div className="text-center py-20">Loading Order Details...</div>;
  }

  if (!order) {
    return <div className="text-center py-20">Order not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" onClick={() => navigate('/admin/orders')} className="mb-2">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Orders
          </Button>
          <h2 className="text-2xl font-bold">Order #{order.id}</h2>
          <p className="text-gray-600 mt-1">View and Manage Order Details</p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={order.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className={`px-3 py-2 rounded-md border ${getStatusColor(order.status)}`}
          >
            <option value="pending">Pending</option>
            <option value="preparing">Preparing</option>
            <option value="ready">Ready</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="w-5 h-5 mr-2" /> Order Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items && order.items.length > 0 ? (
                  order.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center border-b pb-3">
                      <div>
                        <p className="font-medium">
                          {item.name}
                          {/* ✅ Display selected options if any */}
                          {formatOptions(item.options)}
                        </p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No items found</p>
                )}
                <div className="flex justify-between pt-4">
                  <p className="font-bold">Total</p>
                  <p className="font-bold text-[#074af2]">${(typeof order.total === 'number' ? order.total : parseFloat(order.total)).toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Customer & Payment Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2" /> Customer Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center text-sm">
                <User className="w-4 h-4 mr-2 text-gray-400" />
                <span>{order.customer || `User #${order.user_id}`}</span>
              </div>
              {order.email && (
                <div className="flex items-center text-sm">
                  <Mail className="w-4 h-4 mr-2 text-gray-400" />
                  <span>{order.email}</span>
                </div>
              )}
              {order.phone && (
                <div className="flex items-center text-sm">
                  <Phone className="w-4 h-4 mr-2 text-gray-400" />
                  <span>{order.phone}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" /> Order Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Date:</span>
                <span>{new Date(order.order_date).toLocaleString()}</span>
              </div>
              {order.pickup_time && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Pickup Time:</span>
                  <span>{order.pickup_time}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Payment Method:</span>
                <span className="capitalize">{order.payment_method}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Payment Status:</span>
                <Badge variant="outline" className="capitalize">{order.payment_status}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}