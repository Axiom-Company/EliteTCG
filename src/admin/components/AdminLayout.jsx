import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import { cn } from '@/lib/utils';
import { LogOut, ExternalLink, Menu, X } from 'lucide-react';

const AdminLayout = ({ children, currentPage, onNavigate }) => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Add admin-dark to body so Radix portals (Dialog, Select) also get dark styling
  useEffect(() => {
    document.body.classList.add('admin-dark');
    document.body.style.backgroundColor = '#0f0f0f';
    return () => {
      document.body.classList.remove('admin-dark');
      document.body.style.backgroundColor = '';
    };
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMenuOpen]);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'products', label: 'Products' },
    { id: 'orders', label: 'Orders' },
    { id: 'inventory', label: 'Inventory' },
    { id: 'sets', label: 'Sets' },
    { id: 'categories', label: 'Categories' },
    { id: 'preorders', label: 'Pre-Orders' },
    { id: 'discounts', label: 'Discounts' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'seller-applications', label: 'Sellers' },
    { id: 'email', label: 'Email' },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      {/* Top Nav */}
      <header className="sticky top-0 z-[300] h-[52px] bg-[#111111] border-b border-[#282828] flex items-center px-6 gap-5">
        {/* Logo */}
        <button
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-2.5 shrink-0"
        >
          <div className="w-7 h-7 rounded-md bg-[#3ECF8E] flex items-center justify-center">
            <span className="text-[#0f0f0f] text-xs font-medium">E</span>
          </div>
          <span className="text-sm font-medium text-[#f1f1f1]">EliteTCG</span>
        </button>

        {/* Divider */}
        <div className="w-px h-4 bg-[#282828] shrink-0" />

        {/* Nav Items — desktop only */}
        <nav className="hidden md:flex items-center gap-0.5 flex-1 overflow-x-auto scrollbar-none">
          {navItems.map((item) => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={cn(
                  "px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap",
                  isActive
                    ? "text-[#f1f1f1] bg-[#1c1c1c]"
                    : "text-[#6b6b6b] hover:text-[#c4c4c4] hover:bg-[#1a1a1a]"
                )}
              >
                {item.label}
              </button>
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

          {/* User */}
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

          {/* Hamburger — mobile only */}
          <button
            className="md:hidden flex items-center justify-center w-8 h-8 text-[#6b6b6b] hover:text-[#f1f1f1] transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Menu"
          >
            {isMenuOpen ? (
              <X className="w-5 h-5" strokeWidth={1.5} />
            ) : (
              <Menu className="w-5 h-5" strokeWidth={1.5} />
            )}
          </button>
        </div>
      </header>

      {/* Mobile Menu — full-screen overlay */}
      {isMenuOpen && (
        <div className="md:hidden fixed top-13 left-0 right-0 bottom-0 bg-[#111111] border-t border-[#282828] z-299 overflow-y-auto">
          <nav className="flex flex-col p-3">
            {navItems.map((item) => {
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { onNavigate(item.id); setIsMenuOpen(false); }}
                  className={cn(
                    "w-full text-left px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                    isActive
                      ? "text-[#f1f1f1] bg-[#1c1c1c]"
                      : "text-[#6b6b6b] hover:text-[#c4c4c4] hover:bg-[#1a1a1a]"
                  )}
                >
                  {item.label}
                </button>
              );
            })}

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
