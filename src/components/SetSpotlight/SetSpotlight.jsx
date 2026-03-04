import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ELITE_API_URL, getImageUrl, PLACEHOLDER_IMAGE } from '../../config/api';

// Fallback themes if canvas/CORS fails
const FALLBACK_THEMES = [
  { bg: 'linear-gradient(135deg, #0f0c29 0%, #302b63 60%, #1a1040 100%)', orbA: '#7c5ce7', orbB: '#a29bfe', shape: 'rgba(162,155,254,0.07)', line: 'rgba(255,255,255,0.05)' },
  { bg: 'linear-gradient(135deg, #2d1515 0%, #6b2020 60%, #3d1010 100%)', orbA: '#e74c3c', orbB: '#ff7675', shape: 'rgba(255,118,117,0.07)', line: 'rgba(255,255,255,0.05)' },
  { bg: 'linear-gradient(135deg, #0a1628 0%, #0d3460 60%, #071020 100%)', orbA: '#0984e3', orbB: '#74b9ff', shape: 'rgba(116,185,255,0.07)', line: 'rgba(255,255,255,0.05)' },
  { bg: 'linear-gradient(135deg, #0d2b1a 0%, #1a5c35 60%, #0a2015 100%)', orbA: '#00b894', orbB: '#55efc4', shape: 'rgba(85,239,196,0.07)', line: 'rgba(255,255,255,0.05)' },
];

const rgbToHsl = (r, g, b) => {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s, l };
};

// Find the most frequently occurring colour (quantized into buckets), excluding black/white/gray
const extractDominantColor = (src) =>
  new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const SIZE = 80;
        const canvas = document.createElement('canvas');
        canvas.width = SIZE; canvas.height = SIZE;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, SIZE, SIZE);
        const { data } = ctx.getImageData(0, 0, SIZE, SIZE);

        const BUCKET = 28; // quantisation step — groups similar shades together
        const buckets = {};

        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] < 30) continue;                               // transparent
          const pr = data[i], pg = data[i+1], pb = data[i+2];
          if (pr > 215 && pg > 215 && pb > 215) continue;              // near-white
          if (pr < 35  && pg < 35  && pb < 35)  continue;              // near-black
          if (Math.max(pr,pg,pb) - Math.min(pr,pg,pb) < 25) continue;  // near-gray

          const key = `${Math.round(pr/BUCKET)},${Math.round(pg/BUCKET)},${Math.round(pb/BUCKET)}`;
          buckets[key] = (buckets[key] || 0) + 1;
        }

        let best = null, bestCount = 0;
        for (const [key, count] of Object.entries(buckets)) {
          if (count > bestCount) { bestCount = count; best = key; }
        }

        if (!best) return resolve(null);
        const [r, g, b] = best.split(',').map(n => Math.round(n * BUCKET));
        resolve({ r, g, b });
      } catch { resolve(null); }
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });

// Build a muted theme from an extracted RGB colour — dark enough for white text
const buildTheme = ({ r, g, b }) => {
  const { h, s } = rgbToHsl(r, g, b);
  const sat = Math.round(Math.max(s, 0.4) * 65); // muted — max ~65% saturation
  return {
    bg:    `linear-gradient(135deg, hsl(${h},${sat}%,12%) 0%, hsl(${h},${sat}%,20%) 60%, hsl(${h},${sat}%,14%) 100%)`,
    orbA:  `hsl(${h},${sat}%,42%)`,
    orbB:  `hsl(${h},${Math.round(sat*0.85)}%,58%)`,
    shape: `hsla(${h},${sat}%,70%,0.07)`,
    line:  'rgba(255,255,255,0.05)',
  };
};

// ── Desktop templates (landscape 900×380) ──────────────────────────────────

