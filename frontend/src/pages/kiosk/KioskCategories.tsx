import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { itemsService } from '../../services/api';

// Map category slugs to emoji
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

  if (loading) return <div className="text-center text-xl">Loading categories...</div>;
  if (error) {
    return (
      <div className="text-center">
        <p className="text-red-600">Error: {error}</p>
        <button onClick={fetchCategories} className="kiosk-btn mt-4 px-6 py-2">Retry</button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="kiosk-title text-4xl">Choose a Category</h1>
        <p className="kiosk-subtle text-lg">Tap to explore our menu</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => {
          const emoji = categoryEmojis[category] || '🍽️';
          return (
            <button
              key={category}
              onClick={() => navigate(`/kiosk/menu/${encodeURIComponent(category)}`)}
              className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all hover:-translate-y-1 border-2 border-transparent hover:border-school-600 text-left w-full"
            >
              <div className="text-5xl mb-2">{emoji}</div>
              <h2 className="text-2xl font-extrabold text-school-800">{category}</h2>
              <p className="text-gray-500 mt-1">Browse →</p>
            </button>
          );
        })}
      </div>
      <div className="mt-8">
        <button onClick={() => navigate('/kiosk')} className="kiosk-btn bg-white px-6 py-3">
          ← Back to Home
        </button>
      </div>
    </div>
  );
}