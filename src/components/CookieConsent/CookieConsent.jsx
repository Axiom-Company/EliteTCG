import { useState, useEffect } from 'react';

const CONSENT_KEY = 'eliteTCG_cookieConsent';

export const hasCookieConsent = () => localStorage.getItem(CONSENT_KEY) === 'accepted';

const CookieConsent = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(CONSENT_KEY, 'accepted');
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem(CONSENT_KEY, 'declined');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 animate-slide-up">
      <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-[0_4px_32px_rgba(0,0,0,0.12)] border border-gray-100 p-5 sm:p-6">
        <p className="text-sm font-medium text-gray-900 mb-1">We use cookies</p>
        <p className="text-xs text-gray-500 leading-relaxed">
          We use cookies to save your cart and checkout details for a better shopping experience. No tracking, no ads.
        </p>
        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={accept}
            className="flex-1 h-9 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 active:scale-[0.98] transition-all"
          >
            Accept
          </button>
          <button
            onClick={decline}
            className="flex-1 h-9 bg-white text-gray-600 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-50 hover:text-gray-900 active:scale-[0.98] transition-all"
          >
            Decline
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up { animation: slide-up 0.4s ease-out; }
      `}</style>
    </div>
  );
};

export default CookieConsent;
