import React from 'react';
import { useNavigate } from 'react-router';
import { useCart } from '../../contexts/CartContext';
import { useKiosk } from '../../contexts/KioskContext';
import { toast } from '../../utils/toastWithSound';

export function KioskCart() {
  const navigate = useNavigate();
  const { cartItems, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart();
  const { isKioskMode, identifiedUser } = useKiosk();
  const total = getCartTotal();

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      if (window.confirm('Remove this item?')) {
        removeFromCart(itemId);
        toast.info('Item removed');
      }
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  const handleClearCart = () => {
    if (cartItems.length === 0) return;
    if (window.confirm('Remove all items from cart?')) {
      clearCart();
      toast.info('Cart cleared');
    }
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    if (isKioskMode && !identifiedUser) {
      navigate('/kiosk/get-user', { state: { returnTo: '/kiosk/checkout' } });
    } else {
      navigate('/kiosk/checkout');
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-3xl font-bold">Your cart is empty</h2>
        <p className="kiosk-subtle text-lg mt-2">Add some delicious items from our menu</p>
        <button
          onClick={() => navigate('/kiosk/categories')}
          className="kiosk-btn kiosk-primary mt-6 px-8 py-3 text-xl"
        >
          Browse Menu
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <button onClick={() => navigate(-1)} className="kiosk-btn bg-white px-5 py-2">
          ← Back
        </button>
        <button onClick={handleClearCart} className="kiosk-btn bg-white px-5 py-2 text-red-600">
          Clear Cart
        </button>
      </div>

      <h1 className="kiosk-title text-4xl mb-6">Your Order</h1>

      <div className="space-y-4">
        {cartItems.map((item) => (
          <div key={item.id} className="kiosk-panel p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-2xl font-extrabold">{item.name}</h3>
              <p className="kiosk-subtle">${(item.price ?? 0).toFixed(2)} each</p>
              {Object.keys(item.selectedOptions).length > 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  {Object.values(item.selectedOptions).map((opt: any) => opt.name).join(', ')}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                className="kiosk-btn bg-white px-4 py-2 text-xl font-black"
              >
                -
              </button>
              <span className="text-2xl font-black min-w-12 text-center">{item.quantity}</span>
              <button
                onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                className="kiosk-btn bg-white px-4 py-2 text-xl font-black"
              >
                +
              </button>
              <button
                onClick={() => removeFromCart(item.id)}
                className="kiosk-btn bg-white px-4 py-2 text-red-600"
              >
                🗑️ Remove
              </button>
            </div>
            <div className="text-right min-w-[100px]">
              <p className="text-xl font-black">${((item.price ?? 0) * item.quantity).toFixed(2)}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="kiosk-panel p-6 mt-8">
        <div className="flex justify-between text-2xl font-black">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
        {isKioskMode && identifiedUser && (
          <div className="flex justify-between text-lg mt-2">
            <span className="kiosk-subtle">💰 Wallet Balance:</span>
            <span className="font-bold">${identifiedUser.walletBalance.toFixed(2)}</span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-4 mt-8">
        <button onClick={() => navigate('/kiosk/categories')} className="kiosk-btn bg-white px-6 py-3 text-xl">
          🛍️ Add More Items
        </button>
        <button onClick={handleCheckout} className="kiosk-btn kiosk-primary px-8 py-3 text-xl">
          💳 Proceed to Checkout
        </button>
      </div>
    </div>
  );
}