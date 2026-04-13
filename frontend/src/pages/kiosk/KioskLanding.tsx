// KioskLanding.tsx - Fresh, modern landing page with new styling
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';

export function KioskLanding() {
  const navigate = useNavigate();

  const hour = new Date().getHours();
  const greeting = 
    hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";
  
  const funFacts = [
    "🍔 Our famous bake & bulla sells out every morning by 10 AM!",
    "🎉 Students love our combo deals – best value on campus!",
    "🌿 We use fresh local ingredients from Grenadian farms!",
    "⭐ Over 500 happy meals served this week alone!",
    "🔥 Try our signature Marryshow Burger – student approved!",
    "💰 Wallet payments get you 5% cashback!",
    "🥗 New vegan bowl added – try it today!"
  ];
  const [randomFact, setRandomFact] = useState('');

  useEffect(() => {
    setRandomFact(funFacts[Math.floor(Math.random() * funFacts.length)]);
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-10">
      {/* Hero Section – Clean and welcoming */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
          <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></span>
          OPEN FOR ORDERS
        </div>
        <h1 className="text-5xl md:text-7xl font-black tracking-tight text-neutral-800">
          Marryshow's
          <span className="text-primary-500 block md:inline md:ml-3">Mealhouse</span>
        </h1>
        <p className="text-lg md:text-xl text-neutral-500 mt-4 max-w-2xl mx-auto">
          Touch, customize, collect – your perfect meal is moments away.
        </p>
      </div>

      {/* Greeting & Fun Fact Card – Floating, animated */}
      <div className="max-w-2xl mx-auto mb-12">
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-card border border-neutral-200 text-center transition-all hover:shadow-lg animate-float">
          <div className="text-4xl md:text-5xl mb-2">
            {hour < 12 ? '🌅' : hour < 18 ? '☀️' : '🌙'}
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-neutral-800">
            {greeting}!
          </h2>
          <p className="text-neutral-600 mt-2 text-lg">Ready for something delicious?</p>
          <div className="mt-4 bg-primary-50 rounded-2xl p-4 text-primary-700 font-medium">
            {randomFact}
          </div>
        </div>
      </div>

      {/* Primary CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
        <button
          onClick={() => navigate('/kiosk/categories')}
          className="kiosk-btn kiosk-primary px-8 py-4 text-xl font-bold flex items-center justify-center gap-2"
        >
          🛍️ Start Ordering
        </button>
        <button
          onClick={() => navigate('/kiosk/categories')}
          className="kiosk-btn kiosk-outline px-8 py-4 text-xl font-bold flex items-center justify-center gap-2"
        >
          📋 View Full Menu
        </button>
      </div>

      {/* Feature Tiles – Simple, card-like */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <div className="kiosk-tile text-center">
          <div className="text-5xl mb-3">🥪</div>
          <h3 className="text-xl font-bold text-neutral-800">Made Fresh</h3>
          <p className="text-neutral-500 mt-1">Prepared instantly with quality ingredients.</p>
        </div>
        <div className="kiosk-tile text-center">
          <div className="text-5xl mb-3">⏱️</div>
          <h3 className="text-xl font-bold text-neutral-800">Fast Pickup</h3>
          <p className="text-neutral-500 mt-1">Ready in minutes – no waiting in line.</p>
        </div>
        <div className="kiosk-tile text-center">
          <div className="text-5xl mb-3">💳</div>
          <h3 className="text-xl font-bold text-neutral-800">Wallet Ready</h3>
          <p className="text-neutral-500 mt-1">Pay with your TAMCC wallet balance.</p>
        </div>
      </div>

      {/* Bottom Callout – Simple gradient box */}
      <div className="bg-gradient-to-br from-primary-50 to-white rounded-3xl p-8 text-center max-w-3xl mx-auto border border-primary-100">
        <h2 className="text-3xl font-black text-neutral-800">Hungry? 😋</h2>
        <p className="text-neutral-600 mt-2 text-lg">Tap below and build your meal in seconds.</p>
        <button
          onClick={() => navigate('/kiosk/categories')}
          className="kiosk-btn kiosk-primary mt-6 px-8 py-4 text-xl font-bold"
        >
          Order Now 🚀
        </button>
      </div>
    </div>
  );
}