import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Menu as MenuIcon, Wallet, LogOut, Heart, Bell, History, X } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationsContext';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import logo from '../../assets/logo.png';

export default function Navbar() {
  const { itemCount } = useCart();
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img
              src={logo}
              alt="MarryShow's Mealhouse"
              className="h-12 md:h-16 w-auto object-contain"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-700 hover:text-[#074af2] transition-colors">Home</Link>
            <Link to="/menu" className="text-gray-700 hover:text-[#074af2] transition-colors">Menu</Link>
            <Link to="/about" className="text-gray-700 hover:text-[#074af2] transition-colors">About</Link>
            <Link to="/help" className="text-gray-700 hover:text-[#074af2] transition-colors">Help</Link>
            <Link to="/contact" className="text-gray-700 hover:text-[#074af2] transition-colors">Contact</Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            {user && (
              <Link to="/notifications">
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#f97316] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </Link>
            )}

            {/* Wallet */}
            {user && (
              <Link to="/wallet">
                <Button variant="ghost" size="icon">
                  <Wallet className="w-5 h-5" />
                </Button>
              </Link>
            )}

            {/* Cart */}
            <Link to="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#f97316] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-2">
                    <p className="text-sm font-medium">{user.username}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="mr-2 h-4 w-4" /> My Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/orders')}>
                    <History className="mr-2 h-4 w-4" /> Order History
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/favorites')}>
                    <Heart className="mr-2 h-4 w-4" /> Favorites
                  </DropdownMenuItem>

                  {user.role === 'staff' && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate('/staff')}>
                        Staff Dashboard
                      </DropdownMenuItem>
                    </>
                  )}
                  {user.role === 'admin' && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate('/admin')}>
                        Admin Dashboard
                      </DropdownMenuItem>
                    </>
                  )}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login">
                <Button size="sm">Sign In</Button>
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(true)}
            >
              <MenuIcon className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu – slide‑in overlay */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition-all duration-300 ${
          mobileMenuOpen ? 'visible' : 'invisible'
        }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
            mobileMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setMobileMenuOpen(false)}
        />
        {/* Menu panel */}
        <div
          className={`absolute right-0 top-0 h-full w-80 bg-white shadow-xl transition-transform duration-300 ${
            mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex justify-between items-center p-4 border-b">
            <img src={logo} alt="Logo" className="h-8 w-auto" />
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <nav className="flex flex-col p-4 space-y-3">
            <Link
              to="/"
              className="text-gray-700 hover:text-[#074af2] py-2 text-lg font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/menu"
              className="text-gray-700 hover:text-[#074af2] py-2 text-lg font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Menu
            </Link>
            <Link
              to="/about"
              className="text-gray-700 hover:text-[#074af2] py-2 text-lg font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link
              to="/help"
              className="text-gray-700 hover:text-[#074af2] py-2 text-lg font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Help
            </Link>
            <Link
              to="/contact"
              className="text-gray-700 hover:text-[#074af2] py-2 text-lg font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </Link>
            {user && (
              <>
                <div className="h-px bg-gray-200 my-2" />
                <Link
                  to="/profile"
                  className="text-gray-700 hover:text-[#074af2] py-2 text-lg font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Profile
                </Link>
                <Link
                  to="/orders"
                  className="text-gray-700 hover:text-[#074af2] py-2 text-lg font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Order History
                </Link>
                <Link
                  to="/favorites"
                  className="text-gray-700 hover:text-[#074af2] py-2 text-lg font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Favorites
                </Link>
                <Link
                  to="/notifications"
                  className="text-gray-700 hover:text-[#074af2] py-2 text-lg font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Notifications
                </Link>
                <Link
                  to="/wallet"
                  className="text-gray-700 hover:text-[#074af2] py-2 text-lg font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Wallet
                </Link>
                {user.role === 'staff' && (
                  <Link
                    to="/staff"
                    className="text-gray-700 hover:text-[#074af2] py-2 text-lg font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Staff Dashboard
                  </Link>
                )}
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="text-gray-700 hover:text-[#074af2] py-2 text-lg font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Admin Dashboard
                  </Link>
                )}
                <div className="h-px bg-gray-200 my-2" />
                <button
                  onClick={handleLogout}
                  className="text-left text-red-600 hover:text-red-700 py-2 text-lg font-medium"
                >
                  Logout
                </button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}