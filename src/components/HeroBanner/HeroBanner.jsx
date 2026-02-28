import React, { useState, useEffect, useRef, useCallback } from 'react';

import boosterPack from '../../assets/images/ascended-heroes-booster-pack.png';
import cardBack from '../../assets/images/tcg-card-back.jpg';
import card1 from '../../assets/images/single_card_1.png';
import card2 from '../../assets/images/single_card_2.png';
import card3 from '../../assets/images/single_card_3.png';
import card4 from '../../assets/images/single_card_4.png';
import card5 from '../../assets/images/single_card_5.png';
import card6 from '../../assets/images/single_card_6.png';
import card7 from '../../assets/images/single_card_7.png';

import './HeroBanner.css';

// ── Card configuration (arc order: left → right) ─────────────
const CARDS = [
  { index: 0, name: 'Mega Dragonite ex',       front: card1, xVw: -38, y: 20,  rot: -16, scale: 0.82, z: 1, glow: '#F97316' },
  { index: 1, name: 'Mega Gengar ex',           front: card5, xVw: -25, y: 10,  rot: -10, scale: 0.88, z: 2, glow: '#8B5CF6' },
  { index: 2, name: 'Mega Lucario ex',          front: card6, xVw: -13, y: 3,   rot: -4,  scale: 0.94, z: 3, glow: '#3B82F6' },
  { index: 3, name: 'Pikachu ex',               front: card2, xVw: 0,   y: 0,   rot: 0,   scale: 1.0,  z: 7, glow: '#EAB308' },
  { index: 4, name: 'Mega Gardevoir ex',        front: card4, xVw: 13,  y: 3,   rot: 4,   scale: 0.94, z: 3, glow: '#EC4899' },
  { index: 5, name: "Team Rocket's Mewtwo ex",  front: card3, xVw: 25,  y: 10,  rot: 10,  scale: 0.88, z: 2, glow: '#A855F7' },
  { index: 6, name: 'Koraidon ex',              front: card7, xVw: 38,  y: 20,  rot: 16,  scale: 0.82, z: 1, glow: '#EF4444' },
];

// Flip order: center first, alternating outward
const FLIP_ORDER = [3, 2, 4, 1, 5, 0, 6];

// Particle count
const PARTICLE_COUNT = 25;