const Template1 = ({ s, l, className = '' }) => (
  <svg className={`absolute inset-0 w-full h-full ${className}`} viewBox="0 0 900 380" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <line x1="-50" y1="480" x2="480"  y2="-50" stroke={l} strokeWidth="80" />
    <line x1="200" y1="480" x2="720"  y2="-50" stroke={l} strokeWidth="40" />
    <line x1="600" y1="480" x2="1050" y2="-50" stroke={l} strokeWidth="60" />
    <polygon points="80,260 120,283 120,330 80,353 40,330 40,283" fill="none" stroke={s} strokeWidth="1" />
    <polygon points="30,100 70,123 70,170 30,193 -10,170 -10,123" fill={s} />
    <circle cx="160" cy="320" r="80" fill="none" stroke={s} strokeWidth="0.8" />
    <circle cx="160" cy="60"  r="3"   fill={s} />
    <circle cx="680" cy="30"  r="2.5" fill={s} />
    <circle cx="50"  cy="200" r="3"   fill={s} />
    <circle cx="880" cy="300" r="4"   fill={s} />
  </svg>
);

const Template2 = ({ s, l, className = '' }) => (
  <svg className={`absolute inset-0 w-full h-full ${className}`} viewBox="0 0 900 380" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <circle cx="780" cy="380" r="340" fill={l} />
    <circle cx="780" cy="380" r="340" fill="none" stroke={s} strokeWidth="1" />
    <circle cx="600" cy="60"  r="220" fill="none" stroke={s} strokeWidth="0.8" />
    <circle cx="880" cy="100" r="180" fill="none" stroke={s} strokeWidth="0.7" />
    <circle cx="400" cy="320" r="140" fill="none" stroke={s} strokeWidth="0.6" />
    <circle cx="60"  cy="60"  r="30"  fill="none" stroke={s} strokeWidth="0.8" />
    <circle cx="60"  cy="60"  r="6"   fill={s} />
    <circle cx="150" cy="330" r="3"   fill={s} />
    <circle cx="820" cy="30"  r="2.5" fill={s} />
    <circle cx="50"  cy="200" r="2"   fill={s} />
  </svg>
);

const Template3 = ({ s, l, className = '' }) => {
  const dots = [];
  for (let x = 420; x <= 880; x += 38)
    for (let y = 20; y <= 360; y += 38)
      dots.push(<circle key={`${x}-${y}`} cx={x} cy={y} r="1.6" fill={s} />);
  return (
    <svg className={`absolute inset-0 w-full h-full ${className}`} viewBox="0 0 900 380" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      {dots}
      <path d="M 900 0 A 380 380 0 0 1 520 380" fill="none" stroke={l} strokeWidth="70" />
      <path d="M 900 0 A 280 280 0 0 1 620 280" fill="none" stroke={s} strokeWidth="1" />
      <circle cx="80" cy="80"  r="50" fill="none" stroke={s} strokeWidth="0.8" />
      <circle cx="80" cy="80"  r="20" fill="none" stroke={s} strokeWidth="0.5" />
      <circle cx="50" cy="300" r="3"  fill={s} />
    </svg>
  );
};

const Template4 = ({ s, l, className = '' }) => (
  <svg className={`absolute inset-0 w-full h-full ${className}`} viewBox="0 0 900 380" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <polygon points="0,380 300,0 500,0 200,380"   fill={l} />
    <polygon points="400,380 650,0 750,0 500,380"  fill={l} />
    <polygon points="60,40 120,140 0,140"           fill="none" stroke={s} strokeWidth="1" />
    <polygon points="820,20 880,120 760,120"        fill="none" stroke={s} strokeWidth="1" />
    <polygon points="200,280 260,360 140,360"       fill={s} />
    <rect x="680" y="260" width="40" height="40" fill="none" stroke={s} strokeWidth="0.8" transform="rotate(45 700 280)" />
    <rect x="120" y="160" width="24" height="24" fill={s} transform="rotate(45 132 172)" />
    <rect x="820" y="80"  width="18" height="18" fill="none" stroke={s} strokeWidth="0.8" transform="rotate(45 829 89)" />
    <circle cx="350" cy="50"  r="2.5" fill={s} />
    <circle cx="550" cy="340" r="3"   fill={s} />
    <circle cx="850" cy="340" r="2"   fill={s} />
  </svg>
);

