import { useState } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth.jsx';
import AdminLayout from './components/AdminLayout';
import AdminLogin from './components/AdminLogin';
import { Dashboard, Settings, Products, Sets, Categories, Orders, Reviews, EmailManagement } from './pages';
import SellerApplications from './pages/SellerApplications';
import Banners from './pages/Banners';
import WebhookSettings from './pages/WebhookSettings';
import PageAccess from './pages/PageAccess';
import PackInventory from './pages/PackInventory';
import SEO from '../components/SEO/SEO';

// Placeholder pages for now
const PlaceholderPage = ({ title, description }) => (
  <div className="border border-[#282828] bg-[#171717] rounded-lg p-8 text-center">
    <h2 className="text-base font-medium text-[#f1f1f1] mb-2">{title}</h2>
    <p className="text-sm text-[#6b6b6b]">{description}</p>
  </div>
);

const CRMPage = () => <PlaceholderPage title="Customer Management" description="Coming soon — CRM, customer tags, notes, and communication tracking." />;
const InventoryPage = () => <PlaceholderPage title="Inventory Management" description="Coming soon — suppliers, purchase orders, stock adjustments, and movement tracking." />;
const AccountingPage = () => <PlaceholderPage title="Accounting" description="Coming soon — income, expenses, invoicing, P&L reports, and VAT." />;
const PreordersPage = () => <PlaceholderPage title="Pre-Orders" description="Coming soon — manage pre-orders here." />;
const DiscountsPage = () => <PlaceholderPage title="Discounts" description="Coming soon — manage discount codes here." />;

const AdminContent = () => {
  const { isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'products':
        return <Products />;
      case 'orders':
        return <Orders />;
      case 'crm':
        return <CRMPage />;
      case 'inventory':
        return <InventoryPage />;
      case 'accounting':
        return <AccountingPage />;
      case 'sets':
        return <Sets />;
      case 'categories':
        return <Categories />;
      case 'banners':
        return <Banners />;
      case 'preorders':
        return <PreordersPage />;
      case 'discounts':
        return <DiscountsPage />;
      case 'reviews':
        return <Reviews />;
      case 'seller-applications':
        return <SellerApplications />;
      case 'email':
        return <EmailManagement />;
      case 'webhooks':
        return <WebhookSettings />;
      case 'page-access':
        return <PageAccess />;
      case 'pack-inventory':
        return <PackInventory />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <AdminLayout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </AdminLayout>
  );
};

const AdminApp = () => {
  return (
    <AuthProvider>
      <SEO title="Admin" noindex />
      <AdminContent />
    </AuthProvider>
  );
};

export default AdminApp;
