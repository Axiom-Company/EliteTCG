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

// Cart Provider and Components
import { CartProvider } from './contexts/CartContext';
import CartDrawer from './components/Cart/CartDrawer';

// Wishlist Provider
import { WishlistProvider } from './contexts/WishlistContext';

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
    <ShopBySet />
    <ShopByCategory />
    <FeaturedProducts />
    <MarketplaceCTA />
    <PreOrders />
    <TrustSection />
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
        </Routes>
        <CartDrawer />
      </CartProvider>
    </WishlistProvider>
  );
}

export default App;
