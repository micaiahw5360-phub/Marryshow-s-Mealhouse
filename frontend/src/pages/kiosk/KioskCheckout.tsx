import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useCart } from '../../contexts/CartContext';
import { useKiosk } from '../../contexts/KioskContext';
import api from '../../services/api';
import { ordersService } from '../../services/api';
import { toast } from '../../utils/toastWithSound';

export function KioskCheckout() {
  const navigate = useNavigate();
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { identifiedUser, clearIdentifiedUser, isKioskMode } = useKiosk();
  const total = getCartTotal();

  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'cash'>(
    identifiedUser ? 'wallet' : 'cash'
  );
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [walletBalance, setWalletBalance] = useState(identifiedUser?.walletBalance || 0);

  // ✅ 1. Real‑time wallet balance check
  useEffect(() => {
    const fetchLatestBalance = async () => {
      if (paymentMethod === 'wallet' && identifiedUser?.email) {
        try {
          const data = await api.kiosk.getBalance(identifiedUser.email);
          if (data.success) {
            setWalletBalance(data.balance);
          }
        } catch (err) {
          console.error('Failed to fetch latest balance', err);
        }
      }
    };
    fetchLatestBalance();
  }, [paymentMethod, identifiedUser]);

  const isWalletSufficient = walletBalance >= total;

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    if (paymentMethod === 'wallet' && !isWalletSufficient) {
      toast.error('Insufficient wallet balance');
      return;
    }
    if (paymentMethod === 'cash' && !guestName.trim()) {
      toast.error('Please enter your name for pickup');
      return;
    }

    if (!window.confirm(`Confirm order for $${total.toFixed(2)}?`)) return;

    setLoading(true);
    try {
      const orderData = {
        items: cartItems.map(item => ({
          id: item.menuItemId,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.subtotal,
          options: item.selectedOptions,
        })),
        total: total,
        paymentMethod: paymentMethod,
        ...(paymentMethod === 'wallet' && identifiedUser
          ? { userId: identifiedUser.userId }
          : { customerName: guestName }),
        customerEmail: paymentMethod === 'cash' ? (guestName.includes('@') ? guestName : undefined) : identifiedUser?.email,
        customerPhone: '',
      };

      const result = await ordersService.createOrder(orderData);

      clearCart();
      if (isKioskMode) clearIdentifiedUser();

      setOrderPlaced(true);
      toast.success('Order placed successfully!');

      setTimeout(() => {
        navigate('/kiosk/order-confirmation', { state: { orderId: result.orderId } });
      }, 2000);
    } catch (error: any) {
      console.error('Order failed:', error);
      toast.error(error.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">✓</div>
        <h2 className="text-3xl font-bold">Order Placed!</h2>
        <p className="text-lg mt-2">Redirecting to confirmation...</p>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-3xl font-bold">Cart is empty</h2>
        <button onClick={() => navigate('/kiosk/categories')} className="kiosk-btn mt-6 px-6 py-3">
          Browse Menu
        </button>
      </div>
    );
  }

  return (
    <div>
      <button onClick={() => navigate('/kiosk/cart')} className="kiosk-btn bg-white px-5 py-2 mb-6">
        ← Back to Cart
      </button>
      <h1 className="kiosk-title text-4xl mb-6">Checkout</h1>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="kiosk-panel p-6">
          <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
          <div className="space-y-2">
            {cartItems.map((item) => (
              <div key={item.id} className="flex justify-between">
                <span>{item.quantity}x {item.name}</span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-kiosk-line mt-4 pt-4">
            <div className="flex justify-between text-xl font-black">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="kiosk-panel p-6">
          <h2 className="text-2xl font-bold mb-4">Payment Method</h2>
          <div className="space-y-4">
            {identifiedUser && (
              <label className="flex items-center gap-3 p-3 border rounded-kiosk cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="wallet"
                  checked={paymentMethod === 'wallet'}
                  onChange={() => setPaymentMethod('wallet')}
                  className="w-5 h-5"
                />
                <span className="flex-1">
                  Wallet Balance (Available: ${walletBalance.toFixed(2)})
                </span>
                {!isWalletSufficient && <span className="text-red-600">⚠️ Insufficient</span>}
              </label>
            )}
            <label className="flex items-center gap-3 p-3 border rounded-kiosk cursor-pointer">
              <input
                type="radio"
                name="paymentMethod"
                value="cash"
                checked={paymentMethod === 'cash'}
                onChange={() => setPaymentMethod('cash')}
                className="w-5 h-5"
              />
              <span>Cash on Pickup</span>
            </label>
          </div>

          {/* ✅ 8. Guest name input for cash orders */}
          {paymentMethod === 'cash' && (
            <input
              type="text"
              placeholder="Your name (for order pickup)"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              className="w-full p-3 border rounded mt-4 text-lg"
            />
          )}

          <button
            onClick={handlePlaceOrder}
            disabled={loading || (paymentMethod === 'wallet' && !isWalletSufficient)}
            className="kiosk-btn kiosk-primary w-full mt-6 py-4 text-2xl font-black disabled:opacity-50"
          >
            {loading ? 'Processing...' : `Place Order - $${total.toFixed(2)}`}
          </button>
        </div>
      </div>
    </div>
  );
}