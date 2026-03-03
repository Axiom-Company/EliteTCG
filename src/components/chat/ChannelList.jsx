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
                'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{channel.name}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export default ChannelList;
