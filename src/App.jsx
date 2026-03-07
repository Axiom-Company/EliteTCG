import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Toaster } from 'sonner';

const ResponsiveToaster = () => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return (
    <Toaster
      position={isMobile ? 'top-center' : 'bottom-right'}
      toastOptions={{
        style: {
          background: '#1a1a1a',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.1)',
        },
      }}
      icons={{ success: null, error: null, info: null, warning: null, loading: null }}
    />
  );
};

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    // Catch Supabase auth callbacks (email confirm, password reset, etc.)
    if (hash && hash.includes('access_token')) {
      const params = new URLSearchParams(hash.replace('#', ''));
      const type = params.get('type');
      if (type === 'signup' || type === 'email') {
        navigate('/login', { replace: true, state: { emailConfirmed: true } });
      } else {
        navigate('/', { replace: true });
      }
      return;
    }

    if (hash) {
      setTimeout(() => {
        const el = document.getElementById(hash.slice(1));
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash, navigate]);
  return null;
};

// Admin
import AdminApp from './admin/AdminApp';

// Components for main public site
import Navbar from './components/Navbar/Navbar';
import ShopHero from './components/ShopHero/ShopHero';
import ShopBySet from './components/ShopBySet/ShopBySet';
import ShopByCategory from './components/ShopByCategory/ShopByCategory';
import FeaturedProducts from './components/FeaturedProducts/FeaturedProducts';
import PreOrders from './components/PreOrders/PreOrders';
import MarketplaceCTA from './components/MarketplaceCTA/MarketplaceCTA';
import TrustSection from './components/TrustSection/TrustSection';
import StatsSection from './components/StatsSection/StatsSection';
import PaymentStrip from './components/PaymentStrip/PaymentStrip';
import Footer from './components/Footer/Footer';
import ProductPage from './components/ProductPage/ProductPage';

// Products pages
import Products from './pages/products/Products';

// Wishlist page
import Wishlist from './pages/wishlist/Wishlist';

// Sets pages
import Sets from './pages/sets/Sets';
import SetDetail from './pages/sets/SetDetail';

// Category pages
import CategoryDetail from './pages/categories/CategoryDetail';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AuthPage from './pages/auth/AuthPage';
import WriteReview from './pages/reviews/WriteReview';
import SearchResults from './pages/search/SearchResults';

// Checkout
import Checkout from './pages/checkout/Checkout';
import PaymentSuccess from './pages/checkout/PaymentSuccess';
import PaymentCancel from './pages/checkout/PaymentCancel';

// Orders
import TrackOrder from './pages/orders/TrackOrder';
import MyOrders from './pages/orders/MyOrders';
import OrderDetail from './pages/orders/OrderDetail';

// Legal pages
import TermsOfService from './pages/legal/TermsOfService';
import PrivacyPolicy from './pages/legal/PrivacyPolicy';
import RefundPolicy from './pages/legal/RefundPolicy';

// Community pages
import ChatPage from './pages/community/ChatPage';

// Cart Provider and Components
import { CartProvider } from './contexts/CartContext';
import CartDrawer from './components/Cart/CartDrawer';

// Wishlist Provider
import { WishlistProvider } from './contexts/WishlistContext';

// Auth Provider
import { AuthProvider } from './contexts/AuthContext';

// SEO
import SEO from './components/SEO/SEO';
import AnnouncementBar from './components/AnnouncementBar/AnnouncementBar';
import CookieConsent from './components/CookieConsent/CookieConsent';

const HomePage = () => {
  return (
  <>
    <SEO
      title={null}
      description="South Africa's premier destination for authentic Pokemon TCG products. Shop booster boxes, ETBs, singles, and more."
      path="/"
    />
    <ShopHero />
    <ShopBySet />
    <ShopByCategory />
    <FeaturedProducts />
    <PreOrders />
    <PaymentStrip />
    <StatsSection />
  </>
  );
};

const StickyHeader = () => (
  <div className="sticky top-0 z-40">
    <Navbar />
    <AnnouncementBar />
  </div>
);

const MainLayout = ({ children }) => (
  <div className="flex flex-col min-h-screen">
    <StickyHeader />
    <main className="flex-1">
      {children}
    </main>
    <Footer />
  </div>
);

const NavbarLayout = ({ children }) => (
  <div className="flex flex-col min-h-screen">
    <StickyHeader />
    <main className="flex-1">
      {children}
    </main>
  </div>
);

const AuthLayout = ({ children }) => (
  <div className="min-h-screen bg-gray-50">
    {children}
  </div>
);

function App() {
  return (
    <AuthProvider>
    <WishlistProvider>
      <CartProvider>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<MainLayout><HomePage /></MainLayout>} />
          <Route path="/search" element={<MainLayout><SearchResults /></MainLayout>} />
          <Route path="/products" element={<MainLayout><Products /></MainLayout>} />
          <Route path="/wishlist" element={<MainLayout><Wishlist /></MainLayout>} />
          <Route path="/sets" element={<MainLayout><Sets /></MainLayout>} />
          <Route path="/sets/:id" element={<MainLayout><SetDetail /></MainLayout>} />
          <Route path="/categories/:slug" element={<MainLayout><CategoryDetail /></MainLayout>} />
          <Route path="/product/:id" element={<MainLayout><ProductPage /></MainLayout>} />
          <Route path="/product/:id/review" element={<NavbarLayout><WriteReview /></NavbarLayout>} />
          <Route path="/login" element={<AuthLayout><Login /></AuthLayout>} />
          <Route path="/register" element={<AuthLayout><Register /></AuthLayout>} />
          <Route path="/checkout" element={<NavbarLayout><Checkout /></NavbarLayout>} />
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/payment/cancel" element={<MainLayout><PaymentCancel /></MainLayout>} />
          <Route path="/orders" element={<MainLayout><MyOrders /></MainLayout>} />
          <Route path="/orders/:orderId" element={<MainLayout><OrderDetail /></MainLayout>} />
          <Route path="/track" element={<MainLayout><TrackOrder /></MainLayout>} />
          <Route path="/marketplace" element={<MainLayout><Products /></MainLayout>} />
          <Route path="/become-seller" element={<NavbarLayout><AuthPage /></NavbarLayout>} />
          <Route path="/terms-of-service" element={<MainLayout><TermsOfService /></MainLayout>} />
          <Route path="/privacy-policy" element={<MainLayout><PrivacyPolicy /></MainLayout>} />
          <Route path="/refund-policy" element={<MainLayout><RefundPolicy /></MainLayout>} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/chat/:channelSlug" element={<ChatPage />} />
          <Route path="/admin/*" element={<AdminApp />} />
        </Routes>
        <CartDrawer />
        <CookieConsent />
        <ResponsiveToaster />
      </CartProvider>
    </WishlistProvider>
    </AuthProvider>
  );
}

export default App;
