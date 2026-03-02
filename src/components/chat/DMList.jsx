import { Plus, User } from 'lucide-react';
import { cn } from '@/lib/utils';

function formatRelativeTime(dateStr) {
  if (!dateStr) return '';
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return 'now';
  if (diffMin < 60) return `${diffMin}m`;
  if (diffHr < 24) return `${diffHr}h`;
  if (diffDay < 7) return `${diffDay}d`;
  return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function DMList({ conversations, activeDMId, onSelectDM, onNewDM }) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between px-3 py-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          Direct Messages
        </span>
        <button
          type="button"
          onClick={onNewDM}
          className="rounded p-0.5 text-gray-400 transition-colors hover:bg-gray-800 hover:text-gray-200"
          aria-label="New direct message"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <ul className="space-y-0.5 px-2">
        {conversations.map((dm) => {
          const isActive = dm.channel_id === activeDMId;
          const other = dm.other_user;

          return (
            <li key={dm.channel_id}>
              <button
                type="button"
                onClick={() => onSelectDM(dm.channel_id)}
                className={cn(
                  'flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left transition-colors',
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                )}
              >
                {other?.avatar_url ? (
                  <img
                    src={other.avatar_url}
                    alt=""
                    className="h-7 w-7 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-700 text-gray-300">
                    <User className="h-3.5 w-3.5" />
                  </span>
                )}

                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-center justify-between">
                    <span className="truncate text-sm font-medium">
                      {other?.name || 'Unknown'}
                    </span>
                    {dm.last_message_at && (
                      <span
                        className={cn(
                          'ml-1 shrink-0 text-[10px]',
                          isActive ? 'text-indigo-200' : 'text-gray-600'
                        )}
                      >
                        {formatRelativeTime(dm.last_message_at)}
                      </span>
                    )}
                  </div>
                  {dm.last_message && (
                    <span
                      className={cn(
                        'truncate text-xs',
                        isActive ? 'text-indigo-200' : 'text-gray-600'
                      )}
                    >
                      {dm.last_message}
                    </span>
                  )}
                </div>
              </button>
            </li>
          );
        })}

        {conversations.length === 0 && (
          <li className="px-2 py-3 text-center text-xs text-gray-600">
            No conversations yet
          </li>
        )}
      </ul>
    </div>
  );
}

export default DMList;
