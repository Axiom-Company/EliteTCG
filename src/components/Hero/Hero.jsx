import React, { useState, useEffect, useRef } from 'react';
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

// Each card gets a different scroll speed — index 0 fastest, index 4 slowest
const cardScrollSpeeds = [0.3, 0.4, 0.5, 0.6, 0.7];

const Hero = () => {
  const [spread, setSpread] = useState(false);
  const [animDone, setAnimDone] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const sectionRef = useRef(null);

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

  useEffect(() => {
    if (spread) {
      // Wait for spread animation to finish before enabling scroll transforms
      const timer = setTimeout(() => setAnimDone(true), 800);
      return () => clearTimeout(timer);
    }
  }, [spread]);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const cards = isDesktop ? desktopCards : mobileCards;

  const textOffset      = scrollY * 0.25;
  const titleOpacity    = Math.max(0, 1 - scrollY / 300);
  const watermarkOffset = scrollY * 0.1;
  const cardFadeOpacity = Math.max(0, 1 - scrollY / 350);

  return (
    <section ref={sectionRef} className="relative bg-white flex flex-col items-center min-h-[85vh] overflow-hidden">

      {/* Background watermark text */}
      <div
        className="absolute inset-0 hidden md:flex items-end justify-center pointer-events-none z-0 overflow-hidden md:pb-[172px]"
        style={{
          perspective: '800px',
          maskImage: 'linear-gradient(to top, transparent 0%, black 40%)',
          WebkitMaskImage: 'linear-gradient(to top, transparent 0%, black 40%)',
          transform: `translateY(${-watermarkOffset}px)`,
        }}
      >
        <p
          className="text-[7rem] md:text-[16rem] text-[#f5f5f5] whitespace-nowrap select-none leading-none"
          style={{ fontFamily: "'Bebas Neue', sans-serif", transform: 'rotateX(18deg)', transformOrigin: 'center bottom', letterSpacing: '0.05em', WebkitTextStroke: '4px #f5f5f5' }}
        >
          POKÉMON POKÉMON POKÉMON
        </p>
      </div>

      {/* Text + Button */}
      <div
        className="relative z-10 flex flex-col items-center text-center px-6 mt-12 md:mt-[14vh]"
        style={{ transform: `translateY(${-textOffset}px)`, opacity: titleOpacity }}
      >
        <p className="text-xs font-medium tracking-[0.2em] text-gray-400 uppercase mb-5">
          Pokémon TCG Store
        </p>
        <h1 className="text-2xl md:text-5xl font-normal text-gray-900 leading-tight max-w-xl mb-6">
          The Home of Pokémon<br />Packs, Boxes & Rare Pulls.
        </h1>
        <a
          href="#products"
          className="inline-flex items-center justify-center gap-2 py-2.5 px-7 text-sm font-medium rounded-full bg-gray-900 text-white hover:bg-gray-700 transition-colors duration-200"
        >
          Shop Now
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </a>
      </div>

      {/* Card Fan — pinned to bottom */}
      <div className="relative w-full -mt-2 md:absolute md:bottom-0 md:left-0 md:right-0 z-10 flex justify-center" style={{ height: '280px' }}>
        {cards.map((card, i) => {
          const scrollOffset = animDone ? scrollY * cardScrollSpeeds[i] : 0;
          return (
            <img
              key={i}
              src={card.src}
              alt={card.alt}
              className="absolute w-32 md:w-44 h-auto object-contain drop-shadow-2xl"
              style={{
                transform: spread
                  ? `translateX(${card.x}px) translateY(${card.y - scrollOffset}px) rotate(${card.rotate}deg)`
                  : `translateX(0px) translateY(0px) rotate(0deg)`,
                opacity: spread ? cardFadeOpacity : 0,
                zIndex: card.z,
                bottom: '0',
                transition: animDone
                  ? 'none'
                  : `transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 60}ms, opacity 0.3s ease ${i * 60}ms`,
              }}
            />
          );
        })}
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent z-20 pointer-events-none" />

    </section>
  );
};

export default Hero;
