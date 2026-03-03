import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CartIcon from '../Cart/CartIcon';
import { useCustomerAuth } from '../../contexts/AuthContext';

const UserAvatar = ({ user, session, onSignOut }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const avatarUrl = session?.user?.user_metadata?.avatar_url;
  const initial = (user?.first_name?.[0] || session?.user?.email?.[0] || '?').toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-center w-8 h-8 rounded-full overflow-hidden focus:outline-none ring-offset-2 hover:ring-2 hover:ring-gray-200 transition-all"
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gray-900 flex items-center justify-center">
            <span className="text-white text-xs font-medium">{initial}</span>
          </div>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-44 bg-white rounded-lg border border-gray-100 shadow-md py-1 z-50">
          <div className="px-3 py-2 border-b border-gray-100">
            <p className="text-xs font-medium text-gray-900 truncate">
              {user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : session?.user?.email}
            </p>
            <p className="text-xs text-gray-400 truncate">{session?.user?.email}</p>
          </div>
          <button
            onClick={() => { setOpen(false); onSignOut(); }}
            className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
};

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [mobileShopOpen, setMobileShopOpen] = useState(false);
  const { user, session, isAuthenticated, loading, signOut } = useCustomerAuth();
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
        { name: 'Pre-Orders', href: '/#preorders' },
        { name: 'Wishlist', href: '/wishlist' },
      ]
    }
  ];

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-gray-100">
      <div className="flex items-center justify-between max-w-7xl mx-auto px-6 h-16">
        {/* Logo */}
        <div className="flex items-center">
          <Link to="/" className="flex items-center gap-3">
            <span
              className="text-xl font-medium elite-tcg-text"
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
                isShopOpen ? 'text-gray-900' : 'text-gray-800 hover:text-gray-900'
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

          <Link
            to="/#preorders"
            className="text-sm font-medium text-gray-800 hover:text-gray-900 transition-colors"
            onClick={closeAll}
          >
            Pre-Orders
          </Link>

          <Link
            to="/wishlist"
            className="text-sm font-medium text-gray-800 hover:text-gray-900 transition-colors"
            onClick={closeAll}
          >
            Wishlist
          </Link>
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {loading ? (
            <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
          ) : isAuthenticated ? (
            <UserAvatar user={user} session={session} onSignOut={handleSignOut} />
          ) : (
            <Link
              to="/login"
              className="hidden md:inline-flex items-center justify-center px-4 py-1.5 text-sm font-medium text-gray-800 hover:text-gray-900 border border-gray-200 rounded-full hover:bg-gray-50 transition-all duration-200"
            >
              Sign In
            </Link>
          )}
          <CartIcon />

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
        <div className="md:hidden fixed top-16 left-0 right-0 bottom-0 bg-white border-t border-gray-100 z-50 overflow-y-auto">
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
              to="/wishlist"
              className="px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Wishlist
            </Link>

            <div className="border-t border-gray-100 mt-2 pt-2">
              {isAuthenticated ? (
                <>
                  <p className="px-4 py-2 text-xs text-gray-400 truncate">{session?.user?.email}</p>
                  <button
                    onClick={() => { setIsMenuOpen(false); handleSignOut(); }}
                    className="w-full text-left px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors block"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign in
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </nav>
  );
};

export default Navbar;