import React from 'react';
import pikachuImage from '../../assets/images/pikachu.png';
import tcgImage from '../../assets/images/tcg.png';

// Social Icons (copied from Footer.jsx)
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

const socialLinks = [
  { name: 'Instagram', icon: InstagramIcon, href: '#' },
  { name: 'Twitter', icon: TwitterIcon, href: '#' },
  { name: 'TikTok', icon: TiktokIcon, href: '#' },
];


const Hero = () => {
  // Function to render dots for the grid
  const renderDots = (rows, cols) => {
    const dots = [];
    for (let i = 0; i < rows * cols; i++) {
      dots.push(<div key={i} className="w-1 h-1 bg-white rounded-full"></div>);
    }
    return dots;
  };

  return (
    <section className="relative flex flex-col md:flex-row min-h-[80vh] bg-white overflow-hidden">
      {/* Left Section - White Background */}
      <div className="w-full md:w-1/2 flex items-center justify-center py-20 px-4 md:px-8 relative">
        <div className="flex flex-col items-center md:items-start text-center md:text-left max-w-xl">
          {/* <img
            src={tcgImage}
            alt="TCG"
            className="w-38 h-auto mb-8"
          /> */}
          <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4 text-gray-900">
            Catch 'Em All at the Elite TCG Store!
          </h1>
          <p className="text-md md:text-md mb-8 leading-relaxed text-gray-700">
            Your ultimate destination for rare Pokémon cards, booster packs, and exclusive merchandise.
          </p>
          <a
            href="#products"
            className="inline-flex items-center justify-center gap-2 py-3 px-6 text-sm font-medium rounded-full bg-white text-gray-900 border border-gray-300 hover:border-primary hover:text-primary transition-all duration-250"
          >
            View All Sets
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>

      {/* Right Section - Pikachu Yellow Background with skew */}
      <div className="relative w-full md:w-1/2 flex items-center justify-center bg-[#FFCB32] py-20 px-4 md:px-8 transform -skew-x-6 origin-bottom-left">
        {/* Content wrapper to counter-skew */}
        <div className="relative z-10 flex items-center justify-center transform skew-x-6 w-full h-full">
          {/* White dots grid */}
          <div
            className="absolute bottom-0 left-0 grid opacity-70 md:grid"
            style={{
              gridTemplateColumns: 'repeat(11, minmax(0, 1fr))',
              gridTemplateRows: 'repeat(6, minmax(0, 1fr))',
              gap: '8px',
              width: '124px',
              height: '64px',
              transform: 'translateX(-20px) translateY(40px)',
            }}
          >
            {renderDots(6, 11)}
          </div>

          <img
            src={pikachuImage}
            alt="Pikachu"
            className="relative z-20 w-3/4 max-w-sm h-auto object-contain drop-shadow-2xl animate-bounce-slow md:w-1/2 md:max-w-xs"
            style={{ animationDuration: '3s' }}
          />

          {/* Social Icons Bottom Right of Yellow Section (inside counter-skewed div) */}
          <div
            className="absolute bottom-0 right-0 flex items-center gap-3 md:flex"
            style={{ transform: 'translateX(-20px) translateY(40px)' }}
          >
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.name}
                  href={social.href}
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-white/90 text-[#FFCB32]"
                  aria-label={social.name}
                >
                  <Icon />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
