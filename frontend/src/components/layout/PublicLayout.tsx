import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router';
import { ShoppingCart, User, Menu as MenuIcon, Wallet, LogOut, Heart, Bell, History } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useKiosk } from '../../contexts/KioskContext';
import { useNotifications } from '../../contexts/NotificationsContext';
import { Button } from '../ui/button';
import { PromoBanner } from '../PromoBanner';
import Navbar from './Navbar';        // Import the new Navbar component
import { Footer } from './Footer';    // Import the new Footer component

export function PublicLayout() {
  const { itemCount } = useCart();
  const { user, logout } = useAuth();
  const { isKioskMode } = useKiosk();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Promo Banner */}
      {!isKioskMode && <PromoBanner />}

      {/* Use the new Navbar component for normal mode */}
      {!isKioskMode && <Navbar />}

      {/* Kiosk Mode Header (unchanged) */}
      {isKioskMode && (
        <header className="bg-[#074af2] text-white py-4 border-4 border-[#f97316]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                <span className="text-[#074af2] font-bold text-xl">T</span>
              </div>
              <div>
                <div className="font-bold text-xl">Marryshow's Mealhouse - Kiosk</div>
                <div className="text-sm text-white/80">Touch to Order</div>
              </div>
            </div>
            <Link to="/cart">
              <Button size="lg" variant="secondary" className="relative">
                <ShoppingCart className="w-6 h-6 mr-2" />
                Cart
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#f97316] text-white text-sm rounded-full w-7 h-7 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Button>
            </Link>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Use the new Footer component for normal mode */}
      {!isKioskMode && <Footer />}

      {/* Kiosk Floating Cart Button (unchanged) */}
      {isKioskMode && (
        <Link
          to="/cart"
          className="fixed bottom-6 right-6 bg-[#f97316] text-white rounded-full p-4 shadow-lg hover:bg-[#ea580c] transition-colors"
        >
          <ShoppingCart className="w-8 h-8" />
          {itemCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-[#074af2] text-white text-sm rounded-full w-8 h-8 flex items-center justify-center font-bold">
              {itemCount}
            </span>
          )}
        </Link>
      )}
    </div>
  );
}