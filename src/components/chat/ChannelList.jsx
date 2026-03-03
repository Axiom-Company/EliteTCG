import {
  MessageCircle,
  Repeat,
  Sparkles,
  TrendingUp,
  Layers,
  MapPin,
  Hash,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ICON_MAP = {
  'message-circle': MessageCircle,
  repeat: Repeat,
  sparkles: Sparkles,
  'trending-up': TrendingUp,
  layers: Layers,
  'map-pin': MapPin,
};

function ChannelList({ channels, activeSlug, onSelectChannel }) {
  return (
    <ul className="space-y-0.5 px-2">
      {channels.map((channel) => {
        const Icon = ICON_MAP[channel.icon] || Hash;
        const isActive = channel.slug === activeSlug;
        return (
          <li key={channel.slug}>
            <button
              type="button"
              onClick={() => onSelectChannel(channel.slug)}
              className={cn(
                'flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-amber-50 text-amber-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <Icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-amber-500' : 'text-gray-400')} />
              <span className="truncate">{channel.name}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export default ChannelList;
