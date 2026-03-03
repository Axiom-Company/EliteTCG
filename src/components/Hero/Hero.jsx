import React, { useState, useEffect, useRef, useCallback } from 'react';
import '../../components/HeroBanner/HeroBanner.css';
import card1 from '../../assets/images/SingleCards/card1.webp';
import card2 from '../../assets/images/SingleCards/card2.webp';
import card3 from '../../assets/images/SingleCards/card3.webp';
import card4 from '../../assets/images/SingleCards/card4.webp';
import card5 from '../../assets/images/SingleCards/card5.webp';
import card6 from '../../assets/images/SingleCards/card6.webp';
import card7  from '../../assets/images/SingleCards/card7.webp';
import card8  from '../../assets/images/SingleCards/card8.webp';
import card9  from '../../assets/images/SingleCards/card9.webp';
import card10 from '../../assets/images/SingleCards/card10.webp';
import card11 from '../../assets/images/SingleCards/card11.webp';
import card12 from '../../assets/images/SingleCards/card12.webp';

//test
const CARD_DATA = [
  { pos: 1,  src: card1,  name: 'Card 1' },
  { pos: 2,  src: card2,  name: 'Card 2' },
  { pos: 3,  src: card3,  name: 'Card 3' },
  { pos: 4,  src: card4,  name: 'Card 4' },
  { pos: 5,  src: card5,  name: 'Card 5' },
  { pos: 6,  src: card6,  name: 'Card 6' },
  { pos: 7,  src: card7,  name: 'Card 7' },
  { pos: 8,  src: card8,  name: 'Card 8' },
  { pos: 9,  src: card9,  name: 'Card 9' },
  { pos: 10, src: card10, name: 'Card 10' },
  { pos: 11, src: card11, name: 'Card 11' },
  { pos: 12, src: card12, name: 'Card 12' },
];

const TOTAL_CARDS = CARD_DATA.length;

/* ── Arc geometry: returns { x (vw), y (px), rot (deg) } for slot ── */
function computeArc(slot, total, spreadVw) {
  const t = total <= 1 ? 0 : (slot / (total - 1)) * 2 - 1;
  return {
    x: t * (spreadVw / 2),
    y: t * t * 60,
    rot: t * 18,
  };
}