// ── Component ────────────────────────────────────────────────
const HeroBanner = ({ onShopClick }) => {
  // Phase: 0=pack visible, 1=ripping, 2=cards emerging, 3=flipping, 4=interactive
  const [phase, setPhase] = useState(0);
  const [flippedCards, setFlippedCards] = useState(new Set());
  const [hoveredCard, setHoveredCard] = useState(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [cardsSettled, setCardsSettled] = useState(false);
  const [packReady, setPackReady] = useState(false);
  const [shimmeringCards, setShimmeringCards] = useState(new Set());

  const containerRef = useRef(null);
  const packWrapRef = useRef(null);
  const cardRefs = useRef([]);
  const mousePos = useRef({ x: 0.5, y: 0.5 });
  const rafId = useRef(null);
  const timers = useRef([]);
  const packClicked = useRef(false);

  // ── Responsive detection ───────────────────────────────────
  useEffect(() => {
    const check = () => {
      setIsMobile(window.innerWidth < 640);
      setIsTablet(window.innerWidth < 1024);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // ── Preload card fronts during Phase 0 ─────────────────────
  useEffect(() => {
    CARDS.forEach((c) => {
      const img = new Image();
      img.src = c.front;
    });
  }, []);

  // ── Mark pack as ready after fadeIn animation completes ────
  useEffect(() => {
    const t = setTimeout(() => setPackReady(true), 1050);
    return () => clearTimeout(t);
  }, []);

  // ── Cleanup on unmount ─────────────────────────────────────
  useEffect(() => {
    return () => {
      timers.current.forEach(clearTimeout);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  // ── Global mouse tracking ──────────────────────────────────
  useEffect(() => {
    const handleMove = (e) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      mousePos.current = {
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      };
    };
    window.addEventListener('mousemove', handleMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  // ── Phase 0: Pack tilt on mouse move ───────────────────────
  useEffect(() => {
    if (phase !== 0 || isMobile) return;
    let active = true;
    const tick = () => {
      if (!active || !packWrapRef.current) return;
      const mx = (mousePos.current.x - 0.5) * 2; // -1 to 1
      const my = (mousePos.current.y - 0.5) * 2;
      const ry = mx * 7;  // max ±7deg
      const rx = my * -5; // max ±5deg
      packWrapRef.current.style.transform = `rotateY(${ry}deg) rotateX(${rx}deg)`;
      rafId.current = requestAnimationFrame(tick);
    };
    rafId.current = requestAnimationFrame(tick);
    return () => {
      active = false;
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [phase, isMobile]);

  // ── Phase 4: Card tilt RAF loop ────────────────────────────
  useEffect(() => {
    if (phase !== 4 || isMobile) return;
    let active = true;

    const tick = () => {
      if (!active) return;
      const idx = hoveredCard;
      if (idx !== null && cardRefs.current[idx]) {
        const el = cardRefs.current[idx];
        const rect = el.getBoundingClientRect();
        const cRect = containerRef.current?.getBoundingClientRect();
        if (!cRect) { rafId.current = requestAnimationFrame(tick); return; }
        const mx = mousePos.current.x * cRect.width + cRect.left;
        const my = mousePos.current.y * cRect.height + cRect.top;
        const cx = (mx - rect.left) / rect.width;   // 0-1 within card
        const cy = (my - rect.top) / rect.height;
        const rx = Math.max(-15, Math.min(15, (cy - 0.5) * -30));
        const ry = Math.max(-20, Math.min(20, (cx - 0.5) * 40));
        const sheenAngle = cx * 360;

        el.style.transform = `translateY(-25px) scale(1.15) rotateX(${rx}deg) rotateY(${ry}deg)`;
        el.style.setProperty('--sheen-angle', `${sheenAngle}deg`);
      }
      rafId.current = requestAnimationFrame(tick);
    };

    rafId.current = requestAnimationFrame(tick);
    return () => {
      active = false;
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [phase, hoveredCard, isMobile]);

  // ── Pack click → Phase sequence ────────────────────────────
  const handlePackClick = useCallback(() => {
    if (phase !== 0 || packClicked.current || !packReady) return;
    packClicked.current = true;
    setPhase(1);

    const t1 = setTimeout(() => {
      setPhase(2);

      const t2 = setTimeout(() => {
        setPhase(3);

        // Stagger card flips with self-managing shimmer
        FLIP_ORDER.forEach((cardIdx, i) => {
          const t3 = setTimeout(() => {
            setFlippedCards((prev) => new Set([...prev, cardIdx]));
            setShimmeringCards((prev) => new Set([...prev, cardIdx]));
            // Auto-remove shimmer after animation completes
            const tShimmer = setTimeout(() => {
              setShimmeringCards((prev) => {
                const next = new Set(prev);
                next.delete(cardIdx);
                return next;
              });
            }, 850);
            timers.current.push(tShimmer);
          }, i * 150);
          timers.current.push(t3);
        });

        // After all flips + shimmer done → Phase 4
        const t4 = setTimeout(() => {
          setPhase(4);
          setCardsSettled(true);
          const t5 = setTimeout(() => setShowOverlay(true), 350);
          timers.current.push(t5);
        }, FLIP_ORDER.length * 150 + 1000);
        timers.current.push(t4);
      }, 850);
      timers.current.push(t2);
    }, 650);
    timers.current.push(t1);
  }, [phase, packReady]);

  // ── Card mouse enter/leave ─────────────────────────────────
  const handleCardEnter = useCallback((idx) => {
    if (phase !== 4 || isMobile) return;
    setHoveredCard(idx);
  }, [phase, isMobile]);

  const handleCardLeave = useCallback((idx) => {
    if (hoveredCard !== idx) return;
    // Reset inline transform so CSS transition takes over
    const el = cardRefs.current[idx];
    if (el) {
      el.style.transform = '';
      el.style.removeProperty('--sheen-angle');
    }
    setHoveredCard(null);
  }, [hoveredCard]);

  // ── Mobile tap-to-enlarge ──────────────────────────────────
  const handleCardTap = useCallback((idx) => {
    if (!isMobile || phase !== 4) return;
    setHoveredCard((prev) => (prev === idx ? null : idx));
  }, [isMobile, phase]);

  // ── Visible cards (mobile: only 2,3,4) ─────────────────────
  const visibleCards = isMobile
    ? CARDS.filter((c) => [2, 3, 4].includes(c.index))
    : CARDS;

  // ── X offset multiplier for responsive ─────────────────────
  const xMult = isMobile ? 0.45 : isTablet ? 0.7 : 1;

  // ── Get neighbor class ─────────────────────────────────────
  const getNeighborClass = (cardIdx) => {
    if (hoveredCard === null || cardIdx === hoveredCard) return '';
    const diff = cardIdx - hoveredCard;
    if (diff === -1) return 'hero-card--neighbor-left';
    if (diff === 1) return 'hero-card--neighbor-right';
    return '';
  };

  // ── Compute card inline style ──────────────────────────────
  const getCardStyle = (card) => {
    const base = {
      '--card-x': `${card.xVw * xMult}vw`,
      '--card-y': `${card.y}px`,
      '--card-rot': `${card.rot}deg`,
      '--card-scale': card.scale,
      '--card-z': card.z,
      '--card-glow': card.glow,
      '--bob-delay': `${card.index * 0.6}s`,
      zIndex: hoveredCard === card.index ? 50 : card.z,
    };

    // Neighbor shift
    if (hoveredCard !== null && hoveredCard !== card.index) {
      const diff = card.index - hoveredCard;
      if (Math.abs(diff) === 1) {
        const shiftX = diff > 0 ? 14 : -14;
        const extraRot = diff > 0 ? 3 : -3;
        base.transform = `translateX(calc(${card.xVw * xMult}vw + ${shiftX}px)) translateY(${card.y}px) rotate(${card.rot + extraRot}deg) scale(${card.scale})`;
      }
    }

    // Mobile enlarged
    if (isMobile && hoveredCard === card.index) {
      base.transform = `translateX(${card.xVw * xMult}vw) translateY(-20px) rotate(0deg) scale(1.2)`;
      base.zIndex = 50;
    }

    return base;
  };

  // ── Render ─────────────────────────────────────────────────
  return (
    <section ref={containerRef} className="hero-banner">
      {/* Background */}
      <div className="hero-banner__bg" />
      <div className="hero-banner__noise" aria-hidden="true" />

      {/* Floating Particles */}
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

      {/* ─── Phase 0 & 1: Booster Pack ─────────────────────── */}
      {phase < 2 && (
        <div
          className={`hero-banner__pack ${phase === 1 ? 'hero-banner__pack--ripping' : ''}`}
          style={{ perspective: '800px' }}
        >
          {/* Pulsing glow */}
          <div className="hero-banner__pack-glow" />

          {/* Pack image wrapper (for 3D tilt) */}
          <div
            ref={packWrapRef}
            className="hero-banner__pack-img-wrap"
            onClick={handlePackClick}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handlePackClick(); } }}
            role="button"
            tabIndex={0}
            aria-label="Open booster pack"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Left half */}
            <div
              className="hero-banner__pack-half hero-banner__pack-half--left"
              style={{ backgroundImage: `url(${boosterPack})` }}
            />
            {/* Right half */}
            <div
              className="hero-banner__pack-half hero-banner__pack-half--right"
              style={{ backgroundImage: `url(${boosterPack})` }}
            />
          </div>

          {/* Sparkles (Phase 0 only) */}
          {phase === 0 && (
            <div className="hero-banner__pack-sparkles" aria-hidden="true">
              {Array.from({ length: 8 }).map((_, i) => (
                <span key={i} className="sparkle" />
              ))}
            </div>
          )}

          {/* "Click to open" */}
          {phase === 0 && (
            <p className="hero-banner__pack-prompt">
              {isMobile ? 'Tap to open' : 'Click to open'}
            </p>
          )}

          {/* Flash (Phase 1) */}
          {phase === 1 && <div className="hero-banner__flash" />}

          {/* Energy burst particles (Phase 1) */}
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

      {/* ─── Phase 2-4: Cards ──────────────────────────────── */}
      {phase >= 2 && (
        <div className="hero-banner__cards">
          {visibleCards.map((card) => {
            const isFlipped = flippedCards.has(card.index);
            const isHovered = hoveredCard === card.index;
            const isEmerging = phase === 2;
            const isIdle = cardsSettled && !isHovered && hoveredCard === null;
            const neighborCls = getNeighborClass(card.index);

            return (
              <div
                key={card.index}
                ref={(el) => { cardRefs.current[card.index] = el; }}
                className={[
                  'hero-card',
                  isEmerging && 'hero-card--emerging',
                  isIdle && 'hero-card--idle',
                  isHovered && 'hero-card--hovered',
                  neighborCls,
                ].filter(Boolean).join(' ')}
                style={{
                  ...getCardStyle(card),
                  '--emerge-delay': `${card.index * 80}ms`,
                }}
                onMouseEnter={() => handleCardEnter(card.index)}
                onMouseLeave={() => handleCardLeave(card.index)}
                onClick={() => handleCardTap(card.index)}
              >
                {/* Flip inner */}
                <div className={`hero-card__inner ${isFlipped ? 'hero-card__inner--flipped' : ''}`}>
                  {/* Card Back */}
                  <div className="hero-card__face hero-card__back">
                    <img src={cardBack} alt="Card back" draggable="false" />
                  </div>
                  {/* Card Front */}
                  <div className="hero-card__face hero-card__front">
                    <img src={card.front} alt={card.name} draggable="false" />
                    {/* Holographic sheen */}
                    <div className="hero-card__sheen" />
                    {/* Shimmer on first flip */}
                    {shimmeringCards.has(card.index) && <div className="hero-card__shimmer" />}
                  </div>
                </div>
                {/* Glow shadow */}
                <div className="hero-card__glow-shadow" />
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Phase 4: Overlay Content ──────────────────────── */}
      {showOverlay && (
        <>
          {/* Top: Title + Tagline */}
          <div className="hero-banner__overlay hero-banner__overlay--top">
            <h1 className="hero-banner__title">ELITE TCG</h1>
            <hr className="hero-banner__divider" />
            <p className="hero-banner__tagline">Premium Pokémon Singles — South Africa</p>
          </div>

          {/* Bottom: CTA */}
          <div className="hero-banner__overlay hero-banner__overlay--bottom">
            <button
              className="hero-banner__cta"
              onClick={onShopClick}
              type="button"
            >
              Shop Collection
            </button>
          </div>
        </>
      )}
    </section>
  );
};

export default HeroBanner;
