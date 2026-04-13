import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { CheckCircle, FileText, ShoppingBag, RefreshCw } from 'lucide-react';
import { ordersService } from '../../services/api';
import { toast } from '../../utils/toastWithSound';

interface OrderDetails {
  orderNumber: string;
  items: any[];
  total: number;
  paymentMethod: string;
  timestamp: string;
  pickupTime?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
}

export function KioskOrderConfirmation() {
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');

  const loadOrder = async () => {
    if (!orderId) {
      navigate('/kiosk');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const order = await ordersService.getOrder(parseInt(orderId));
      setOrderDetails({
        orderNumber: order.id?.toString() || '',
        items: order.items || [],
        total: parseFloat(order.total),
        paymentMethod: order.payment_method || 'cash',
        timestamp: order.order_date || new Date().toISOString(),
        pickupTime: order.pickup_time,
        customerName: order.customer_name,
        customerEmail: order.customer_email,
        customerPhone: order.customer_phone,
      });
    } catch (err: any) {
      setError(err.message || 'Could not load order details');
      toast.error('Order not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const handlePrint = () => window.print();

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-school-600 border-t-transparent"></div>
        <p className="mt-4 text-lg">Loading your order...</p>
      </div>
    );
  }

  if (error || !orderDetails) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-red-600">Order Not Found</h2>
        <p className="text-slate-600 mt-2">{error}</p>
        <button onClick={loadOrder} className="kiosk-btn kiosk-primary mt-6">
          <RefreshCw className="w-4 h-4 inline mr-2" /> Retry
        </button>
      </div>
    );
  }

  const orderTime = new Date(orderDetails.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <>
      {/* Screen View – no auto-redirect */}
      <div className="print:hidden">
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => navigate('/kiosk')} className="kiosk-btn bg-white px-6 py-2">
            ← Back to Home
          </button>
          <button onClick={handlePrint} className="kiosk-btn bg-white px-6 py-2">
            <FileText className="w-4 h-4 inline mr-2" /> Print Receipt
          </button>
        </div>
        <div className="kiosk-panel max-w-2xl mx-auto text-center p-8">
          <div className="w-28 h-28 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-14 h-14 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-green-600 mb-2">Order Confirmed!</h1>
          <p className="text-slate-600 mb-6 text-lg">Thank you for your order. Your food is being prepared.</p>

          <div className="bg-slate-50 rounded-2xl p-6 text-left space-y-2">
            <div className="flex justify-between"><span className="font-bold">Order #</span><span>{orderDetails.orderNumber}</span></div>
            {orderDetails.customerName && <div className="flex justify-between"><span className="font-bold">Name</span><span>{orderDetails.customerName}</span></div>}
            {orderDetails.customerEmail && <div className="flex justify-between"><span className="font-bold">Email</span><span>{orderDetails.customerEmail}</span></div>}
            {orderDetails.customerPhone && <div className="flex justify-between"><span className="font-bold">Phone</span><span>{orderDetails.customerPhone}</span></div>}
            <div className="flex justify-between"><span className="font-bold">Total</span><span className="text-school-800 text-2xl font-bold">${orderDetails.total.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="font-bold">Payment</span><span className="capitalize">{orderDetails.paymentMethod === 'cash' ? 'Cash on Pickup' : orderDetails.paymentMethod}</span></div>
            <div className="flex justify-between"><span className="font-bold">Order Time</span><span>{orderTime}</span></div>
            {orderDetails.pickupTime && <div className="flex justify-between"><span className="font-bold">Pickup Time</span><span>{orderDetails.pickupTime}</span></div>}
            <div className="border-t pt-4 mt-2">
              <div className="font-bold mb-2">Items</div>
              {orderDetails.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm py-1">
                  <span>{item.quantity}x {item.name}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 p-5 bg-school-50 rounded-xl text-sm">
            <p className="font-bold text-school-800">Pickup Location:</p>
            <p>Marryshow's Mealhouse, TAMCC Campus</p>
            <p className="text-xs mt-1">Please show your order number when collecting.</p>
          </div>

          <div className="flex gap-4 mt-8 justify-center">
            <Link to="/kiosk/categories">
              <button className="kiosk-btn bg-white px-6 py-3"><ShoppingBag className="w-4 h-4 inline mr-2" /> Order Again</button>
            </Link>
            <Link to="/kiosk">
              <button className="kiosk-btn kiosk-primary px-6 py-3">Back to Home</button>
            </Link>
          </div>
        </div>
      </div>

      {/* Printable Receipt – full page when printed */}
      <div className="hidden print:block print:visible">
        <div className="max-w-2xl mx-auto p-8 font-mono text-sm">
          <div className="text-center border-b pb-4 mb-4">
            <h1 className="text-2xl font-bold">MARRYSHOW'S MEALHOUSE</h1>
            <p>TAMCC Campus, Grenada</p>
            <p>Tel: (473) 555-0123</p>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between"><span>Order #:</span><span>{orderDetails.orderNumber}</span></div>
            <div className="flex justify-between"><span>Date:</span><span>{new Date(orderDetails.timestamp).toLocaleDateString()}</span></div>
            <div className="flex justify-between"><span>Time:</span><span>{orderTime}</span></div>
            {orderDetails.pickupTime && <div className="flex justify-between"><span>Pickup:</span><span>{orderDetails.pickupTime}</span></div>}
            <div className="flex justify-between"><span>Payment:</span><span className="capitalize">{orderDetails.paymentMethod}</span></div>
            {orderDetails.customerName && <div className="flex justify-between"><span>Name:</span><span>{orderDetails.customerName}</span></div>}
            <div className="border-t my-3"></div>
            <div className="font-bold">ITEMS</div>
            {orderDetails.items.map((item, idx) => (
              <div key={idx} className="flex justify-between">
                <span>{item.quantity}x {item.name}</span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t my-3"></div>
            <div className="flex justify-between text-lg font-bold">
              <span>TOTAL</span>
              <span>${orderDetails.total.toFixed(2)}</span>
            </div>
            <div className="text-center mt-6">
              {orderDetails.paymentMethod === 'cash' ? (
                <p className="font-bold">Due on pickup: ${orderDetails.total.toFixed(2)}</p>
              ) : (
                <p className="text-green-700 font-bold">✓ PAID IN FULL</p>
              )}
            </div>
            <div className="text-center border-t mt-6 pt-6">
              <p>Thank you for your order!</p>
              <p className="text-xs mt-2">Please present this receipt at pickup.</p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print\\:block, .print\\:block * { visibility: visible; }
          .print\\:block { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print, .print\\:hidden { display: none; }
          button { display: none; }
        }
      `}</style>
    </>
  );
}