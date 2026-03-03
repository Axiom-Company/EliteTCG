import { cn } from '@/lib/utils';

const formatTypingText = (typingUsers) => {
  if (!typingUsers || typingUsers.length === 0) return null;
  if (typingUsers.length === 1) return `${typingUsers[0].userName} is typing`;
  if (typingUsers.length === 2) return `${typingUsers[0].userName} and ${typingUsers[1].userName} are typing`;
  return `${typingUsers.length} people are typing`;
};

const TypingIndicator = ({ typingUsers }) => {
  const text = formatTypingText(typingUsers);
  if (!text) return null;

  return (
    <div className="flex items-center gap-2 px-4 py-1.5 text-xs text-gray-400 bg-white">
      <span className="flex items-center gap-0.5" aria-label={text}>
        <span className={cn('inline-block h-1.5 w-1.5 rounded-full bg-amber-400', 'animate-[typing-bounce_1.4s_ease-in-out_infinite]')} />
        <span className={cn('inline-block h-1.5 w-1.5 rounded-full bg-amber-400', 'animate-[typing-bounce_1.4s_ease-in-out_0.2s_infinite]')} />
        <span className={cn('inline-block h-1.5 w-1.5 rounded-full bg-amber-400', 'animate-[typing-bounce_1.4s_ease-in-out_0.4s_infinite]')} />
      </span>
      <span>{text}</span>
      <style>{`
        @keyframes typing-bounce {
          0%, 60%, 100% { opacity: 0.3; transform: translateY(0); }
          30% { opacity: 1; transform: translateY(-2px); }
        }
      `}</style>
    </div>
  );
};

export default TypingIndicator;
