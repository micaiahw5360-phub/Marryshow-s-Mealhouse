import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router';
import { ShoppingCart, User, Menu as MenuIcon, X } from 'lucide-react';
import { Button } from '../ui/button';
import { useCart } from '../../contexts/CartContext';

export function KioskLayout() {
  const navigate = useNavigate();
  const { getCartCount, getCartTotal } = useCart();
  const [openCart, setOpenCart] = useState(false);

  const cartCount = getCartCount();
  const cartTotal = getCartTotal();

  return (
    <div className="kiosk-shell">
      <header className="kiosk-header">
        <div className="flex items-center gap-4">
          <img src="/chef.png" alt="Mascot" className="h-16 w-16 object-contain" />
          <div>
            <div className="kiosk-title">Marryshow's Mealhouse</div>
            <div className="kiosk-subtle">Tap to start your order</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="kiosk-btn px-5 py-3 bg-white">EN</button>
          <button className="kiosk-btn px-5 py-3 bg-white">Accessibility</button>
          <button
            onClick={() => setOpenCart(true)}
            className="relative p-3 bg-white rounded-full shadow-md hover:bg-gray-50 transition"
          >
            <ShoppingCart className="w-6 h-6 text-school-800" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-school-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
          <button className="p-3 bg-white rounded-full shadow-md hover:bg-gray-50 transition">
            <User className="w-6 h-6 text-school-800" />
          </button>
          <button className="p-3 bg-white rounded-full shadow-md hover:bg-gray-50 transition">
            <MenuIcon className="w-6 h-6 text-school-800" />
          </button>
        </div>
      </header>

      {/* Cart Drawer */}
      {openCart && (
        <div className="fixed inset-0 z-50 bg-black/50 flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow-xl flex flex-col rounded-l-kiosk">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-2xl font-extrabold">Your Cart</h2>
              <button
                onClick={() => setOpenCart(false)}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {cartCount === 0 ? (
                <p className="text-center text-gray-500">Cart is empty</p>
              ) : (
                <div className="space-y-3">
                  {/* You could optionally show cart items here, but for brevity skip */}
                  <p className="text-center">Total items: {cartCount}</p>
                  <p className="text-center text-xl font-bold">Total: ${cartTotal.toFixed(2)}</p>
                </div>
              )}
            </div>
            {cartCount > 0 && (
              <div className="p-4 border-t">
                <Button
                  className="kiosk-btn kiosk-primary w-full py-4 text-2xl font-black"
                  onClick={() => {
                    setOpenCart(false);
                    navigate('/kiosk/cart');
                  }}
                >
                  Proceed to Checkout
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      <main className="mt-6">
        <Outlet />
      </main>
    </div>
  );
}