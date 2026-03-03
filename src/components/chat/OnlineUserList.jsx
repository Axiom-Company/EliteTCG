import { MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const UserAvatar = ({ user }) => {
  const initials = (user.name || '').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  return (
    <div className="relative shrink-0">
      {user.avatar_url ? (
        <img src={user.avatar_url} alt={user.name} className="h-8 w-8 rounded-full object-cover" />
      ) : (
        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-200 text-gray-500 text-xs font-medium">
          {initials || '?'}
        </div>
      )}
      <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" aria-hidden="true" />
    </div>
  );
};

const OnlineUserList = ({ onlineUsers, onStartDM }) => {
  const users = onlineUsers || [];
  return (
    <aside className="flex flex-col h-full w-60 bg-white border-l border-gray-100">
      <div className="px-4 pt-4 pb-2">
        <h3 className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
          Online &mdash; {users.length}
        </h3>
      </div>
      {users.length === 0 ? (
        <div className="flex-1 flex items-center justify-center px-4">
          <p className="text-xs text-gray-400 text-center">No users online right now.</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-2 pb-4">
          <ul className="space-y-0.5" role="list">
            {users.map((user) => (
              <li key={user.id}>
                <button
                  type="button"
                  onClick={() => onStartDM(user.id)}
                  className={cn(
                    'flex items-center gap-2.5 w-full px-2 py-1.5 rounded-lg',
                    'text-left text-sm text-gray-700',
                    'hover:bg-gray-50 transition-colors',
                    'focus:outline-none focus:ring-1 focus:ring-amber-400 focus:ring-offset-0',
                    'group'
                  )}
                  title={`Message ${user.name}`}
                >
                  <UserAvatar user={user} />
                  <span className="flex-1 truncate">{user.name}</span>
                  <MessageCircle className="h-3.5 w-3.5 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
};

export default OnlineUserList;
