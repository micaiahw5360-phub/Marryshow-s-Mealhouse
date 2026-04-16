import React, { useState, useEffect } from 'react';
import { Search, Plus, Heart, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { useCart } from '../contexts/CartContext';
import type { MenuItem } from '../contexts/CartContext';
import { useKiosk } from '../contexts/KioskContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { itemsService } from '../services/api';
import { toast } from '../utils/toastWithSound';

const categories = ['All', 'Breakfast', 'Lunch', 'A La Carte', 'Combo', 'Beverage', 'Dessert'] as const;

// Normalize item from backend (snake_case -> camelCase, ensure numbers)
function normalizeMenuItem(raw: any): MenuItem {
  const options = raw.options?.map((opt: any) => ({
    id: opt.id,
    name: opt.option_name || opt.name,
    values: (opt.values || []).map((val: any) => ({
      id: val.id,
      name: val.value_name || val.name,
      priceModifier: typeof val.price_modifier === 'number' ? val.price_modifier : parseFloat(val.price_modifier) || 0,
    })),
  })) || [];

  return {
    id: raw.id,
    name: raw.name,
    category: raw.category,
    price: typeof raw.price === 'number' ? raw.price : parseFloat(raw.price) || 0,
    image: raw.image || '',
    description: raw.description || '',
    options,
  };
}

export function Menu() {
  const { addItem } = useCart();
  const { isKioskMode } = useKiosk();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<{ [key: string]: string }>({});
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingItem, setLoadingItem] = useState(false);

  useEffect(() => {
    itemsService.getItems()
      .then((data: any[]) => {
        const normalized = data.map(item => normalizeMenuItem(item));
        setItems(normalized);
        setLoading(false);
      })
      .catch(() => {
        toast.error('Failed to load menu');
        setLoading(false);
      });
  }, []);

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = () => {
    if (!selectedItem) return;
    const options: { [key: string]: any } = {};
    if (selectedItem.options) {
      for (const option of selectedItem.options) {
        const selectedValueId = selectedOptions[option.id];
        if (!selectedValueId) {
          toast.error(`Please select ${option.name}`);
          return;
        }
        const value = option.values.find((v) => v.id === selectedValueId);
        if (value) {
          options[option.id] = value;
        }
      }
    }
    addItem(selectedItem, options);
    toast.success('Item added to cart!');
    setSelectedItem(null);
    setSelectedOptions({});
  };

  const openItemDialog = (item: MenuItem) => {
    setSelectedItem(item);
    const defaults: { [key: string]: string } = {};
    if (item.options) {
      item.options.forEach((opt) => {
        if (opt.values && opt.values.length > 0) {
          defaults[opt.id] = opt.values[0].id;
        }
      });
    }
    setSelectedOptions(defaults);
  };

  const handleAddClick = async (item: MenuItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setLoadingItem(true);
    try {
      // Fetch full item (including options) from API
      const rawFullItem = await itemsService.getItem(item.id);
      const fullItem = normalizeMenuItem(rawFullItem);
      if (fullItem.options && fullItem.options.length > 0) {
        openItemDialog(fullItem);
      } else {
        addItem(fullItem, {});
        toast.success('Item added to cart!');
      }
    } catch (error) {
      console.error('Failed to fetch item details:', error);
      toast.error('Could not load item details');
    } finally {
      setLoadingItem(false);
    }
  };

  const handleFavoriteToggle = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(itemId);
    const isNowFavorite = isFavorite(itemId);
    toast.success(isNowFavorite ? 'Added to favorites!' : 'Removed from favorites');
  };

  if (loading) return <div className="text-center py-20">Loading menu...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Our Menu</h1>
          <p className="text-gray-600">Browse our delicious selection and order for pickup</p>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`pl-10 ${isKioskMode ? 'h-14 text-lg' : ''}`}
            />
          </div>
        </div>

        <div className="mb-8 overflow-x-auto">
          <div className="flex space-x-2 pb-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category)}
                className={`whitespace-nowrap ${
                  isKioskMode ? 'h-12 px-6 text-base' : ''
                } ${
                  selectedCategory === category
                    ? 'bg-[#074af2] hover:bg-[#0639c0]'
                    : ''
                }`}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No items found matching your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredItems.map((item) => (
              <Card
                key={item.id}
                className="overflow-hidden hover:shadow-xl transition-shadow group relative"
              >
                {/* Favorite Heart Button */}
                <button
                  onClick={(e) => handleFavoriteToggle(item.id, e)}
                  className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <Heart
                    className={`h-4 w-4 ${
                      isFavorite(item.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'
                    }`}
                  />
                </button>

                <div className="aspect-square overflow-hidden bg-gray-100">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardContent className={`${isKioskMode ? 'p-6' : 'p-4'}`}>
                  <div className="mb-2">
                    <span className="text-xs font-medium text-[#074af2] bg-blue-50 px-2 py-1 rounded">
                      {item.category}
                    </span>
                  </div>
                  <h3 className={`font-bold mb-2 ${isKioskMode ? 'text-xl' : 'text-lg'}`}>
                    {item.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{item.description}</p>
                  <div className="flex items-center justify-between">
                    <span className={`font-bold text-[#074af2] ${isKioskMode ? 'text-2xl' : 'text-xl'}`}>
                      ${item.price.toFixed(2)}
                    </span>
                    <Button
                      size={isKioskMode ? 'default' : 'sm'}
                      className="bg-[#f97316] hover:bg-[#ea580c]"
                      onClick={(e) => handleAddClick(item, e)}
                      disabled={loadingItem}
                    >
                      {loadingItem ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Plus className={`${isKioskMode ? 'w-5 h-5 mr-2' : 'w-4 h-4'}`} />
                          {isKioskMode ? 'Add to Cart' : 'Add'}
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className={isKioskMode ? 'max-w-2xl' : 'max-w-md'}>
          {!selectedItem ? null : (
            <>
              <DialogHeader>
                <DialogTitle className={isKioskMode ? 'text-2xl' : ''}>
                  {selectedItem.name}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="aspect-video overflow-hidden rounded-lg">
                  <img
                    src={selectedItem.image}
                    alt={selectedItem.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className={`text-gray-600 ${isKioskMode ? 'text-lg' : ''}`}>
                  {selectedItem.description}
                </p>
                <div className={`font-bold text-[#074af2] ${isKioskMode ? 'text-3xl' : 'text-2xl'}`}>
                  ${selectedItem.price.toFixed(2)}
                </div>
                {selectedItem.options?.map((option) => (
                  <div key={option.id}>
                    <Label className={`mb-3 block ${isKioskMode ? 'text-lg' : ''}`}>
                      {option.name}
                    </Label>
                    <RadioGroup
                      value={selectedOptions[option.id]}
                      onValueChange={(value) =>
                        setSelectedOptions({ ...selectedOptions, [option.id]: value })
                      }
                    >
                      {option.values.map((value) => (
                        <div key={value.id} className="flex items-center space-x-2 mb-2">
                          <RadioGroupItem value={value.id} id={value.id} />
                          <Label
                            htmlFor={value.id}
                            className={`flex-1 cursor-pointer ${isKioskMode ? 'text-base' : ''}`}
                          >
                            {value.name}
                            {value.priceModifier !== 0 && (
                              <span className="text-gray-500 ml-2">
                                (+${value.priceModifier.toFixed(2)})
                              </span>
                            )}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                ))}
                <Button
                  className={`w-full bg-[#f97316] hover:bg-[#ea580c] ${
                    isKioskMode ? 'h-14 text-lg' : ''
                  }`}
                  onClick={handleAddToCart}
                >
                  Add to Cart
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}