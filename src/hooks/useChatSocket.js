import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { ELITE_API_URL } from '../config/api';
import { useAuth } from '../contexts/AuthContext';

// delivery state per tempId: 'sending' | 'sent' | 'delivered' | 'failed'
export function useChatSocket() {
  const { getToken, isAuthenticated } = useAuth();
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const [deliveryState, setDeliveryState] = useState({});
  const socketRef = useRef(null);
  const pendingAcks = useRef({});

  const updateDelivery = useCallback((tempId, state) => {
    setDeliveryState(prev => ({ ...prev, [tempId]: state }));
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;

    (async () => {
      const token = await getToken();
      if (!token || cancelled) return;

      const socket = io(ELITE_API_URL, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
      });

      socket.on('connect', () => { setConnected(true); setError(null); });
      socket.on('disconnect', () => setConnected(false));
      socket.on('connect_error', (err) => { setConnected(false); setError(err.message); });
      socket.on('error', (data) => { setError(data.message || 'Socket error'); });

      // When server broadcasts a message back (our own message confirmed by server)
      socket.on('message:broadcast', (msg) => {
        const tempId = msg.temp_id || msg.tempId;
        if (tempId && pendingAcks.current[tempId]) {
          clearTimeout(pendingAcks.current[tempId]);
          delete pendingAcks.current[tempId];
          setDeliveryState(prev => ({ ...prev, [tempId]: 'delivered' }));
        }
      });

      socketRef.current = socket;
    })();

    return () => {
      cancelled = true;
      Object.values(pendingAcks.current).forEach(clearTimeout);
      pendingAcks.current = {};
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, getToken]);

  const joinChannel = useCallback((slug) => {
    socketRef.current?.emit('channel:join', { channelSlug: slug });
  }, []);

  const leaveChannel = useCallback((slug) => {
    socketRef.current?.emit('channel:leave', { channelSlug: slug });
  }, []);

  const sendMessage = useCallback((slug, content, replyTo = null, tempId = null) => {
    const id = tempId || `tmp-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    updateDelivery(id, 'sending');

    socketRef.current?.emit('message:send', {
      channelSlug: slug,
      content,
      replyTo: replyTo ? { id: replyTo.id, author_name: replyTo.author_name, content: replyTo.content } : undefined,
      temp_id: id,
    }, (ack) => {
      // Socket.io acknowledgement from server
      if (ack?.error) {
        updateDelivery(id, 'failed');
      } else {
        updateDelivery(id, 'sent');
      }
    });

    // Timeout fallback: if no ack within 5s mark as failed
    const timeout = setTimeout(() => {
      setDeliveryState(prev => {
        if (prev[id] === 'sending') return { ...prev, [id]: 'failed' };
        return prev;
      });
      delete pendingAcks.current[id];
    }, 5000);

    pendingAcks.current[id] = timeout;

    return id;
  }, [updateDelivery]);

  const retryMessage = useCallback((slug, content, replyTo, oldTempId) => {
    // Clear failed state and resend
    setDeliveryState(prev => {
      const next = { ...prev };
      delete next[oldTempId];
      return next;
    });
    return sendMessage(slug, content, replyTo);
  }, [sendMessage]);

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
    deliveryState,
    joinChannel,
    leaveChannel,
    sendMessage,
    retryMessage,
    editMessage,
    deleteMessage,
    pinMessage,
    reactToMessage,
    sendTyping,
  };
}
