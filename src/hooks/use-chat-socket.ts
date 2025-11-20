import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ChatMessage } from '@/api/types/chat.types';

const getToken = () => localStorage.getItem('access_token') || '';

export const useChatSocket = (channelId: string | null) => {
  const socketRef = useRef<WebSocket | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!channelId) return;
    const token = getToken();
    if (!token) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // Ensure correct backend port/host mapping
    const wsUrl = `${protocol}//localhost:8080/api/chat/ws/${channelId}?token=${token}`;

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {};

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'new_message' && msg.message) {
          const newMessage = msg.message as ChatMessage;
          queryClient.setQueryData<ChatMessage[]>(['chat-messages', channelId], (old) => {
            if (!old) return [newMessage];
            if (old.some(m => m.id === newMessage.id)) return old;
            return [...old, newMessage];
          });
        }
        if (msg.type === 'delete_message' && msg.id) {
           queryClient.setQueryData<ChatMessage[]>(['chat-messages', channelId], (old) => {
             return old ? old.filter(m => m.id !== msg.id) : [];
           });
        }
      } catch (err) {
        // Handle parse error silently
      }
    };

    ws.onclose = () => {};
    socketRef.current = ws;

    return () => {
      if (socketRef.current) socketRef.current.close();
    };
  }, [channelId, queryClient]);
};