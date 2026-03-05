import { useRef, useEffect, useCallback } from 'react';
import applePay from '../../assets/images/Payment/apple-pay.svg';
import payfast from '../../assets/images/Payment/Payfast logo.svg';
import payflex from '../../assets/images/Payment/Payflex_idFYclxM6Y_1.svg';
import paypal from '../../assets/images/Payment/paypal.svg';
import visa from '../../assets/images/Payment/visa.svg';

const methods = [
  { src: visa, alt: 'Visa', scale: 1.4 },
  { src: paypal, alt: 'PayPal', scale: 1 },
  { src: applePay, alt: 'Apple Pay', scale: 1.4 },
  { src: payfast, alt: 'PayFast', scale: 1 },
  { src: payflex, alt: 'Payflex', scale: 1 },
];

const ITEM_W = 140;
const SET_W = methods.length * ITEM_W;
const SPEED = 0.3; // px per frame (~18px/s)

const MobileMarquee = () => {
  const trackRef = useRef(null);
  const offsetRef = useRef(0);
  const rafRef = useRef(null);
  const pausedRef = useRef(false);
  const resumeTimer = useRef(null);

  const tick = useCallback(() => {
    if (!pausedRef.current) {
      offsetRef.current -= SPEED;
      if (offsetRef.current <= -SET_W) offsetRef.current += SET_W;
      if (trackRef.current) {
        trackRef.current.style.transform = `translateX(${offsetRef.current}px)`;
      }
    }
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [tick]);

  const pause = () => {
    pausedRef.current = true;
    clearTimeout(resumeTimer.current);
  };

  const scheduleResume = () => {
    clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => {
      pausedRef.current = false;
    }, 2000);
  };

  return (
    <div
      className="md:hidden overflow-hidden"
      onTouchStart={pause}
      onTouchEnd={scheduleResume}
      onMouseDown={pause}
      onMouseUp={scheduleResume}
      onMouseLeave={scheduleResume}
    >
      <div
        ref={trackRef}
        className="flex"
        style={{ width: SET_W * 2, willChange: 'transform' }}
      >
        {[...methods, ...methods].map(({ src, alt, scale }, i) => (
          <div
            key={i}
            className="flex flex-col items-center justify-center shrink-0"
            style={{ width: ITEM_W, height: 68 }}
          >
            <img
              src={src} alt={alt} draggable={false}
              className="object-contain"
              style={{ maxHeight: 40, maxWidth: ITEM_W - 40, transform: `scale(${scale})` }}
            />
            <span className="text-sm font-medium text-gray-400 mt-3">{alt}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const PaymentStrip = () => (
  <div className="border-t border-gray-100 bg-white pt-8 pb-0">

    <MobileMarquee />

    {/* Desktop: spread across full width */}
    <div className="hidden md:flex container items-center justify-between px-24 gap-6">
      {methods.map(({ src, alt, scale }) => (
        <div key={alt} className="flex flex-col items-center justify-center" style={{ width: 130, height: 68 }}>
          <img
            src={src} alt={alt} draggable={false}
            className="object-contain"
            style={{ maxWidth: '100%', maxHeight: 40, width: 'auto', height: 'auto', transform: `scale(${scale})` }}
          />
          <span className="text-sm font-medium text-gray-400 mt-3">{alt}</span>
        </div>
      ))}
    </div>

    <div className="mt-8 border-t border-gray-100" />
  </div>
);

export default PaymentStrip;
