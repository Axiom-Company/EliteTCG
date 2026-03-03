import { Hash, Pin, Users, AtSign } from 'lucide-react';
import { cn } from '@/lib/utils';

function ChannelHeader({
  channel,
  memberCount,
  onlineCount,
  onShowPinned,
  onShowMembers,
  isDM,
  dmUserName,
}) {
  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-gray-800 bg-gray-900 px-4">
      <div className="flex min-w-0 items-center gap-2">
        {isDM ? (
          <AtSign className="h-4.5 w-4.5 shrink-0 text-gray-500" />
        ) : (
          <Hash className="h-4.5 w-4.5 shrink-0 text-gray-500" />
        )}

        <h2 className="truncate text-sm font-semibold text-white">
          {isDM ? dmUserName : channel?.name}
        </h2>

        {!isDM && channel?.description && (
          <>
            <span className="mx-1.5 h-4 w-px shrink-0 bg-gray-700" />
            <span className="truncate text-xs text-gray-500">
              {channel.description}
            </span>
          </>
        )}
      </div>

      <div className="flex items-center gap-1">
        {!isDM && (
          <button
            type="button"
            onClick={onShowPinned}
            className="rounded p-1.5 text-gray-400 transition-colors hover:bg-gray-800 hover:text-gray-200"
            aria-label="Show pinned messages"
          >
            <Pin className="h-4 w-4" />
          </button>
        )}

        {!isDM && (
          <button
            type="button"
            onClick={onShowMembers}
            className="rounded p-1.5 text-gray-400 transition-colors hover:bg-gray-800 hover:text-gray-200"
            aria-label="Show members"
          >
            <Users className="h-4 w-4" />
          </button>
        )}

        {!isDM && typeof memberCount === 'number' && (
          <span className="ml-1 text-xs text-gray-500">
            <span className="text-emerald-400">{onlineCount ?? 0}</span>
            {' / '}
            {memberCount}
          </span>
        )}
      </div>
    </header>
  );
}

export default ChannelHeader;