const Template5 = ({ s, l, className = '' }) => (
  <svg className={`absolute inset-0 w-full h-full ${className}`} viewBox="0 0 900 380" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <path d="M -100 280 Q 250 100 600 260 Q 800 350 1000 200" fill="none" stroke={l} strokeWidth="90" />
    <path d="M -100 100 Q 300 300 650  80 Q 850  0 1000 160" fill="none" stroke={l} strokeWidth="50" />
    <path d="M 0 380 Q 450 -60 900 380"   fill="none" stroke={s} strokeWidth="1" />
    <path d="M 0 300 Q 400  20 900 300"   fill="none" stroke={s} strokeWidth="0.7" />
    <path d="M -80 200 Q 200 380 500 150 Q 700 0 950 250" fill="none" stroke={s} strokeWidth="0.5" />
    <circle cx="60"  cy="60"  r="3"   fill={s} />
    <circle cx="450" cy="30"  r="2.5" fill={s} />
    <circle cx="860" cy="100" r="4"   fill={s} />
    <circle cx="200" cy="350" r="2"   fill={s} />
  </svg>
);

// ── Mobile templates (portrait 400×420) ────────────────────────────────────

const MobileTemplate1 = ({ s, l, className = '' }) => (
  <svg className={`absolute inset-0 w-full h-full ${className}`} viewBox="0 0 400 420" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <line x1="-60" y1="520" x2="460"  y2="-60" stroke={l} strokeWidth="80" />
    <line x1="140" y1="520" x2="660"  y2="-60" stroke={l} strokeWidth="40" />
    <line x1="-180" y1="520" x2="340" y2="-60" stroke={l} strokeWidth="55" />
    <polygon points="60,320 92,338 92,375 60,393 28,375 28,338" fill="none" stroke={s} strokeWidth="1" />
    <polygon points="18,110 50,128 50,165 18,183 -14,165 -14,128" fill={s} />
    <circle cx="340" cy="60"  r="3"   fill={s} />
    <circle cx="380" cy="210" r="2.5" fill={s} />
    <circle cx="50"  cy="50"  r="2"   fill={s} />
    <circle cx="290" cy="390" r="3"   fill={s} />
  </svg>
);

const MobileTemplate2 = ({ s, l, className = '' }) => (
  <svg className={`absolute inset-0 w-full h-full ${className}`} viewBox="0 0 400 420" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <circle cx="360" cy="420" r="320" fill={l} />
    <circle cx="360" cy="420" r="320" fill="none" stroke={s} strokeWidth="1" />
    <circle cx="140" cy="50"  r="210" fill="none" stroke={s} strokeWidth="0.8" />
    <circle cx="390" cy="80"  r="160" fill="none" stroke={s} strokeWidth="0.7" />
    <circle cx="40"  cy="300" r="110" fill="none" stroke={s} strokeWidth="0.6" />
    <circle cx="28"  cy="52"  r="32"  fill="none" stroke={s} strokeWidth="0.8" />
    <circle cx="28"  cy="52"  r="6"   fill={s} />
    <circle cx="370" cy="160" r="2.5" fill={s} />
    <circle cx="90"  cy="400" r="2"   fill={s} />
  </svg>
);

const MobileTemplate3 = ({ s, l, className = '' }) => {
  const dots = [];
  for (let x = 210; x <= 400; x += 34)
    for (let y = 20; y <= 410; y += 34)
      dots.push(<circle key={`${x}-${y}`} cx={x} cy={y} r="1.5" fill={s} />);
  return (
    <svg className={`absolute inset-0 w-full h-full ${className}`} viewBox="0 0 400 420" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      {dots}
      <path d="M 400 0 A 420 420 0 0 1 0 400" fill="none" stroke={l} strokeWidth="70" />
      <path d="M 400 0 A 310 310 0 0 1 90 310" fill="none" stroke={s} strokeWidth="1" />
      <circle cx="60" cy="80"  r="45" fill="none" stroke={s} strokeWidth="0.8" />
      <circle cx="60" cy="80"  r="18" fill="none" stroke={s} strokeWidth="0.5" />
      <circle cx="40" cy="390" r="3"  fill={s} />
    </svg>
  );
};

