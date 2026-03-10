import { useState, useCallback, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { RotateCcw, CreditCard, Truck, ChevronLeft, ChevronRight } from 'lucide-react';
import SEO from '../../components/SEO/SEO';
import { ELITE_API_URL } from '../../config/api';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import './PackOpening.css';
import codeCardImg from '../../assets/images/code_card.jpg';

/* ─── Pack art images ─── */
import sv9Pack from '../../assets/packs/Journey-Together-Pack.png';
import sv8pt5Pack from '../../assets/packs/prismatic-evolution.png';
import sv8Pack from '../../assets/packs/surging-sparks.png';
import sv4pt5Pack from '../../assets/packs/PaldeanFates.png';
import sv3pt5Pack from '../../assets/packs/151(Pokemon).png';
import sv2Pack from '../../assets/packs/Paldea-Evolved.png';
import swsh8Pack from '../../assets/packs/fusion-strike.png';
import swsh7Pack from '../../assets/packs/evolving-skies.png';
import swsh6Pack from '../../assets/packs/Chilling-Reign.png';
import sv10Pack from '../../assets/packs/destinedrivals.png';
import sv10pt5bPack from '../../assets/packs/black-bolt.png';
import sv10pt5wPack from '../../assets/packs/white-flare.png';
import me01Pack from '../../assets/packs/mega-evolution.png';
import me02Pack from '../../assets/packs/phantasmal-flames.png';
import me02pt5Pack from '../../assets/packs/ascended-heroes.png';

/* ─── Set logos (for confirm screen) ─── */
import sv9Logo from '../../assets/images/sets/sv9.png';
import sv8pt5Logo from '../../assets/images/sets/sv8pt5.png';
import sv8Logo from '../../assets/images/sets/sv8.png';
import sv4pt5Logo from '../../assets/images/sets/sv4pt5.png';
import sv3pt5Logo from '../../assets/images/sets/sv3pt5.png';
import sv2Logo from '../../assets/images/sets/sv2.png';
import swsh8Logo from '../../assets/images/sets/swsh8.png';
import swsh7Logo from '../../assets/images/sets/swsh7.png';
import swsh6Logo from '../../assets/images/sets/swsh6.png';
import sv10Logo from '../../assets/images/sets/sv10.png';
import sv10pt5bLogo from '../../assets/images/sets/sv10pt5b.png';
import sv10pt5wLogo from '../../assets/images/sets/sv10pt5w.png';
import me01Logo from '../../assets/images/sets/me01.png';
import me02Logo from '../../assets/images/sets/me02.png';
import me02pt5Logo from '../../assets/images/sets/me02pt5.png';

/* ─── Set catalogue ─── */
const PACK_SETS = [
  { id: 'me02pt5',  name: 'Ascended Heroes',      series: 'Mega Evolution',   total: 295, releaseDate: '2026/01/30', img: me02pt5Pack,  logo: me02pt5Logo,  price: 29.99 },
  { id: 'me02',     name: 'Phantasmal Flames',     series: 'Mega Evolution',   total: 130, releaseDate: '2025/11/14', img: me02Pack,     logo: me02Logo,     price: 29.99 },
  { id: 'me01',     name: 'Mega Evolution',        series: 'Mega Evolution',   total: 188, releaseDate: '2025/09/26', img: me01Pack,     logo: me01Logo,     price: 29.99 },
  { id: 'sv10pt5b', name: 'Black Bolt',            series: 'Scarlet & Violet', total: 172, releaseDate: '2025/07/17', img: sv10pt5bPack, logo: sv10pt5bLogo, price: 29.99 },
  { id: 'sv10pt5w', name: 'White Flare',           series: 'Scarlet & Violet', total: 173, releaseDate: '2025/07/17', img: sv10pt5wPack, logo: sv10pt5wLogo, price: 29.99 },
  { id: 'sv10',     name: 'Destined Rivals',       series: 'Scarlet & Violet', total: 244, releaseDate: '2025/05/30', img: sv10Pack,     logo: sv10Logo,     price: 24.99 },
  { id: 'sv9',      name: 'Journey Together',      series: 'Scarlet & Violet', total: 167, releaseDate: '2025/03/28', img: sv9Pack,      logo: sv9Logo,      price: 24.99 },
  { id: 'sv8pt5',   name: 'Prismatic Evolutions',  series: 'Scarlet & Violet', total: 175, releaseDate: '2025/01/17', img: sv8pt5Pack,   logo: sv8pt5Logo,   price: 29.99 },
  { id: 'sv8',      name: 'Surging Sparks',        series: 'Scarlet & Violet', total: 191, releaseDate: '2024/11/08', img: sv8Pack,      logo: sv8Logo,      price: 24.99 },
  { id: 'sv4pt5',   name: 'Paldean Fates',         series: 'Scarlet & Violet', total: 245, releaseDate: '2024/01/26', img: sv4pt5Pack,   logo: sv4pt5Logo,   price: 29.99 },
  { id: 'sv3pt5',   name: '151',                   series: 'Scarlet & Violet', total: 207, releaseDate: '2023/09/22', img: sv3pt5Pack,   logo: sv3pt5Logo,   price: 34.99 },
  { id: 'sv2',      name: 'Paldea Evolved',        series: 'Scarlet & Violet', total: 193, releaseDate: '2023/06/09', img: sv2Pack,      logo: sv2Logo,      price: 24.99 },
  { id: 'swsh8',    name: 'Fusion Strike',         series: 'Sword & Shield',   total: 264, releaseDate: '2021/11/12', img: swsh8Pack,    logo: swsh8Logo,    price: 29.99 },
  { id: 'swsh7',    name: 'Evolving Skies',        series: 'Sword & Shield',   total: 203, releaseDate: '2021/08/27', img: swsh7Pack,    logo: swsh7Logo,    price: 39.99 },
  { id: 'swsh6',    name: 'Chilling Reign',        series: 'Sword & Shield',   total: 198, releaseDate: '2021/06/18', img: swsh6Pack,    logo: swsh6Logo,    price: 29.99 },
];

const CARDS_PER_PACK = 8;
import cardBackImg from '../../assets/images/card_back.jpg';
const CARD_BACK = cardBackImg;

const PULL_RATES = [
  'Holo Rare',
  'Ultra Rare',
  'Full Art',
  'Alt Art',
  'Secret Rare',
  'Illustration Rare',
  'Special Art Rare',
];

/* ─── Fan offset ─── */
const fanOffset = (stackPos, total) => {
  const x = stackPos * -14;
  const y = stackPos * -12;
  const rot = 0;
  const scale = 1 - stackPos * 0.03;
  return {
    transform: `translate(${x}px, ${y}px) rotate(${rot}deg) scale(${scale})`,
    zIndex: total - stackPos,
    filter: stackPos > 0 ? `drop-shadow(4px 4px 8px rgba(0,0,0,0.4))` : `drop-shadow(2px 2px 6px rgba(0,0,0,0.2))`,
  };
};

const makeSparkles = (color, n) =>
  Array.from({ length: n }, (_, i) => {
    const a = (Math.PI * 2 * i) / n;
    const d = 30 + Math.random() * 60;
    return { id: i, tx: `${Math.cos(a) * d}px`, ty: `${Math.sin(a) * d}px`, size: 3 + Math.random() * 5, delay: Math.random() * 0.15, color };
  });

const preloadImages = (urls) =>
  Promise.all(urls.map(url => new Promise((resolve) => {
    const img = new Image();
    img.onload = resolve;
    img.onerror = resolve;
    img.src = url;
  })));

/* ─── Main Component ─── */
const PackOpening = () => {
  const { setId } = useParams();
  const navigate = useNavigate();
  const selectedSet = PACK_SETS.find(s => s.id === setId);
  const { getToken } = useAuth();

  const api = async (path, opts = {}) => {
    const token = await getToken();
    const res = await fetch(`${ELITE_API_URL}/api/packs${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      ...opts,
    });
    if (!res.ok) throw new Error(`API error ${res.status}`);
    return res.json();
  };

  const [phase, setPhase] = useState('confirm');
  const [selectedImage, setSelectedImage] = useState(0);
  const [packCards, setPackCards] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [cardState, setCardState] = useState('idle');
  const [revealedCards, setRevealedCards] = useState([]);
  const [packsOpened, setPacksOpened] = useState(0);
  const [flash, setFlash] = useState(null);
  const [sparkles, setSparkles] = useState([]);
  const [isOpening, setIsOpening] = useState(false);
  const [shaking, setShaking] = useState(false);
  const { dark } = useTheme();

  // Theme helpers — d = dark value, l = light value
  const t = (d, l) => dark ? d : l;

  const [fairness, setFairness] = useState(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const busyRef = useRef(false);
  const stackRef = useRef(null);
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [flippedCards, setFlippedCards] = useState([]);

  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  // Hide navbar only during immersive phases (loading, cards, done)
  useEffect(() => {
    if (phase === 'loading' || phase === 'cards' || phase === 'done') {
      document.body.classList.add('pack-immersive');
      document.body.style.overflow = 'hidden';
    } else {
      document.body.classList.remove('pack-immersive');
      document.body.style.overflow = '';
    }
    return () => { document.body.classList.remove('pack-immersive'); document.body.style.overflow = ''; };
  }, [phase]);

  useEffect(() => {
    if (!selectedSet) return;
    api('/seed').then(setFairness).catch(() => {});
    preloadImages([CARD_BACK]);
  }, [selectedSet]);

  // Staggered card flip on done phase
  useEffect(() => {
    if (phase !== 'done') { setFlippedCards([]); return; }
    const timers = [];
    for (let i = 0; i < packCards.length; i++) {
      timers.push(setTimeout(() => {
        setFlippedCards(prev => [...prev, i]);
      }, 200 + i * 80));
    }
    return () => timers.forEach(clearTimeout);
  }, [phase, packCards]);

  // Scroll arrows for done phase
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const check = () => {
      setCanScrollLeft(el.scrollLeft > 2);
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
    };
    check();
    el.addEventListener('scroll', check);
    window.addEventListener('resize', check);
    return () => { el.removeEventListener('scroll', check); window.removeEventListener('resize', check); };
  }, [phase, packCards]);

  // 3D tilt on card stack
  const handlePointerMove = useCallback((e) => {
    if (!stackRef.current) return;
    const rect = stackRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const x = (e.clientX - cx) / (rect.width / 2);
    const y = (e.clientY - cy) / (rect.height / 2);
    setTilt({ x: y * -5, y: x * 5 });
  }, []);

  const handlePointerLeave = useCallback(() => {
    setTilt({ x: 0, y: 0 });
  }, []);

  const openPack = useCallback(async () => {
    if (isOpening || !selectedSet) return;
    setIsOpening(true);
    setPhase('loading');
    scrollTop();

    try {
      const data = await api('/open', {
        method: 'POST',
        body: JSON.stringify({ setId: selectedSet.id }),
      });

      const imageUrls = data.cards.flatMap(c => [c.image, c.imageLarge].filter(Boolean));
      await preloadImages(imageUrls);

      const codeCard = { id: 'code-card', name: 'Code Card', image: codeCardImg, imageLarge: codeCardImg, priceZar: null, rarity: 'common', isCodeCard: true };
      setPackCards([codeCard, ...data.cards]);
      setFairness(data.fairness);
      setCurrentIdx(0);
      setCardState('idle');
      setRevealedCards([]);
      setSparkles([]);

      setPhase('cards');
      setPacksOpened(p => p + 1);
    } catch (err) {
      console.error('Failed to open pack:', err);
      setPhase('confirm');
    } finally {
      setIsOpening(false);
    }
  }, [isOpening, selectedSet]);

  const flipCard = useCallback(() => {
    if (cardState !== 'idle' || phase !== 'cards' || busyRef.current) return;
    busyRef.current = true;
    setCardState('flipped');

    const card = packCards[currentIdx];
    if (card.rarity === 'ultra_rare') {
      setFlash('gold'); setSparkles(makeSparkles('#D4AF37', 20));
      setTimeout(() => setFlash(null), 450);
    } else if (card.rarity === 'rare') {
      setFlash('blue'); setSparkles(makeSparkles('#2563EB', 12));
      setTimeout(() => setFlash(null), 300);
    } else if (card.rarity === 'uncommon') {
      setSparkles(makeSparkles('#16A34A', 8));
    } else {
      setSparkles([]);
    }
    setTimeout(() => { busyRef.current = false; }, 600);
  }, [cardState, phase, packCards, currentIdx]);

  const nextCard = useCallback(() => {
    if (cardState !== 'flipped' || busyRef.current) return;
    busyRef.current = true;
    setCardState('swiping');
    setSparkles([]);

    setTimeout(() => {
      setRevealedCards(prev => [...prev, packCards[currentIdx]]);
      if (currentIdx < packCards.length - 1) {
        setCurrentIdx(prev => prev + 1);
        setCardState('idle');
        setTimeout(() => {
          busyRef.current = false;
        }, 350);
      } else {
        setPhase('done');
        busyRef.current = false;
      }
    }, 550);
  }, [cardState, packCards, currentIdx]);

  const handleCardClick = useCallback(() => {
    if (cardState === 'idle') flipCard();
    else if (cardState === 'flipped') nextCard();
  }, [cardState, flipCard, nextCard]);

  const openAnother = useCallback(() => {
    setPhase('confirm');
    setPackCards([]);
    setCurrentIdx(0);
    setCardState('idle');
    setRevealedCards([]);
    setSparkles([]);
  }, []);

  const remaining = packCards.length - currentIdx;
  const totalValue = packCards.reduce((sum, c) => sum + (c.priceZar || 0), 0);

  // Redirect if invalid set ID
  if (!selectedSet) {
    return (
      <div className="fixed inset-0 z-30 flex flex-col items-center justify-center" style={{ background: '#111111' }}>
        <p className="text-white/60 text-sm mb-4">Pack not found</p>
        <Link to="/elite-rips" className="text-white/40 text-sm hover:text-white/60 transition-colors">← Back to Elite Rips</Link>
      </div>
    );
  }

  const isImmersive = phase === 'loading' || phase === 'cards' || phase === 'done';

  return (
    <div className={`${isImmersive ? 'fixed inset-0 z-30' : 'min-h-screen'} overflow-y-auto transition-colors duration-300 ${t('bg-black', 'bg-white')}`}>
      <SEO title={`${selectedSet.name} – Elite Rips`} description={`Open a ${selectedSet.name} pack and discover rare cards.`} path={`/elite-rips/${setId}`} noindex />

      {flash && (
        <div className="fixed inset-0 z-[60] pointer-events-none flash-overlay" style={{
          backgroundColor: flash === 'gold' ? 'rgba(212,175,55,0.25)' : flash === 'blue' ? 'rgba(37,99,235,0.15)' : t('rgba(255,255,255,0.5)', 'rgba(0,0,0,0.08)'),
        }} />
      )}

      {/* ═══ CONFIRM ═══ */}
      {phase === 'confirm' && selectedSet && (
        <div className={`min-h-screen ${t('bg-black', 'bg-white')}`}>
          <div className="container py-6 md:py-12 lg:py-16 px-2 md:px-0">
            {/* Breadcrumb */}
            <nav className={`flex items-center gap-2 text-sm mb-5 md:mb-10 ${t('text-white/30', 'text-gray-500')}`}>
              <Link to="/elite-rips" className={`flex items-center gap-1 transition-colors ${t('hover:text-white/60', 'hover:text-gray-900')}`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                Back to Packs
              </Link>
            </nav>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8 lg:gap-16 max-w-5xl mx-auto">
              {/* Image Section */}
              <div className="space-y-3">
                {/* Main image */}
                <div className={`relative aspect-square rounded-2xl flex items-center justify-center overflow-hidden max-w-full md:max-w-[85%] md:mx-auto border ${t('bg-white/[0.03] border-white/[0.06]', 'bg-white border-gray-200')}`}>
                  <img
                    src={selectedImage === 0 ? selectedSet.img : selectedSet.logo}
                    alt={selectedSet.name}
                    className={`object-contain ${selectedImage === 0 ? 'w-[60%] h-[60%]' : 'w-[70%] max-h-[40%]'}`}
                  />
                </div>

                {/* Thumbnails */}
                <div className="flex gap-2 max-w-full md:max-w-[85%] md:mx-auto">
                  <button
                    onClick={() => setSelectedImage(0)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border flex items-center justify-center transition-colors ${
                      selectedImage === 0
                        ? t('border-white/20 bg-white/[0.04]', 'border-gray-300 bg-white')
                        : t('border-white/[0.06] bg-white/[0.02] hover:border-white/10', 'border-gray-200 bg-white hover:border-gray-300')
                    }`}
                  >
                    <img src={selectedSet.img} alt="Pack" className="w-[70%] h-[70%] object-contain" />
                  </button>
                  <button
                    onClick={() => setSelectedImage(1)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border flex items-center justify-center transition-colors ${
                      selectedImage === 1
                        ? t('border-white/20 bg-white/[0.04]', 'border-gray-300 bg-white')
                        : t('border-white/[0.06] bg-white/[0.02] hover:border-white/10', 'border-gray-200 bg-white hover:border-gray-300')
                    }`}
                  >
                    <img src={selectedSet.logo} alt="Set logo" className="w-[80%] object-contain" />
                  </button>
                </div>

                {/* Provably fair under image */}
                {fairness && (
                  <div className="max-w-full md:max-w-[85%] md:mx-auto space-y-1.5">
                    <p className={`text-[11px] mb-2 ${t('text-white/25', 'text-gray-400')}`}>Provably Fair</p>
                    <div className="flex items-start text-[11px]">
                      <span className={`w-14 shrink-0 ${t('text-white/20', 'text-gray-400')}`}>Hash</span>
                      <span className={`font-mono break-all leading-relaxed ${t('text-white/35', 'text-gray-500')}`}>{fairness.serverSeedHash}</span>
                    </div>
                    <div className="flex items-center text-[11px]">
                      <span className={`w-14 shrink-0 ${t('text-white/20', 'text-gray-400')}`}>Client</span>
                      <span className={`font-mono ${t('text-white/35', 'text-gray-500')}`}>{fairness.clientSeed}</span>
                    </div>
                    <div className="flex items-center text-[11px]">
                      <span className={`w-14 shrink-0 ${t('text-white/20', 'text-gray-400')}`}>Nonce</span>
                      <span className={`font-mono ${t('text-white/35', 'text-gray-500')}`}>{fairness.nonce}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Details Section */}
              <div className="flex flex-col gap-6">
                {/* Title group */}
                <div>
                  <span className={`text-xs uppercase tracking-wider ${t('text-white/30', 'text-gray-400')}`}>
                    {selectedSet.series}
                  </span>
                  <h1 className={`text-xl md:text-3xl font-medium mt-2 leading-snug ${t('text-white', 'text-gray-900')}`}>{selectedSet.name}</h1>
                  <p className={`text-sm leading-relaxed mt-3 ${t('text-white/40', 'text-gray-500')}`}>
                    Open a digital {selectedSet.name} booster pack and reveal {CARDS_PER_PACK} randomly selected cards from a pool of {selectedSet.total}. Every outcome is cryptographically verifiable.
                  </p>
                </div>

                {/* Price block */}
                <div className={`border-t pt-6 ${t('border-white/[0.06]', 'border-gray-100')}`}>
                  <span className={`text-2xl md:text-3xl font-medium ${t('text-white', 'text-gray-900')}`}>R{selectedSet.price.toFixed(2)}</span>
                </div>

                {/* CTA */}
                <div className={`border-t pt-6 flex flex-col gap-4 ${t('border-white/[0.06]', 'border-gray-100')}`}>
                  <button
                    onClick={openPack}
                    disabled={isOpening}
                    className={`w-full py-3 text-sm font-medium rounded-full transition-colors ${t('bg-white hover:bg-white/90 disabled:bg-white/20 disabled:text-white/30 text-black', 'bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 text-white')}`}
                  >
                    {isOpening ? 'Opening...' : 'Open Pack'}
                  </button>
                </div>

                {/* Meta */}
                <div className={`border-t pt-6 space-y-2.5 ${t('border-white/[0.06]', 'border-gray-100')}`}>
                  <div className="flex items-center text-sm">
                    <span className={`w-28 ${t('text-white/25', 'text-gray-400')}`}>Cards in Set</span>
                    <span className={t('text-white/60', 'text-gray-700')}>{selectedSet.total}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className={`w-28 ${t('text-white/25', 'text-gray-400')}`}>Per Pack</span>
                    <span className={t('text-white/60', 'text-gray-700')}>{CARDS_PER_PACK} cards</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className={`w-28 ${t('text-white/25', 'text-gray-400')}`}>Series</span>
                    <span className={t('text-white/60', 'text-gray-700')}>{selectedSet.series}</span>
                  </div>
                  <div className="flex items-start text-sm">
                    <span className={`w-28 shrink-0 ${t('text-white/25', 'text-gray-400')}`}>Pull Rates</span>
                    <div className="flex flex-wrap gap-1.5">
                      {PULL_RATES.map((rate) => (
                        <span key={rate} className={`text-[11px] px-2 py-0.5 rounded-full ${t('text-white/30 bg-white/[0.04]', 'text-gray-500 bg-gray-100')}`}>{rate}</span>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ LOADING ═══ */}
      {phase === 'loading' && (
        <div className="pack-bg flex flex-col items-center justify-center h-screen" style={{ background: '#111111' }}>
          <div className="pack-ring" />
          <div className="pack-ring-sm" />
          <div className="w-8 h-8 border-2 rounded-full animate-spin border-white/10 border-t-white/60" style={{ zIndex: 1 }} />
          <p className="text-sm mt-4 text-white/30" style={{ zIndex: 1 }}>Pulling cards...</p>
        </div>
      )}

      {/* ═══ CARDS ═══ */}
      {phase === 'cards' && (
        <div className={`pack-bg relative flex flex-col items-center justify-center h-screen ${shaking ? 'screen-shake' : ''}`} style={{ background: '#111111', touchAction: 'none', overflow: 'hidden', position: 'fixed', inset: 0 }}>
          <div className="pack-particles">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="pack-particle" style={{
                left: `${8 + (i * 7.5) % 85}%`,
                width: `${2 + (i % 3)}px`,
                height: `${2 + (i % 3)}px`,
                background: ['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.1)', 'rgba(255,255,255,0.12)', 'rgba(255,255,255,0.08)'][i % 4],
                animationDuration: `${8 + (i % 5) * 3}s`,
                animationDelay: `${(i * 1.7) % 10}s`,
              }} />
            ))}
          </div>
          <div className="pack-ring" />
          <div className="pack-ring-sm" />
          {/* Card stack with 3D tilt */}
          <div
            ref={stackRef}
            className="card-stack-lg"
            onClick={handleCardClick}
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
            onTouchMove={(e) => e.preventDefault()}
            style={{ cursor: 'pointer', perspective: '800px', touchAction: 'none' }}
          >
            {packCards.map((card, i) => {
              if (i < currentIdx) return null;
              const stackPos = i - currentIdx;
              if (stackPos > 4) return null;

              const isActive = i === currentIdx;
              const offset = fanOffset(stackPos, remaining);
              const tiltStyle = isActive && cardState === 'flipped'
                ? { transform: `${offset.transform} rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`, transition: 'transform 0.1s ease-out' }
                : {};

              return (
                <div
                  key={`${card.id}-${i}`}
                  className={`card-stack-item ${isActive && cardState === 'swiping' ? 'card-swiping' : ''}`}
                  style={{
                    ...offset,
                    ...tiltStyle,
                  }}
                >
                  <div className="flip-scene">
                    <div className={`flip-inner ${isActive && (cardState === 'flipped' || cardState === 'swiping') ? 'is-flipped' : ''}`}>
                      <div className="flip-face shadow-lg">
                        <img src={CARD_BACK} alt="Card back" className="w-full h-full object-cover rounded-[10px]" draggable={false} />
                      </div>
                      <div className={`flip-face flip-face-reveal shadow-lg relative ${isActive && cardState === 'flipped' && card.rarity === 'ultra_rare' ? 'holo-shimmer' : ''}`}>
                        <img
                          src={card.imageLarge || card.image}
                          alt={card.name}
                          className="w-full h-full object-cover"
                          draggable={false}
                        />
                        {isActive && cardState === 'flipped' && (tilt.x !== 0 || tilt.y !== 0) && (
                          <div
                            className="card-shine"
                            style={{
                              background: `radial-gradient(circle at ${50 + tilt.y * 8}% ${50 - tilt.x * 8}%, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.1) 30%, transparent 60%)`,
                            }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {sparkles.length > 0 && cardState === 'flipped' && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 50 }}>
                {sparkles.map(s => (
                  <div key={s.id} className="sparkle-dot" style={{ '--tx': s.tx, '--ty': s.ty, width: s.size, height: s.size, backgroundColor: s.color, animationDelay: `${s.delay}s`, boxShadow: `0 0 ${s.size * 2}px ${s.color}` }} />
                ))}
              </div>
            )}
          </div>

          {/* Card price overlay above card */}
          {cardState === 'flipped' && packCards[currentIdx] && packCards[currentIdx].priceZar != null && (
            <div className="absolute left-0 right-0 text-center fade-up" style={{ bottom: 'calc(50% + clamp(220px, 52vw, 250px))' }}>
              <p className="text-3xl font-medium text-white">R{packCards[currentIdx].priceZar.toFixed(2)}</p>
            </div>
          )}

        </div>
      )}

      {/* ═══ DONE ═══ */}
      {phase === 'done' && (
        <div className="pack-bg flex flex-col min-h-screen fade-up" style={{ background: '#111111' }}>
          <div className="pack-particles">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="pack-particle" style={{
                left: `${8 + (i * 7.5) % 85}%`,
                width: `${2 + (i % 3)}px`,
                height: `${2 + (i % 3)}px`,
                background: ['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.1)', 'rgba(255,255,255,0.12)', 'rgba(255,255,255,0.08)'][i % 4],
                animationDuration: `${8 + (i % 5) * 3}s`,
                animationDelay: `${(i * 1.7) % 10}s`,
              }} />
            ))}
          </div>
          <div className="pack-ring" />
          <div className="pack-ring-sm" />

          {/* Main content area */}
          <div className="flex-1 flex flex-col items-center justify-center px-4 py-8" style={{ zIndex: 1 }}>

            {/* Cards row */}
            <div className="relative w-full mb-8">
              {canScrollLeft && (
                <button onClick={() => scrollRef.current?.scrollBy({ left: -200 })} className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/70 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors backdrop-blur-sm">
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              {canScrollRight && (
                <button onClick={() => scrollRef.current?.scrollBy({ left: 200 })} className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/70 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors backdrop-blur-sm">
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
              <div ref={scrollRef} className="flex gap-3 overflow-x-auto scrollbar-hide px-4" style={{ scrollBehavior: 'smooth' }}>
                {/* Code card - always first, always face-up */}
                <div className="done-card flex-shrink-0" style={{ width: 'clamp(140px, 28vw, 200px)' }}>
                  <div className="w-full aspect-[2.5/3.5] rounded-xl overflow-hidden shadow-lg shadow-black/40">
                    <img src={codeCardImg} alt="Code Card" className="w-full h-full object-cover" />
                  </div>
                </div>
                {packCards.filter(c => !c.isCodeCard).map((card, i) => (
                  <div key={i} className="done-card flex-shrink-0" style={{ width: 'clamp(140px, 28vw, 200px)' }}>
                    <div className="w-full aspect-[2.5/3.5]">
                      <div className={`done-card-inner ${flippedCards.includes(i) ? 'flipped' : ''}`}>
                        <div className="done-card-front shadow-lg shadow-black/40 relative">
                          <img src={card.image} alt={card.name} className="w-full h-full object-cover" />
                          {card.priceZar != null && (
                            <div className="absolute bottom-2 md:bottom-3 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-full">
                              <p className="text-[11px] md:text-xs text-white/90 whitespace-nowrap font-medium">R{card.priceZar.toFixed(2)}</p>
                            </div>
                          )}
                        </div>
                        <div className="done-card-back shadow-lg shadow-black/40">
                          <img src={CARD_BACK} alt="Card back" className="w-full h-full object-cover" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Value + Actions */}
            <div className="w-full max-w-[340px] flex flex-col items-center gap-5">
              {/* Total value */}
              {totalValue > 0 && (
                <div className="text-center scale-in">
                  <p className="text-4xl md:text-5xl font-medium text-white tracking-tight">R{totalValue.toFixed(2)}</p>
                  <p className="text-[11px] mt-1 text-white/25 uppercase tracking-widest">Total Value</p>
                </div>
              )}

              {/* Buttons */}
              <div className="w-full flex flex-col gap-2">
                <button onClick={openAnother} className="w-full py-3 text-sm font-medium rounded-full transition-all bg-white hover:bg-white/90 text-gray-900 active:scale-[0.98]">
                  Open Another Pack
                </button>
                <div className="flex gap-2">
                  <button className="flex-1 py-2.5 text-[13px] font-medium rounded-full transition-all border border-white/10 text-white/50 hover:text-white/80 hover:border-white/20 active:scale-[0.98]">
                    Store Credit
                  </button>
                  <button className="flex-1 py-2.5 text-[13px] font-medium rounded-full transition-all border border-white/10 text-white/50 hover:text-white/80 hover:border-white/20 active:scale-[0.98]">
                    Ship Cards
                  </button>
                </div>
              </div>

              {packsOpened > 1 && <p className="text-[10px] text-white/15">{packsOpened} packs opened this session</p>}
            </div>
          </div>

          {/* Provably fair footer */}
          {fairness && (
            <div className="w-full px-3 py-2 flex items-center justify-center bg-white/[0.03]">
              <p className="text-[9px] font-mono truncate text-white/15">
                {fairness.serverSeedHash?.slice(0, 16)}... n:{fairness.nonce}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PackOpening;
