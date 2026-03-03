import { useState, useEffect, useRef } from 'react';
import { ELITE_API_URL } from '../../config/api';

const AnnouncementBar = () => {
  const [config, setConfig] = useState(null);
  const [dismissed, setDismissed] = useState(false);
  const outerRef = useRef(null);
  const innerRef = useRef(null);
  const lastScrollY = useRef(0);
  const isHidden = useRef(false);
  const isAnimating = useRef(false);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch(`${ELITE_API_URL}/api/config`);
        const data = await res.json();
        setConfig(data.config);
      } catch {}
    };
    fetchConfig();
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastScrollY.current;

      // Always keep lastScrollY current so direction is accurate after lock expires
      if (Math.abs(delta) >= 4) lastScrollY.current = y;

      // Don't interrupt a running animation
      if (isAnimating.current) return;
      if (Math.abs(delta) < 4) return;

      const shouldHide = y > 60 && delta > 0;
      if (shouldHide === isHidden.current) return;
      isHidden.current = shouldHide;

      if (outerRef.current) {
        outerRef.current.style.maxHeight = shouldHide ? '0' : '60px';
      }
      if (innerRef.current) {
        innerRef.current.style.transform = shouldHide ? 'translateY(-100%)' : 'translateY(0)';
      }

      // Lock until animation completes
      isAnimating.current = true;
      setTimeout(() => { isAnimating.current = false; }, 400);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!config) return null;

  const enabled = config.announcement_bar_enabled?.value === 'true';
  const text = config.announcement_bar_text?.value || '';
  const bgColor = config.announcement_bar_bg_color?.value || '#E3350D';
  const textColor = config.announcement_bar_text_color?.value || '#FFFFFF';
  const link = config.announcement_bar_link?.value || '';
  const dismissible = config.announcement_bar_dismissible?.value === 'true';
  const fontSize = config.announcement_bar_font_size?.value || 'sm';
  const icon = config.announcement_bar_icon?.value || '';

  if (!enabled || !text || dismissed) return null;

  const fontSizeClass = { sm: 'text-xs', md: 'text-sm', lg: 'text-base' }[fontSize] || 'text-xs';

  const textNode = (
    <span className={`${fontSizeClass} font-medium whitespace-nowrap`}>
      {icon && <span className="mr-2">{icon}</span>}
      {text}
    </span>
  );

  const content = link ? <a href={link} className="hover:underline">{textNode}</a> : textNode;

  return (
    <div
      ref={outerRef}
      style={{ maxHeight: '60px', overflow: 'hidden', transition: 'max-height 0.35s ease' }}
    >
      <div
        ref={innerRef}
        style={{ transition: 'transform 0.35s ease' }}
      >
        <div
          className="relative flex items-center py-2 overflow-hidden"
          style={{ backgroundColor: bgColor, color: textColor }}
        >
          <div className="flex-1 overflow-hidden">
            <div className="animate-marquee flex" style={{ width: 'max-content' }}>
              {Array(8).fill(0).map((_, i) => (
                <span key={i} className="pl-16 whitespace-nowrap">{content}</span>
              ))}
            </div>
          </div>

          {dismissible && (
            <button
              onClick={() => setDismissed(true)}
              className="shrink-0 ml-1 mr-3 opacity-70 hover:opacity-100 transition-opacity"
              aria-label="Dismiss"
              style={{ color: textColor }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnnouncementBar;
