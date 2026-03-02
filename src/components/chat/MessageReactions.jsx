import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import EmojiPicker from './EmojiPicker';

const MessageReactions = ({ reactions, currentUserId, onReact }) => {
  if (!reactions || Object.keys(reactions).length === 0) return null;

  const entries = Object.entries(reactions).filter(
    ([, userIds]) => Array.isArray(userIds) && userIds.length > 0
  );

  if (entries.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1 mt-1">
      {entries.map(([emoji, userIds]) => {
        const hasReacted = userIds.includes(currentUserId);
        return (
          <button
            key={emoji}
            type="button"
            onClick={() => onReact(emoji)}
            className={cn(
              'inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs transition-colors',
              'border hover:bg-gray-700',
              hasReacted
                ? 'border-indigo-500/50 bg-indigo-500/10 text-indigo-300'
                : 'border-gray-700 bg-gray-800 text-gray-400'
            )}
            aria-label={`${emoji} ${userIds.length} reaction${userIds.length !== 1 ? 's' : ''}`}
          >
            <span className="text-sm leading-none">{emoji}</span>
            <span>{userIds.length}</span>
          </button>
        );
      })}
      <EmojiPicker
        onSelect={onReact}
        trigger={
          <button
            type="button"
            className="inline-flex items-center justify-center h-6 w-6 rounded-full border border-gray-700 bg-gray-800 text-gray-500 hover:text-gray-300 hover:bg-gray-700 hover:border-gray-600 transition-colors"
            aria-label="Add reaction"
          >
            <Plus className="h-3 w-3" />
          </button>
        }
      />
    </div>
  );
};

export default MessageReactions;
