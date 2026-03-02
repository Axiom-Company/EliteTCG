import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { ELITE_API_URL } from '../config/api';
import { useAuth } from '../contexts/AuthContext';

export function useChatSocket() {
  const { getToken, isAuthenticated } = useAuth();
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    const token = getToken();
    if (!token) return;

    const socket = io(ELITE_API_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      setConnected(true);
      setError(null);
    });

    socket.on('disconnect', () => setConnected(false));

    socket.on('connect_error', (err) => {
      setConnected(false);
      setError(err.message);
    });

    socket.on('error', (data) => {
      setError(data.message || 'Socket error');
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, getToken]);

  const joinChannel = useCallback((slug) => {
    socketRef.current?.emit('channel:join', { channelSlug: slug });
  }, []);

  const leaveChannel = useCallback((slug) => {
    socketRef.current?.emit('channel:leave', { channelSlug: slug });
  }, []);

  const sendMessage = useCallback((slug, content, replyTo = null) => {
    socketRef.current?.emit('message:send', {
      channelSlug: slug,
      content,
      replyTo: replyTo ? { id: replyTo.id, author_name: replyTo.author_name, content: replyTo.content } : undefined,
    });
  }, []);

  const editMessage = useCallback((slug, messageId, content) => {
    socketRef.current?.emit('message:edit', { channelSlug: slug, messageId, content });
  }, []);

  const deleteMessage = useCallback((slug, messageId) => {
    socketRef.current?.emit('message:delete', { channelSlug: slug, messageId });
  }, []);

  const pinMessage = useCallback((slug, messageId) => {
    socketRef.current?.emit('message:pin', { channelSlug: slug, messageId });
  }, []);

  const reactToMessage = useCallback((slug, messageId, emoji) => {
    socketRef.current?.emit('message:react', { channelSlug: slug, messageId, emoji });
  }, []);

  const sendTyping = useCallback((slug) => {
    socketRef.current?.emit('typing:start', { channelSlug: slug });
  }, []);

  return {
    socket: socketRef.current,
    connected,
    error,
    joinChannel,
    leaveChannel,
    sendMessage,
    editMessage,
    deleteMessage,
    pinMessage,
    reactToMessage,
    sendTyping,
  };
}
