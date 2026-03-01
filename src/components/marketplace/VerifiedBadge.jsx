const VerifiedBadge = ({ isVerified, className = '' }) => {
  if (!isVerified) return null;

  return (
    <span
      className={`bg-blue-50 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${className}`}
    >
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
      </svg>
      Elite Verified
    </span>
  );
};

export default VerifiedBadge;
