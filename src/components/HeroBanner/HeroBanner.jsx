import { useState, useEffect, useRef, useCallback } from 'react';
import './HeroBanner.css';

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

const CARD_BACK_SRC = '/images/hero/tcg-card-back.jpg';
const BOOSTER_PACK_SRC = '/images/hero/ascended-heroes-booster-pack.png';
const TOTAL_CARDS = CARD_DATA.length;
const PARTICLE_COUNT = 25;

/* Flip order: center outward (indices 6,7 are center hero cards) */
const FLIP_ORDER = [6, 7, 5, 8, 4, 9, 3, 10, 2, 11, 1, 12, 0, 13];

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
const HeroBanner = ({ onShopClick, onCardClick }) => {
  const [phase, setPhase] = useState(0);
  const [flippedCards, setFlippedCards] = useState(new Set());
  const [showOverlay, setShowOverlay] = useState(false);
  const [packReady, setPackReady] = useState(false);
  const [shimmeringCards, setShimmeringCards] = useState(new Set());
  const [, forceUpdate] = useState(0);

  const bannerRef = useRef(null);
  const packWrapRef = useRef(null);
  const cardElRefs = useRef([]);
  const innerRefs = useRef([]);
  const holoRefs = useRef([]);
  const sheenRefs = useRef([]);
  const sparkleRefs = useRef([]);
  const timers = useRef([]);
  const packClicked = useRef(false);
  const hoveredSlot = useRef(null);
  const isMobileRef = useRef(false);
  const spreadVwRef = useRef(150);
  const phaseRef = useRef(0);

  useEffect(() => { phaseRef.current = phase; }, [phase]);

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

  useEffect(() => {
    CARD_DATA.forEach((c) => { const img = new Image(); img.src = `/images/hero/${c.file}`; });
    const back = new Image();
    back.src = CARD_BACK_SRC;
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setPackReady(true), 1050);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => () => {
    timers.current.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (phase !== 0 || isMobileRef.current) return;
    const onMove = (e) => {
      const el = packWrapRef.current;
      const banner = bannerRef.current;
      if (!el || !banner) return;
      const r = banner.getBoundingClientRect();
      const mx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      const my = ((e.clientY - r.top) / r.height - 0.5) * 2;
      el.style.transform = `rotateY(${mx * 7}deg) rotateX(${my * -5}deg)`;
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, [phase]);

  const handlePackClick = useCallback(() => {
    if (phaseRef.current !== 0 || packClicked.current || !packReady) return;
    packClicked.current = true;
    setPhase(1);

    const t1 = setTimeout(() => {
      setPhase(2);
      const t2 = setTimeout(() => {
        setPhase(3);
        FLIP_ORDER.forEach((dataIdx, i) => {
          const t3 = setTimeout(() => {
            setFlippedCards((prev) => new Set([...prev, dataIdx]));
            setShimmeringCards((prev) => new Set([...prev, dataIdx]));
            const tS = setTimeout(() => {
              setShimmeringCards((prev) => {
                const n = new Set(prev);
                n.delete(dataIdx);
                return n;
              });
            }, 850);
            timers.current.push(tS);
          }, i * 60);
          timers.current.push(t3);
        });
        const t4 = setTimeout(() => {
          setPhase(4);
          const t5 = setTimeout(() => setShowOverlay(true), 350);
          timers.current.push(t5);
        }, FLIP_ORDER.length * 60 + 1000);
        timers.current.push(t4);
      }, 1000);
      timers.current.push(t2);
    }, 600);
    timers.current.push(t1);
  }, [packReady]);

  const applyHoloLayers = useCallback((slotIdx, clientX, clientY) => {
    const cardEl = cardElRefs.current[slotIdx];
    if (!cardEl) return;
    const rect = cardEl.getBoundingClientRect();
    const cx = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const cy = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));

    const rotY = (cx - 0.5) * 30;
    const rotX = (cy - 0.5) * -20;
    const inner = innerRefs.current[slotIdx];
    if (inner) {
      inner.style.transform = `rotateY(${180 + rotY}deg) rotateX(${rotX}deg)`;
      inner.style.transition = 'transform 0.08s linear';
      const hue = Math.round(cx * 60 + 20);
      inner.style.boxShadow =
        `inset 0 0 30px rgba(255,${150 + hue},50,0.15), 0 0 20px rgba(100,140,255,0.25), 0 8px 32px rgba(0,0,0,0.5)`;
      inner.style.borderRadius = '11px';
    }

    const holo = holoRefs.current[slotIdx];
    if (holo) {
      const angle = Math.round(cx * 360);
      holo.style.background =
        `linear-gradient(${angle}deg,rgba(255,50,50,0.15),rgba(255,180,50,0.15),rgba(255,255,80,0.15),rgba(50,255,100,0.15),rgba(50,150,255,0.15),rgba(180,50,255,0.15),rgba(255,50,150,0.15))`;
    }

    const sheen = sheenRefs.current[slotIdx];
    if (sheen) {
      const px = Math.round(cx * 100);
      const py = Math.round(cy * 100);
      sheen.style.background =
        `radial-gradient(circle at ${px}% ${py}%,rgba(255,255,255,0.25) 0%,rgba(255,255,255,0.05) 30%,transparent 60%)`;
    }

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
      inner.style.transform = 'rotateY(180deg)';
      inner.style.transition = 'transform 0.4s ease-out, box-shadow 0.4s ease-out';
      inner.style.boxShadow = '';
    }
    const sheen = sheenRefs.current[slotIdx];
    if (sheen) sheen.style.background = '';
    const spark = sparkleRefs.current[slotIdx];
    if (spark) spark.style.backgroundPosition = '';
  }, []);

  const handleCardMouseEnter = useCallback((slotIdx) => {
    if (phaseRef.current !== 4 || isMobileRef.current) return;
    hoveredSlot.current = slotIdx;
    const el = cardElRefs.current[slotIdx];
    if (!el) return;
    el.classList.add('hero-card--hovered');
    el.classList.remove('hero-card--idle');
    el.style.transform = 'translateX(var(--card-x)) translateY(calc(var(--card-y) - 35px)) rotate(0deg) scale(1.24)';
    el.style.zIndex = '100';
    el.style.transition = 'transform 0.25s ease-out';
  }, []);

  const handleCardMouseMove = useCallback((e, slotIdx) => {
    if (phaseRef.current !== 4 || hoveredSlot.current !== slotIdx) return;
    applyHoloLayers(slotIdx, e.clientX, e.clientY);
  }, [applyHoloLayers]);

  const handleCardMouseLeave = useCallback((slotIdx) => {
    hoveredSlot.current = null;
    const el = cardElRefs.current[slotIdx];
    if (el) {
      el.classList.remove('hero-card--hovered');
      if (phaseRef.current === 4) el.classList.add('hero-card--idle');
      el.style.transform = '';
      el.style.zIndex = '';
      el.style.transition = 'transform 0.35s ease-out';
    }
    clearHoloLayers(slotIdx);
  }, [clearHoloLayers]);

  const getSlotVars = useCallback((slotIdx) => {
    const arc = computeArc(slotIdx, TOTAL_CARDS, spreadVwRef.current);
    const centerDist = Math.abs(slotIdx - (TOTAL_CARDS - 1) / 2);
    const z = Math.round(TOTAL_CARDS - centerDist);
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

  const isMobile = isMobileRef.current;

  return (
    <section ref={bannerRef} className="hero-banner">
      <div className="hero-banner__bg" />
      <div className="hero-banner__noise" aria-hidden="true" />

      <div className="hero-banner__particles" aria-hidden="true">
        {Array.from({ length: isMobile ? 10 : PARTICLE_COUNT }).map((_, i) => (
          <span
            key={i}
            className={`particle particle--${i % 3}`}
            style={{
              left: `${((i * 17 + 3) % 100)}%`,
              bottom: '0px',
              animationDelay: `${(i * 1.3) % 8}s`,
              animationDuration: `${7 + (i % 5)}s`,
              width: `${2 + (i % 3)}px`,
              height: `${2 + (i % 3)}px`,
            }}
          />
        ))}
      </div>

      {phase < 2 && (
        <div
          className={`hero-banner__pack${phase === 1 ? ' hero-banner__pack--ripping' : ''}`}
          style={{ perspective: '800px' }}
        >
          <div className="hero-banner__pack-glow" />

          <div
            ref={packWrapRef}
            className="hero-banner__pack-img-wrap"
            onClick={handlePackClick}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handlePackClick(); }
            }}
            role="button"
            tabIndex={0}
            aria-label="Open booster pack"
          >
            <div
              className="hero-banner__pack-half hero-banner__pack-half--left"
              style={{ backgroundImage: `url(${BOOSTER_PACK_SRC})` }}
            />
            <div
              className="hero-banner__pack-half hero-banner__pack-half--right"
              style={{ backgroundImage: `url(${BOOSTER_PACK_SRC})` }}
            />
          </div>

          {phase === 0 && (
            <div className="hero-banner__pack-sparkles" aria-hidden="true">
              {Array.from({ length: 8 }).map((_, i) => (
                <span key={i} className="sparkle" />
              ))}
            </div>
          )}

          {phase === 0 && (
            <p className="hero-banner__pack-prompt">
              {isMobile ? 'Tap to open' : 'Click to open'}
            </p>
          )}

          {phase === 1 && <div className="hero-banner__flash" />}

          {phase === 1 && (
            <div className="hero-banner__burst" aria-hidden="true">
              {Array.from({ length: 14 }).map((_, i) => (
                <span
                  key={i}
                  className="burst-particle"
                  style={{ '--angle': `${i * (360 / 14)}deg` }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {phase >= 2 && (
        <div className="hero-banner__cards">
          {CARD_DATA.map((card, slotIdx) => {
            const dataIdx = slotIdx;
            const isFlipped = flippedCards.has(dataIdx);
            const isEmerging = phase === 2;
            const isInteractive = phase === 4;
            const vars = getSlotVars(slotIdx);

            return (
              <div
                key={dataIdx}
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
                onClick={() => onCardClick && onCardClick(dataIdx)}
              >
                <div
                  ref={(el) => { innerRefs.current[slotIdx] = el; }}
                  className={`hero-card__inner${isFlipped ? ' hero-card__inner--flipped' : ''}`}
                >
                  <div className="hero-card__face hero-card__back">
                    <img src={CARD_BACK_SRC} alt="Card back" draggable="false" />
                  </div>

                  <div className="hero-card__face hero-card__front">
                    <img
                      src={`/images/hero/${card.file}`}
                      alt={card.name}
                      draggable="false"
                    />
                    <div
                      ref={(el) => { holoRefs.current[slotIdx] = el; }}
                      className="hero-card__holo-rainbow"
                    />
                    <div
                      ref={(el) => { sheenRefs.current[slotIdx] = el; }}
                      className="hero-card__light-sheen"
                    />
                    <div
                      ref={(el) => { sparkleRefs.current[slotIdx] = el; }}
                      className="hero-card__sparkle-texture"
                    />
                    {shimmeringCards.has(dataIdx) && <div className="hero-card__shimmer" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showOverlay && (
        <>
          <div className="hero-banner__overlay hero-banner__overlay--top">
            <h1 className="hero-banner__title">ELITE TCG</h1>
            <hr className="hero-banner__divider" />
            <p className="hero-banner__tagline">{`Premium Pok\u00e9mon Singles \u2014 South Africa`}</p>
          </div>

          <div className="hero-banner__overlay hero-banner__overlay--bottom">
            <button className="hero-banner__cta" onClick={onShopClick} type="button">
              Shop Collection
            </button>
          </div>
        </>
      )}
    </section>
  );
};

export default HeroBanner;
