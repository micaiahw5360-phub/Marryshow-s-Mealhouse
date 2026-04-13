import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { CheckCircle, FileText, ShoppingBag, ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { useKiosk } from '../contexts/KioskContext';
import { ordersService } from '../services/api';
import { toast } from '../utils/toastWithSound';

interface OrderDetails {
  orderNumber: string;
  items: any[];
  total: number;
  paymentMethod: string;
  walletUsed: number;
  timestamp: string;
  pickupTime?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
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

const format12Hour = (dateOrTime: string | Date): string => {
  const d = new Date(dateOrTime);
  if (isNaN(d.getTime())) return String(dateOrTime);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
};

export function OrderConfirmation() {
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isKioskMode } = useKiosk();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');

  const loadOrder = async () => {
    if (!orderId) {
      navigate('/menu');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const order = await ordersService.getOrder(parseInt(orderId));
      const normalizedItems = Array.isArray(order.items) 
        ? order.items.map((item: any) => ({
            ...item,
            price: typeof item.price === 'string' ? parseFloat(item.price) : item.price,
            quantity: typeof item.quantity === 'string' ? parseInt(item.quantity, 10) : item.quantity,
            // Ensure options is parsed if it's a string
            options: typeof item.options === 'string' ? JSON.parse(item.options) : item.options,
          }))
        : [];

      setOrderDetails({
        orderNumber: order.id?.toString() || '',
        items: normalizedItems,
        total: typeof order.total === 'string' ? parseFloat(order.total) : order.total,
        paymentMethod: order.payment_method || 'cash',
        walletUsed: 0,
        timestamp: order.order_date || new Date().toISOString(),
        pickupTime: order.pickup_time,
        customerName: order.customer_name,
        customerEmail: order.customer_email,
        customerPhone: order.customer_phone,
      });
    } catch (err: any) {
      console.error('Failed to load order:', err);
      setError(err.message || 'Could not load order details. Please check your order number.');
      toast.error('Order not found. Please contact support.');
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#074af2] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your order confirmation...</p>
        </div>
      </div>
    );
  }

  if (error || !orderDetails) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Order Not Found</h2>
            <p className="text-gray-600 mb-6">{error || 'Unable to retrieve order details.'}</p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => loadOrder()} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" /> Retry
              </Button>
              <Link to="/menu">
                <Button>Back to Menu</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const orderTime12 = format12Hour(orderDetails.timestamp);
  const pickupTime12 = orderDetails.pickupTime ? format12Hour(orderDetails.pickupTime) : 'N/A';

  return (
    <>
      {/* Screen view */}
      <div className="min-h-screen bg-gray-50 py-12 print:hidden">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardContent className={`text-center ${isKioskMode ? 'p-12' : 'p-8'}`}>
              <div className="flex justify-center mb-6">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-16 h-16 text-green-600" />
                </div>
              </div>
              <h1 className={`font-bold text-green-600 mb-2 ${isKioskMode ? 'text-4xl' : 'text-3xl'}`}>Order Confirmed!</h1>
              <p className={`text-gray-600 mb-8 ${isKioskMode ? 'text-xl' : 'text-lg'}`}>Thank you for your order. Your food is being prepared.</p>

              <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
                <div className="space-y-4">
                  <div className="flex justify-between"><span className="text-gray-600">Order Number</span><span className="font-bold">{orderDetails.orderNumber}</span></div>
                  {orderDetails.customerName && (
                    <div className="flex justify-between"><span className="text-gray-600">Customer Name</span><span>{orderDetails.customerName}</span></div>
                  )}
                  {orderDetails.customerEmail && (
                    <div className="flex justify-between"><span className="text-gray-600">Email</span><span>{orderDetails.customerEmail}</span></div>
                  )}
                  {orderDetails.customerPhone && (
                    <div className="flex justify-between"><span className="text-gray-600">Phone</span><span>{orderDetails.customerPhone}</span></div>
                  )}
                  <div className="flex justify-between"><span className="text-gray-600">Total Paid</span><span className="font-bold text-[#074af2]">${orderDetails.total.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Payment Method</span><span className="capitalize">{orderDetails.paymentMethod === 'cash' ? 'Cash on Pickup' : orderDetails.paymentMethod}</span></div>
                  {orderDetails.walletUsed > 0 && <div className="flex justify-between text-blue-600"><span>Wallet Used</span><span>${orderDetails.walletUsed.toFixed(2)}</span></div>}
                  <div className="flex justify-between"><span className="text-gray-600">Order Time</span><span>{orderTime12}</span></div>
                  {orderDetails.pickupTime && <div className="flex justify-between"><span className="text-gray-600">Pickup Time</span><span>{pickupTime12}</span></div>}
                </div>
                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-bold mb-3">Order Items</h3>
                  <div className="space-y-2">
                    {orderDetails.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          {item.quantity}x {item.name}
                          {/* ✅ Display selected options */}
                          {formatOptions(item.options)}
                        </span>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mb-8">
                {orderDetails.paymentMethod === 'cash' ? (
                  <p className="text-gray-600">Please pay <strong>${orderDetails.total.toFixed(2)}</strong> on pickup.</p>
                ) : (
                  <p className="text-green-600 font-medium">Payment Completed Successfully!</p>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Button variant="outline" onClick={handlePrint}><FileText className="w-4 h-4 mr-2" /> View Receipt</Button>
                <Link to="/menu"><Button variant="outline"><ShoppingBag className="w-4 h-4 mr-2" /> Order Again</Button></Link>
                <Link to="/"><Button><ArrowLeft className="w-4 h-4 mr-2" /> Back to Home</Button></Link>
              </div>
              <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                <p className="text-blue-800"><strong>Pickup Location:</strong> Marryshow's Mealhouse, TAMCC Campus</p>
                <p className="text-blue-800 mt-1">Please show your order number when collecting.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Printable receipt – full page */}
      <div className="hidden print:block print:visible print:bg-white print:text-black">
        <div className="max-w-full mx-auto p-8 font-sans" style={{ width: '100%', minHeight: '100vh' }}>
          <div className="text-center border-b-2 border-black pb-6 mb-6">
            <h1 className="text-4xl font-bold">MARRYSHOW'S MEALHOUSE</h1>
            <p className="text-xl mt-2">TAMCC Campus, Grenada</p>
            <p className="text-lg">Tel: (473) 555‑0123</p>
            <div className="text-lg mt-2">----------------------------------------</div>
          </div>
          <div className="text-lg mb-6 space-y-2">
            <div className="flex justify-between"><span className="font-semibold">Order #:</span><span>{orderDetails.orderNumber}</span></div>
            <div className="flex justify-between"><span className="font-semibold">Date:</span><span>{new Date(orderDetails.timestamp).toLocaleDateString()}</span></div>
            <div className="flex justify-between"><span className="font-semibold">Order Time:</span><span>{orderTime12}</span></div>
            {orderDetails.pickupTime && <div className="flex justify-between"><span className="font-semibold">Pickup Time:</span><span>{pickupTime12}</span></div>}
            <div className="flex justify-between"><span className="font-semibold">Payment:</span><span className="capitalize">{orderDetails.paymentMethod === 'cash' ? 'Cash' : orderDetails.paymentMethod}</span></div>
            <div className="border-t border-black my-3"></div>
            {orderDetails.customerName && (
              <div className="flex justify-between"><span className="font-semibold">Name:</span><span>{orderDetails.customerName}</span></div>
            )}
            {orderDetails.customerEmail && (
              <div className="flex justify-between"><span className="font-semibold">Email:</span><span>{orderDetails.customerEmail}</span></div>
            )}
            {orderDetails.customerPhone && (
              <div className="flex justify-between"><span className="font-semibold">Phone:</span><span>{orderDetails.customerPhone}</span></div>
            )}
          </div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-4">ITEMS</h2>
            <div className="space-y-3">
              {orderDetails.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-lg border-b pb-2">
                  <span>
                    {item.quantity} x {item.name}
                    {/* ✅ Display selected options on receipt */}
                    {formatOptions(item.options)}
                  </span>
                  <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t-2 border-black my-4"></div>
            <div className="flex justify-between text-2xl font-bold">
              <span>TOTAL</span>
              <span>${orderDetails.total.toFixed(2)}</span>
            </div>
          </div>
          <div className="text-center text-xl mb-6">
            {orderDetails.paymentMethod === 'cash' ? (
              <span className="font-semibold">Due on pickup: ${orderDetails.total.toFixed(2)}</span>
            ) : (
              <span className="text-green-700 font-bold">✓ PAID IN FULL</span>
            )}
          </div>
          <div className="text-center border-t-2 border-black pt-6 text-lg">
            <p>Thank you for your order!</p>
            <p className="mt-2">Please present this receipt at pickup.</p>
            <p className="mt-6 text-base">Marryshow's Mealhouse – Eat Well, Live Well</p>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print\\:block, .print\\:block * { visibility: visible; }
          .print\\:block { position: absolute; left: 0; top: 0; width: 100%; }
          button, .no-print { display: none !important; }
          @page { margin: 0.5in; size: auto; }
        }
      `}</style>
    </>
  );
}