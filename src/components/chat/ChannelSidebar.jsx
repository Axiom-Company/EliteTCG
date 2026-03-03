import { MessageSquare, Wifi, WifiOff } from 'lucide-react';
import ChannelList from './ChannelList';
import DMList from './DMList';

function ChannelSidebar({ channels, activeSlug, activeDMId, dmConversations, onSelectChannel, onSelectDM, onNewDM, connected }) {
  return (
    <aside className="flex h-full w-64 shrink-0 flex-col bg-white border-r border-gray-100">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
        <MessageSquare className="h-5 w-5 text-amber-500" />
        <span className="text-base font-bold text-gray-900 tracking-tight">EliteTCG Chat</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="pt-3 pb-1 px-3">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Channels</span>
        </div>
        <ChannelList channels={channels} activeSlug={activeSlug} onSelectChannel={onSelectChannel} />

        <div className="mx-3 my-3 border-t border-gray-100" />

        <DMList conversations={dmConversations} activeDMId={activeDMId} onSelectDM={onSelectDM} onNewDM={onNewDM} />
      </div>

      <div className="flex items-center gap-2 border-t border-gray-100 bg-gray-50/50 px-4 py-2">
        {connected ? (
          <>
            <Wifi className="h-3.5 w-3.5 text-emerald-500" />
            <span className="text-xs text-emerald-600">Connected</span>
          </>
        ) : (
          <>
            <WifiOff className="h-3.5 w-3.5 text-gray-400" />
            <span className="text-xs text-gray-400">Disconnected</span>
          </>
        )}
      </div>
    </aside>
  );
}

export default ChannelSidebar;
