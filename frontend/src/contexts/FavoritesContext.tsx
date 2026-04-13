import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { favoritesService } from '../services/api';
import { useAuth } from './AuthContext';

interface FavoritesContextType {
  favorites: string[];
  addFavorite: (itemId: string) => Promise<void>;
  removeFavorite: (itemId: string) => Promise<void>;
  isFavorite: (itemId: string) => boolean;
  toggleFavorite: (itemId: string) => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      favoritesService.getFavorites()
        .then(data => {
          // Ensure data is an array and map safely
          const favs = Array.isArray(data) 
            ? data.map(item => item.menu_item_id?.toString()).filter(Boolean) 
            : [];
          setFavorites(favs as string[]);
        })
        .catch(console.error);
    } else {
      setFavorites([]);
    }
  }, [user]);

  const addFavorite = async (itemId: string) => {
    if (!user) return;
    await favoritesService.addFavorite(parseInt(itemId));
    setFavorites(prev => [...prev, itemId]);
  };

  const removeFavorite = async (itemId: string) => {
    if (!user) return;
    await favoritesService.removeFavorite(parseInt(itemId));
    setFavorites(prev => prev.filter(id => id !== itemId));
  };

  const isFavorite = (itemId: string) => favorites.includes(itemId);

  const toggleFavorite = async (itemId: string) => {
    if (isFavorite(itemId)) {
      await removeFavorite(itemId);
    } else {
      await addFavorite(itemId);
    }
  };

  return (
    <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, isFavorite, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error('useFavorites must be used within FavoritesProvider');
  return context;
}