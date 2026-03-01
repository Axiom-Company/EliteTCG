const TIER_CONFIG = {
  spotlight: {
    label: 'Spotlight',
    colors: 'bg-yellow-100 text-yellow-800',
  },
  featured: {
    label: 'Featured',
    colors: 'bg-orange-100 text-orange-800',
  },
  premium: {
    label: 'Premium',
    colors: 'bg-purple-100 text-purple-800',
  },
  elite: {
    label: 'Elite Pin',
    colors: 'bg-gradient-to-r from-amber-500 to-yellow-400 text-white',
  },
};

const PromotionBadge = ({ tier, className = '' }) => {
  if (!tier) return null;

  const config = TIER_CONFIG[tier];
  if (!config) return null;

  return (
    <span
      className={`text-[11px] font-medium px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${config.colors} ${className}`}
    >
      {config.label}
    </span>
  );
};

export default PromotionBadge;
