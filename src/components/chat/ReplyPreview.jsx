import { X, Reply } from 'lucide-react';

const MAX_PREVIEW_LENGTH = 120;

const ReplyPreview = ({ replyTo, onCancel }) => {
  if (!replyTo) return null;

  const truncated = replyTo.content?.length > MAX_PREVIEW_LENGTH
    ? replyTo.content.slice(0, MAX_PREVIEW_LENGTH) + '...'
    : replyTo.content || '';

  return (
    <div className="flex items-center gap-2 px-3 py-2 mb-1 rounded-t-lg bg-amber-50/80 border-l-2 border-amber-400">
      <Reply className="h-3.5 w-3.5 text-amber-500 shrink-0" />
      <div className="flex-1 min-w-0">
        <span className="text-xs font-medium text-amber-700">Replying to {replyTo.author_name}</span>
        <p className="text-xs text-gray-500 truncate">{truncated}</p>
      </div>
      <button
        type="button"
        onClick={onCancel}
        className="flex items-center justify-center h-5 w-5 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-200/50 transition-colors shrink-0"
        aria-label="Cancel reply"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};

export default ReplyPreview;
