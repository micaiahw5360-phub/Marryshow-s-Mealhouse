import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router';
import { ShoppingCart, Home, Grid, X } from 'lucide-react';
import { Button } from '../ui/button';
import { useCart } from '../../contexts/CartContext';

export function KioskLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { getCartCount, getCartTotal } = useCart();
  const [openCart, setOpenCart] = useState(false);
  const starsContainerRef = useRef<HTMLDivElement>(null);

  const cartCount = getCartCount();
  const cartTotal = getCartTotal();

  const isActive = (path: string) => location.pathname === path;

  // Generate stars after the container is ready
  useEffect(() => {
    const container = starsContainerRef.current;
    if (!container) return;

    // Clear any existing stars
    container.innerHTML = '';

    // Regular stars
    for (let i = 0; i < 80; i++) {
      const star = document.createElement('div');
      star.className = 'star';
      star.style.left = Math.random() * 100 + '%';
      star.style.top = Math.random() * 100 + '%';
      star.style.animationDelay = Math.random() * 3 + 's';
      container.appendChild(star);
    }

    // Larger glowing stars
    for (let i = 0; i < 20; i++) {
      const star = document.createElement('div');
      star.className = 'star large glow';
      star.style.left = Math.random() * 100 + '%';
      star.style.top = Math.random() * 100 + '%';
      star.style.animationDelay = Math.random() * 2.5 + 's';
      container.appendChild(star);
    }
  }, []);

  return (
    <div className="kiosk-shell">
      <div className="kiosk-stars" ref={starsContainerRef}></div>
      <main className="kiosk-main">
        <Outlet />
      </main>
      <nav className="kiosk-bottom-nav">
        <button
          onClick={() => navigate('/kiosk')}
          className={`kiosk-nav-btn ${isActive('/kiosk') ? 'active' : ''}`}
        >
          <Home className="w-6 h-6" />
          <span>Home</span>
        </button>
        <button
          onClick={() => navigate('/kiosk/categories')}
          className={`kiosk-nav-btn ${isActive('/kiosk/categories') ? 'active' : ''}`}
        >
          <Grid className="w-6 h-6" />
          <span>Menu</span>
        </button>
        <button
          onClick={() => setOpenCart(true)}
          className="kiosk-nav-btn cart-btn relative"
        >
          <ShoppingCart className="w-6 h-6" />
          {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          <span>Cart</span>
        </button>
      </nav>

      {openCart && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end md:items-center justify-end" onClick={() => setOpenCart(false)}>
          <div
            className="kiosk-cart-drawer bg-white w-full md:max-w-md rounded-t-3xl md:rounded-l-3xl md:rounded-tr-none shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b flex justify-between items-center">
              <h2 className="text-2xl font-black">Your Cart</h2>
              <button onClick={() => setOpenCart(false)} className="p-2 rounded-full hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 max-h-[60vh]">
              {cartCount === 0 ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-3">🛒</div>
                  <p className="text-gray-500">Cart is empty</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-2xl p-4">
                    <p>Items: <strong>{cartCount}</strong></p>
                    <p className="text-2xl font-bold mt-2">Total: ${cartTotal.toFixed(2)}</p>
                  </div>
                  <Button
                    className="w-full bg-primary-600 text-white py-3 rounded-full font-bold hover:bg-primary-700"
                    onClick={() => {
                      setOpenCart(false);
                      navigate('/kiosk/cart');
                    }}
                  >
                    View Full Cart →
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}