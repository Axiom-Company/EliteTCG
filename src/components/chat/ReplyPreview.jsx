import { X, Reply } from 'lucide-react';
import { cn } from '@/lib/utils';

const MAX_PREVIEW_LENGTH = 120;

const ReplyPreview = ({ replyTo, onCancel }) => {
  if (!replyTo) return null;

  const truncated =
    replyTo.content && replyTo.content.length > MAX_PREVIEW_LENGTH
      ? replyTo.content.slice(0, MAX_PREVIEW_LENGTH) + '...'
      : replyTo.content || '';

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3 py-2 mx-3 mb-1 rounded-t-lg',
        'bg-gray-800 border-l-2 border-indigo-500'
      )}
    >
      <Reply className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
      <div className="flex-1 min-w-0">
        <span className="text-xs font-medium text-indigo-400">
          Replying to {replyTo.author_name}
        </span>
        <p className="text-xs text-gray-400 truncate">{truncated}</p>
      </div>
      <button
        type="button"
        onClick={onCancel}
        className="flex items-center justify-center h-5 w-5 rounded text-gray-500 hover:text-gray-300 hover:bg-gray-700 transition-colors shrink-0"
        aria-label="Cancel reply"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};

export default ReplyPreview;
