import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      setTimeout(() => {
        const el = document.getElementById(hash.slice(1));
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);
  return null;
};

// Admin
import AdminApp from './admin/AdminApp';

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
import AuthPage from './pages/auth/AuthPage';
import WriteReview from './pages/reviews/WriteReview';

// Legal pages
import PrivacyPolicy from './pages/legal/PrivacyPolicy';
import TermsOfService from './pages/legal/TermsOfService';

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

const HomePage = () => {
  const navigate = useNavigate();
  return (
  <>
    <SEO
      title={null}
      description="South Africa's premier destination for authentic Pokemon TCG products. Shop booster boxes, ETBs, singles, and more."
      path="/"
    />
    <Hero onShopClick={() => navigate('/products')} />
    <hr className="border-gray-100" />
    <ShopBySet />
    <hr className="border-gray-100" />
    <ShopByCategory />
    <hr className="border-gray-100" />
    <FeaturedProducts />
    <hr className="border-gray-100" />
    <PreOrders />
    <hr className="border-gray-100" />
    <TrustSection />
    <hr className="border-gray-100" />
    <MarketplaceCTA />
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

function App() {
  return (
    <AuthProvider>
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
          <Route path="/product/:id/review" element={<NavbarLayout><WriteReview /></NavbarLayout>} />
          <Route path="/login" element={<NavbarLayout><AuthPage /></NavbarLayout>} />
          <Route path="/register" element={<NavbarLayout><AuthPage /></NavbarLayout>} />
          <Route path="/marketplace" element={<MainLayout><Products /></MainLayout>} />
          <Route path="/privacy-policy" element={<MainLayout><PrivacyPolicy /></MainLayout>} />
          <Route path="/terms-of-service" element={<MainLayout><TermsOfService /></MainLayout>} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/chat/:channelSlug" element={<ChatPage />} />
          <Route path="/admin/*" element={<AdminApp />} />
        </Routes>
        <CartDrawer />
      </CartProvider>
    </WishlistProvider>
    </AuthProvider>
  );
}

export default App;
