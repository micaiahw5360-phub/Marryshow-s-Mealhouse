import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from "./components/ui/sonner";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';
import { useEffect, useState } from 'react'; // ✅ Added for PWA install button
import { PublicLayout } from './components/layout/PublicLayout';
import { AdminLayout } from './components/layout/AdminLayout';
import { StaffLayout } from './components/layout/StaffLayout';
import { StaffDashboard } from './pages/staff/StaffDashboard';
import { KioskLayout } from './components/layout/KioskLayout';
import { KioskLanding } from './pages/kiosk/KioskLanding';
import { KioskCategories } from './pages/kiosk/KioskCategories';
import { KioskMenu } from './pages/kiosk/KioskMenu';
import { KioskCart } from './pages/kiosk/KioskCart';
import { KioskCheckout } from './pages/kiosk/KioskCheckout';
import { KioskGetUser } from './pages/kiosk/KioskGetUser';
import { KioskOrderConfirmation } from './pages/kiosk/KioskOrderConfirmation';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { ResetPassword } from './pages/auth/ResetPassword';
import { Landing } from './pages/Home';
import { Menu } from './pages/Menu';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { OrderConfirmation } from './pages/OrderConfirmation';
import { OrderHistory } from './pages/OrderHistory';
import { Wallet } from './pages/Wallet';
import { Profile } from './pages/Profile';
import { Favorites } from './pages/Favorites';
import { Notifications } from './pages/Notifications';
import { Help } from './pages/Help';
import { Contact } from './pages/Contact';
import { About } from './pages/About';
import { TermsOfService } from './pages/TermsOfService';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { AdminDashboard } from './pages/admin/Dashboard';
import { ManageMenu } from './pages/admin/ManageMenu';
import { ManageOrders } from './pages/admin/ManageOrders';
import { ManageUsers } from './pages/admin/ManageUsers';
import { AddMenuItem } from './pages/admin/AddMenuItem';
import { EditMenuItem } from './pages/admin/EditMenuItem';
import { ManageItemOptions } from './pages/admin/ManageItemOptions';
import { AdminOrderDetail } from './pages/admin/AdminOrderDetail';
import { NotFound } from './pages/NotFound';
import GlobalLoader from './components/GlobalLoader';
import { useAuth } from './contexts/AuthContext';
import { useKiosk } from './contexts/KioskContext';

const queryClient = new QueryClient();

// Route guards (unchanged)
const KioskRouteGuard = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const { isKioskMode } = useKiosk();
  if (!isKioskMode || user?.role !== 'kiosk') {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

const CustomerRouteGuard = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const { isKioskMode } = useKiosk();
  if (isKioskMode || user?.role === 'kiosk') {
    return <Navigate to="/kiosk" replace />;
  }
  return <>{children}</>;
};

const StaffRouteGuard = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  if (!user || (user.role !== 'staff' && user.role !== 'admin')) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

function App() {
  // PWA install button logic
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choice: { outcome: string }) => {
      if (choice.outcome === 'accepted') console.log('User accepted installation');
      else console.log('User dismissed installation');
      setDeferredPrompt(null);
      setShowInstallButton(false);
    });
  };

  return (
    <QueryClientProvider client={queryClient}>
      <GlobalLoader />
      <BrowserRouter>
        <Toaster position="top-right" richColors />
        <Routes>
          {/* Public routes (customer) */}
          <Route path="/" element={<CustomerRouteGuard><PublicLayout /></CustomerRouteGuard>}>
            <Route index element={<Landing />} />
            <Route path="menu" element={<Menu />} />
            <Route path="cart" element={<Cart />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="order-confirmation" element={<OrderConfirmation />} />
            <Route path="wallet" element={<Wallet />} />
            <Route path="profile" element={<Profile />} />
            <Route path="orders" element={<OrderHistory />} />
            <Route path="favorites" element={<Favorites />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="help" element={<Help />} />
            <Route path="contact" element={<Contact />} />
            <Route path="about" element={<About />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="reset-password" element={<ResetPassword />} />
            <Route path="terms" element={<TermsOfService />} />
            <Route path="privacy" element={<PrivacyPolicy />} />
          </Route>

          {/* Admin routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="menu" element={<ManageMenu />} />
            <Route path="menu/create" element={<AddMenuItem />} />
            <Route path="menu/edit/:id" element={<EditMenuItem />} />
            <Route path="menu/options/:id" element={<ManageItemOptions />} />
            <Route path="orders" element={<ManageOrders />} />
            <Route path="orders/:id" element={<AdminOrderDetail />} />
            <Route path="users" element={<ManageUsers />} />
          </Route>

          {/* Staff routes */}
          <Route path="/staff" element={<StaffRouteGuard><StaffLayout /></StaffRouteGuard>}>
            <Route index element={<StaffDashboard />} />
          </Route>

          {/* Kiosk routes */}
          <Route path="/kiosk" element={<KioskRouteGuard><KioskLayout /></KioskRouteGuard>}>
            <Route index element={<KioskLanding />} />
            <Route path="categories" element={<KioskCategories />} />
            <Route path="menu/:category" element={<KioskMenu />} />
            <Route path="cart" element={<KioskCart />} />
            <Route path="get-user" element={<KioskGetUser />} />
            <Route path="checkout" element={<KioskCheckout />} />
            <Route path="order-confirmation" element={<KioskOrderConfirmation />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>

        {/* PWA Install Button – floats at bottom right */}
        {showInstallButton && (
          <button
            onClick={handleInstall}
            className="fixed bottom-4 right-4 z-50 bg-[#074af2] text-white px-4 py-2 rounded-full shadow-lg hover:bg-[#0639c0] transition-colors flex items-center gap-2"
          >
            📱 Install App
          </button>
        )}
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;