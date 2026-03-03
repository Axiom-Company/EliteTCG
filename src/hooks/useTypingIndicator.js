import { useState, useEffect, useCallback, useRef } from 'react';

const TYPING_TIMEOUT = 4000;
const SEND_DEBOUNCE = 3000;

export function useTypingIndicator(socket, channelSlug) {
  const [typingUsers, setTypingUsers] = useState([]);
  const lastSentRef = useRef(0);
  const timersRef = useRef({});

  useEffect(() => {
    if (!socket) return;

    const onTyping = (data) => {
      if (data.channelSlug !== channelSlug) return;

      const key = data.userId;

      setTypingUsers((prev) => {
        const exists = prev.some((u) => u.userId === key);
        if (!exists) return [...prev, { userId: key, userName: data.userName }];
        return prev;
      });

      if (timersRef.current[key]) clearTimeout(timersRef.current[key]);
      timersRef.current[key] = setTimeout(() => {
        setTypingUsers((prev) => prev.filter((u) => u.userId !== key));
        delete timersRef.current[key];
      }, TYPING_TIMEOUT);
    };

    socket.on('typing:update', onTyping);

    return () => {
      socket.off('typing:update', onTyping);
      Object.values(timersRef.current).forEach(clearTimeout);
      timersRef.current = {};
      setTypingUsers([]);
    };
  }, [socket, channelSlug]);

  const sendTyping = useCallback(() => {
    const now = Date.now();
    if (now - lastSentRef.current < SEND_DEBOUNCE) return;
    lastSentRef.current = now;
    socket?.emit('typing:start', { channelSlug });
  }, [socket, channelSlug]);

  return { typingUsers, sendTyping };
}
