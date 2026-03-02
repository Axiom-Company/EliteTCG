import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

// Components for main public site
import Navbar from './components/Navbar/Navbar';
import Hero from './components/Hero/Hero';
import ShopBySet from './components/ShopBySet/ShopBySet';
import ShopByCategory from './components/ShopByCategory/ShopByCategory';
import FeaturedProducts from './components/FeaturedProducts/FeaturedProducts';
import PreOrders from './components/PreOrders/PreOrders';
import MarketplaceCTA from './components/MarketplaceCTA/MarketplaceCTA';
import TrustSection from './components/TrustSection/TrustSection';
import Footer from './components/Footer/Footer';
import ProductPage from './components/ProductPage/ProductPage';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Seller pages
import BecomeSeller from './pages/seller/BecomeSeller';
import CreateListing from './pages/seller/CreateListing';
import SellerDashboard from './pages/seller/SellerDashboard';

// Marketplace pages
import MarketplaceBrowse from './pages/marketplace/MarketplaceBrowse';
import ListingDetail from './pages/marketplace/ListingDetail';
import MarketplaceCheckout from './pages/marketplace/MarketplaceCheckout';
import MarketplacePaymentSuccess from './pages/marketplace/MarketplacePaymentSuccess';
import MarketplacePaymentCancel from './pages/marketplace/MarketplacePaymentCancel';

// Products pages
import Products from './pages/products/Products';

// Wishlist page
import Wishlist from './pages/wishlist/Wishlist';

// Sets pages
import Sets from './pages/sets/Sets';
import SetDetail from './pages/sets/SetDetail';

// Category pages
import CategoryDetail from './pages/categories/CategoryDetail';

// Checkout pages
import Checkout from './pages/checkout/Checkout';
import PaymentSuccess from './pages/checkout/PaymentSuccess';
import PaymentCancel from './pages/checkout/PaymentCancel';
import PayflexReturn from './pages/checkout/PayflexReturn';

// Order pages
import OrderTracking from './pages/orders/OrderTracking';
import OrderHistory from './pages/orders/OrderHistory';

// Subscription pages
import SubscriptionPlans from './pages/subscription/SubscriptionPlans';
import SubscriptionManage from './pages/subscription/SubscriptionManage';

// Customer Auth Provider
import { CustomerAuthProvider } from './contexts/CustomerAuthContext';

// Toast
import { Toaster } from 'sonner';

// Cart Provider and Components
import { CartProvider } from './contexts/CartContext';
import CartDrawer from './components/Cart/CartDrawer';

// Wishlist Provider
import { WishlistProvider } from './contexts/WishlistContext';

// PWA Components
import InstallPrompt from './components/PWA/InstallPrompt';
import UpdateNotification from './components/PWA/UpdateNotification';

// Analytics
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

// Admin Application
import AdminApp from './admin/AdminApp';
import AnnouncementBar from './components/AnnouncementBar/AnnouncementBar';

const HomePage = () => {
  const navigate = useNavigate();
  return (
  <>
    <Hero onShopClick={() => navigate('/products')} />
    <ShopBySet />
    <ShopByCategory />
    <FeaturedProducts />
    <MarketplaceCTA />
    <PreOrders />
    {/* <TrustSection /> */}
  </>
  );
};

const MainLayout = ({ children }) => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <AnnouncementBar />
    <main className="flex-1">
      {children}
    </main>
    <Footer />
  </div>
);

const NavbarLayout = ({ children }) => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <AnnouncementBar />
    <main className="flex-1">
      {children}
    </main>
  </div>
);

function App() {
  return (
    <CustomerAuthProvider>
      <WishlistProvider>
      <CartProvider>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<MainLayout><HomePage /></MainLayout>} />
          <Route path="/products" element={<MainLayout><Products /></MainLayout>} />
          <Route path="/wishlist" element={<MainLayout><Wishlist /></MainLayout>} />
          <Route path="/sets" element={<MainLayout><Sets /></MainLayout>} />
          <Route path="/sets/:id" element={<MainLayout><SetDetail /></MainLayout>} />
          <Route path="/categories/:slug" element={<MainLayout><CategoryDetail /></MainLayout>} />
          <Route path="/product/:id" element={<MainLayout><ProductPage /></MainLayout>} />
          <Route path="/login" element={<NavbarLayout><Login /></NavbarLayout>} />
          <Route path="/register" element={<NavbarLayout><Register /></NavbarLayout>} />
          <Route path="/become-seller" element={<MainLayout><BecomeSeller /></MainLayout>} />
          <Route path="/marketplace" element={<MainLayout><MarketplaceBrowse /></MainLayout>} />
          <Route path="/marketplace/:id" element={<MainLayout><ListingDetail /></MainLayout>} />
          <Route path="/marketplace/checkout/:listingId" element={<MainLayout><MarketplaceCheckout /></MainLayout>} />
          <Route path="/marketplace/payment-success" element={<MainLayout><MarketplacePaymentSuccess /></MainLayout>} />
          <Route path="/marketplace/payment-cancel" element={<MainLayout><MarketplacePaymentCancel /></MainLayout>} />
          <Route path="/seller/create-listing" element={<MainLayout><CreateListing /></MainLayout>} />
          <Route path="/seller/dashboard" element={<MainLayout><SellerDashboard /></MainLayout>} />
          <Route path="/checkout" element={<MainLayout><Checkout /></MainLayout>} />
          <Route path="/payment/success" element={<MainLayout><PaymentSuccess /></MainLayout>} />
          <Route path="/payment/cancel" element={<MainLayout><PaymentCancel /></MainLayout>} />
          <Route path="/checkout/payflex/return" element={<MainLayout><PayflexReturn /></MainLayout>} />
          <Route path="/orders" element={<MainLayout><OrderHistory /></MainLayout>} />
          <Route path="/orders/track" element={<MainLayout><OrderTracking /></MainLayout>} />
          <Route path="/subscription" element={<MainLayout><SubscriptionPlans /></MainLayout>} />
          <Route path="/subscription/manage" element={<MainLayout><SubscriptionManage /></MainLayout>} />
          <Route path="/admin/*" element={<AdminApp />} />
        </Routes>
        <CartDrawer />
        <Toaster
          position="bottom-right"
          mobilePosition="top-center"
          theme="dark"
          icons={{ error: null, success: null, warning: null, info: null, loading: null }}
        />
        <InstallPrompt />
        <UpdateNotification />
        <Analytics />
        <SpeedInsights />
      </CartProvider>
      </WishlistProvider>
    </CustomerAuthProvider>
  );
}

export default App;
