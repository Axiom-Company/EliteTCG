import { useEffect, useCallback } from 'react';
import { X, Pin } from 'lucide-react';
import { cn } from '@/lib/utils';

const formatPinnedDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const PinnedMessages = ({ pinned, isOpen, onClose }) => {
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (!isOpen) return;

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[500] bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={cn(
          'fixed top-0 right-0 z-[510] h-full w-full max-w-sm',
          'flex flex-col bg-gray-900 border-l border-gray-800 shadow-xl',
          'animate-in slide-in-from-right duration-200'
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Pinned messages"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <Pin className="h-4 w-4 text-yellow-500" />
            <h2 className="text-sm font-semibold text-gray-100">
              Pinned Messages
            </h2>
            {pinned && pinned.length > 0 && (
              <span className="text-xs text-gray-500">
                ({pinned.length})
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center h-7 w-7 rounded-md text-gray-400 hover:text-gray-200 hover:bg-gray-800 transition-colors"
            aria-label="Close pinned messages"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {(!pinned || pinned.length === 0) ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 text-sm gap-2">
              <Pin className="h-8 w-8 text-gray-700" />
              <p>No pinned messages yet.</p>
            </div>
          ) : (
            pinned.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  'rounded-lg border border-gray-800 bg-gray-850 p-3',
                  'bg-gray-800/50 hover:bg-gray-800/80 transition-colors'
                )}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-gray-200">
                    {msg.author_name || msg.author?.display_name || 'Unknown'}
                  </span>
                  {msg.pinned_at && (
                    <span className="text-[10px] text-gray-500">
                      Pinned {formatPinnedDate(msg.pinned_at)}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-300 whitespace-pre-wrap break-words leading-relaxed">
                  {msg.content}
                </p>
              </div>
            ))
          )}
        </div>
      </aside>
    </>
  );
};

export default PinnedMessages;
