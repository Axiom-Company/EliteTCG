import React, { useState, useEffect } from 'react';
import card1 from '../../assets/images/card1.png';
import card2 from '../../assets/images/card2.png';
import card3 from '../../assets/images/card3.png';
import card4 from '../../assets/images/card4.png';
import card5 from '../../assets/images/card5.png';

const mobileCards = [
  { src: card1, alt: 'Card 1', rotate: -18, x: -170, y: 25, z: 1 },
  { src: card2, alt: 'Card 2', rotate: -9,  x: -85,  y: 4,  z: 2 },
  { src: card3, alt: 'Card 3', rotate: 0,   x: 0,    y: 0,  z: 3 },
  { src: card4, alt: 'Card 4', rotate: 9,   x: 85,   y: 4,  z: 2 },
  { src: card5, alt: 'Card 5', rotate: 18,  x: 170,  y: 25, z: 1 },
];

const desktopCards = [
  { src: card1, alt: 'Card 1', rotate: -22, x: -260, y: 35, z: 1 },
  { src: card2, alt: 'Card 2', rotate: -11, x: -130, y: 6,  z: 2 },
  { src: card3, alt: 'Card 3', rotate: 0,   x: 0,    y: 0,  z: 3 },
  { src: card4, alt: 'Card 4', rotate: 11,  x: 130,  y: 6,  z: 2 },
  { src: card5, alt: 'Card 5', rotate: 22,  x: 260,  y: 35, z: 1 },
];

const Hero = () => {
  const [spread, setSpread] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    setIsDesktop(mq.matches);
    const handler = (e) => setIsDesktop(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setSpread(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const cards = isDesktop ? desktopCards : mobileCards;

  return (
    <section className="relative bg-white flex flex-col items-center min-h-[85vh] overflow-hidden">

      {/* Background watermark text */}
      <div
        className="absolute inset-0 flex items-end justify-center pointer-events-none z-0 overflow-hidden pb-[347px] md:pb-[172px]"
        style={{ perspective: '800px', maskImage: 'linear-gradient(to top, transparent 0%, black 40%)', WebkitMaskImage: 'linear-gradient(to top, transparent 0%, black 40%)' }}
      >
        <p
          className="text-[7rem] md:text-[16rem] text-[#f5f5f5] whitespace-nowrap select-none leading-none"
          style={{ fontFamily: "'Bebas Neue', sans-serif", transform: 'rotateX(18deg)', transformOrigin: 'center bottom', letterSpacing: '0.05em', WebkitTextStroke: '4px #f5f5f5' }}
        >
          POKÉMON POKÉMON POKÉMON
        </p>
      </div>

      {/* Text + Button — vertically centered in upper half */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 mt-[14vh]">
        <p className="text-xs font-medium tracking-[0.2em] text-gray-400 uppercase mb-5">
          Pokémon TCG Store
        </p>
        <h1 className="text-4xl md:text-5xl font-normal text-gray-900 leading-tight max-w-xl mb-6">
          The Home of Pokémon<br />Packs, Boxes & Rare Pulls.
        </h1>
        <a
          href="#products"
          className="inline-flex items-center justify-center gap-2 py-2.5 px-7 text-sm font-medium rounded-full bg-gray-900 text-white hover:bg-gray-700 transition-all duration-200"
        >
          Shop Now
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </a>
      </div>

      {/* Card Fan — pinned to bottom */}
      <div className="absolute bottom-[150px] md:bottom-0 left-0 right-0 z-10 flex justify-center" style={{ height: '280px' }}>
        {cards.map((card, i) => (
          <img
            key={i}
            src={card.src}
            alt={card.alt}
            className="absolute w-36 md:w-44 h-auto object-contain drop-shadow-2xl"
            style={{
              transform: spread
                ? `translateX(${card.x}px) translateY(${card.y}px) rotate(${card.rotate}deg)`
                : `translateX(0px) translateY(0px) rotate(0deg)`,
              opacity: spread ? 1 : 0,
              zIndex: card.z,
              bottom: '0',
              transition: `transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 60}ms, opacity 0.3s ease ${i * 60}ms`,
            }}
          />
        ))}
      </div>

      {/* Bottom fade into next section */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent z-20 pointer-events-none" />

    </section>
  );
};

export default Hero;
