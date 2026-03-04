import { useState } from 'react';
import { Reply, Smile, Pin, Pencil, Trash2, Loader2, Check, CheckCheck, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import MessageReactions from './MessageReactions';
import EmojiPicker from './EmojiPicker';

const DeliveryStatus = ({ status, onRetry }) => {
  if (!status) return null;
  if (status === 'sending') {
    return <Loader2 className="h-3 w-3 text-gray-400 animate-spin shrink-0" aria-label="Sending" />;
  }
  if (status === 'sent') {
    return <Check className="h-3 w-3 text-gray-400 shrink-0" aria-label="Sent" />;
  }
  if (status === 'delivered') {
    return <CheckCheck className="h-3 w-3 shrink-0" style={{ color: '#FFCB32' }} aria-label="Delivered" />;
  }
  if (status === 'failed') {
    return (
      <button
        type="button"
        onClick={onRetry}
        className="flex items-center gap-0.5 text-[10px] text-red-500 hover:text-red-600 transition-colors"
        aria-label="Send failed – click to retry"
        title="Failed to send. Click to retry."
      >
        <AlertCircle className="h-3 w-3 shrink-0" />
        <span>Retry</span>
      </button>
    );
  }
  return null;
};

const ROLE_BADGE_STYLES = {
  admin: 'bg-red-50 text-red-600',
  moderator: 'bg-blue-50 text-blue-600',
  verified_seller: 'bg-emerald-50 text-emerald-600',
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
    <span className={cn('inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium leading-none', styles)}>
      {label}
    </span>
  );
};

const formatTime = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
};

const InlineReplyPreview = ({ replyTo, isOwn }) => {
  if (!replyTo) return null;
  const truncated = replyTo.content?.length > 80 ? replyTo.content.slice(0, 80) + '...' : replyTo.content || '';
  return (
    <div className="flex items-center gap-1.5 mb-1 pl-0.5">
      <div className={cn('w-0.5 h-4 rounded-full shrink-0', isOwn ? 'bg-amber-600/50' : 'bg-amber-400')} />
      <span className={cn('text-[11px] font-medium truncate', isOwn ? 'text-amber-800/70' : 'text-amber-600')}>{replyTo.author_name}</span>
      <span className={cn('text-[11px] truncate', isOwn ? 'text-gray-700/60' : 'text-gray-400')}>{truncated}</span>
    </div>
  );
};

const MessageAvatar = ({ message }) => {
  const initials = (message.author_name || '').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  if (message.author_avatar_url) {
    return <img src={message.author_avatar_url} alt={message.author_name} className="h-8 w-8 rounded-full object-cover shrink-0" />;
  }
  return (
    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-200 text-gray-500 text-xs font-medium shrink-0">
      {initials || '?'}
    </div>
  );
};

const HoverAction = ({ icon: Icon, label, onClick, variant }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'flex items-center justify-center h-7 w-7 rounded-md transition-colors',
      variant === 'danger' ? 'text-gray-400 hover:text-red-500 hover:bg-red-50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
    )}
    aria-label={label}
    title={label}
  >
    <Icon className="h-3.5 w-3.5" />
  </button>
);

