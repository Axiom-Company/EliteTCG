import { useState, useRef, useCallback, useEffect } from 'react';
import { Send, ImagePlus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { compressImage } from '@/services/imageCompressor';
import { uploadDMImage } from '@/services/chatApi';
import ReplyPreview from './ReplyPreview';

const MAX_CHARS = 2000;
const CHAR_WARN_THRESHOLD = 1800;
const MAX_ROWS = 5;
const LINE_HEIGHT_PX = 20;
const PADDING_PX = 16;

const MessageInput = ({
  onSend,
  onTyping,
  replyTo,
  onCancelReply,
  isDM,
  channelId,
  token,
  disabled,
}) => {
  const [content, setContent] = useState('');
  const [uploading, setUploading] = useState(false);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  const adjustHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const maxHeight = LINE_HEIGHT_PX * MAX_ROWS + PADDING_PX;
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
  }, []);

  useEffect(() => {
    adjustHeight();
  }, [content, adjustHeight]);

  const handleSend = useCallback(() => {
    const trimmed = content.trim();
    if (!trimmed || trimmed.length > MAX_CHARS) return;
    onSend(trimmed);
    setContent('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [content, onSend]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const handleChange = useCallback(
    (e) => {
      const val = e.target.value;
      if (val.length > MAX_CHARS) return;
      setContent(val);
      onTyping?.();
    },
    [onTyping]
  );

  const handleImageUpload = useCallback(
    async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      if (!file.type.startsWith('image/')) {
        toast.error('Only image files are allowed.');
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image must be under 10MB.');
        return;
      }

      setUploading(true);
      try {
        const compressed = await compressImage(file);
        const result = await uploadDMImage(token, channelId, compressed);
        if (result?.url) {
          onSend(result.url);
        }
      } catch (err) {
        toast.error(err?.message || 'Failed to upload image.');
      } finally {
        setUploading(false);
      }
    },
    [token, channelId, onSend]
  );

  const charCount = content.length;
  const showCharCount = charCount > CHAR_WARN_THRESHOLD;
  const isOverLimit = charCount > MAX_CHARS;
  const canSend = content.trim().length > 0 && !isOverLimit && !disabled;

  return (
    <div className="border-t border-gray-800 bg-gray-900 px-4 pb-4 pt-2">
      <ReplyPreview replyTo={replyTo} onCancel={onCancelReply} />

      <div
        className={cn(
          'flex items-end gap-2 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2',
          replyTo && 'rounded-t-none border-t-0',
          disabled && 'opacity-50'
        )}
      >
        {isDM && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
              disabled={disabled || uploading}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || uploading}
              className={cn(
                'flex shrink-0 items-center justify-center rounded-md p-1.5 transition-colors',
                'text-gray-400 hover:bg-gray-700 hover:text-gray-200',
                'disabled:cursor-not-allowed disabled:opacity-50'
              )}
              aria-label="Attach image"
            >
              {uploading ? (
                <Loader2 className="h-4.5 w-4.5 animate-spin" />
              ) : (
                <ImagePlus className="h-4.5 w-4.5" />
              )}
            </button>
          </>
        )}

        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          rows={1}
          placeholder={
            disabled
              ? 'Connecting...'
              : isDM
                ? 'Send a message...'
                : `Message #${replyTo ? 'reply' : 'channel'}...`
          }
          className={cn(
            'flex-1 resize-none bg-transparent text-sm text-gray-100 leading-5',
            'placeholder:text-gray-500 focus:outline-none',
            'disabled:cursor-not-allowed'
          )}
        />

        <div className="flex shrink-0 items-center gap-2">
          {showCharCount && (
            <span
              className={cn(
                'text-[10px] tabular-nums',
                isOverLimit ? 'text-red-400' : 'text-gray-500'
              )}
            >
              {charCount}/{MAX_CHARS}
            </span>
          )}

          <button
            type="button"
            onClick={handleSend}
            disabled={!canSend}
            className={cn(
              'flex items-center justify-center rounded-md p-1.5 transition-colors',
              canSend
                ? 'bg-indigo-600 text-white hover:bg-indigo-500'
                : 'cursor-not-allowed bg-gray-700 text-gray-500'
            )}
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageInput;
