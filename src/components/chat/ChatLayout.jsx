import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useChatSocket } from '@/hooks/useChatSocket';
import { useChatMessages } from '@/hooks/useChatMessages';
import { useChatPresence } from '@/hooks/useChatPresence';
import { useTypingIndicator } from '@/hooks/useTypingIndicator';
import {
  getChannels,
  getDMList,
  getOrCreateDM,
  getChannelPinned,
} from '@/services/chatApi';
import ChannelSidebar from './ChannelSidebar';
import ChannelHeader from './ChannelHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import OnlineUserList from './OnlineUserList';
import TypingIndicator from './TypingIndicator';
import PinnedMessages from './PinnedMessages';

const ChatLayout = () => {
  const { channelSlug } = useParams();
  const navigate = useNavigate();
  const { user, session } = useAuth();

  const token = session?.access_token || null;
  const activeSlug = channelSlug || 'general';

  const [channels, setChannels] = useState([]);
  const [activeChannel, setActiveChannel] = useState(null);
  const [dmConversations, setDmConversations] = useState([]);
  const [activeDMId, setActiveDMId] = useState(null);
  const [isDM, setIsDM] = useState(false);
  const [dmUserName, setDmUserName] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [pinnedMessages, setPinnedMessages] = useState([]);
  const [showPinned, setShowPinned] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

  const prevSlugRef = useRef(null);

  const {
    socket,
    connected,
    joinChannel,
    leaveChannel,
    sendMessage,
    editMessage,
    deleteMessage,
    pinMessage,
    reactToMessage,
  } = useChatSocket();

  const { messages, loading } = useChatMessages(socket, isDM ? activeDMId : activeSlug, isDM);
  const { onlineUsers, onlineCount } = useChatPresence(socket);
  const { typingUsers, sendTyping } = useTypingIndicator(socket, isDM ? null : activeSlug);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    getChannels(token)
      .then((data) => { if (!cancelled) setChannels(Array.isArray(data) ? data : data?.channels || []); })
      .catch(() => { if (!cancelled) toast.error('Failed to load channels.'); });
    return () => { cancelled = true; };
  }, [token]);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    getDMList(token)
      .then((data) => { if (!cancelled) setDmConversations(Array.isArray(data) ? data : data?.dms || []); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [token]);

  useEffect(() => {
    if (isDM || channels.length === 0) return;
    setActiveChannel(channels.find((c) => c.slug === activeSlug) || null);
  }, [activeSlug, channels, isDM]);

  useEffect(() => {
    if (!connected || isDM) return;
    const prev = prevSlugRef.current;
    if (prev && prev !== activeSlug) leaveChannel(prev);
    joinChannel(activeSlug);
    prevSlugRef.current = activeSlug;
    return () => { if (activeSlug) leaveChannel(activeSlug); };
  }, [activeSlug, connected, isDM, joinChannel, leaveChannel]);

  useEffect(() => {
    if (isDM) { setPinnedMessages([]); return; }
    if (!token || !activeSlug) return;
    let cancelled = false;
    getChannelPinned(activeSlug, token)
      .then((data) => { if (!cancelled) setPinnedMessages(Array.isArray(data) ? data : data?.pinned || []); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [activeSlug, isDM, token]);

  useEffect(() => { setReplyTo(null); setShowPinned(false); }, [activeSlug, activeDMId]);

  const handleSelectChannel = useCallback((slug) => {
    if (prevSlugRef.current) { leaveChannel(prevSlugRef.current); }
    setIsDM(false); setActiveDMId(null); setDmUserName(''); setShowSidebar(false);
    prevSlugRef.current = null;
    navigate(`/chat/${slug}`);
  }, [navigate, leaveChannel]);

  const handleSelectDM = useCallback((channelId) => {
    if (prevSlugRef.current) { leaveChannel(prevSlugRef.current); }
    const dm = dmConversations.find((d) => d.channel_id === channelId);
    setIsDM(true); setActiveDMId(channelId); setDmUserName(dm?.other_user?.name || 'Direct Message');
    setActiveChannel(null); setShowSidebar(false);
    joinChannel(channelId);
    prevSlugRef.current = channelId;
  }, [dmConversations, leaveChannel, joinChannel]);

  const handleNewDM = useCallback(() => { toast.info('Select a user from the online list to start a DM.'); }, []);

  const handleStartDM = useCallback(async (userId) => {
    if (!token) return;
    try {
      const result = await getOrCreateDM(token, userId);
      const channelId = result?.channel_id || result?.id;
      if (!channelId) throw new Error('Invalid response');
      if (prevSlugRef.current) { leaveChannel(prevSlugRef.current); }
      setIsDM(true); setActiveDMId(channelId); setDmUserName(result?.other_user?.name || 'Direct Message');
      setActiveChannel(null);
      joinChannel(channelId);
      prevSlugRef.current = channelId;
      const updated = await getDMList(token);
      setDmConversations(Array.isArray(updated) ? updated : updated?.dms || []);
    } catch (err) { toast.error(err?.message || 'Failed to start conversation.'); }
  }, [token, leaveChannel, joinChannel]);

  const handleSend = useCallback((content) => {
    const slug = isDM ? activeDMId : activeSlug;
    sendMessage(slug, content, replyTo || null);
    setReplyTo(null);
  }, [isDM, activeSlug, activeDMId, sendMessage, replyTo]);

  const handleEdit = useCallback((message) => {
    const newContent = prompt('Edit message:', message.content);
    if (newContent === null || newContent.trim() === '' || newContent === message.content) return;
    const slug = isDM ? activeDMId : activeSlug;
    editMessage(slug, message.id, newContent.trim());
  }, [isDM, activeSlug, activeDMId, editMessage]);

  const handleDelete = useCallback((messageId) => {
    if (!confirm('Delete this message?')) return;
    const slug = isDM ? activeDMId : activeSlug;
    deleteMessage(slug, messageId);
  }, [isDM, activeSlug, activeDMId, deleteMessage]);

  const handlePin = useCallback((messageId) => { if (!isDM) pinMessage(activeSlug, messageId); }, [isDM, activeSlug, pinMessage]);
  const handleReact = useCallback((messageId, emoji) => { if (!isDM) reactToMessage(activeSlug, messageId, emoji); }, [isDM, activeSlug, reactToMessage]);
  const handleTyping = useCallback(() => { if (!isDM) sendTyping(); }, [isDM, sendTyping]);

  const isModOrAdmin = user?.role === 'admin' || user?.role === 'moderator';

  return (
    <div className="flex h-screen bg-stone-50 text-gray-900">
      {showSidebar && (
        <div className="fixed inset-0 z-40 bg-black/20 lg:hidden" onClick={() => setShowSidebar(false)} aria-hidden="true" />
      )}

      <div className={cn(
        'fixed inset-y-0 left-0 z-50 lg:relative lg:z-auto transition-transform duration-200 ease-in-out',
        showSidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        <ChannelSidebar
          channels={channels}
          activeSlug={isDM ? null : activeSlug}
          activeDMId={activeDMId}
          dmConversations={dmConversations}
          onSelectChannel={handleSelectChannel}
          onSelectDM={handleSelectDM}
          onNewDM={handleNewDM}
          connected={connected}
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => setShowSidebar((s) => !s)}
            className="flex items-center justify-center h-12 w-12 text-gray-400 hover:text-gray-600 lg:hidden"
            aria-label="Toggle sidebar"
          >
            {showSidebar ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className="flex-1">
            <ChannelHeader
              channel={activeChannel}
              memberCount={onlineUsers.length}
              onlineCount={onlineCount}
              onShowPinned={() => setShowPinned(true)}
              onShowMembers={() => {}}
              isDM={isDM}
              dmUserName={dmUserName}
            />
          </div>
        </div>

        <MessageList
          messages={messages}
          currentUserId={user?.id}
          loading={loading}
          onReply={(msg) => setReplyTo(msg)}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onPin={handlePin}
          onReact={handleReact}
          isModOrAdmin={isModOrAdmin}
        />

        <TypingIndicator typingUsers={typingUsers} />

        <MessageInput
          onSend={handleSend}
          onTyping={handleTyping}
          replyTo={replyTo}
          onCancelReply={() => setReplyTo(null)}
          isDM={isDM}
          channelId={activeDMId}
          token={token}
          disabled={!connected}
        />
      </div>

      {!isDM && (
        <div className="hidden lg:block">
          <OnlineUserList onlineUsers={onlineUsers} onStartDM={handleStartDM} />
        </div>
      )}

      <PinnedMessages pinned={pinnedMessages} isOpen={showPinned} onClose={() => setShowPinned(false)} />
    </div>
  );
};

export default ChatLayout;
