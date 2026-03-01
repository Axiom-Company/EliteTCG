import React, { useState, useEffect, useRef, useCallback } from 'react';
import '../../components/HeroBanner/HeroBanner.css';

/* ── Card Data: 14 cards, display order left-to-right (positions 1-14) ── */
const CARD_DATA = [
  { pos: 1,  file: 'single_card_14.png', name: 'Mega Lopunny ex' },
  { pos: 2,  file: 'single_card_8.png',  name: 'Mega Emboar ex' },
  { pos: 3,  file: 'single_card_10.png', name: 'Mega Froslass ex' },
  { pos: 4,  file: 'single_card_5.png',  name: 'Mega Gengar ex' },
  { pos: 5,  file: 'single_card_7.png',  name: 'Koraidon ex' },
  { pos: 6,  file: 'single_card_1.png',  name: 'Mega Dragonite ex' },
  { pos: 7,  file: 'single_card_13.png', name: 'Mega Charizard X ex' },
  { pos: 8,  file: 'single_card_2.png',  name: 'Pikachu ex' },
  { pos: 9,  file: 'single_card_11.png', name: 'Miraidon ex' },
  { pos: 10, file: 'single_card_3.png',  name: "Team Rocket's Mewtwo ex" },
  { pos: 11, file: 'single_card_9.png',  name: 'Cinderace ex' },
  { pos: 12, file: 'single_card_6.png',  name: 'Mega Lucario ex' },
  { pos: 13, file: 'single_card_4.png',  name: 'Mega Gardevoir ex' },
  { pos: 14, file: 'single_card_12.png', name: 'Mega Gardevoir ex' },
];

const TOTAL_CARDS = CARD_DATA.length;

/* ── Arc geometry: returns { x (vw), y (px), rot (deg) } for slot ── */
function computeArc(slot, total, spreadVw) {
  const t = total <= 1 ? 0 : (slot / (total - 1)) * 2 - 1;
  return {
    x: t * (spreadVw / 2),
    y: t * t * 80,
    rot: t * 18,
  };
}

