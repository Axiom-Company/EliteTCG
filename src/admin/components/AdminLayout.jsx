import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import { cn } from '@/lib/utils';
import { LogOut, ExternalLink, Menu, X, ChevronDown } from 'lucide-react';

const AdminLayout = ({ children, currentPage, onNavigate }) => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const navRef = useRef(null);

  useEffect(() => {
    document.body.classList.add('admin-dark');
    document.body.style.backgroundColor = '#0f0f0f';
    return () => {
      document.body.classList.remove('admin-dark');
      document.body.style.backgroundColor = '';
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMenuOpen]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const navGroups = [
    {
      id: 'store',
      label: 'Store',
      items: [
        { id: 'products', label: 'Products' },
        { id: 'orders', label: 'Orders' },
        { id: 'sets', label: 'Sets' },
        { id: 'categories', label: 'Categories' },
        { id: 'banners', label: 'Banners' },
        { id: 'pack-inventory', label: 'Pack Inventory' },
      ],
    },
    {
      id: 'business',
      label: 'Business',
      items: [
        { id: 'crm', label: 'Customers' },
        { id: 'inventory', label: 'Inventory' },
        { id: 'accounting', label: 'Accounting' },
      ],
    },
    {
      id: 'operations',
      label: 'Operations',
      items: [
        { id: 'preorders', label: 'Pre-Orders' },
        { id: 'discounts', label: 'Discounts' },
        { id: 'reviews', label: 'Reviews' },
        { id: 'seller-applications', label: 'Sellers' },
        { id: 'email', label: 'Email' },
        { id: 'webhooks', label: 'Webhooks' },
        { id: 'page-access', label: 'Page Access' },
        { id: 'settings', label: 'Settings' },
      ],
    },
  ];

  // All items flat (for mobile)
  const navSections = [
    { label: 'Store', items: navGroups[0].items },
    { label: 'Business', items: navGroups[1].items },
    { label: 'Operations', items: navGroups[2].items },
  ];

  const isGroupActive = (group) => group.items.some((i) => i.id === currentPage);

  const handleNavigate = (id) => {
    onNavigate(id);
    setOpenDropdown(null);
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      {/* Top Nav */}
      <header className="sticky top-0 z-[300] h-[52px] bg-[#111111] border-b border-[#282828] flex items-center px-6 gap-4">

        {/* Logo */}
        <button
          onClick={() => handleNavigate('dashboard')}
          className="flex items-center gap-2.5 shrink-0"
        >
          <div className="w-7 h-7 rounded-md bg-[#3ECF8E] flex items-center justify-center">
            <span className="text-[#0f0f0f] text-xs font-medium">E</span>
          </div>
          <span className="text-sm font-medium text-[#f1f1f1]">EliteTCG</span>
        </button>

        <div className="w-px h-4 bg-[#282828] shrink-0" />

        {/* Desktop Nav */}
        <nav ref={navRef} className="hidden md:flex items-center gap-0.5 flex-1">

          {/* Dashboard — standalone */}
          <button
            onClick={() => handleNavigate('dashboard')}
            className={cn(
              'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
              currentPage === 'dashboard'
                ? 'text-[#f1f1f1] bg-[#1c1c1c]'
                : 'text-[#6b6b6b] hover:text-[#c4c4c4] hover:bg-[#1a1a1a]'
            )}
          >
            Dashboard
          </button>

          <div className="w-px h-4 bg-[#282828] mx-1 shrink-0" />

          {/* Dropdown groups */}
          {navGroups.map((group) => {
            const isOpen = openDropdown === group.id;
            const isActive = isGroupActive(group);
            return (
              <div key={group.id} className="relative">
                <button
                  onClick={() => setOpenDropdown(isOpen ? null : group.id)}
                  className={cn(
                    'flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                    isActive || isOpen
                      ? 'text-[#f1f1f1] bg-[#1c1c1c]'
                      : 'text-[#6b6b6b] hover:text-[#c4c4c4] hover:bg-[#1a1a1a]'
                  )}
                >
                  {group.label}
                  <ChevronDown
                    className={cn('w-3.5 h-3.5 transition-transform duration-150', isOpen && 'rotate-180')}
                    strokeWidth={2}
                  />
                </button>

                {isOpen && (
                  <div className="absolute top-full left-0 mt-1.5 bg-[#171717] border border-[#282828] rounded-xl shadow-xl py-1.5 z-50 min-w-[160px]">
                    {group.items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleNavigate(item.id)}
                        className={cn(
                          'w-full text-left px-4 py-2 text-sm transition-colors',
                          currentPage === item.id
                            ? 'text-[#f1f1f1] bg-[#222]'
                            : 'text-[#a0a0a0] hover:text-[#f1f1f1] hover:bg-[#1e1e1e]'
                        )}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3 shrink-0 ml-auto md:ml-0">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 text-sm text-[#6b6b6b] hover:text-[#f1f1f1] transition-colors"
          >
            <span>View Store</span>
            <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.5} />
          </a>

          <div className="hidden sm:block w-px h-4 bg-[#282828]" />

          <div className="hidden md:flex items-center gap-2">
            <div className="w-7 h-7 bg-[#282828] text-[#a0a0a0] rounded-full flex items-center justify-center text-xs font-medium shrink-0">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <button
              onClick={logout}
              className="flex items-center justify-center text-[#6b6b6b] hover:text-[#f1f1f1] transition-colors"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>

          {/* Hamburger — mobile */}
          <button
            className="md:hidden flex items-center justify-center w-8 h-8 text-[#6b6b6b] hover:text-[#f1f1f1] transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Menu"
          >
            {isMenuOpen ? <X className="w-5 h-5" strokeWidth={1.5} /> : <Menu className="w-5 h-5" strokeWidth={1.5} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden fixed top-13 left-0 right-0 bottom-0 bg-[#111111] border-t border-[#282828] z-[299] overflow-y-auto">
          <nav className="flex flex-col p-3">
            {/* Dashboard */}
            <button
              onClick={() => handleNavigate('dashboard')}
              className={cn(
                'w-full text-left px-4 py-3 text-sm font-medium rounded-lg transition-colors mb-1',
                currentPage === 'dashboard'
                  ? 'text-[#f1f1f1] bg-[#1c1c1c]'
                  : 'text-[#6b6b6b] hover:text-[#c4c4c4] hover:bg-[#1a1a1a]'
              )}
            >
              Dashboard
            </button>

            {navSections.map((section, si) => (
              <div key={section.label}>
                <div className="border-t border-[#282828] my-2" />
                <div className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#4a4a4a]">
                  {section.label}
                </div>
                {section.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleNavigate(item.id)}
                    className={cn(
                      'w-full text-left px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                      currentPage === item.id
                        ? 'text-[#f1f1f1] bg-[#1c1c1c]'
                        : 'text-[#6b6b6b] hover:text-[#c4c4c4] hover:bg-[#1a1a1a]'
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            ))}

            <div className="border-t border-[#282828] mt-2 pt-2 space-y-1">
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-3 text-sm text-[#6b6b6b] hover:text-[#f1f1f1] rounded-lg transition-colors"
              >
                <span>View Store</span>
                <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.5} />
              </a>
              <button
                onClick={() => { logout(); setIsMenuOpen(false); }}
                className="w-full flex items-center gap-2 px-4 py-3 text-sm text-[#6b6b6b] hover:text-[#f1f1f1] rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" strokeWidth={1.5} />
                <span>Sign Out</span>
              </button>
            </div>
          </nav>
        </div>
      )}

      {/* Content */}
      <main className="p-4 sm:p-8">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
