import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import CartIcon from '../Cart/CartIcon';
import { useCustomerAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';

const Navbar = () => {
  const { user, session, isAuthenticated, isSeller, loading, signOut } = useCustomerAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [mobileShopOpen, setMobileShopOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);
  const userRef = useRef(null);
  const { itemCount, openCart } = useCart();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMenuOpen]);

  const shopRef = useRef(null);

  const closeAll = () => {
    setIsShopOpen(false);
  };

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (shopRef.current && !shopRef.current.contains(e.target)) setIsShopOpen(false);
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
        { name: 'Battle Decks', href: '/products?category=battle_deck' },
        { name: 'Starter Decks', href: '/products?category=starter_deck' },
        { name: 'Collection Boxes', href: '/products?category=collection_box' },
        { name: 'Tin Boxes', href: '/products?category=tin_box' },
      ]
    },
    {
      title: 'Browse',
      links: [
        { name: 'All Sets', href: '/sets' },
        { name: 'Coming Soon', href: '/#preorders' },
        { name: 'Wishlist', href: '/wishlist' },
      ]
    }
  ];

  return (
    <nav className="bg-white border-b border-gray-100">
      <div className="flex items-center justify-between max-w-7xl mx-auto px-6 h-16">
        {/* Logo */}
        <div className="flex items-center">
          <Link to="/" className="flex items-center gap-3">
            <span
              className="text-2xl font-medium elite-tcg-text tracking-tight cursor-pointer"
              style={{ paddingLeft: '7px' }}
            >
              Elite TCG
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {/* Shop trigger */}
          <div ref={shopRef}>
            <button
              onClick={() => {
                setIsShopOpen(!isShopOpen);
              }}
              className={`flex items-center gap-1 text-sm font-medium transition-colors ${
                isShopOpen ? 'text-gray-900' : 'text-gray-900 hover:text-black'
              }`}
            >
              Shop
              <svg
                className={`w-3.5 h-3.5 transition-transform duration-200 ${isShopOpen ? 'rotate-180' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>

              {/* Full-width mega menu */}
              {isShopOpen && (
                <div
                  className="fixed top-16 left-0 right-0 bg-white border-b border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.06)] z-50"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="max-w-5xl mx-auto px-6 py-8">
                    <div className="grid grid-cols-3 divide-x divide-gray-100">
                      {shopCategories.map(({ title, links }) => (
                        <div key={title} className="text-left px-8 first:pl-0 last:pr-0">
                          <p className="text-[11px] font-medium text-gray-400 uppercase tracking-widest mb-3">
                            {title}
                          </p>
                          <div className="space-y-0">
                            {links.map(link => (
                              <Link
                                key={link.name}
                                to={link.href}
                                className="block py-1.5 text-sm text-gray-500 hover:text-primary transition-colors duration-150"
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

          <Link
            to="/elite-rips"
            className="text-sm font-medium text-primary hover:text-primary-dark transition-colors"
            onClick={closeAll}
          >
            Elite Rips
          </Link>

          <Link
            to="/#preorders"
            className="text-sm font-medium text-gray-900 hover:text-black transition-colors"
            onClick={closeAll}
          >
            Coming Soon
          </Link>

          <Link
            to="/wishlist"
            className="text-sm font-medium text-gray-900 hover:text-black transition-colors"
            onClick={closeAll}
          >
            Wishlist
          </Link>
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {loading ? (
            <div className="hidden md:flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
              <CartIcon />
            </div>
          ) : isAuthenticated ? (
            <div className="hidden md:flex items-center gap-2">
            <div ref={userRef} className="relative">
              <button
                onClick={() => setIsUserOpen(!isUserOpen)}
                className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                <div className="w-8 h-8 bg-[#FFCB32] rounded-full flex items-center justify-center text-gray-900 font-medium text-sm">
                  {(user?.first_name || user?.name || session?.user?.email)?.charAt(0).toUpperCase()}
                </div>
              </button>

              {isUserOpen && (
                <div className="absolute top-full right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-lg min-w-[200px] z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : session?.user?.email}
                    </p>
                    <p className="text-[11px] text-gray-400 truncate mt-0.5">
                      {session?.user?.email || user?.email}
                    </p>
                  </div>
                  <div className="p-1.5">
                    <Link
                      to="/orders"
                      className="block px-3 py-2 rounded-lg text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsUserOpen(false)}
                    >
                      My Orders
                    </Link>
                    <Link
                      to="/orders/track"
                      className="block px-3 py-2 rounded-lg text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsUserOpen(false)}
                    >
                      Track Order
                    </Link>
                    {isSeller && (
                      <Link
                        to="/seller/dashboard"
                        className="block px-3 py-2 rounded-lg text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                        onClick={() => setIsUserOpen(false)}
                      >
                        Seller Dashboard
                      </Link>
                    )}
                    <button
                      onClick={() => { handleSignOut(); setIsUserOpen(false); }}
                      className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
              <CartIcon />
            </div>
          ) : (
            <div className="hidden md:flex items-center" style={{ gap: '13px' }}>
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-4 py-1.5 text-sm font-medium text-white bg-gray-900 rounded-full hover:bg-gray-800 active:scale-[0.97] transition-all duration-200"
                style={{ marginLeft: '-3px' }}
              >
                Sign In
              </Link>
              <CartIcon />
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

      {/* Mobile Menu — portaled to body to escape stacking context */}
      {isMenuOpen && createPortal(
        <div className="md:hidden fixed top-16 left-0 right-0 bottom-0 bg-white border-t border-gray-100 z-[9999] overflow-y-auto">
          <nav className="flex flex-col p-4">
            <Link
              to="/"
              className="px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>

            {/* Shop - collapsible */}
            <div>
              <button
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-900"
                onClick={() => setMobileShopOpen(!mobileShopOpen)}
              >
                Shop
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${mobileShopOpen ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {mobileShopOpen && (
                <div className="pl-8 pb-2 space-y-1">
                  {shopCategories.flatMap(cat => cat.links).map((link) => (
                    <Link
                      key={link.name}
                      to={link.href}
                      className="block px-2 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              to="/elite-rips"
              className="px-4 py-3 text-sm font-medium text-primary hover:text-primary-dark hover:bg-red-50 rounded-lg transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Elite Rips
            </Link>

            <Link
              to="/wishlist"
              className="px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Wishlist
            </Link>

            <button
              onClick={() => { setIsMenuOpen(false); openCart(); }}
              className="flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <span>Cart</span>
              {itemCount > 0 && (
                <span className="text-xs font-medium bg-gray-900 text-white rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>

            <div className="border-t border-gray-100 mt-2 pt-2">
              {isAuthenticated ? (
                <>
                  <div className="px-4 py-3 text-sm text-gray-500">
                    {user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : session?.user?.email}
                  </div>
                  {isSeller && (
                    <Link
                      to="/seller/dashboard"
                      className="block px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Seller Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => { handleSignOut(); setIsMenuOpen(false); }}
                    className="w-full text-left px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="block px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
              )}
            </div>
          </nav>
        </div>,
        document.body
      )}
    </nav>
  );
};

export default Navbar;