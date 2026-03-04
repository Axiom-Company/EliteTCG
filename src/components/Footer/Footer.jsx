import { useState } from 'react';
import { Link } from 'react-router-dom';

const InstagramIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <path d="M17.5 6.5h.01" strokeLinecap="round"/>
  </svg>
);

const TwitterIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const TiktokIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

const socialLinks = [
  { name: 'Instagram', icon: InstagramIcon, href: '#' },
  { name: 'Twitter / X', icon: TwitterIcon, href: '#' },
  { name: 'TikTok', icon: TiktokIcon, href: '#' },
];

const shopLinks = [
  { name: 'All Products', to: '/products' },
  { name: 'Sets', to: '/sets' },
  { name: 'Pre-Orders', to: '/products' },
  { name: 'Marketplace', to: '/marketplace' },
];

const infoLinks = [
  { name: 'Privacy Policy', to: '/privacy-policy' },
  { name: 'Terms of Service', to: '/terms-of-service' },
  { name: 'Contact Us', to: '#' },
];

const Footer = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  };

  return (
    <footer style={{ background: '#1a1a1a' }}>
      <div className="container py-14 md:py-16">

        {/* Newsletter row */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-12 border-b border-white/10">
          <div className="max-w-xs">
            <h3 className="text-base font-medium text-white mb-1">Stay ahead of every release</h3>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>New sets, restocks and exclusive deals — first to your inbox.</p>
          </div>

          {submitted ? (
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-gray-900 text-sm font-medium">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              You're on the list
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex gap-2.5 w-full md:max-w-sm">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                required
                className="flex-1 h-10 rounded-full border border-white/10 bg-white/5 px-4 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-white/30 transition-colors"
              />
              <button
                type="submit"
                className="h-10 px-5 rounded-full bg-white text-gray-900 text-sm font-medium hover:bg-white/90 transition-colors shrink-0"
              >
                Subscribe
              </button>
            </form>
          )}
        </div>

        {/* Main columns */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-10 pt-12">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="text-base font-medium text-white mb-3 block">EliteTCG</Link>
            <p className="text-sm leading-relaxed max-w-xs mb-6" style={{ color: 'rgba(255,255,255,0.4)' }}>
              South Africa's trusted source for authentic Pokémon TCG products.
            </p>
            <div className="flex items-center gap-2">
              {socialLinks.map(({ name, icon: Icon, href }) => (
                <a
                  key={name}
                  href={href}
                  aria-label={name}
                  className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center transition-all hover:border-white/30 hover:text-white"
                  style={{ color: 'rgba(255,255,255,0.45)' }}
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {/* Shop links */}
          <div>
            <p className="text-[11px] font-medium uppercase tracking-widest mb-4" style={{ color: 'rgba(255,255,255,0.3)' }}>Shop</p>
            <ul className="flex flex-col gap-3">
              {shopLinks.map(({ name, to }) => (
                <li key={name}>
                  <Link to={to} className="text-sm transition-colors hover:text-white" style={{ color: 'rgba(255,255,255,0.5)' }}>{name}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info links */}
          <div>
            <p className="text-[11px] font-medium uppercase tracking-widest mb-4" style={{ color: 'rgba(255,255,255,0.3)' }}>Info</p>
            <ul className="flex flex-col gap-3">
              {infoLinks.map(({ name, to }) => (
                <li key={name}>
                  <Link to={to} className="text-sm transition-colors hover:text-white" style={{ color: 'rgba(255,255,255,0.5)' }}>{name}</Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-2 pt-10 mt-10 border-t border-white/10">
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>© {new Date().getFullYear()} EliteTCG. All rights reserved.</p>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>Pokémon and its trademarks are © Nintendo / Creatures Inc. / GAME FREAK inc.</p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
