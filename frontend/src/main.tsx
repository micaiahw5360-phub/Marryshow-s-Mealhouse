import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { KioskProvider } from './contexts/KioskContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { NotificationsProvider } from './contexts/NotificationsContext';
import { initNotificationSound } from './utils/sound';
import './index.css';

console.log('main.tsx loaded');

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

if (!GOOGLE_CLIENT_ID) {
  console.error('Missing VITE_GOOGLE_CLIENT_ID environment variable');
}

initNotificationSound();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <KioskProvider>
        <AuthProvider>
          <CartProvider>
            <FavoritesProvider>
              <NotificationsProvider>
                <App />
              </NotificationsProvider>
            </FavoritesProvider>
          </CartProvider>
        </AuthProvider>
      </KioskProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);