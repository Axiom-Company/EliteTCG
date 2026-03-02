import { useState, useEffect } from 'react';
import { ELITE_API_URL } from '../../config/api';

const AnnouncementBar = () => {
  const [config, setConfig] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch(`${ELITE_API_URL}/api/config`);
        const data = await res.json();
        setConfig(data.config);
      } catch {
        // Silently fail — announcement bar is non-critical
      }
    };
    fetchConfig();
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

  const content = (
    <span className={`${fontSizeClass} font-medium`}>
      {icon && <span className="mr-2">{icon}</span>}
      {text}
    </span>
  );

  return (
    <div
      className="relative flex items-center justify-center px-4 py-2 text-center"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      {link ? (
        <a href={link} className="hover:underline">
          {content}
        </a>
      ) : (
        content
      )}

      {dismissible && (
        <button
          onClick={() => setDismissed(true)}
          className="absolute right-3 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Dismiss"
          style={{ color: textColor }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default AnnouncementBar;
