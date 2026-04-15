import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { itemsService } from '../../services/api';
import { useCart } from '../../contexts/CartContext';
import { toast } from '../../utils/toastWithSound';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { Button } from '../../components/ui/button';
import { Loader2, ShoppingCart } from 'lucide-react';
import confetti from 'canvas-confetti';

interface MenuItem {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
  description: string;
  is_available: boolean;
  options?: any[];
}

const normalizeItem = (raw: any): MenuItem => ({
  ...raw,
  price: typeof raw.price === 'string' ? parseFloat(raw.price) : raw.price,
  options: raw.options?.map((opt: any) => ({
    id: opt.id,
    name: opt.option_name || opt.name,
    values: (opt.values || []).map((val: any) => ({
      id: val.id,
      name: val.value_name || val.name,
      priceModifier: typeof val.price_modifier === 'number' ? val.price_modifier : parseFloat(val.price_modifier) || 0,
    })),
  })) || [],
});

export function KioskMenu() {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const { addItem, getCartCount } = useCart();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingId, setAddingId] = useState<number | null>(null);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<{ [key: string]: string }>({});
  const [loadingItem, setLoadingItem] = useState(false);
  const [currentPrice, setCurrentPrice] = useState(0);

  const decodedCategory = decodeURIComponent(category || '');
  const cartCount = getCartCount();

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const allItems = await itemsService.getItems();
      const filtered = allItems.filter(
        (item: MenuItem) => item.category === decodedCategory && item.is_available !== false
      );
      setItems(filtered.map(normalizeItem));
    } catch (err: any) {
      setError(err.message || 'Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [decodedCategory]);

  const openItemDialog = async (item: MenuItem) => {
    setLoadingItem(true);
    try {
      const fullItem = await itemsService.getItem(item.id);
      const normalized = normalizeItem(fullItem);
      setSelectedItem(normalized);
      const defaults: { [key: string]: string } = {};
      if (normalized.options) {
        normalized.options.forEach((opt) => {
          if (opt.values.length) defaults[opt.id] = opt.values[0].id;
        });
      }
      setSelectedOptions(defaults);
      setCurrentPrice(normalized.price);
    } catch (err) {
      toast.error('Could not load item details');
    } finally {
      setLoadingItem(false);
    }
  };

  useEffect(() => {
    if (!selectedItem) return;
    let modifierSum = 0;
    for (const optionId of Object.keys(selectedOptions)) {
      const option = selectedItem.options?.find(opt => opt.id === parseInt(optionId));
      const value = option?.values.find(v => v.id === selectedOptions[optionId]);
      if (value) modifierSum += value.priceModifier;
    }
    setCurrentPrice(selectedItem.price + modifierSum);
  }, [selectedOptions, selectedItem]);

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
        if (value) options[option.id] = value;
      }
    }
    addItem(selectedItem, options);
    toast.success(`${selectedItem.name} added to cart!`);
    setSelectedItem(null);
    setSelectedOptions({});
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
  };

  const handleAddClick = async (item: MenuItem) => {
    setAddingId(item.id);
    try {
      const fullItem = await itemsService.getItem(item.id);
      const normalized = normalizeItem(fullItem);
      if (normalized.options && normalized.options.length > 0) {
        await openItemDialog(normalized);
      } else {
        addItem(normalized, {});
        toast.success(`${normalized.name} added to cart!`);
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      }
    } catch (err) {
      toast.error('Failed to add item');
    } finally {
      setAddingId(null);
    }
  };

  if (loading) return <div className="text-center text-xl py-16 text-white">Loading menu items...</div>;
  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-red-400">Error: {error}</p>
        <button onClick={fetchItems} className="kiosk-btn mt-4 px-6 py-2">Retry</button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">🍽️</div>
        <h2 className="text-3xl font-bold text-white">No items in this category</h2>
        <button onClick={() => navigate('/kiosk/categories')} className="kiosk-btn kiosk-primary mt-6 px-6 py-3">
          Choose Another Category
        </button>
      </div>
    );
  }

  return (
    <div className="relative pb-20">
      {/* Back button */}
      <button onClick={() => navigate('/kiosk/categories')} className="kiosk-btn bg-white/20 backdrop-blur-sm text-white px-6 py-2 mb-6 shadow-sm">
        ← Back to Categories
      </button>

      <div className="mb-8">
        <h1 className="kiosk-title text-4xl text-white">{decodedCategory}</h1>
        <p className="kiosk-subtle text-white/80 text-lg">Tap + to add items to your order</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div key={item.id} className="kiosk-tile kiosk-tile-hover">
            {/* Image container – flexible height, shows full image without cropping */}
            <div className="w-full flex items-center justify-center bg-white/5 rounded-kiosk overflow-hidden">
              {item.image ? (
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-full h-auto max-h-48 object-contain" 
                />
              ) : (
                <div className="text-6xl py-8">🥪</div>
              )}
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-extrabold text-white">{item.name}</h3>
              <p className="text-white/70 mt-1">{item.description || 'Delicious fresh item'}</p>
              <div className="flex justify-between items-center mt-4">
                <span className="text-2xl font-black text-white">${item.price.toFixed(2)}</span>
                <button
                  onClick={() => handleAddClick(item)}
                  disabled={addingId === item.id}
                  className="kiosk-btn kiosk-primary px-6 py-3 text-2xl font-black"
                >
                  {addingId === item.id ? <Loader2 className="w-6 h-6 animate-spin" /> : '+'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Floating Cart Button – dark frosted glass */}
      <button
        onClick={() => navigate('/kiosk/cart')}
        className="fixed bottom-24 right-4 z-50 bg-black/50 backdrop-blur-md text-white p-4 rounded-full shadow-xl hover:bg-black/70 transition-all transform hover:scale-110 border border-white/20"
      >
        <ShoppingCart className="w-8 h-8" />
        {cartCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-accent-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg">
            {cartCount}
          </span>
        )}
      </button>

      {/* Options Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-md rounded-kiosk bg-white/90 backdrop-blur-md">
          {loadingItem ? (
            <div className="flex flex-col items-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary-800" />
              <p className="mt-4">Loading options...</p>
            </div>
          ) : selectedItem && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-black text-primary-800">{selectedItem.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <img src={selectedItem.image} alt={selectedItem.name} className="rounded-lg w-full h-auto max-h-48 object-contain" />
                <p>{selectedItem.description}</p>
                <div className="font-bold text-xl text-primary-800">${currentPrice.toFixed(2)}</div>
                {selectedItem.options?.map((opt) => (
                  <div key={opt.id}>
                    <Label className="font-bold">{opt.name}</Label>
                    <RadioGroup
                      value={selectedOptions[opt.id]}
                      onValueChange={(val) => setSelectedOptions({ ...selectedOptions, [opt.id]: val })}
                    >
                      {opt.values.map((val) => (
                        <div key={val.id} className="flex items-center space-x-2 mt-2">
                          <RadioGroupItem value={val.id} id={val.id} />
                          <Label htmlFor={val.id} className="flex-1">
                            {val.name}
                            {val.priceModifier !== 0 && (
                              <span className="text-primary-600 ml-2">(+${val.priceModifier.toFixed(2)})</span>
                            )}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                ))}
                <Button onClick={handleAddToCart} className="w-full kiosk-btn kiosk-primary text-lg py-3">
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