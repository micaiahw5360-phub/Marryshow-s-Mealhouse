import { useState, useEffect } from 'react';   // ADDED useEffect
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Heart, ShoppingCart, Trash2, Search } from 'lucide-react';
import { toast } from '../utils/toastWithSound';
import { itemsService } from '../services/api';   // ADDED (replaces menuItems import)
import { useFavorites } from '../contexts/FavoritesContext';
import { useCart } from '../contexts/CartContext';

export function Favorites() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const { favorites, removeFavorite } = useFavorites();
  const { addItem } = useCart();

  // REPLACED: const favoriteItems = menuItems.filter((item) => favorites.includes(item.id));
  const [favoriteItems, setFavoriteItems] = useState([]);   // ADDED
  const [loading, setLoading] = useState(true);             // ADDED

  useEffect(() => {                                          // ADDED
    if (favorites.length === 0) {
      setFavoriteItems([]);
      setLoading(false);
      return;
    }
    itemsService.getItems().then(allItems => {
      const filtered = allItems.filter(item => favorites.includes(item.id.toString()));
      setFavoriteItems(filtered);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [favorites]);

  const filteredItems = favoriteItems.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRemoveFavorite = (itemId: string) => {
    removeFavorite(itemId);
    toast.success('Removed from favorites');
  };

  const handleAddToCart = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const item = favoriteItems.find((i) => i.id === itemId);   // CHANGED: was menuItems.find
    if (item) {
      if (item.options && item.options.length > 0) {
        navigate(`/menu/${itemId}`);
      } else {
        addItem(item, {});   // CHANGED: was addItem(item, 1, {}) – already correct, but we keep
        toast.success('Added to cart!');
      }
    }
  };

  const handleViewItem = (itemId: string) => {
    navigate(`/menu/${itemId}`);
  };

  // ADDED loading check
  if (loading) return <div className="text-center py-20">Loading favorites...</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Favorites</h1>
            <p className="text-gray-600">
              {favoriteItems.length} {favoriteItems.length === 1 ? 'item' : 'items'} saved
            </p>
          </div>
          <Heart className="h-8 w-8 text-red-500 fill-red-500" />
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search favorites..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {searchQuery ? 'No favorites found' : 'No favorites yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery
                ? 'Try a different search term'
                : 'Start adding items to your favorites from the menu'}
            </p>
            <Button onClick={() => navigate('/menu')}>Browse Menu</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <Card
              key={item.id}
              className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
            >
              <div onClick={() => handleViewItem(item.id)}>
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-white text-gray-900 shadow-md">
                      {item.category}
                    </Badge>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFavorite(item.id);
                    }}
                    className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </button>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-bold text-lg mb-1 text-gray-900">{item.name}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {item.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-xl font-bold text-[#074af2]">
                      ${item.price.toFixed(2)}
                    </p>
                  </div>
                </CardContent>
              </div>
              <div className="px-4 pb-4">
                <Button
                  onClick={(e) => handleAddToCart(item.id, e)}
                  className="w-full"
                  size="sm"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {filteredItems.length > 0 && (
        <div className="mt-8 p-6 bg-gradient-to-br from-blue-50 to-orange-50 border border-blue-200 rounded-lg">
          <h3 className="font-bold text-lg text-blue-900 mb-2">
            Quick Tip
          </h3>
          <p className="text-blue-800">
            Click the heart icon on any menu item to save it to your favorites for easy access later!
          </p>
        </div>
      )}
    </div>
  );
}