import { useState, useEffect, useCallback, useRef } from 'react';

export function useChatMessages(socket, channelSlug, isDM = false) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const slugRef = useRef(channelSlug);

  useEffect(() => {
    slugRef.current = channelSlug;
  }, [channelSlug]);

  useEffect(() => {
    if (!socket) return;

    setMessages([]);
    setLoading(true);

    const onHistory = (data) => {
      if (data.channelSlug === slugRef.current) {
        setMessages(data.messages || []);
        setLoading(false);
      }
    };

    const onNewMessage = (msg) => {
      if (isDM || msg.channel_slug === slugRef.current) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    const onEdited = (data) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === data.id ? { ...m, content: data.content, is_edited: true, edited_at: data.edited_at } : m
        )
      );
    };

    const onDeleted = (data) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === data.id ? { ...m, is_deleted: true, content: '' } : m))
      );
    };

    const onPinned = (data) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === data.message?.id ? { ...m, is_pinned: true } : m))
      );
    };

    const onReaction = (data) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === data.messageId ? { ...m, reactions: data.reactions } : m))
      );
    };

    socket.on('channel:history', onHistory);
    socket.on('message:new', onNewMessage);
    socket.on('message:edited', onEdited);
    socket.on('message:deleted', onDeleted);
    socket.on('message:pinned', onPinned);
    socket.on('reaction:updated', onReaction);

    return () => {
      socket.off('channel:history', onHistory);
      socket.off('message:new', onNewMessage);
      socket.off('message:edited', onEdited);
      socket.off('message:deleted', onDeleted);
      socket.off('message:pinned', onPinned);
      socket.off('reaction:updated', onReaction);
    };
  }, [socket, channelSlug, isDM]);

  const addLocalMessage = useCallback((msg) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  const setInitialMessages = useCallback((msgs) => {
    setMessages(msgs);
    setLoading(false);
  }, []);

  return { messages, loading, addLocalMessage, setInitialMessages };
}
