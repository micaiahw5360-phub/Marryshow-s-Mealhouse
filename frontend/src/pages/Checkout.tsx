import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { CreditCard, Wallet as WalletIcon, DollarSign } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useKiosk } from '../contexts/KioskContext';
import { useNotifications } from '../contexts/NotificationsContext';
import { ordersService } from '../services/api';
import { toast } from '../utils/toastWithSound';

export function Checkout() {
  const { cartItems: items, getCartTotal, clearCart } = useCart();
  const { user, updateWalletBalance } = useAuth();
  const { isKioskMode } = useKiosk();
  const { addNotification } = useNotifications();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.username || '',
    email: user?.email || '',
    phone: '',
    pickupTime: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('cash');

  const cartItems = items || [];
  const totalAmount = getCartTotal();

  const OPERATIONAL_START = 8;
  const OPERATIONAL_END = 16;

  const isWithinOperatingHours = (timeStr: string): boolean => {
    if (!timeStr) return true;
    const [hours] = timeStr.split(':').map(Number);
    return (hours >= OPERATIONAL_START && hours < OPERATIONAL_END);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('Please login to place an order');
      navigate('/login');
      return;
    }
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error('Please fill in all required fields (name, email, phone)');
      return;
    }

    if (formData.pickupTime && !isWithinOperatingHours(formData.pickupTime)) {
      toast.error(`Pickup time must be between ${OPERATIONAL_START}:00 AM and ${OPERATIONAL_END}:00 PM. Leave empty for "ASAP".`);
      return;
    }

    const walletBalance = user?.walletBalance ?? 0;
    if (paymentMethod === 'wallet' && walletBalance < totalAmount) {
      toast.error('Insufficient wallet balance');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        items: cartItems.map(item => ({
          id: item.menuItemId,                // numeric menu item ID
          quantity: item.quantity,
          price: item.price,                  // effective price (base + modifiers)
          options: item.selectedOptions,      // ✅ send selected options to backend
        })),
        total: totalAmount,
        paymentMethod: paymentMethod,
        pickupTime: formData.pickupTime || 'ASAP',
        customerName: formData.name,
        customerEmail: formData.email,
        customerPhone: formData.phone,
      };
      const response = await ordersService.createOrder(orderData);

      if (paymentMethod === 'wallet') {
        await updateWalletBalance(-totalAmount);
      }

      clearCart();
      addNotification({
        type: 'order',
        title: 'Order Received',
        message: `Your order #${response.orderId} has been received and is being prepared.`,
        actionUrl: '/orders',
      });

      toast.success('Order placed successfully!');
      navigate(`/order-confirmation?orderId=${response.orderId}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-gray-50">
        <Card className="max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <h2 className="text-2xl font-bold mb-4">Login Required</h2>
            <p className="text-gray-600 mb-6">Please login to your account to place an order.</p>
            <Button onClick={() => navigate('/login')} className="w-full">Go to Login</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-gray-50">
        <Card className="max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <h2 className="text-2xl font-bold mb-4">Cart is Empty</h2>
            <p className="text-gray-600 mb-6">Add items to your cart before checking out.</p>
            <Button onClick={() => navigate('/menu')} className="w-full">Browse Menu</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const walletBalance = user?.walletBalance ?? 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className={`font-bold mb-8 ${isKioskMode ? 'text-4xl' : 'text-3xl'}`}>Checkout</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader><CardTitle className={isKioskMode ? 'text-2xl' : ''}>Pickup Details</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name" className={isKioskMode ? 'text-lg' : ''}>Name *</Label>
                    <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={isKioskMode ? 'h-12 text-lg' : ''} required />
                  </div>
                  <div>
                    <Label htmlFor="email" className={isKioskMode ? 'text-lg' : ''}>Email *</Label>
                    <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={isKioskMode ? 'h-12 text-lg' : ''} required />
                  </div>
                  <div>
                    <Label htmlFor="phone" className={isKioskMode ? 'text-lg' : ''}>Phone Number *</Label>
                    <Input id="phone" type="tel" placeholder="(473) 555-0123" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className={isKioskMode ? 'h-12 text-lg' : ''} required />
                  </div>
                  <div>
                    <Label htmlFor="pickupTime" className={isKioskMode ? 'text-lg' : ''}>Pickup Time (optional)</Label>
                    <Input 
                      id="pickupTime" 
                      type="time" 
                      value={formData.pickupTime} 
                      onChange={(e) => setFormData({ ...formData, pickupTime: e.target.value })} 
                      className={isKioskMode ? 'h-12 text-lg' : ''} 
                    />
                    <p className="text-xs text-gray-500 mt-1">Leave empty for "ASAP" (available 8:00 AM – 4:00 PM)</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className={isKioskMode ? 'text-2xl' : ''}>Payment Method</CardTitle></CardHeader>
                <CardContent>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                        <RadioGroupItem value="cash" id="cash" />
                        <Label htmlFor="cash" className={`flex-1 cursor-pointer ${isKioskMode ? 'text-lg' : ''}`}>
                          <div className="flex items-center"><DollarSign className="w-5 h-5 mr-2 text-green-600" /> Cash on Pickup</div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                        <RadioGroupItem value="wallet" id="wallet" />
                        <Label htmlFor="wallet" className={`flex-1 cursor-pointer ${isKioskMode ? 'text-lg' : ''}`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center"><WalletIcon className="w-5 h-5 mr-2 text-blue-600" /> Wallet Balance</div>
                            <span className="text-sm text-gray-500">${walletBalance.toFixed(2)} available</span>
                          </div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer opacity-60">
                        <RadioGroupItem value="card" id="card" disabled />
                        <Label htmlFor="card" className={`flex-1 cursor-not-allowed ${isKioskMode ? 'text-lg' : ''}`}>
                          <div className="flex items-center"><CreditCard className="w-5 h-5 mr-2 text-gray-400" /> Credit/Debit Card <span className="ml-2 text-xs text-gray-500">(Coming Soon)</span></div>
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="sticky top-20">
                <CardHeader><CardTitle className={isKioskMode ? 'text-2xl' : ''}>Order Summary</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="max-h-48 overflow-y-auto space-y-3 pb-4 border-b">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-gray-600">{item.quantity}x {item.name}</span>
                        <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span>${totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between">
                        <span className={`font-bold ${isKioskMode ? 'text-xl' : ''}`}>Total</span>
                        <span className={`font-bold text-[#074af2] ${isKioskMode ? 'text-xl' : ''}`}>${totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  <Button type="submit" className={`w-full bg-[#f97316] hover:bg-[#ea580c] ${isKioskMode ? 'h-16 text-xl' : ''}`} disabled={loading}>
                    {loading ? 'Placing Order...' : 'Place Order'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}