/* ── Component ───────────────────────────────────────────────────────── */
const Hero = () => {
  // Phase: 'emerging' -> 'interactive'  (no pack phases)
  const [phase, setPhase] = useState('emerging');
  const [scrollY, setScrollY] = useState(0);
  const [selectedCard, setSelectedCard] = useState(null);
  const [cardVisible, setCardVisible] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [, forceUpdate] = useState(0);

  const sectionRef = useRef(null);
  const cardElRefs = useRef([]);
  const innerRefs = useRef([]);
  const holoRefs = useRef([]);
  const sheenRefs = useRef([]);
  const sparkleRefs = useRef([]);
  const hoveredSlot = useRef(null);
  const isMobileRef = useRef(false);
  const spreadVwRef = useRef(150);
  const phaseRef = useRef('emerging');

  useEffect(() => { phaseRef.current = phase; }, [phase]);

  /* ── Responsive spread ────────────────────────────────────────────── */
  useEffect(() => {
    const check = () => {
      const w = window.innerWidth;
      isMobileRef.current = w < 640;
      spreadVwRef.current = w < 640 ? 100 : w < 1024 ? 130 : 150;
      forceUpdate((n) => n + 1);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  /* ── Preload card images ──────────────────────────────────────────── */
  useEffect(() => {
    CARD_DATA.forEach((c) => {
      const img = new Image();
      img.src = `/images/hero/${c.file}`;
    });
  }, []);

  /* ── Scroll tracking ──────────────────────────────────────────────── */
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /* ── Emerge -> Interactive transition on page load ─────────────────── */
  useEffect(() => {
    // Cards emerge immediately; after emerge animation completes, go idle
    const emergeTotal = TOTAL_CARDS * 60 + 700; // last card delay + animation duration
    const timer = setTimeout(() => {
      setPhase('interactive');
    }, emergeTotal);
    return () => clearTimeout(timer);
  }, []);

  /* ── Lock body scroll when card overlay is open ───────────────────── */
  useEffect(() => {
    document.body.style.overflow = selectedCard !== null ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
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
    const rotY = (cx - 0.5) * 30;
    const rotX = (cy - 0.5) * -20;
    const inner = innerRefs.current[slotIdx];
    if (inner) {
      inner.style.transform = `rotateY(${rotY}deg) rotateX(${rotX}deg)`;
      inner.style.transition = 'transform 0.08s linear';
      // Layer 5: Edge glow via box-shadow
      const hue = Math.round(cx * 60 + 20);
      inner.style.boxShadow =
        `inset 0 0 30px rgba(255,${150 + hue},50,0.15), 0 0 20px rgba(100,140,255,0.25), 0 8px 32px rgba(0,0,0,0.3)`;
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
  const handleCardMouseEnter = useCallback((slotIdx) => {
    if (phaseRef.current !== 'interactive' || isMobileRef.current) return;
    hoveredSlot.current = slotIdx;
    const el = cardElRefs.current[slotIdx];
    if (!el) return;
    el.classList.add('hero-card--hovered');
    el.classList.remove('hero-card--idle');
    el.style.transform = 'translateX(var(--card-x)) translateY(calc(var(--card-y) - 35px)) rotate(0deg) scale(1.46)';
    el.style.zIndex = '100';
    el.style.transition = 'transform 0.25s ease-out';

    // Taskbar-style neighbor magnification
    const prev = cardElRefs.current[slotIdx - 1];
    const next = cardElRefs.current[slotIdx + 1];
    if (prev) {
      prev.classList.remove('hero-card--idle');
      prev.style.transform = 'translateX(var(--card-x)) translateY(calc(var(--card-y) - 14px)) rotate(var(--card-rot)) scale(1.18)';
      prev.style.transition = 'transform 0.25s ease-out';
      prev.style.zIndex = '99';
    }
    if (next) {
      next.classList.remove('hero-card--idle');
      next.style.transform = 'translateX(var(--card-x)) translateY(calc(var(--card-y) - 14px)) rotate(var(--card-rot)) scale(1.18)';
      next.style.transition = 'transform 0.25s ease-out';
      next.style.zIndex = '99';
    }
  }, []);

  const handleCardMouseMove = useCallback((e, slotIdx) => {
    if (phaseRef.current !== 'interactive' || hoveredSlot.current !== slotIdx) return;
    applyHoloLayers(slotIdx, e.clientX, e.clientY);
  }, [applyHoloLayers]);

  const handleCardMouseLeave = useCallback((slotIdx) => {
    hoveredSlot.current = null;
    const el = cardElRefs.current[slotIdx];
    if (el) {
      el.classList.remove('hero-card--hovered');
      if (phaseRef.current === 'interactive') el.classList.add('hero-card--idle');
      el.style.transform = '';
      el.style.zIndex = '';
      el.style.transition = 'transform 0.35s ease-out';
    }
    clearHoloLayers(slotIdx);

    // Reset neighbors
    const prev = cardElRefs.current[slotIdx - 1];
    const next = cardElRefs.current[slotIdx + 1];
    [prev, next].forEach((n) => {
      if (!n) return;
      if (phaseRef.current === 'interactive') n.classList.add('hero-card--idle');
      n.style.transform = '';
      n.style.zIndex = '';
      n.style.transition = 'transform 0.35s ease-out';
    });
  }, [clearHoloLayers]);

  /* ── Compute CSS custom properties for each card slot ──────────────── */
  const getSlotVars = useCallback((slotIdx) => {
    const arc = computeArc(slotIdx, TOTAL_CARDS, spreadVwRef.current);
    const centerDist = Math.abs(slotIdx - (TOTAL_CARDS - 1) / 2);
    const z = Math.round(TOTAL_CARDS - centerDist);
    const isDesktop = spreadVwRef.current === 150;
    return {
      '--card-x': `${arc.x}vw`,
      '--card-y': `${arc.y}px`,
      '--card-rot': `${arc.rot}deg`,
      '--card-scale': isDesktop ? '0.98' : '1',
      '--card-z': z,
      '--emerge-delay': `${slotIdx * 60}ms`,
      '--bob-delay': `${slotIdx * 0.4}s`,
      zIndex: z,
    };
  }, []);

  /* ── Scroll-derived values ────────────────────────────────────────── */
  const textOffset      = scrollY * 0.25;
  const titleOpacity    = Math.max(0, 1 - scrollY / 300);
  const watermarkOffset = scrollY * 0.1;
  const cardFadeOpacity = Math.max(0, 1 - scrollY / 350);

  const isEmerging = phase === 'emerging';
  const isInteractive = phase === 'interactive';

  return (
    <section
      ref={sectionRef}
      className="relative bg-white flex flex-col items-center min-h-[85vh] overflow-x-clip"
    >
      {/* ── Background watermark text ──────────────────────────────── */}
      <div
        className="absolute inset-0 flex items-end justify-center pointer-events-none z-0 overflow-hidden pb-[450px] md:pb-[172px]"
        style={{
          perspective: '800px',
          maskImage: 'linear-gradient(to top, transparent 0%, black 40%)',
          WebkitMaskImage: 'linear-gradient(to top, transparent 0%, black 40%)',
          transform: `translateY(${-watermarkOffset}px)`,
        }}
      >
        <p
          className="text-[7rem] md:text-[16rem] text-[#f9f9f9] whitespace-nowrap select-none leading-none"
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            transform: 'rotateX(18deg)',
            transformOrigin: 'center bottom',
            letterSpacing: '0.05em',
            WebkitTextStroke: '4px #f9f9f9',
          }}
        >
          POKEMON POKEMON POKEMON
        </p>
      </div>

      {/* ── Text + Button ──────────────────────────────────────────── */}
      <div
        className="relative z-10 flex flex-col items-center text-center px-6 mt-8 md:mt-[8vh]"
        style={{ transform: `translateY(${-textOffset}px)`, opacity: titleOpacity }}
      >
        <p className="text-xs font-medium tracking-[0.2em] text-gray-400 uppercase mb-5">
          {`Pok\u00e9mon TCG Store`}
        </p>
        <h1 className="text-2xl md:text-5xl font-normal text-gray-900 leading-tight max-w-xl mb-6">
          {`The Home of Pok\u00e9mon`}<br />Packs, Boxes & Rare Pulls.
        </h1>
        <a
          href="#products"
          className="inline-flex items-center justify-center gap-2 py-2.5 px-7 text-sm font-medium rounded-full bg-gray-900 text-white hover:bg-gray-700 transition-colors duration-200"
        >
          Shop Now
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        </a>
      </div>

      {/* ── 14-Card Parabolic Arc (pinned to bottom) ───────────────── */}
      <div
        className="relative w-full -mt-2 md:absolute md:bottom-[60px] md:left-0 md:right-0 z-10 flex justify-center"
        style={{ height: '320px', opacity: cardFadeOpacity }}
      >
        <div
          className="hero-banner__cards"
          style={{ position: 'relative', width: '100%', height: '100%' }}
        >
          {CARD_DATA.map((card, slotIdx) => {
            const vars = getSlotVars(slotIdx);

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
                      src={`/images/hero/${card.file}`}
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

                    {/* Layer 4: Sparkle/glitter texture */}
                    <div
                      ref={(el) => { sparkleRefs.current[slotIdx] = el; }}
                      className="hero-card__sparkle-texture"
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
            src={`/images/hero/${CARD_DATA[selectedCard].file}`}
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
