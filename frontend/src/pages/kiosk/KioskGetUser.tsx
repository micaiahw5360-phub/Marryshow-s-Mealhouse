import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useKiosk } from '../../contexts/KioskContext';
import { toast } from '../../utils/toastWithSound';
import api from '../../services/api';

export function KioskGetUser() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setIdentifiedUser, identifiedUser } = useKiosk();
  const [cardNumber, setCardNumber] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const returnTo = location.state?.returnTo || '/kiosk/checkout';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardNumber.trim() || !pin.trim()) {
      setError('Please enter your card number and PIN');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const userData = await api.kiosk.authenticateWithCard({
        cardNumber: cardNumber.trim(),
        pin: pin.trim(),
      });

      setIdentifiedUser({
        userId: userData.id,
        email: userData.email,
        walletBalance: userData.walletBalance,
        name: userData.name,
        cardNumber: userData.cardNumber,
      });
      toast.success(`Welcome ${userData.name}!`);
      navigate(returnTo);
    } catch (err: any) {
      setError(err.message || 'Invalid card or PIN');
      toast.error('Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    toast.info('Continuing as guest. Wallet payment not available.');
    navigate(returnTo);
  };

  if (identifiedUser) {
    navigate(returnTo);
    return null;
  }

  return (
    <div className="max-w-md mx-auto">
      <button onClick={() => navigate('/kiosk/cart')} className="kiosk-btn bg-white px-6 py-2 mb-6 shadow-sm">
        ← Back to Cart
      </button>

      <div className="kiosk-panel p-8 text-center">
        <div className="text-7xl mb-4">💳</div>
        <h1 className="kiosk-title text-3xl">Pay with Wallet</h1>
        <p className="kiosk-subtle mt-2">Enter your Marryshow Card number and PIN</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-left font-bold mb-1">Card Number</label>
            <input
              type="text"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value.toUpperCase())}
              placeholder="e.g. MC00001234"
              autoFocus
              disabled={loading}
              className="w-full p-4 border rounded-kiosk text-lg font-mono focus:outline-none focus:ring-2 focus:ring-primary-400"
            />
          </div>
          <div>
            <label className="block text-left font-bold mb-1">PIN</label>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="••••"
              maxLength={6}
              disabled={loading}
              className="w-full p-4 border rounded-kiosk text-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
            />
          </div>
          {error && <p className="text-accent-500">⚠️ {error}</p>}

          <div className="flex flex-col gap-3">
            <button
              type="submit"
              disabled={loading}
              className="kiosk-btn kiosk-primary w-full py-4 text-xl font-black"
            >
              {loading ? 'Verifying...' : 'Continue with Wallet'}
            </button>
            <button
              type="button"
              onClick={handleSkip}
              className="kiosk-btn bg-white w-full py-4 text-xl border-2 border-primary-600 text-primary-700"
            >
              Pay with Cash Instead
            </button>
          </div>
        </form>

        <p className="kiosk-subtle text-sm mt-6">
          💡 Your card number is printed on your Marryshow Card.<br />
          Forgot your PIN? Visit the campus service desk.
        </p>
      </div>
    </div>
  );
}