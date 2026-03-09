import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import SEO from '../../components/SEO/SEO';

const pages = [
  {
    label: 'Terms of Service',
    to: '/terms-of-service',
  },
  {
    label: 'Privacy Policy',
    to: '/privacy-policy',
  },
  {
    label: 'Refund Policy',
    to: '/refund-policy',
  },
  {
    label: 'Elite Rips Policy',
    to: '/elite-rips-policy',
  },
];

const LegalLayout = ({ title, lastUpdated, seo, sections, children }) => {
  const { pathname } = useLocation();
  const [activeId, setActiveId] = useState(sections[0]?.id || '');
  const observerRef = useRef(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Scroll spy via IntersectionObserver
  const setupObserver = useCallback(() => {
    if (observerRef.current) observerRef.current.disconnect();

    const headings = sections
      .map((s) => document.getElementById(s.id))
      .filter(Boolean);

    if (headings.length === 0) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0 }
    );

    headings.forEach((el) => observerRef.current.observe(el));
  }, [sections]);

  useEffect(() => {
    // Small delay so DOM is ready
    const t = setTimeout(setupObserver, 100);
    return () => {
      clearTimeout(t);
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [setupObserver]);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
    setMobileOpen(false);
  };

  return (
    <div className="min-h-screen bg-white">
      <SEO {...seo} />

      <div className="max-w-6xl mx-auto px-6 pt-4 pb-0">
        <nav className="flex items-center gap-1.5 text-xs text-gray-400">
          <Link to="/" className="hover:text-gray-700 transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-600">{title}</span>
        </nav>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 lg:flex lg:gap-12">

        {/* ── Sidebar ── */}
        <aside className="lg:w-56 shrink-0">

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden flex items-center justify-between w-full text-sm font-medium text-gray-900 border border-gray-200 px-3 py-2.5 mb-4"
          >
            On this page
            <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${mobileOpen ? 'rotate-90' : ''}`} />
          </button>

          <nav className={`${mobileOpen ? 'block' : 'hidden'} lg:block lg:sticky lg:top-28 overflow-y-auto max-h-[calc(100vh-8rem)] pb-8`}>
            {/* Page links */}
            <div className="space-y-0.5 mb-6">
              {pages.map((p) => (
                <Link
                  key={p.to}
                  to={p.to}
                  className={`block px-2.5 py-1.5 text-sm transition-colors rounded-md ${
                    pathname === p.to
                      ? 'font-medium text-gray-900'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {p.label}
                </Link>
              ))}
            </div>

            {/* Section links for current page */}
            <div className="border-l border-gray-200 ml-2.5">
              <p className="text-[10px] font-medium uppercase tracking-widest text-gray-400 mb-2 pl-3">
                On this page
              </p>
              <div className="space-y-0.5">
                {sections.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => scrollTo(s.id)}
                    className={`block w-full text-left pl-3 pr-2 py-1 text-[13px] leading-snug transition-colors border-l-2 -ml-px ${
                      activeId === s.id
                        ? 'border-gray-900 text-gray-900 font-medium'
                        : 'border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </nav>
        </aside>

        {/* ── Content ── */}
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-medium text-gray-900 mb-1">{title}</h1>
          <p className="text-sm text-gray-400 mb-10">Last updated: {lastUpdated}</p>

          <div className="space-y-10 text-gray-600 text-sm leading-relaxed">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegalLayout;
