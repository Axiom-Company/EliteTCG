import { useRegisterSW } from 'virtual:pwa-register/react';

const UpdateNotification = () => {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  if (!needRefresh) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm bg-gray-900 text-white rounded-xl shadow-lg p-4">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <p className="text-sm font-medium">Update available</p>
          <p className="text-xs text-gray-400 mt-0.5">A new version of EliteTCG is ready.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => updateServiceWorker(true)}
            className="px-3 py-1.5 bg-[#E3350D] text-white text-xs font-medium rounded-full hover:bg-[#CC2D0A] transition-colors"
          >
            Update
          </button>
          <button
            onClick={() => setNeedRefresh(false)}
            className="p-1 text-gray-400 hover:text-white transition-colors"
            aria-label="Dismiss"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateNotification;