const MobileTemplate4 = ({ s, l, className = '' }) => (
  <svg className={`absolute inset-0 w-full h-full ${className}`} viewBox="0 0 400 420" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <polygon points="0,420 180,0 320,0 140,420"   fill={l} />
    <polygon points="180,420 330,0 400,0 250,420"  fill={l} />
    <polygon points="36,40 96,130 -24,130"         fill="none" stroke={s} strokeWidth="1" />
    <polygon points="316,20 376,110 256,110"        fill="none" stroke={s} strokeWidth="1" />
    <polygon points="70,300 130,390 10,390"         fill={s} />
    <rect x="290" y="280" width="40" height="40" fill="none" stroke={s} strokeWidth="0.8" transform="rotate(45 310 300)" />
    <rect x="130" y="180" width="24" height="24" fill={s} transform="rotate(45 142 192)" />
    <circle cx="210" cy="50"  r="2.5" fill={s} />
    <circle cx="340" cy="380" r="3"   fill={s} />
  </svg>
);

const MobileTemplate5 = ({ s, l, className = '' }) => (
  <svg className={`absolute inset-0 w-full h-full ${className}`} viewBox="0 0 400 420" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <path d="M -100 300 Q 100 140 300 290 Q 380 340 500 220" fill="none" stroke={l} strokeWidth="90" />
    <path d="M -100 130 Q 140 310 340 110 Q 410 30 520 170" fill="none" stroke={l} strokeWidth="50" />
    <path d="M 0 420 Q 200 -30 400 420"   fill="none" stroke={s} strokeWidth="1" />
    <path d="M 0 340 Q 180 70 400 340"    fill="none" stroke={s} strokeWidth="0.7" />
    <path d="M -60 230 Q 100 400 240 160 Q 310 20 460 260" fill="none" stroke={s} strokeWidth="0.5" />
    <circle cx="38"  cy="60"  r="3"   fill={s} />
    <circle cx="196" cy="28"  r="2.5" fill={s} />
    <circle cx="368" cy="108" r="4"   fill={s} />
    <circle cx="96"  cy="394" r="2"   fill={s} />
  </svg>
);

const DESKTOP_TEMPLATES = [Template1, Template2, Template3, Template4, Template5];
const MOBILE_TEMPLATES  = [MobileTemplate1, MobileTemplate2, MobileTemplate3, MobileTemplate4, MobileTemplate5];

const ShapeLayer = ({ theme, banner, index, mobile = false, className = '' }) => {
  const templates = mobile ? MOBILE_TEMPLATES : DESKTOP_TEMPLATES;
  const templateIdx = banner?.svg_template != null
    ? (banner.svg_template - 1) % templates.length
    : index % templates.length;
  const T = templates[templateIdx];
  return <T s={theme.shape} l={theme.line} className={className} />;
};

