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

    const onHistory = ({ channelSlug: slug, messages: msgs }) => {
      if (slug === slugRef.current) {
        setMessages(msgs || []);
        setLoading(false);
      }
    };

    const onNewMessage = ({ channelSlug: slug, message }) => {
      if (isDM || slug === slugRef.current) {
        setMessages((prev) => [...prev, message]);
      }
    };

    const onEdited = ({ message }) => {
      if (!message) return;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === message.id
            ? { ...m, content: message.content, is_edited: true, edited_at: message.edited_at }
            : m
        )
      );
    };

    const onDeleted = ({ messageId }) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, is_deleted: true, content: '' } : m))
      );
    };

    const onPinned = ({ message }) => {
      if (!message) return;
      setMessages((prev) =>
        prev.map((m) => (m.id === message.id ? { ...m, is_pinned: true } : m))
      );
    };

    const onReaction = ({ messageId, reactions }) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, reactions } : m))
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
