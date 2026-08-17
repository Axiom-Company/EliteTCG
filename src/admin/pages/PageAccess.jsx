import { useState, useEffect } from 'react';
import { pageAccessApi } from '../hooks/useApi';
import { Plus, Trash2, Lock, Globe, Search } from 'lucide-react';

// All pages in the site
const SITE_PAGES = [
  { path: '/', label: 'Home' },
  { path: '/products', label: 'Products' },
  { path: '/sets', label: 'Sets' },
  { path: '/search', label: 'Search' },
  { path: '/wishlist', label: 'Wishlist' },
  { path: '/checkout', label: 'Checkout' },
  { path: '/orders', label: 'My Orders' },
  { path: '/track', label: 'Track Order' },
  { path: '/marketplace', label: 'Marketplace' },
  { path: '/chat', label: 'Chat' },
  { path: '/login', label: 'Login' },
  { path: '/register', label: 'Register' },
  { path: '/terms-of-service', label: 'Terms of Service' },
  { path: '/privacy-policy', label: 'Privacy Policy' },
  { path: '/refund-policy', label: 'Refund Policy' },
];

const PageAccess = () => {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPage, setSelectedPage] = useState(null);
  const [newEmail, setNewEmail] = useState('');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const fetchRules = async () => {
    try {
      const data = await pageAccessApi.getAll();
      setRules(data.rules || []);
    } catch (err) {
      console.error('Failed to fetch rules:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRules(); }, []);

  const getRulesForPage = (path) => rules.filter(r => r.page_path === path);
  const restrictedPages = [...new Set(rules.map(r => r.page_path))];

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newEmail.trim() || !selectedPage) return;
    setAdding(true);
    setError('');
    try {
      await pageAccessApi.create({ page_path: selectedPage, user_email: newEmail.trim() });
      setNewEmail('');
      await fetchRules();
    } catch (err) {
      setError(err.message);
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await pageAccessApi.remove(id);
      setRules(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  const filteredPages = SITE_PAGES.filter(p =>
    p.label.toLowerCase().includes(search.toLowerCase()) ||
    p.path.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 rounded-full animate-spin border-[#282828] border-t-[#6b6b6b]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-lg font-medium text-[#f1f1f1]">Page Access</h1>
        <p className="text-sm text-[#6b6b6b] mt-1">
          Control which users can access specific pages. Pages with no rules are open to everyone.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-6">
        {/* Left: Page list */}
        <div className="border border-[#282828] bg-[#171717] rounded-lg overflow-hidden">
          <div className="p-3 border-b border-[#282828]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#4a4a4a]" />
              <input
                type="text"
                placeholder="Search pages..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#1c1c1c] border border-[#282828] rounded-lg text-sm text-[#f1f1f1] placeholder-[#4a4a4a] outline-none focus:border-[#3ECF8E]/50"
              />
            </div>
          </div>
          <div className="max-h-[500px] overflow-y-auto">
            {filteredPages.map((page) => {
              const pageRules = getRulesForPage(page.path);
              const isRestricted = pageRules.length > 0;
              const isSelected = selectedPage === page.path;
              return (
                <button
                  key={page.path}
                  onClick={() => setSelectedPage(page.path)}
                  className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors border-b border-[#282828]/50 last:border-0 ${
                    isSelected
                      ? 'bg-[#1c1c1c]'
                      : 'hover:bg-[#1a1a1a]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {isRestricted ? (
                      <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    ) : (
                      <Globe className="w-3.5 h-3.5 text-[#4a4a4a] shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className={`text-sm truncate ${isSelected ? 'text-[#f1f1f1]' : 'text-[#a0a0a0]'}`}>{page.label}</p>
                      <p className="text-[11px] text-[#4a4a4a] truncate">{page.path}</p>
                    </div>
                  </div>
                  {isRestricted && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-400 shrink-0 ml-2">
                      {pageRules.length} user{pageRules.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Selected page details */}
        <div className="border border-[#282828] bg-[#171717] rounded-lg overflow-hidden">
          {selectedPage ? (
            <>
              <div className="p-4 border-b border-[#282828]">
                <h2 className="text-sm font-medium text-[#f1f1f1]">
                  {SITE_PAGES.find(p => p.path === selectedPage)?.label || selectedPage}
                </h2>
                <p className="text-[11px] text-[#6b6b6b] mt-0.5 font-mono">{selectedPage}</p>
                {getRulesForPage(selectedPage).length === 0 && (
                  <p className="text-xs text-[#4a4a4a] mt-2">
                    No restrictions — this page is open to all users. Add an email below to restrict access.
                  </p>
                )}
              </div>

              {/* Add user form */}
              <form onSubmit={handleAdd} className="p-4 border-b border-[#282828] flex gap-2">
                <input
                  type="email"
                  placeholder="user@example.com"
                  value={newEmail}
                  onChange={(e) => { setNewEmail(e.target.value); setError(''); }}
                  className="flex-1 px-3 py-2 bg-[#1c1c1c] border border-[#282828] rounded-lg text-sm text-[#f1f1f1] placeholder-[#4a4a4a] outline-none focus:border-[#3ECF8E]/50"
                />
                <button
                  type="submit"
                  disabled={adding || !newEmail.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#3ECF8E] text-[#0f0f0f] text-sm font-medium rounded-lg hover:bg-[#35b87d] transition-colors disabled:opacity-50"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </button>
              </form>
              {error && <p className="px-4 py-2 text-xs text-red-400">{error}</p>}

              {/* User list */}
              <div className="max-h-[350px] overflow-y-auto">
                {getRulesForPage(selectedPage).length === 0 ? (
                  <div className="p-8 text-center">
                    <Globe className="w-8 h-8 text-[#282828] mx-auto mb-2" />
                    <p className="text-sm text-[#4a4a4a]">Open to everyone</p>
                  </div>
                ) : (
                  getRulesForPage(selectedPage).map((rule) => (
                    <div key={rule.id} className="flex items-center justify-between px-4 py-3 border-b border-[#282828]/50 last:border-0">
                      <div className="min-w-0">
                        <p className="text-sm text-[#f1f1f1] truncate">{rule.user_email}</p>
                        <p className="text-[10px] text-[#4a4a4a]">
                          Added by {rule.granted_by} · {new Date(rule.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDelete(rule.id)}
                        className="p-1.5 text-[#4a4a4a] hover:text-red-400 transition-colors shrink-0"
                        title="Remove access"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Lock className="w-8 h-8 text-[#282828] mx-auto mb-2" />
                <p className="text-sm text-[#4a4a4a]">Select a page to manage access</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageAccess;