const SetSpotlight = () => {
  const [sets, setSets]           = useState([]);
  const [themes, setThemes]       = useState([]);
  const [current, setCurrent]     = useState(0);
  const [loading, setLoading]     = useState(true);
  const [saleSetIds, setSaleSetIds] = useState(new Set());
  const [dragOffset, setDragOffset] = useState(0);
  const isDragging = useRef(false);
  const timerRef   = useRef(null);
  const touchX     = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bannersRes, prodsRes] = await Promise.all([
          fetch(`${ELITE_API_URL}/api/banners`),
          fetch(`${ELITE_API_URL}/api/products?limit=200`),
        ]);
        const bannersData = await bannersRes.json();
        const prodsData   = await prodsRes.json();

        const onSaleIds = new Set(
          (prodsData.products || [])
            .filter(p => p.compare_at_price && Number(p.compare_at_price) > Number(p.price))
            .map(p => p.set_id)
            .filter(Boolean)
        );
        setSaleSetIds(onSaleIds);

        const banners = bannersData.banners || [];
        setSets(banners);

        // Extract dominant colour for every slide upfront
        const extracted = await Promise.all(
          banners.map(async (b, i) => {
            if (b.type === 'image') return FALLBACK_THEMES[i % FALLBACK_THEMES.length];
            const src = getImageUrl(b.set?.logo_url || b.image_url);
            if (!src || src === PLACEHOLDER_IMAGE) return FALLBACK_THEMES[i % FALLBACK_THEMES.length];
            const color = await extractDominantColor(src);
            return color ? buildTheme(color) : FALLBACK_THEMES[i % FALLBACK_THEMES.length];
          })
        );
        setThemes(extracted);
      } catch {}
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (sets.length <= 1) return;
    timerRef.current = setInterval(() => setCurrent(c => (c + 1) % sets.length), 5000);
    return () => clearInterval(timerRef.current);
  }, [sets.length]);

  const goTo = (i) => { clearInterval(timerRef.current); setCurrent(i); };
  const prev = () => { clearInterval(timerRef.current); setCurrent(c => (c - 1 + sets.length) % sets.length); };
  const next = () => { clearInterval(timerRef.current); setCurrent(c => (c + 1) % sets.length); };

  const onTouchStart = (e) => {
    touchX.current = e.touches[0].clientX;
    isDragging.current = true;
  };
  const onTouchMove = (e) => {
    if (!isDragging.current || touchX.current === null) return;
    setDragOffset(e.touches[0].clientX - touchX.current);
  };
  const onTouchEnd = () => {
    isDragging.current = false;
    const dx = dragOffset;
    setDragOffset(0);
    touchX.current = null;
    if (Math.abs(dx) < 50) return;
    dx < 0 ? next() : prev();
  };

  if (loading || sets.length === 0) return null;

  return (
    <>
    {/* Outer clip so slides don't show outside the banner */}
    <div className="relative overflow-hidden" style={{ minHeight: '340px' }}>

      {/* Track — all slides side by side */}
      <div
        style={{
          display: 'flex',
          width: '100%',
          transform: `translateX(calc(-${current * 100}% + ${dragOffset}px))`,
          transition: isDragging.current ? 'none' : 'transform 0.42s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          willChange: 'transform',
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {sets.map((banner, i) => {
          const theme   = themes[i] || FALLBACK_THEMES[i % FALLBACK_THEMES.length];
          const isImage = banner.type === 'image';
          const setData = banner.set || {};
          const logoSrc = getImageUrl(setData.logo_url || banner.image_url) || PLACEHOLDER_IMAGE;
          const title    = banner.title || setData.name || '';
          const subtitle = banner.subtitle || '';
          const ctaLabel = banner.cta_label || '';
          const ctaUrl   = banner.cta_url || (setData.id ? `/sets/${setData.id}` : '/products');
          const hasSale  = saleSetIds.has(setData.id) || saleSetIds.has(banner.set_id);

          return (
            <div
              key={banner.id}
              style={{
                minWidth: '100%',
                position: 'relative',
                overflow: 'hidden',
                background: theme.bg,
                minHeight: '420px',
              }}
            >
              {/* Orbs + shapes — always visible (image covers them on desktop) */}
              <div className="absolute -top-24 -right-24 w-[500px] h-[500px] rounded-full pointer-events-none"
                style={{ background: theme.orbA, filter: 'blur(100px)', opacity: 0.35 }} />
              <div className="absolute -bottom-24 -left-16 w-[340px] h-[340px] rounded-full pointer-events-none"
                style={{ background: theme.orbB, filter: 'blur(80px)', opacity: 0.22 }} />
              <ShapeLayer theme={theme} banner={banner} index={i} className="hidden md:block" />
              <ShapeLayer theme={theme} banner={banner} index={i} mobile className="md:hidden" />

              {/* Background image — desktop only */}
              {isImage && banner.image_url && (
                <img src={getImageUrl(banner.image_url)} alt={title}
                  className="absolute inset-0 w-full h-full object-cover hidden md:block" />
              )}

              {/* ── MOBILE layout ── */}
              <div className="flex md:hidden flex-col items-center justify-center text-center px-8" style={{ minHeight: '420px' }}>
                {(banner.label || hasSale) && (
                  <div className="flex items-center justify-center gap-2 mb-3">
                    {banner.label && (
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-white/60 animate-pulse" />
                        <span className="text-[11px] font-medium tracking-[0.22em] uppercase text-white/60">{banner.label}</span>
                      </span>
                    )}
                    {hasSale && <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-red-500 text-white">Sale</span>}
                  </div>
                )}
                <h1 className="text-[1.6rem] font-extrabold text-white tracking-tight leading-tight mb-2 drop-shadow-sm">{title}</h1>
                {subtitle && <p className="text-sm text-white/50 mb-5 max-w-[260px]">{subtitle}</p>}
                {ctaLabel && (
                  <Link to={ctaUrl} className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium rounded-full bg-white text-gray-900 hover:bg-white/90 transition-colors shadow-lg mb-8">
                    {ctaLabel}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m9 18 6-6-6-6"/></svg>
                  </Link>
                )}
              </div>

              {/* ── DESKTOP layout ── */}
              <div className="hidden md:flex max-w-7xl mx-auto px-14 items-center gap-16" style={{ minHeight: '340px' }}>
                {/* Text */}
                <div className="flex-1 min-w-0 py-12">
                  {(banner.label || hasSale) && (
                    <div className="flex items-center gap-2 mb-5">
                      {banner.label && (
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-white/60 animate-pulse" />
                          <span className="text-[11px] font-medium tracking-[0.22em] uppercase text-white/60">{banner.label}</span>
                        </span>
                      )}
                      {hasSale && <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-red-500 text-white">Sale</span>}
                    </div>
                  )}
                  <h1 className="text-5xl font-extrabold text-white tracking-tight leading-tight mb-3 drop-shadow-sm">{title}</h1>
                  {subtitle && <p className="text-sm text-white/50 mb-8 max-w-xs">{subtitle}</p>}
                  <div className="flex items-center gap-3 flex-wrap">
                    {ctaLabel && (
                      <Link to={ctaUrl} className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium rounded-full bg-white text-gray-900 hover:bg-white/90 transition-colors shadow-lg">
                        {ctaLabel}
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m9 18 6-6-6-6"/></svg>
                      </Link>
                    )}
                    {!isImage && (
                      <>
                        <Link to="/products?category=booster_box" className="inline-flex items-center px-5 py-2.5 text-sm font-medium rounded-full border border-white/25 text-white/80 hover:bg-white/10 transition-colors">Booster Boxes</Link>
                        <Link to="/products?category=etb" className="inline-flex items-center px-5 py-2.5 text-sm font-medium rounded-full border border-white/25 text-white/80 hover:bg-white/10 transition-colors">ETBs</Link>
                      </>
                    )}
                  </div>
                </div>
                {/* Logo */}
                {!isImage && (
                  <div className="shrink-0 relative flex items-center justify-center py-8">
                    <div className="absolute w-72 h-72 rounded-full border border-white/10"
                      style={{ animation: 'spin 18s linear infinite' }} />
                    <svg className="absolute w-60 h-60" viewBox="0 0 240 240"
                      style={{ animation: 'spin 12s linear infinite reverse' }}>
                      <circle cx="120" cy="120" r="118" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="6 28" />
                    </svg>
                    <img src={logoSrc} alt={title}
                      className="relative z-10 h-52 w-auto max-w-[320px] object-contain drop-shadow-2xl"
                      onError={e => { e.target.src = PLACEHOLDER_IMAGE; }} />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop arrows */}
      {sets.length > 1 && (
        <>
          <button onClick={prev} aria-label="Previous"
            className="absolute hidden md:flex left-5 top-1/2 -translate-y-1/2 z-20 items-center justify-center w-10 h-10 rounded-full transition-all duration-200"
            style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.14)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.16)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <button onClick={next} aria-label="Next"
            className="absolute hidden md:flex right-5 top-1/2 -translate-y-1/2 z-20 items-center justify-center w-10 h-10 rounded-full transition-all duration-200"
            style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.14)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.16)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>

    {/* Dots */}
    {sets.length > 1 && (
      <div className="flex items-center justify-center gap-1.5 py-3 bg-white">
        {sets.map((_, i) => (
          <button key={i} onClick={() => goTo(i)} className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? 'w-6 bg-gray-800' : 'w-1.5 bg-gray-300'}`} />
        ))}
      </div>
    )}
    </>
  );
};

export default SetSpotlight;
