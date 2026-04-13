import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useKiosk } from '../../contexts/KioskContext';
import { toast } from '../../utils/toastWithSound';
import api from '../../services/api';

export function KioskGetUser() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setIdentifiedUser, identifiedUser } = useKiosk();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const returnTo = location.state?.returnTo || '/kiosk/checkout';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const userData = await api.kiosk.getUserByEmail(email.trim());
      setIdentifiedUser({
        email: userData.email,
        userId: userData.id,
        walletBalance: userData.wallet_balance || 0,
        name: userData.name || userData.username,
      });
      toast.success(`Welcome back, ${userData.name || userData.username}!`);
      navigate(returnTo);
    } catch (err: any) {
      setError(err.message || 'User not found. Please check your email.');
      toast.error('Could not verify user');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    toast.info('Continuing as guest. Wallet payment will not be available.');
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
        <div className="text-7xl mb-4">💰</div>
        <h1 className="kiosk-title text-3xl">Identify Yourself</h1>
        <p className="kiosk-subtle mt-2">Enter your email to use your wallet balance</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-left font-bold mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              autoFocus
              disabled={loading}
              className="w-full p-4 border border-sand-200 rounded-kiosk text-lg focus:outline-none focus:ring-2 focus:ring-ocean-400"
            />
            {error && <p className="text-coral-500 mt-2">⚠️ {error}</p>}
          </div>

          <div className="flex flex-col gap-3">
            <button
              type="submit"
              disabled={loading}
              className="kiosk-btn kiosk-primary w-full py-4 text-xl font-black"
            >
              {loading ? 'Checking...' : 'Continue with Wallet'}
            </button>
            <button
              type="button"
              onClick={handleSkip}
              className="kiosk-btn bg-white w-full py-4 text-xl border-2 border-ocean-600 text-ocean-700"
            >
              Continue as Guest
            </button>
          </div>
        </form>

        <p className="kiosk-subtle text-sm mt-6">
          💡 Your wallet balance will be used to pay for your order.<br />
          No account? You can still order as a guest.
        </p>
      </div>
    </div>
  );
}