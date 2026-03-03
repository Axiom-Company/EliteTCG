import * as Popover from '@radix-ui/react-popover';
import { Smile } from 'lucide-react';
import { cn } from '@/lib/utils';

const EMOJIS = [
  { emoji: '\u{1F44D}', label: 'Thumbs up' },
  { emoji: '\u{1F44E}', label: 'Thumbs down' },
  { emoji: '\u{2764}\u{FE0F}', label: 'Heart' },
  { emoji: '\u{1F525}', label: 'Fire' },
  { emoji: '\u{1F602}', label: 'Laughing' },
  { emoji: '\u{1F62D}', label: 'Crying' },
  { emoji: '\u{1F62E}', label: 'Surprised' },
  { emoji: '\u{1F621}', label: 'Angry' },
  { emoji: '\u{1F60D}', label: 'Heart eyes' },
  { emoji: '\u{1F914}', label: 'Thinking' },
  { emoji: '\u{1F389}', label: 'Party' },
  { emoji: '\u{1F44F}', label: 'Clap' },
  { emoji: '\u{1F4AF}', label: 'Hundred' },
  { emoji: '\u{1F440}', label: 'Eyes' },
  { emoji: '\u{1F480}', label: 'Skull' },
  { emoji: '\u{1F631}', label: 'Screaming' },
  { emoji: '\u{1F60E}', label: 'Sunglasses' },
  { emoji: '\u{1F622}', label: 'Sad' },
  { emoji: '\u{1F4AA}', label: 'Strong' },
  { emoji: '\u{1F64F}', label: 'Pray' },
  { emoji: '\u{1F680}', label: 'Rocket' },
  { emoji: '\u{2705}', label: 'Check' },
  { emoji: '\u{274C}', label: 'Cross' },
  { emoji: '\u{26A0}\u{FE0F}', label: 'Warning' },
  { emoji: '\u{1F4B0}', label: 'Money bag' },
  { emoji: '\u{1F3B4}', label: 'Card' },
  { emoji: '\u{2728}', label: 'Sparkles' },
  { emoji: '\u{1F31F}', label: 'Star' },
  { emoji: '\u{1F451}', label: 'Crown' },
  { emoji: '\u{1F48E}', label: 'Gem' },
  { emoji: '\u{1F3C6}', label: 'Trophy' },
  { emoji: '\u{1F3AF}', label: 'Bullseye' },
  { emoji: '\u{26A1}', label: 'Lightning' },
  { emoji: '\u{1F30A}', label: 'Wave' },
  { emoji: '\u{1F343}', label: 'Leaf' },
  { emoji: '\u{1F916}', label: 'Robot' },
  { emoji: '\u{1F47B}', label: 'Ghost' },
  { emoji: '\u{1F409}', label: 'Dragon' },
  { emoji: '\u{1F98A}', label: 'Fox' },
  { emoji: '\u{1F43E}', label: 'Paw prints' },
  { emoji: '\u{1F52E}', label: 'Crystal ball' },
  { emoji: '\u{1F3B2}', label: 'Dice' },
  { emoji: '\u{1F0CF}', label: 'Joker card' },
  { emoji: '\u{1F4E6}', label: 'Package' },
  { emoji: '\u{1F4B8}', label: 'Money wings' },
  { emoji: '\u{1F91D}', label: 'Handshake' },
  { emoji: '\u{1F929}', label: 'Star struck' },
  { emoji: '\u{1F973}', label: 'Party face' },
  { emoji: '\u{1F92F}', label: 'Mind blown' },
  { emoji: '\u{1FAE1}', label: 'Salute' },
];

const EmojiPicker = ({ onSelect, trigger }) => {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        {trigger || (
          <button
            type="button"
            className="flex items-center justify-center h-8 w-8 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Pick an emoji"
          >
            <Smile className="h-4 w-4" />
          </button>
        )}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side="top"
          align="start"
          sideOffset={8}
          className={cn(
            'z-[600] w-[280px] rounded-xl border border-gray-200 bg-white p-2 shadow-xl',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95'
          )}
        >
          <div className="grid grid-cols-8 gap-0.5">
            {EMOJIS.map(({ emoji, label }) => (
              <button
                key={label}
                type="button"
                onClick={() => onSelect(emoji)}
                className="flex items-center justify-center h-8 w-8 rounded-md text-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-1 focus:ring-amber-400"
                aria-label={label}
                title={label}
              >
                {emoji}
              </button>
            ))}
          </div>
          <Popover.Arrow className="fill-gray-200" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

export default EmojiPicker;