const MessageItem = ({ message, currentUserId, onReply, onEdit, onDelete, onPin, onReact, isModOrAdmin, deliveryStatus, onRetry }) => {
  const [showActions, setShowActions] = useState(false);
  const isOwn = message.user_id === currentUserId;

  if (message.is_system) {
    return (
      <div className="flex justify-center py-2 px-4">
        <span className="text-xs text-gray-400 bg-gray-100/80 rounded-full px-3 py-1">{message.content}</span>
      </div>
    );
  }

  if (message.is_deleted) {
    return (
      <div className={cn('flex px-4 py-1', isOwn ? 'justify-end' : 'justify-start')}>
        <div className={cn('flex items-start gap-2.5 max-w-[75%]', isOwn ? 'flex-row-reverse' : '')}>
          {!isOwn && <MessageAvatar message={message} />}
          <div className={cn('flex flex-col', isOwn ? 'items-end' : 'items-start')}>
            {!isOwn && (
              <div className="flex items-center gap-1.5 mb-0.5 px-1">
                <span className="text-[13px] font-semibold text-gray-900">{message.author_name}</span>
                <RoleBadge role={message.author_role} />
              </div>
            )}
            <div className={cn('px-3.5 py-2 rounded-2xl', isOwn ? 'bg-amber-400/40 rounded-br-md' : 'bg-white/60 shadow-sm rounded-bl-md')}>
              <p className="text-sm text-gray-400 italic">[message deleted]</p>
            </div>
            <span className="text-[11px] text-gray-400 mt-0.5 px-1">{formatTime(message.created_at)}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn('relative flex px-4 py-1', isOwn ? 'justify-end' : 'justify-start')}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      role="article"
      aria-label={`Message from ${message.author_name}`}
    >
      <div className={cn('flex items-start gap-2.5 max-w-[75%]', isOwn ? 'flex-row-reverse' : '')}>
        {!isOwn && <MessageAvatar message={message} />}
        <div className={cn('flex flex-col', isOwn ? 'items-end' : 'items-start')}>
          {!isOwn && (
            <div className="flex items-center gap-1.5 mb-0.5 px-1">
              <span className="text-[13px] font-semibold text-gray-900">{message.author_name}</span>
              <RoleBadge role={message.author_role} />
            </div>
          )}
          <div className="relative">
            <div className={cn(
              'px-3.5 py-2 rounded-2xl transition-colors',
              isOwn ? 'bg-amber-400 text-gray-900 rounded-br-md' : 'bg-white text-gray-900 shadow-sm rounded-bl-md'
            )}>
              {message.reply_to && <InlineReplyPreview replyTo={message.reply_to} isOwn={isOwn} />}
              <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
              {message.is_edited && (
                <span className={cn('text-[10px] italic', isOwn ? 'text-amber-700/60' : 'text-gray-400')}>(edited)</span>
              )}
            </div>
            {message.image_url && (
              <img src={message.image_url} alt="Attached" className="mt-1.5 max-w-xs rounded-xl shadow-sm cursor-pointer hover:opacity-90 transition-opacity" />
            )}
            {showActions && (
              <div className={cn(
                'absolute -top-8 z-10 flex items-center gap-0.5 rounded-lg bg-white border border-gray-200 p-0.5 shadow-md',
                isOwn ? 'right-0' : 'left-0'
              )}>
                <HoverAction icon={Reply} label="Reply" onClick={() => onReply(message)} />
                <EmojiPicker
                  onSelect={(emoji) => onReact(message.id, emoji)}
                  trigger={
                    <button type="button" className="flex items-center justify-center h-7 w-7 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors" aria-label="Add reaction" title="Add reaction">
                      <Smile className="h-3.5 w-3.5" />
                    </button>
                  }
                />
                {isModOrAdmin && <HoverAction icon={Pin} label="Pin" onClick={() => onPin(message.id)} />}
                {isOwn && <HoverAction icon={Pencil} label="Edit" onClick={() => onEdit(message)} />}
                {(isOwn || isModOrAdmin) && <HoverAction icon={Trash2} label="Delete" onClick={() => onDelete(message.id)} variant="danger" />}
              </div>
            )}
          </div>
          <MessageReactions reactions={message.reactions} currentUserId={currentUserId} onReact={(emoji) => onReact(message.id, emoji)} />
          <div className={cn('flex items-center gap-1 mt-0.5 px-1', isOwn ? 'flex-row-reverse' : '')}>
            <span className="text-[11px] text-gray-400">{formatTime(message.created_at)}</span>
            {isOwn && <DeliveryStatus status={deliveryStatus} onRetry={onRetry} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
