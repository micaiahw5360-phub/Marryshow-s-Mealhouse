import { useState, useEffect } from 'react';
import { X, Info, CreditCard, Utensils, Smartphone, Coffee } from 'lucide-react';
import { Button } from './ui/button';

interface PromoBanner {
  id: string;
  message: string;
  icon?: React.ReactNode;
  ctaText?: string;
  ctaLink?: string;
}

const promos: PromoBanner[] = [
  {
    id: 'welcome',
    message: '🎉 Welcome to Marryshow\'s Mealhouse! Order online and skip the lines. 🎉',
    icon: <Utensils className="w-4 h-4 mr-2" />,
    ctaText: 'Order Now',
    ctaLink: '/menu',
  },
  {
    id: 'wallet',
    message: '💳 Pay faster with your Marryshow Card – no cash, no hassle! 💳',
    icon: <CreditCard className="w-4 h-4 mr-2" />,
    ctaText: 'Learn More',
    ctaLink: '/wallet',
  },
  {
    id: 'kiosk',
    message: '🖥️ Use our touch‑screen kiosk for quick self‑service ordering!',
    icon: <Smartphone className="w-4 h-4 mr-2" />,
    ctaText: 'How It Works',
    ctaLink: '/help',
  },
  {
    id: 'loyalty',
    message: '⭐ Earn 5% cashback when you pay with your Marryshow Wallet!',
    icon: <Coffee className="w-4 h-4 mr-2" />,
    ctaText: 'View Wallet',
    ctaLink: '/wallet',
  },
  {
    id: 'faq',
    message: '❓ New here? Check our FAQs to get the most out of your experience.',
    icon: <Info className="w-4 h-4 mr-2" />,
    ctaText: 'FAQs',
    ctaLink: '/help',
  },
];

export function PromoBanner() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [fade, setFade] = useState(false);
  const [dismissedIds, setDismissedIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('dismissed-promos');
    return saved ? JSON.parse(saved) : [];
  });

  const currentPromo = promos[currentIndex];
  const isDismissed = dismissedIds.includes(currentPromo?.id);

  useEffect(() => {
    if (isDismissed) {
      setIsVisible(false);
    } else {
      setIsVisible(true);
    }
  }, [currentPromo, isDismissed]);

  // Auto‑rotate every 10 seconds with fade transition
  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => {
      setFade(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % promos.length);
        setFade(false);
      }, 300);
    }, 10000);
    return () => clearInterval(interval);
  }, [isVisible]);

  const handleDismiss = () => {
    const newDismissed = [...dismissedIds, currentPromo.id];
    setDismissedIds(newDismissed);
    localStorage.setItem('dismissed-promos', JSON.stringify(newDismissed));
    setIsVisible(false);
  };

  if (!isVisible || !currentPromo) return null;

  return (
    <div
      className={`
        relative overflow-hidden transition-all duration-300
        bg-gradient-to-r from-red-600 via-green-600 to-yellow-500
        text-white py-3 px-4
      `}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex-1 flex items-center justify-center gap-3">
          <div className="hidden sm:flex items-center text-white/80">
            {currentPromo.icon}
          </div>
          <p
            className={`
              text-sm md:text-base font-medium transition-opacity duration-300
              ${fade ? 'opacity-0' : 'opacity-100'}
            `}
          >
            {currentPromo.message}
          </p>
          {currentPromo.ctaText && currentPromo.ctaLink && (
            <a href={currentPromo.ctaLink} className="hidden md:inline-block">
              <Button
                size="sm"
                variant="secondary"
                className="bg-white/20 hover:bg-white/30 text-white border-none"
              >
                {currentPromo.ctaText}
              </Button>
            </a>
          )}
        </div>
        <button
          onClick={handleDismiss}
          className="ml-4 p-1 hover:bg-white/20 rounded transition-colors"
          aria-label="Dismiss banner"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Animated progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/30">
        <div
          className="h-full bg-white/70 animate-progress"
          style={{ animationDuration: '10s' }}
        />
      </div>

      <style>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
        .animate-progress {
          animation: progress linear infinite;
        }
      `}</style>
    </div>
  );
}