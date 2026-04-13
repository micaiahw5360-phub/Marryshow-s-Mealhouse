import React from 'react';
import { Link, useNavigate } from 'react-router';
import { Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { useCart } from '../contexts/CartContext';
import { useKiosk } from '../contexts/KioskContext';

export function Cart() {
  const cartContext = useCart();
  const { isKioskMode } = useKiosk();
  const navigate = useNavigate();

  const cartItems = cartContext?.cartItems ?? [];
  const removeFromCart = cartContext?.removeFromCart ?? (() => {});
  const updateQuantity = cartContext?.updateQuantity ?? (() => {});
  const getCartTotal = cartContext?.getCartTotal ?? (() => 0);
  const total = getCartTotal();

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className={`font-bold mb-2 ${isKioskMode ? 'text-3xl' : 'text-2xl'}`}>
            Your cart is empty
          </h2>
          <p className={`text-gray-600 mb-8 ${isKioskMode ? 'text-lg' : ''}`}>
            Add some delicious items from our menu to get started!
          </p>
          <Link to="/menu">
            <Button
              size={isKioskMode ? 'lg' : 'default'}
              className="bg-[#074af2] hover:bg-[#0639c0]"
            >
              Browse Menu
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            size={isKioskMode ? 'lg' : 'default'}
            onClick={() => navigate('/menu')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Menu
          </Button>
          <h1 className={`font-bold ${isKioskMode ? 'text-4xl' : 'text-3xl'}`}>Shopping Cart</h1>
          <p className={`text-gray-600 mt-2 ${isKioskMode ? 'text-lg' : ''}`}>
            Review your order before checkout
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-0">
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">Item</TableHead>
                        <TableHead>Details</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Subtotal</TableHead>
                        <TableHead className="w-[100px]">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cartItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-20 h-20 object-cover rounded"
                            />
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{item.name}</p>
                              {Object.keys(item.selectedOptions).length > 0 && (
                                <p className="text-sm text-gray-500 mt-1">
                                  {Object.values(item.selectedOptions)
                                    .map((opt: any) => opt.name)
                                    .join(', ')}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>${item.price.toFixed(2)}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) =>
                                updateQuantity(item.id, parseInt(e.target.value) || 1)
                              }
                              className="w-20"
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            ${item.subtotal.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeFromCart(item.id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden divide-y">
                  {cartItems.map((item) => (
                    <div key={item.id} className="p-4">
                      <div className="flex space-x-4">
                        <img
                          src={item.image}
                          alt={item.name}
                          className={`object-cover rounded ${isKioskMode ? 'w-28 h-28' : 'w-20 h-20'}`}
                        />
                        <div className="flex-1">
                          <h3 className={`font-medium mb-1 ${isKioskMode ? 'text-xl' : ''}`}>
                            {item.name}
                          </h3>
                          {Object.keys(item.selectedOptions).length > 0 && (
                            <p className={`text-gray-500 mb-2 ${isKioskMode ? 'text-base' : 'text-sm'}`}>
                              {Object.values(item.selectedOptions)
                                .map((opt: any) => opt.name)
                                .join(', ')}
                            </p>
                          )}
                          <div className="flex items-center space-x-4 mb-2">
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) =>
                                updateQuantity(item.id, parseInt(e.target.value) || 1)
                              }
                              className={isKioskMode ? 'w-20 h-12' : 'w-16'}
                            />
                            <span className={`font-medium ${isKioskMode ? 'text-xl' : ''}`}>
                              ${item.subtotal.toFixed(2)}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size={isKioskMode ? 'default' : 'sm'}
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-20">
              <CardContent className={isKioskMode ? 'p-8' : 'p-6'}>
                <h2 className={`font-bold mb-6 ${isKioskMode ? 'text-2xl' : 'text-xl'}`}>
                  Order Summary
                </h2>
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className={`text-gray-600 ${isKioskMode ? 'text-lg' : ''}`}>
                      Subtotal
                    </span>
                    <span className={`font-medium ${isKioskMode ? 'text-lg' : ''}`}>
                      ${total.toFixed(2)}
                    </span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between">
                      <span className={`font-bold ${isKioskMode ? 'text-2xl' : 'text-lg'}`}>
                        Total
                      </span>
                      <span className={`font-bold text-[#074af2] ${isKioskMode ? 'text-2xl' : 'text-lg'}`}>
                        ${total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
                <Link to="/checkout">
                  <Button
                    className={`w-full bg-[#f97316] hover:bg-[#ea580c] ${isKioskMode ? 'h-16 text-xl' : ''}`}
                  >
                    Proceed to Checkout
                  </Button>
                </Link>
                <Link to="/menu">
                  <Button
                    variant="outline"
                    className={`w-full mt-3 ${isKioskMode ? 'h-14 text-lg' : ''}`}
                  >
                    Continue Shopping
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}