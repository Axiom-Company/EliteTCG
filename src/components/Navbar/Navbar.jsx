import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';
import CartIcon from '../Cart/CartIcon';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isMarketplaceOpen, setIsMarketplaceOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);
  const { isAuthenticated, user, isSeller, logout } = useCustomerAuth();

  const shopRef = useRef(null);
  const marketplaceRef = useRef(null);
  const userRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (shopRef.current && !shopRef.current.contains(e.target)) setIsShopOpen(false);
      if (marketplaceRef.current && !marketplaceRef.current.contains(e.target)) setIsMarketplaceOpen(false);
      if (userRef.current && !userRef.current.contains(e.target)) setIsUserOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const shopCategories = [
    {
      title: 'Products',
      links: [
        { name: 'All Products', href: '/products' },
        { name: 'Singles', href: '/products?category=singles' },
        { name: 'Accessories', href: '/products?category=accessories' },
      ]
    },
    {
      title: 'Sealed',
      links: [
        { name: 'Booster Boxes', href: '/products?category=booster_box' },
        { name: 'Elite Trainer Boxes', href: '/products?category=etb' },
      ]
    },
    {
      title: 'Browse By',
      links: [
        { name: 'Shop by Set', href: '/#sets' },
        { name: 'Shop by Category', href: '/#category' },
      ]
    }
  ];

  const marketplaceLinks = [
    { name: 'Browse Listings', href: '/marketplace', desc: 'Find cards from sellers' },
    { name: 'Create Listing', href: '/seller/create-listing', desc: 'List your cards for sale', sellerOnly: false },
    { name: 'Seller Dashboard', href: '/seller/dashboard', desc: 'Manage your listings', sellerOnly: true },
    { name: 'Become a Seller', href: '/become-seller', desc: 'Start selling today', sellerOnly: false, hideIfSeller: true },
  ];

  const closeAll = () => {
    setIsShopOpen(false);
    setIsMarketplaceOpen(false);
    setIsUserOpen(false);
  };

  return (
    <header className="sticky top-0 left-0 right-0 bg-white z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
        {/* Logo */}
        <Link to="/" className="text-xl font-bold text-gray-900 shrink-0" onClick={closeAll}>
          EliteTCG
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            to="/"
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            onClick={closeAll}
          >
            Home
          </Link>

          {/* Shop trigger */}
          <div ref={shopRef}>
            <button
              onClick={() => {
                setIsShopOpen(!isShopOpen);
                setIsMarketplaceOpen(false);
                setIsUserOpen(false);
              }}
              className={`flex items-center gap-1 text-sm font-medium transition-colors ${
                isShopOpen ? 'text-gray-900' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Shop
              <svg
                className={`w-3.5 h-3.5 transition-transform duration-200 ${isShopOpen ? 'rotate-180' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>

              {/* Full-width mega menu — fixed so it escapes the nav container */}
              {isShopOpen && (
                <div
                  className="fixed top-16 left-0 right-0 bg-gray-50 border-t border-b border-gray-100 z-50"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="max-w-7xl mx-auto px-6 py-8">
                    <div className="flex gap-20 justify-center">
                      {shopCategories.map(({ title, links }) => (
                        <div key={title} className="text-left">
                          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mb-4">
                            {title}
                          </p>
                          <div className="space-y-2">
                            {links.map(link => (
                              <Link
                                key={link.name}
                                to={link.href}
                                className="block text-sm text-gray-700 hover:text-gray-900 transition-colors"
                                onClick={() => setIsShopOpen(false)}
                              >
                                {link.name}
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </button>
          </div>

          {/* Marketplace trigger */}
          <div ref={marketplaceRef}>
            <button
              onClick={() => {
                setIsMarketplaceOpen(!isMarketplaceOpen);
                setIsShopOpen(false);
                setIsUserOpen(false);
              }}
              className={`flex items-center gap-1 text-sm font-medium transition-colors ${
                isMarketplaceOpen ? 'text-gray-900' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Marketplace
              <svg
                className={`w-3.5 h-3.5 transition-transform duration-200 ${isMarketplaceOpen ? 'rotate-180' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>

              {isMarketplaceOpen && (
                <div
                  className="fixed top-16 left-0 right-0 bg-gray-50 border-t border-b border-gray-100 z-50"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="max-w-7xl mx-auto px-6 py-8">
                    <div className="flex gap-16 justify-center">
                      {marketplaceLinks.map((link) => {
                        if (link.sellerOnly && !isSeller) return null;
                        if (link.hideIfSeller && isSeller) return null;
                        return (
                          <Link
                            key={link.name}
                            to={link.href}
                            className="group text-left"
                            onClick={() => setIsMarketplaceOpen(false)}
                          >
                            <p className="text-sm font-medium text-gray-800 group-hover:text-gray-900 transition-colors mb-1">
                              {link.name}
                            </p>
                            <p className="text-[11px] text-gray-400">
                              {link.desc}
                            </p>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </button>
          </div>

          <Link
            to="/#preorders"
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            onClick={closeAll}
          >
            Pre-Orders
          </Link>
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          <CartIcon />

          {isAuthenticated ? (
            <div ref={userRef} className="relative hidden md:block">
              <button
                onClick={() => setIsUserOpen(!isUserOpen)}
                className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                <div className="w-8 h-8 bg-[#FFCB32] rounded-full flex items-center justify-center text-gray-900 font-medium text-sm">
                  {(user?.name || user?.email)?.charAt(0).toUpperCase()}
                </div>
              </button>

              {isUserOpen && (
                <div className="absolute top-full right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-lg min-w-[200px] z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user?.name || 'User'}
                    </p>
                    <p className="text-[11px] text-gray-400 truncate mt-0.5">
                      {user?.email}
                    </p>
                  </div>
                  <div className="p-1.5">
                    {isSeller && (
                      <Link
                        to="/seller/dashboard"
                        className="block px-3 py-2 rounded-lg text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                        onClick={() => setIsUserOpen(false)}
                      >
                        Dashboard
                      </Link>
                    )}
                    <button
                      onClick={() => { logout(); setIsUserOpen(false); }}
                      className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-3">
              <Link
                to="/login"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-sm font-medium bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors"
              >
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden flex items-center justify-center w-10 h-10 text-gray-600 hover:text-gray-900"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Menu"
          >
            {isMenuOpen ? (
              <span className="text-2xl">×</span>
            ) : (
              <div className="space-y-1.5">
                <div className="w-5 h-0.5 bg-current" />
                <div className="w-5 h-0.5 bg-current" />
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-t border-gray-100 shadow-lg">
          <nav className="flex flex-col p-4">
            <Link
              to="/"
              className="px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>

            <div className="px-4 py-3">
              <p className="text-sm font-medium text-gray-900 mb-2">Shop</p>
              <div className="pl-4 space-y-1">
                {shopCategories.flatMap(cat => cat.links).map((link) => (
                  <Link
                    key={link.name}
                    to={link.href}
                    className="block py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="px-4 py-3">
              <p className="text-sm font-medium text-gray-900 mb-2">Marketplace</p>
              <div className="pl-4 space-y-1">
                {marketplaceLinks.map((link) => {
                  if (link.sellerOnly && !isSeller) return null;
                  if (link.hideIfSeller && isSeller) return null;
                  return (
                    <Link
                      key={link.name}
                      to={link.href}
                      className="block py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {link.name}
                    </Link>
                  );
                })}
              </div>
            </div>

            <Link
              to="/#preorders"
              className="px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Pre-Orders
            </Link>

            <div className="border-t border-gray-100 mt-2 pt-2">
              {isAuthenticated ? (
                <>
                  <div className="px-4 py-3 text-sm text-gray-500">
                    {user?.name || user?.email}
                  </div>
                  <button
                    onClick={() => { logout(); setIsMenuOpen(false); }}
                    className="w-full text-left px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="block mx-4 mt-2 px-4 py-3 text-sm font-medium text-center bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
