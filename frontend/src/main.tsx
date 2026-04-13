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

// Your Google Client ID
const GOOGLE_CLIENT_ID = '1048393763438-na9g6fkbulept3j1kqo34gb54im30fve.apps.googleusercontent.com';

// Initialize sound globally
initNotificationSound();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>           {/* ← Add this line */}
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
        </KioskProvider>          {/* ← Close */}
    </GoogleOAuthProvider>
  </React.StrictMode>
);