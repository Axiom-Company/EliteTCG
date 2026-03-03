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
  getDMMessages,
  getOrCreateDM,
  getChannelPinned,
  sendDMMessage,
  editDMMessage,
  deleteDMMessage,
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
  const { user, getToken } = useAuth();

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

  const { messages, loading, setInitialMessages } = useChatMessages(
    socket,
    isDM ? null : activeSlug,
    isDM
  );

  const { onlineUsers, onlineCount } = useChatPresence(socket);
  const { typingUsers, sendTyping } = useTypingIndicator(socket, isDM ? null : activeSlug);

  // Fetch channels on mount
  useEffect(() => {
    let cancelled = false;
    const token = getToken();
    if (!token) return;

    getChannels(token)
      .then((data) => {
        if (cancelled) return;
        const list = Array.isArray(data) ? data : data?.channels || [];
        setChannels(list);
      })
      .catch(() => {
        if (!cancelled) toast.error('Failed to load channels.');
      });

    return () => { cancelled = true; };
  }, [getToken]);

  // Fetch DM list
  useEffect(() => {
    let cancelled = false;
    const token = getToken();
    if (!token) return;

    getDMList(token)
      .then((data) => {
        if (cancelled) return;
        setDmConversations(Array.isArray(data) ? data : data?.conversations || []);
      })
      .catch(() => {});

    return () => { cancelled = true; };
  }, [getToken]);

  // Set active channel object when slug or channels change
  useEffect(() => {
    if (isDM || channels.length === 0) return;
    const found = channels.find((c) => c.slug === activeSlug);
    setActiveChannel(found || null);
  }, [activeSlug, channels, isDM]);

  // Join/leave channels when slug changes
  useEffect(() => {
    if (!connected || isDM) return;

    const prev = prevSlugRef.current;
    if (prev && prev !== activeSlug) {
      leaveChannel(prev);
    }
    joinChannel(activeSlug);
    prevSlugRef.current = activeSlug;

    return () => {
      if (activeSlug) {
        leaveChannel(activeSlug);
      }
    };
  }, [activeSlug, connected, isDM, joinChannel, leaveChannel]);

  // Fetch pinned messages when channel changes
  useEffect(() => {
    if (isDM) {
      setPinnedMessages([]);
      return;
    }

    let cancelled = false;
    const token = getToken();
    if (!token || !activeSlug) return;

    getChannelPinned(activeSlug, token)
      .then((data) => {
        if (cancelled) return;
        setPinnedMessages(Array.isArray(data) ? data : data?.messages || []);
      })
      .catch(() => {});

    return () => { cancelled = true; };
  }, [activeSlug, isDM, getToken]);

  // Fetch DM messages when activeDMId changes
  useEffect(() => {
    if (!isDM || !activeDMId) return;

    let cancelled = false;
    const token = getToken();
    if (!token) return;

    getDMMessages(token, activeDMId)
      .then((data) => {
        if (cancelled) return;
        const msgs = Array.isArray(data) ? data : data?.messages || [];
        setInitialMessages(msgs);
      })
      .catch(() => {
        if (!cancelled) toast.error('Failed to load messages.');
      });

    return () => { cancelled = true; };
  }, [activeDMId, isDM, getToken, setInitialMessages]);

  // Clear reply when channel changes
  useEffect(() => {
    setReplyTo(null);
    setShowPinned(false);
  }, [activeSlug, activeDMId]);

  const handleSelectChannel = useCallback(
    (slug) => {
      setIsDM(false);
      setActiveDMId(null);
      setDmUserName('');
      setShowSidebar(false);
      navigate(`/chat/${slug}`);
    },
    [navigate]
  );

  const handleSelectDM = useCallback(
    (channelId) => {
      const dm = dmConversations.find((d) => d.channel_id === channelId);
      setIsDM(true);
      setActiveDMId(channelId);
      setDmUserName(dm?.other_user?.name || 'Direct Message');
      setActiveChannel(null);
      setShowSidebar(false);

      if (prevSlugRef.current) {
        leaveChannel(prevSlugRef.current);
        prevSlugRef.current = null;
      }
    },
    [dmConversations, leaveChannel]
  );

  const handleNewDM = useCallback(async () => {
    toast.info('Select a user from the online list to start a DM.');
  }, []);

  const handleStartDM = useCallback(
    async (userId) => {
      const token = getToken();
      if (!token) return;

      try {
        const result = await getOrCreateDM(token, userId);
        const channelId = result?.channel_id || result?.id;
        if (!channelId) throw new Error('Invalid response');

        setIsDM(true);
        setActiveDMId(channelId);
        setDmUserName(result?.other_user?.name || 'Direct Message');
        setActiveChannel(null);

        if (prevSlugRef.current) {
          leaveChannel(prevSlugRef.current);
          prevSlugRef.current = null;
        }

        const updated = await getDMList(token);
        setDmConversations(Array.isArray(updated) ? updated : updated?.conversations || []);
      } catch (err) {
        toast.error(err?.message || 'Failed to start conversation.');
      }
    },
    [getToken, leaveChannel]
  );

  const handleSend = useCallback(
    (content) => {
      if (isDM) {
        const token = getToken();
        sendDMMessage(token, activeDMId, content, replyTo?.id || null).catch((err) =>
          toast.error(err?.message || 'Failed to send message.')
        );
      } else {
        sendMessage(activeSlug, content, replyTo || null);
      }
      setReplyTo(null);
    },
    [isDM, activeSlug, activeDMId, sendMessage, replyTo, getToken]
  );

  const handleEdit = useCallback(
    (message) => {
      const newContent = prompt('Edit message:', message.content);
      if (newContent === null || newContent.trim() === '' || newContent === message.content) return;

      if (isDM) {
        const token = getToken();
        editDMMessage(token, activeDMId, message.id, newContent.trim()).catch((err) =>
          toast.error(err?.message || 'Failed to edit message.')
        );
      } else {
        editMessage(activeSlug, message.id, newContent.trim());
      }
    },
    [isDM, activeSlug, activeDMId, editMessage, getToken]
  );

  const handleDelete = useCallback(
    (messageId) => {
      if (!confirm('Delete this message?')) return;

      if (isDM) {
        const token = getToken();
        deleteDMMessage(token, activeDMId, messageId).catch((err) =>
          toast.error(err?.message || 'Failed to delete message.')
        );
      } else {
        deleteMessage(activeSlug, messageId);
      }
    },
    [isDM, activeSlug, activeDMId, deleteMessage, getToken]
  );

  const handlePin = useCallback(
    (messageId) => {
      if (isDM) return;
      pinMessage(activeSlug, messageId);
    },
    [isDM, activeSlug, pinMessage]
  );

  const handleReact = useCallback(
    (messageId, emoji) => {
      if (isDM) return;
      reactToMessage(activeSlug, messageId, emoji);
    },
    [isDM, activeSlug, reactToMessage]
  );

  const handleTyping = useCallback(() => {
    if (!isDM) {
      sendTyping();
    }
  }, [isDM, sendTyping]);

  const isModOrAdmin =
    user?.user_metadata?.role === 'admin' || user?.user_metadata?.role === 'moderator';

  return (
    <div className="flex h-screen bg-gray-950 text-gray-100">
      {/* Mobile sidebar overlay */}
      {showSidebar && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setShowSidebar(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 lg:relative lg:z-auto',
          'transition-transform duration-200 ease-in-out',
          showSidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
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

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile menu button + Header */}
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => setShowSidebar((s) => !s)}
            className="flex items-center justify-center h-12 w-12 text-gray-400 hover:text-gray-200 lg:hidden"
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

        {/* Messages */}
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

        {/* Typing indicator */}
        <TypingIndicator typingUsers={typingUsers} />

        {/* Input */}
        <MessageInput
          onSend={handleSend}
          onTyping={handleTyping}
          replyTo={replyTo}
          onCancelReply={() => setReplyTo(null)}
          isDM={isDM}
          channelId={activeDMId}
          token={getToken()}
          disabled={!connected && !isDM}
        />
      </div>

      {/* Online users - hidden on mobile */}
      {!isDM && (
        <div className="hidden lg:block">
          <OnlineUserList onlineUsers={onlineUsers} onStartDM={handleStartDM} />
        </div>
      )}

      {/* Pinned messages panel */}
      <PinnedMessages
        pinned={pinnedMessages}
        isOpen={showPinned}
        onClose={() => setShowPinned(false)}
      />
    </div>
  );
};

export default ChatLayout;
