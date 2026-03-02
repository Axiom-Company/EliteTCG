import { useState } from 'react';
import { Reply, Smile, Pin, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import MessageReactions from './MessageReactions';
import EmojiPicker from './EmojiPicker';

const ROLE_BADGE_STYLES = {
  admin: 'bg-red-500/15 text-red-400 border-red-500/30',
  moderator: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  verified_seller: 'bg-green-500/15 text-green-400 border-green-500/30',
};

const ROLE_LABELS = {
  admin: 'Admin',
  moderator: 'Mod',
  verified_seller: 'Seller',
};

const RoleBadge = ({ role }) => {
  const styles = ROLE_BADGE_STYLES[role];
  const label = ROLE_LABELS[role];
  if (!styles || !label) return null;

  return (
    <span
      className={cn(
        'inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border leading-none',
        styles
      )}
    >
      {label}
    </span>
  );
};

const formatTime = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const InlineReplyPreview = ({ replyTo }) => {
  if (!replyTo) return null;

  const truncated =
    replyTo.content && replyTo.content.length > 80
      ? replyTo.content.slice(0, 80) + '...'
      : replyTo.content || '';

  return (
    <div className="flex items-center gap-1.5 mb-1 pl-0.5">
      <div className="w-0.5 h-4 rounded-full bg-indigo-500 shrink-0" />
      <span className="text-[11px] text-indigo-400 font-medium truncate">
        {replyTo.author_name}
      </span>
      <span className="text-[11px] text-gray-500 truncate">{truncated}</span>
    </div>
  );
};

const MessageAvatar = ({ message }) => {
  const initials = (message.author_name || '')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  if (message.author_avatar_url) {
    return (
      <img
        src={message.author_avatar_url}
        alt={message.author_name}
        className="h-9 w-9 rounded-full object-cover shrink-0 mt-0.5"
      />
    );
  }

  return (
    <div className="flex items-center justify-center h-9 w-9 rounded-full bg-gray-700 text-gray-300 text-xs font-medium shrink-0 mt-0.5">
      {initials || '?'}
    </div>
  );
};

const HoverAction = ({ icon: Icon, label, onClick, variant }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'flex items-center justify-center h-7 w-7 rounded transition-colors',
      variant === 'danger'
        ? 'text-gray-400 hover:text-red-400 hover:bg-red-500/10'
        : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
    )}
    aria-label={label}
    title={label}
  >
    <Icon className="h-3.5 w-3.5" />
  </button>
);

const MessageItem = ({
  message,
  currentUserId,
  onReply,
  onEdit,
  onDelete,
  onPin,
  onReact,
  isModOrAdmin,
}) => {
  const [showActions, setShowActions] = useState(false);
  const isOwn = message.user_id === currentUserId;

  if (message.is_system) {
    return (
      <div className="flex justify-center py-1.5 px-4">
        <span className="text-xs text-gray-500 italic text-center">
          {message.content}
        </span>
      </div>
    );
  }

  if (message.is_deleted) {
    return (
      <div
        className="group flex items-start gap-3 px-4 py-1.5"
        role="article"
        aria-label="Deleted message"
      >
        <MessageAvatar message={message} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-300">
              {message.author_name}
            </span>
            <RoleBadge role={message.author_role} />
            <span className="text-[11px] text-gray-600">
              {formatTime(message.created_at)}
            </span>
          </div>
          <p className="text-sm text-gray-600 italic">[message deleted]</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'group relative flex items-start gap-3 px-4 py-1.5 transition-colors',
        'hover:bg-gray-800/50'
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      role="article"
      aria-label={`Message from ${message.author_name}`}
    >
      <MessageAvatar message={message} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-gray-200">
            {message.author_name}
          </span>
          <RoleBadge role={message.author_role} />
          <span className="text-[11px] text-gray-600">
            {formatTime(message.created_at)}
          </span>
          {message.is_edited && (
            <span className="text-[10px] text-gray-600 italic">(edited)</span>
          )}
        </div>

        {message.reply_to && <InlineReplyPreview replyTo={message.reply_to} />}

        <p className="text-sm text-gray-300 whitespace-pre-wrap break-words leading-relaxed">
          {message.content}
        </p>

        {message.image_url && (
          <img
            src={message.image_url}
            alt="Attached image"
            className="mt-1.5 max-w-xs rounded-lg border border-gray-800 cursor-pointer hover:opacity-90 transition-opacity"
          />
        )}

        <MessageReactions
          reactions={message.reactions}
          currentUserId={currentUserId}
          onReact={(emoji) => onReact(message.id, emoji)}
        />
      </div>

      {showActions && (
        <div
          className={cn(
            'absolute -top-3 right-4 flex items-center gap-0.5',
            'rounded-md border border-gray-700 bg-gray-900 p-0.5 shadow-lg',
            'animate-in fade-in zoom-in-95 duration-100'
          )}
        >
          <HoverAction
            icon={Reply}
            label="Reply"
            onClick={() => onReply(message)}
          />
          <EmojiPicker
            onSelect={(emoji) => onReact(message.id, emoji)}
            trigger={
              <button
                type="button"
                className="flex items-center justify-center h-7 w-7 rounded text-gray-400 hover:text-gray-200 hover:bg-gray-700 transition-colors"
                aria-label="Add reaction"
                title="Add reaction"
              >
                <Smile className="h-3.5 w-3.5" />
              </button>
            }
          />
          {isModOrAdmin && (
            <HoverAction
              icon={Pin}
              label="Pin message"
              onClick={() => onPin(message.id)}
            />
          )}
          {isOwn && (
            <HoverAction
              icon={Pencil}
              label="Edit message"
              onClick={() => onEdit(message)}
            />
          )}
          {(isOwn || isModOrAdmin) && (
            <HoverAction
              icon={Trash2}
              label="Delete message"
              onClick={() => onDelete(message.id)}
              variant="danger"
            />
          )}
        </div>
      )}
    </div>
  );
};

export default MessageItem;
