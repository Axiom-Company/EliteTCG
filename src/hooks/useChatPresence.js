import { useState, useEffect, useCallback } from 'react';

export function useChatPresence(socket) {
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (!socket) return;

    const onPresence = (data) => {
      setOnlineUsers(data.onlineUsers || []);
    };

    socket.on('presence:update', onPresence);
    return () => socket.off('presence:update', onPresence);
  }, [socket]);

  const onlineCount = onlineUsers.length;

  const isUserOnline = useCallback(
    (userId) => onlineUsers.some((u) => u.id === userId),
    [onlineUsers]
  );

  return { onlineUsers, onlineCount, isUserOnline };
}
