import { Routes, Route, useNavigate } from 'react-router-dom';

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

// Products pages
import Products from './pages/products/Products';

// Checkout pages
import Checkout from './pages/checkout/Checkout';
import PaymentSuccess from './pages/checkout/PaymentSuccess';
import PaymentCancel from './pages/checkout/PaymentCancel';

// Order pages
import OrderTracking from './pages/orders/OrderTracking';
import OrderHistory from './pages/orders/OrderHistory';

// Customer Auth Provider
import { CustomerAuthProvider } from './contexts/CustomerAuthContext';

// Cart Provider and Components
import { CartProvider } from './contexts/CartContext';
import CartDrawer from './components/Cart/CartDrawer';

// Admin Application
import AdminApp from './admin/AdminApp';

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
    <main className="flex-1">
      {children}
    </main>
    <Footer />
  </div>
);

function App() {
  return (
    <CustomerAuthProvider>
      <CartProvider>
        <Routes>
          <Route path="/" element={<MainLayout><HomePage /></MainLayout>} />
          <Route path="/products" element={<MainLayout><Products /></MainLayout>} />
          <Route path="/product/:id" element={<MainLayout><ProductPage /></MainLayout>} />
          <Route path="/login" element={<MainLayout><Login /></MainLayout>} />
          <Route path="/register" element={<MainLayout><Register /></MainLayout>} />
          <Route path="/become-seller" element={<MainLayout><BecomeSeller /></MainLayout>} />
          <Route path="/marketplace" element={<MainLayout><MarketplaceBrowse /></MainLayout>} />
          <Route path="/marketplace/:id" element={<MainLayout><ListingDetail /></MainLayout>} />
          <Route path="/seller/create-listing" element={<MainLayout><CreateListing /></MainLayout>} />
          <Route path="/seller/dashboard" element={<MainLayout><SellerDashboard /></MainLayout>} />
          <Route path="/checkout" element={<MainLayout><Checkout /></MainLayout>} />
          <Route path="/payment/success" element={<MainLayout><PaymentSuccess /></MainLayout>} />
          <Route path="/payment/cancel" element={<MainLayout><PaymentCancel /></MainLayout>} />
          <Route path="/orders" element={<MainLayout><OrderHistory /></MainLayout>} />
          <Route path="/orders/track" element={<MainLayout><OrderTracking /></MainLayout>} />
          <Route path="/admin/*" element={<AdminApp />} />
        </Routes>
        <CartDrawer />
      </CartProvider>
    </CustomerAuthProvider>
  );
}

export default App;
