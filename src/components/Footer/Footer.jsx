// Social Icons
const InstagramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <path d="M17.5 6.5h.01" strokeLinecap="round"/>
  </svg>
);

const TwitterIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const TiktokIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

const Footer = () => {
  const quickLinks = [
    { name: 'Shop All', href: '#' },
    { name: 'New Arrivals', href: '#' },
    { name: 'Pre-Orders', href: '#' },
    { name: 'Contact', href: '#' },
  ];

  const socialLinks = [
    { name: 'Instagram', icon: InstagramIcon, href: '#' },
    { name: 'Twitter', icon: TwitterIcon, href: '#' },
    { name: 'TikTok', icon: TiktokIcon, href: '#' },
  ];

  return (
    <footer className="mt-auto bg-gray-100 border-t border-gray-200">
      <div className="container py-12">
        <div className="flex flex-col items-center text-center">
          {/* Logo */}
          <a href="/" className="inline-flex items-center gap-2 mb-6">
            <span className="text-lg font-medium text-gray-900">EliteTCG</span>
          </a>

          {/* Tagline */}
          <p className="text-sm text-gray-600 mb-6 max-w-md">
            Your trusted source for authentic Pokémon TCG products in South Africa.
          </p>

          {/* Quick Links */}
          <div className="flex items-center gap-6 mb-8">
            {quickLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-3 mb-8">
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.name}
                  href={social.href}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 text-gray-600 transition-all hover:bg-gray-300 hover:text-gray-900"
                  aria-label={social.name}
                >
                  <Icon />
                </a>
              );
            })}
          </div>

          {/* Divider */}
          <div className="w-full max-w-xs h-px bg-gray-200 mb-6"></div>

          {/* Copyright */}
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} EliteTCG. All rights reserved.
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Pokémon and its trademarks are © Nintendo / Creatures Inc. / GAME FREAK inc.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
