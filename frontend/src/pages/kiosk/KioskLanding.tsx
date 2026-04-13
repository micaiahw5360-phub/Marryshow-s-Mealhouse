import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';

export function KioskLanding() {
  const navigate = useNavigate();

  const hour = new Date().getHours();
  const greetings = {
    morning: "🌅 Good Morning! Ready for Breakfast?",
    afternoon: "☀️ Good Afternoon! Lunch Time?",
    evening: "🌙 Good Evening! Dinner's Waiting!"
  };
  const greeting = hour < 12 ? greetings.morning : hour < 18 ? greetings.afternoon : greetings.evening;

  const funFacts = [
    "🍔 Our famous bake & bulla sells out every morning by 10 AM!",
    "🎉 Students love our combo deals - best value on campus!",
    "🌿 We use fresh local ingredients from Grenadian farms!",
    "⭐ Over 500 happy meals served this week alone!",
    "🔥 Try our signature Marryshow Burger - student approved!",
    "💰 Wallet payments get you 5% cashback!"
  ];
  const [randomFact, setRandomFact] = useState('');

  useEffect(() => {
    setRandomFact(funFacts[Math.floor(Math.random() * funFacts.length)]);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
      <div className="mb-6 inline-flex items-center gap-2 bg-ocean-100 text-ocean-800 px-4 py-2 rounded-full text-sm font-bold">
        <span className="w-2 h-2 bg-ocean-600 rounded-full animate-pulse"></span>
        OPEN FOR ORDERS
      </div>
      <h1 className="text-6xl font-black tracking-tight bg-gradient-to-r from-ocean-800 to-ocean-500 bg-clip-text text-transparent">
        Deli<span className="text-ocean-600">Kiosk</span>
      </h1>
      <p className="text-xl text-ocean-600 mt-4 max-w-md">
        Touch, customize, collect – your perfect meal is moments away.
      </p>

      <div className="mt-8 bg-white rounded-2xl p-7 max-w-lg w-full shadow-lg border border-sand-200 transition-all hover:shadow-xl animate-float">
        <div className="text-2xl font-bold text-ocean-800">{greeting}</div>
        <div className="mt-3 text-lg text-ocean-700 bg-ocean-50 p-3 rounded-2xl">{randomFact}</div>
      </div>

      <div className="flex gap-5 mt-8">
        <button
          onClick={() => navigate('/kiosk/categories')}
          className="kiosk-btn kiosk-primary px-8 py-5 text-2xl font-black"
        >
          🛍️ Start Ordering
        </button>
        <button
          onClick={() => navigate('/kiosk/categories')}
          className="kiosk-btn bg-white px-8 py-5 text-2xl font-black border-2 border-ocean-600 text-ocean-800 hover:bg-ocean-50"
        >
          View Menu
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
        <div className="kiosk-tile text-center">
          <div className="text-5xl mb-3">🥪</div>
          <h3 className="text-2xl font-bold">Made Fresh</h3>
          <p className="kiosk-subtle">Prepared instantly with quality ingredients.</p>
        </div>
        <div className="kiosk-tile text-center">
          <div className="text-5xl mb-3">⏱️</div>
          <h3 className="text-2xl font-bold">Fast Pickup</h3>
          <p className="kiosk-subtle">Ready in minutes – no waiting in line.</p>
        </div>
        <div className="kiosk-tile text-center">
          <div className="text-5xl mb-3">💳</div>
          <h3 className="text-2xl font-bold">Wallet Ready</h3>
          <p className="kiosk-subtle">Pay with your TAMCC wallet balance.</p>
        </div>
      </div>

      <div className="mt-20 bg-gradient-to-br from-ocean-50 to-white rounded-3xl p-9 text-center max-w-2xl border border-ocean-100 shadow-md">
        <h2 className="text-3xl font-black text-ocean-800">Hungry? 😋</h2>
        <p className="text-lg mt-2">Tap the button below and build your meal.</p>
        <button
          onClick={() => navigate('/kiosk/categories')}
          className="kiosk-btn kiosk-primary mt-6 px-8 py-4 text-xl font-black"
        >
          Order Now 🚀
        </button>
      </div>
    </div>
  );
}