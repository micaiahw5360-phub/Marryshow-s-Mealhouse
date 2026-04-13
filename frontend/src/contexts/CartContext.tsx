// src/contexts/CartContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface CartItem {
  id: string;                    // composite key: menuItemId + hash of options
  menuItemId: number;
  name: string;
  price: number;                 // effective price per unit (base + modifiers)
  image?: string;
  quantity: number;
  selectedOptions: Record<string, any>;
  subtotal: number;              // price * quantity
}

interface CartContextType {
  cartItems: CartItem[];
  itemCount: number;
  addToCart: (item: CartItem) => void;
  addItem: (menuItem: any, selectedOptions?: Record<string, any>) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Generate a unique ID for a cart item based on menu item ID and selected options
const getCartItemId = (menuItemId: number, selectedOptions: Record<string, any>): string => {
  const optionsKey = Object.keys(selectedOptions)
    .sort()
    .map(key => {
      const val = selectedOptions[key];
      return `${key}:${val.id}`;
    })
    .join('|');
  return `${menuItemId}-${optionsKey}`;
};

// Compute effective price per unit (base price + sum of all price modifiers)
const computeEffectivePrice = (basePrice: number, selectedOptions: Record<string, any>): number => {
  let modifierSum = 0;
  for (const optValue of Object.values(selectedOptions)) {
    if (optValue && typeof optValue.priceModifier === 'number') {
      modifierSum += optValue.priceModifier;
    }
  }
  return basePrice + modifierSum;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const addToCart = (newItem: CartItem) => {
    setCartItems(prev => {
      const existingIndex = prev.findIndex(item => item.id === newItem.id);
      if (existingIndex >= 0) {
        // Update quantity and subtotal
        const updated = [...prev];
        const existing = updated[existingIndex];
        const newQuantity = existing.quantity + newItem.quantity;
        updated[existingIndex] = {
          ...existing,
          quantity: newQuantity,
          subtotal: existing.price * newQuantity,
        };
        return updated;
      }
      return [...prev, newItem];
    });
  };

  const addItem = (menuItem: any, selectedOptions: Record<string, any> = {}) => {
    const effectivePrice = computeEffectivePrice(menuItem.price, selectedOptions);
    const cartItemId = getCartItemId(menuItem.id, selectedOptions);
    const cartItem: CartItem = {
      id: cartItemId,
      menuItemId: menuItem.id,
      name: menuItem.name,
      price: effectivePrice,
      image: menuItem.image,
      quantity: 1,
      selectedOptions: selectedOptions,
      subtotal: effectivePrice,
    };
    addToCart(cartItem);
  };

  const removeFromCart = (itemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    setCartItems(prev =>
      prev.map(item =>
        item.id === itemId
          ? { ...item, quantity, subtotal: item.price * quantity }
          : item
      )
    );
  };

  const clearCart = () => setCartItems([]);

  const getCartTotal = () => {
    return cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  const itemCount = getCartCount();

  return (
    <CartContext.Provider
      value={{
        cartItems,
        itemCount,
        addToCart,
        addItem,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};