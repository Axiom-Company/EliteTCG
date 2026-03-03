import { useRef, useEffect, useState, useCallback } from 'react';
import { ArrowDown, Loader2 } from 'lucide-react';
import MessageItem from './MessageItem';

const SCROLL_THRESHOLD = 150;

const formatDateSeparator = (dateStr) => {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const msgDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (msgDate.getTime() === today.getTime()) return 'Today';
  if (msgDate.getTime() === yesterday.getTime()) return 'Yesterday';
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
};

const isSameDay = (a, b) => {
  if (!a || !b) return false;
  const da = new Date(a);
  const db = new Date(b);
  return da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth() && da.getDate() === db.getDate();
};

const MessageList = ({ messages, currentUserId, loading, onReply, onEdit, onDelete, onPin, onReact, isModOrAdmin }) => {
  const containerRef = useRef(null);
  const bottomRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const prevMessageCountRef = useRef(0);

  const scrollToBottom = useCallback((behavior = 'smooth') => {
    bottomRef.current?.scrollIntoView({ behavior });
  }, []);

  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    setIsAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight < SCROLL_THRESHOLD);
  }, []);

  useEffect(() => {
    const prev = prevMessageCountRef.current;
    prevMessageCountRef.current = messages.length;
    if (messages.length > prev && isAtBottom) {
      requestAnimationFrame(() => scrollToBottom('smooth'));
    }
  }, [messages.length, isAtBottom, scrollToBottom]);

  useEffect(() => {
    if (!loading && messages.length > 0) {
      requestAnimationFrame(() => scrollToBottom('instant'));
    }
  }, [loading]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center bg-stone-50">
        <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 text-center bg-stone-50">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-50">
          <span className="text-2xl">&#128172;</span>
        </div>
        <p className="text-sm font-medium text-gray-500">No messages yet</p>
        <p className="text-xs text-gray-400">Be the first to start the conversation.</p>
      </div>
    );
  }

  return (
    <div className="relative flex-1 overflow-hidden">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full overflow-y-auto scroll-smooth bg-stone-50"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.03) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      >
        <div className="flex flex-col py-4">
          {messages.map((msg, idx) => {
            const prevMsg = idx > 0 ? messages[idx - 1] : null;
            const showDateSeparator = !prevMsg || !isSameDay(prevMsg.created_at, msg.created_at);
            return (
              <div key={msg.id || idx}>
                {showDateSeparator && (
                  <div className="my-3 flex justify-center px-4">
                    <span className="bg-white/80 backdrop-blur-sm rounded-full px-3 py-1 text-[11px] font-medium text-gray-400 shadow-sm">
                      {formatDateSeparator(msg.created_at)}
                    </span>
                  </div>
                )}
                <MessageItem
                  message={msg}
                  currentUserId={currentUserId}
                  onReply={onReply}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onPin={onPin}
                  onReact={onReact}
                  isModOrAdmin={isModOrAdmin}
                />
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </div>
      {!isAtBottom && (
        <button
          type="button"
          onClick={() => scrollToBottom('smooth')}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs text-gray-500 shadow-lg hover:bg-gray-50 hover:text-gray-700 transition-colors"
          aria-label="Scroll to latest messages"
        >
          <ArrowDown className="h-3.5 w-3.5 text-amber-500" />
          New messages
        </button>
      )}
    </div>
  );
};

export default MessageList;
