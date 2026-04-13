// KioskCategories.tsx - Updated to use new card styling
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { itemsService } from '../../services/api';

const categoryEmojis: Record<string, string> = {
  Breakfast: '🍳',
  'A La Carte': '🍔',
  Combo: '🍱',
  Beverage: '🥤',
  Dessert: '🍰',
};

export function KioskCategories() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await itemsService.getCategories();
      setCategories(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  if (loading) return <div className="text-center text-xl py-16">Loading delicious categories...</div>;
  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-red-600">Error: {error}</p>
        <button onClick={fetchCategories} className="kiosk-btn kiosk-primary mt-4 px-6 py-2">Retry</button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 text-center md:text-left">
        <h1 className="kiosk-title text-4xl md:text-5xl">What are you craving?</h1>
        <p className="kiosk-subtle text-lg mt-2">Tap a category to explore our fresh menu</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => {
          const emoji = categoryEmojis[category] || '🍽️';
          return (
            <button
              key={category}
              onClick={() => navigate(`/kiosk/menu/${encodeURIComponent(category)}`)}
              className="category-card group"
            >
              <div className="category-emoji text-6xl mb-2 transition-transform duration-300 group-hover:scale-110">
                {emoji}
              </div>
              <h2 className="category-name text-2xl font-extrabold text-neutral-800">
                {category}
              </h2>
              <div className="category-link flex items-center gap-1 text-primary-500 font-medium">
                Browse Menu
                <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}