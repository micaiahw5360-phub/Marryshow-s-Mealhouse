import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/button';

interface PromoBanner {
  id: string;
  message: string;
  bgColor: string;
  textColor: string;
  ctaText?: string;
  ctaLink?: string;
}

const promos: PromoBanner[] = [
  {
    id: 'promo-1',
    message: '🎉 Welcome to Marryshow\'s Mealhouse. Skip the lines and order online! 🎉',
    bgColor: 'bg-gradient-to-r from-red-500 to-green-500 to-yellow-500',
    textColor: 'text-white',
    ctaText: 'Order Now',
    ctaLink: '/menu',
  },
  {
    id: 'promo-2',
    message: '💳 Instead of using cash, pay with you Marryshow card for a faster checkout! 💳',
    bgColor: 'bg-gradient-to-r from-black-500 to-gold-500',
    textColor: 'text-white',
    ctaText: 'View Wallet',
    ctaLink: '/wallet',
  },
];

export function PromoBanner() {
  const [currentPromo, setCurrentPromo] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [dismissed, setDismissed] = useState<string[]>(() => {
    const saved = localStorage.getItem('dismissed-promos');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentPromo((prev) => (prev + 1) % promos.length);
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const promo = promos[currentPromo];

  useEffect(() => {
    if (dismissed.includes(promo.id)) {
      setIsVisible(false);
    } else {
      setIsVisible(true);
    }
  }, [promo.id, dismissed]);

  const handleDismiss = () => {
    const newDismissed = [...dismissed, promo.id];
    setDismissed(newDismissed);
    localStorage.setItem('dismissed-promos', JSON.stringify(newDismissed));
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className={`${promo.bgColor} ${promo.textColor} py-3 px-4 relative overflow-hidden`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex-1 flex items-center justify-center space-x-4">
          <p className="text-sm md:text-base font-medium">{promo.message}</p>
          {promo.ctaText && promo.ctaLink && (
            <a href={promo.ctaLink}>
              <Button
                size="sm"
                variant="secondary"
                className="hidden md:inline-flex"
              >
                {promo.ctaText}
              </Button>
            </a>
          )}
        </div>
        <button
          onClick={handleDismiss}
          className="ml-4 p-1 hover:bg-white/20 rounded transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30">
        <div
          className="h-full bg-white/60 animate-[progress_5s_linear_infinite]"
          style={{ width: '100%' }}
        />
      </div>
    </div>
  );
}
