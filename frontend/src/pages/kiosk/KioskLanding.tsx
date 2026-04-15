// KioskLanding.tsx – New design with animated elements and clear CTA
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Sparkles, Coffee, Clock, Wallet } from 'lucide-react';

export function KioskLanding() {
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState('');
  const [randomFact, setRandomFact] = useState('');

  const funFacts = [
    "🍔 Our famous bake & bulla sells out every morning by 10 AM!",
    "🎉 Students love our combo deals – best value on campus!",
    "🌿 We use fresh local ingredients from Grenadian farms!",
    "⭐ Over 500 happy meals served this week alone!",
    "🔥 Try our signature Marryshow Burger – student approved!",
    "💰 Wallet payments get you 5% cashback!",
    "🥗 New vegan bowl added – try it today!"
  ];

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

    setRandomFact(funFacts[Math.floor(Math.random() * funFacts.length)]);
  }, []);

  return (
    <div className="min-h-full flex flex-col items-center justify-center px-4 py-8">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto animate-fadeSlide">
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold mb-6">
          <Sparkles className="w-4 h-4 text-yellow-300" />
          <span>OPEN FOR ORDERS</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight drop-shadow-lg">
          Marryshow's
          <span className="text-primary-400 block md:inline md:ml-4">Mealhouse</span>
        </h1>
        <p className="text-white/80 text-lg md:text-xl mt-4 max-w-2xl mx-auto">
          Touch, customize, collect – your perfect meal is moments away.
        </p>
      </div>

      {/* Greeting & Fun Fact Card */}
      <div className="mt-12 w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 text-center border border-white/20 shadow-xl">
          <div className="text-5xl mb-3">
            {greeting === 'Good Morning' ? '🌅' : greeting === 'Good Afternoon' ? '☀️' : '🌙'}
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            {greeting}!
          </h2>
          <p className="text-white/80 mt-1 text-lg">Ready for something delicious?</p>
          <div className="mt-5 bg-white/20 rounded-2xl p-3 text-white/90 text-sm font-medium">
            {randomFact}
          </div>
        </div>
      </div>

      {/* Main CTA Button */}
      <div className="mt-12">
        <button
          onClick={() => navigate('/kiosk/categories')}
          className="kiosk-btn kiosk-primary px-10 py-5 text-2xl md:text-3xl font-bold flex items-center gap-3 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
        >
          🛍️ Start Ordering
          <Sparkles className="w-6 h-6" />
        </button>
      </div>

      {/* Feature Tiles – Simple, interactive */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16 w-full max-w-4xl">
        <div className="kiosk-tile text-center bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-all">
          <div className="text-5xl mb-3">🥪</div>
          <h3 className="text-xl font-bold text-white">Made Fresh</h3>
          <p className="text-white/70 mt-1">Prepared instantly with quality ingredients.</p>
        </div>
        <div className="kiosk-tile text-center bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-all">
          <div className="text-5xl mb-3">⏱️</div>
          <h3 className="text-xl font-bold text-white">Fast Pickup</h3>
          <p className="text-white/70 mt-1">Ready in minutes – no waiting in line.</p>
        </div>
        <div className="kiosk-tile text-center bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-all">
          <div className="text-5xl mb-3">💳</div>
          <h3 className="text-xl font-bold text-white">Wallet Ready</h3>
          <p className="text-white/70 mt-1">Pay with your TAMCC wallet balance.</p>
        </div>
      </div>
    </div>
  );
}