/* ── Component ───────────────────────────────────────────────────────── */
const Hero = () => {
  // Phase: 'emerging' -> 'interactive'  (no pack phases)
  const [phase, setPhase] = useState('emerging');
  const [selectedCard, setSelectedCard] = useState(null);
  const [cardVisible, setCardVisible] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [, forceUpdate] = useState(0);
  const [textOffset, setTextOffset] = useState(0);
  const [cardOffset, setCardOffset] = useState(0);
  const [watermarkOffset, setWatermarkOffset] = useState(0);

  const sectionRef = useRef(null);
  const cardElRefs = useRef([]);
  const innerRefs = useRef([]);
  const holoRefs = useRef([]);
  const sheenRefs = useRef([]);
  const sparkleRefs = useRef([]);
  const hoveredSlot = useRef(null);
  const isMobileRef = useRef(typeof window !== 'undefined' ? window.innerWidth < 640 : false);
  const spreadVwRef = useRef(
    (() => { const w = typeof window !== 'undefined' ? window.innerWidth : 1440; return w < 640 ? 85 : w < 1024 ? 50 : 48; })()
  );
  const phaseRef = useRef('emerging');

  useEffect(() => { phaseRef.current = phase; }, [phase]);

  /* ── Responsive spread ────────────────────────────────────────────── */
  useEffect(() => {
    isMobileRef.current = window.innerWidth < 640;
    const check = () => {
      const w = window.innerWidth;
      isMobileRef.current = w < 640;
      spreadVwRef.current = w < 640 ? 85 : w < 1024 ? 50 : 48;
      forceUpdate((n) => n + 1);
    };
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  /* ── Parallax scroll (desktop only) ──────────────────────────────── */
  useEffect(() => {
    const handleScroll = () => {
      if (isMobileRef.current) return;
      const y = window.scrollY;
      setTextOffset(y * 0.25);
      setCardOffset(y * 0.15);
      setWatermarkOffset(y * 0.1);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /* ── Preload card images ──────────────────────────────────────────── */
  useEffect(() => {
    CARD_DATA.forEach((c) => {
      const img = new Image();
      img.src = c.src;
    });
  }, []);

  /* ── Emerge -> Interactive transition on page load ─────────────────── */
  useEffect(() => {
    const visibleCount = 7;
    const emergeTotal = visibleCount * 60 + 700; // last card delay + animation duration
    const timer = setTimeout(() => {
      setPhase('interactive');
    }, emergeTotal);
    return () => clearTimeout(timer);
  }, []);

  /* ── Lock body scroll when card overlay is open ───────────────────── */
  useEffect(() => {
    if (selectedCard !== null) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
    return () => { document.body.style.overflow = ''; document.body.style.paddingRight = ''; };
  }, [selectedCard]);

  /* ── Card overlay open/close ──────────────────────────────────────── */
  const openCard = useCallback((e, slotIdx) => {
    e.stopPropagation();
    setSelectedCard(slotIdx);
    setCardVisible(false);
    requestAnimationFrame(() => requestAnimationFrame(() => setCardVisible(true)));
  }, []);

  const closeCard = useCallback(() => {
    setCardVisible(false);
    setTilt({ x: 0, y: 0 });
    setTimeout(() => setSelectedCard(null), 400);
  }, []);

  const handleOverlayPointerMove = useCallback((e) => {
    if (!cardVisible) return;
    const { clientX, clientY } = e.touches ? e.touches[0] : e;
    const nx = (clientX / window.innerWidth) * 2 - 1;
    const ny = (clientY / window.innerHeight) * 2 - 1;
    setTilt({ x: ny * -18, y: nx * 18 });
  }, [cardVisible]);

  /* ── 5-layer holographic hover effect ─────────────────────────────── */
  const applyHoloLayers = useCallback((slotIdx, clientX, clientY) => {
    const cardEl = cardElRefs.current[slotIdx];
    if (!cardEl) return;
    const rect = cardEl.getBoundingClientRect();
    const cx = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const cy = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));

    // Layer 1: 3D tilt on card inner
    const rotY = (cx - 0.5) * 15.4;
    const rotX = (cy - 0.5) * -11;
    const inner = innerRefs.current[slotIdx];
    if (inner) {
      inner.style.transform = `rotateY(${rotY}deg) rotateX(${rotX}deg)`;
      inner.style.transition = 'transform 0.08s linear';
      inner.style.boxShadow = '0 8px 24px rgba(0,0,0,0.25)';
      inner.style.borderRadius = '11px';
    }

    // Layer 2: Holographic rainbow gradient
    const holo = holoRefs.current[slotIdx];
    if (holo) {
      const angle = Math.round(cx * 360);
      holo.style.background =
        `linear-gradient(${angle}deg,rgba(255,50,50,0.15),rgba(255,180,50,0.15),rgba(255,255,80,0.15),rgba(50,255,100,0.15),rgba(50,150,255,0.15),rgba(180,50,255,0.15),rgba(255,50,150,0.15))`;
    }

    // Layer 3: Light sheen reflection
    const sheen = sheenRefs.current[slotIdx];
    if (sheen) {
      const px = Math.round(cx * 100);
      const py = Math.round(cy * 100);
      sheen.style.background =
        `radial-gradient(circle at ${px}% ${py}%,rgba(255,255,255,0.25) 0%,rgba(255,255,255,0.05) 30%,transparent 60%)`;
    }

    // Layer 4: Sparkle texture position shift
    const spark = sparkleRefs.current[slotIdx];
    if (spark) {
      const ox = Math.round(cx * 20);
      const oy = Math.round(cy * 20);
      spark.style.backgroundPosition = `${ox}px ${oy}px, ${ox + 5}px ${oy + 5}px`;
    }
  }, []);

  const clearHoloLayers = useCallback((slotIdx) => {
    const inner = innerRefs.current[slotIdx];
    if (inner) {
      inner.style.transform = '';
      inner.style.transition = 'transform 0.4s ease-out, box-shadow 0.4s ease-out';
      inner.style.boxShadow = '';
    }
    const sheen = sheenRefs.current[slotIdx];
    if (sheen) sheen.style.background = '';
    const spark = sparkleRefs.current[slotIdx];
    if (spark) spark.style.backgroundPosition = '';
  }, []);

  /* ── Card hover: 35px lift + 1.46x scale + taskbar neighbor magnification ── */
  const resetCard = useCallback((idx) => {
    const el = cardElRefs.current[idx];
    if (!el) return;
    el.classList.remove('hero-card--hovered');
    if (phaseRef.current === 'interactive') el.classList.add('hero-card--idle');
    el.style.transform = '';
    clearHoloLayers(idx);
  }, [clearHoloLayers]);

  const handleCardMouseEnter = useCallback((slotIdx) => {
    if (phaseRef.current !== 'interactive' || isMobileRef.current) return;

    // Clean up previously hovered card if mouseleave was missed
    if (hoveredSlot.current !== null && hoveredSlot.current !== slotIdx) {
      resetCard(hoveredSlot.current);
    }

    hoveredSlot.current = slotIdx;
    const el = cardElRefs.current[slotIdx];
    if (!el) return;
    el.classList.add('hero-card--hovered');
    el.classList.remove('hero-card--idle');
    requestAnimationFrame(() => {
      if (hoveredSlot.current === slotIdx) {
        el.style.transform = 'translateX(var(--card-x)) translateY(calc(var(--card-y) - 16px)) rotate(var(--card-rot))';
      }
    });
  }, [resetCard]);

  const handleCardMouseMove = useCallback((e, slotIdx) => {
    if (phaseRef.current !== 'interactive' || hoveredSlot.current !== slotIdx) return;
    applyHoloLayers(slotIdx, e.clientX, e.clientY);
  }, [applyHoloLayers]);

  const handleCardMouseLeave = useCallback((slotIdx) => {
    hoveredSlot.current = null;
    resetCard(slotIdx);
  }, [resetCard]);

  /* ── Compute CSS custom properties for each card slot ──────────────── */
  const getSlotVars = useCallback((slotIdx, total) => {
    const arc = computeArc(slotIdx, total, spreadVwRef.current);
    const centerDist = Math.abs(slotIdx - (total - 1) / 2);
    const z = Math.round(total - centerDist);
    return {
      '--card-x': `${arc.x}vw`,
      '--card-y': `${arc.y}px`,
      '--card-rot': `${arc.rot}deg`,
      '--card-z': z,
      '--emerge-delay': `${slotIdx * 60}ms`,
      '--bob-delay': `${slotIdx * 0.4}s`,
      zIndex: z,
    };
  }, []);

  const isEmerging = phase === 'emerging';
  const isInteractive = phase === 'interactive';
  const visibleCards = CARD_DATA.slice(Math.floor((TOTAL_CARDS - 7) / 2), Math.floor((TOTAL_CARDS - 7) / 2) + 7);

  return (
    <section
      ref={sectionRef}
      className="relative flex flex-col items-center min-h-[85vh] overflow-hidden"
    >
      {/* ── Background watermark text ─────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none z-0 overflow-hidden"
        style={{
          maskImage: 'linear-gradient(to top, transparent 0%, transparent 35%, black 75%)',
          WebkitMaskImage: 'linear-gradient(to top, transparent 0%, transparent 35%, black 75%)',
          transform: `translateY(${-watermarkOffset}px)`,
        }}
      >
        <div
          className="absolute left-0 right-0 top-[calc(41%-66px)] md:top-[calc(45%-66px)] flex justify-center -translate-y-1/2"
          style={{ perspective: '800px' }}
        >
          <div
            className="flex items-end whitespace-nowrap select-none leading-none"
            style={{
              transformOrigin: 'center bottom',
              transform: 'rotateX(19deg)',
              gap: '14px',
            }}
          >
            <span
              className="text-[7rem] md:text-[11rem]"
              style={{
                letterSpacing: '0.05em',
                transform: 'translateY(-5px)',
                background: 'linear-gradient(to bottom, #d1d1d1 0%, #b7b7b7 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >POKEMON</span>
            <span
              className="text-[7rem] md:text-[11rem]"
              style={{
                letterSpacing: '0.05em',
                transform: 'translateY(0px) rotateX(-2.7deg)',
                background: 'linear-gradient(to bottom, #d1d1d1 0%, #b7b7b7 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >POKEMON</span>
            <span
              className="text-[7rem] md:text-[11rem]"
              style={{
                letterSpacing: '0.05em',
                transform: 'translateY(-5px)',
                background: 'linear-gradient(to bottom, #d1d1d1 0%, #b7b7b7 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >POKEMON</span>
          </div>
        </div>
      </div>
      {/* ── Text + Button ──────────────────────────────────────────── */}
      <div
        className="relative z-10 flex flex-col items-center text-center px-6 mt-[80px] md:mt-[8vh]"
        style={{ transform: `translateY(${-textOffset - 18}px)` }}
      >
        <p className="text-xs font-medium tracking-[0.2em] text-gray-500 uppercase mb-5">
          {`Pok\u00e9mon TCG Store`}
        </p>
        <h1 className="text-2xl md:text-5xl font-normal text-gray-800 leading-tight max-w-xl">
          {`The Home of Pok\u00e9mon`}<br />Packs, Boxes & Rare Pulls.
        </h1>
      </div>

      {/* ── 14-Card Parabolic Arc ───────────────────────────────────── */}
      <div
        className="relative w-full mt-9 z-10 flex justify-center"
        style={{ height: '320px', transform: `translateY(${4 - (isMobileRef.current ? 50 : 0) - cardOffset}px)` }}
      >
        <div
          className="hero-banner__cards"
          style={{ position: 'relative', width: '100%', height: '100%' }}
        >
          {visibleCards.map((card, slotIdx) => {
            const vars = getSlotVars(slotIdx, visibleCards.length);

            return (
              <div
                key={card.pos}
                ref={(el) => { cardElRefs.current[slotIdx] = el; }}
                className={[
                  'hero-card',
                  isEmerging && 'hero-card--emerging',
                  isInteractive && 'hero-card--idle',
                ].filter(Boolean).join(' ')}
                style={vars}
                onMouseEnter={() => handleCardMouseEnter(slotIdx)}
                onMouseMove={(e) => handleCardMouseMove(e, slotIdx)}
                onMouseLeave={() => handleCardMouseLeave(slotIdx)}
                onClick={(e) => openCard(e, slotIdx)}
              >
                <div
                  ref={(el) => { innerRefs.current[slotIdx] = el; }}
                  className="hero-card__inner"
                >
                  {/* Front face only -- no card back, no flip */}
                  <div className="hero-card__face">
                    <img
                      src={card.src}
                      alt={card.name}
                      draggable="false"
                    />

                    {/* Layer 2: Holographic rainbow gradient */}
                    <div
                      ref={(el) => { holoRefs.current[slotIdx] = el; }}
                      className="hero-card__holo-rainbow"
                    />

                    {/* Layer 3: Moving light sheen */}
                    <div
                      ref={(el) => { sheenRefs.current[slotIdx] = el; }}
                      className="hero-card__light-sheen"
                    />

                  </div>
                </div>

                {/* Glow shadow under card */}
                <div className="hero-card__glow-shadow" />
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Shop Now Button ─────────────────────────────────────────── */}
      <div className="relative z-10 flex justify-center mt-0 mb-8" style={{ transform: `translateY(${32 - (isMobileRef.current ? 50 : 0) - cardOffset}px)` }}>
        <a
          href="#products"
          className="inline-flex items-center justify-center gap-2 py-3 px-6 text-sm font-medium rounded-full bg-gray-900 text-white hover:bg-gray-800 transition-all duration-250"
        >
          Shop Now
        </a>
      </div>

      {/* ── Card Overlay (click to enlarge) ────────────────────────── */}
      {selectedCard !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center cursor-pointer"
          style={{
            backgroundColor: cardVisible ? 'rgba(0,0,0,0.75)' : 'rgba(0,0,0,0)',
            transition: 'background-color 0.3s ease',
            perspective: '1000px',
          }}
          onClick={closeCard}
          onMouseMove={handleOverlayPointerMove}
          onTouchMove={(e) => { e.preventDefault(); handleOverlayPointerMove(e); }}
          onMouseLeave={() => setTilt({ x: 0, y: 0 })}
        >
          <img
            src={CARD_DATA[selectedCard].src}
            alt={CARD_DATA[selectedCard].name}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '220px',
              height: 'auto',
              borderRadius: '12px',
              boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
              transform: cardVisible
                ? `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(1)`
                : 'rotateY(-180deg) scale(0.4) translateY(40px)',
              opacity: cardVisible ? 1 : 0,
              transition: cardVisible
                ? 'transform 0.1s ease-out, opacity 0.3s ease'
                : 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease',
            }}
          />
        </div>
      )}
    </section>
  );
};

export default Hero;
