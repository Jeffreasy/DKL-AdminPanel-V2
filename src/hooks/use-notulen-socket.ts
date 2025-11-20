import { useCallback, useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { Notulen } from '@/api/types/notulen.types';

// Helper function to get the WebSocket token
const getWebSocketToken = (): string | null => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  return token;
};

// WebSocket message types
interface WebSocketMessage {
  type: string;
  data: Notulen;
  timestamp: string;
}

export const useNotulenSocket = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const connectRef = useRef<() => void>();

  // Get WebSocket URL from environment
  const getWebSocketUrl = (): string => {
    const wsBaseUrl = import.meta.env.VITE_WS_BASE_URL || import.meta.env.VITE_API_BASE_URL?.replace(/^http/, 'ws') || 'ws://localhost:8080';
    const wsToken = getWebSocketToken();
    return `${wsBaseUrl}/api/ws/notulen?token=${wsToken}`;
  };

  // Handle incoming WebSocket messages
  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);

      switch (message.type) {
        case 'notulen_updated':
        case 'notulen_finalized':
        case 'notulen_archived':
          // Invalidate and refetch notulen queries
          queryClient.invalidateQueries({ queryKey: ['notulen'] });

          // Also invalidate specific notulen by ID if we have it
          if (message.data.id) {
            queryClient.invalidateQueries({ queryKey: ['notulen', message.data.id] });
          }
          break;

        default:
          // Unhandled message type
      }
    } catch (error) {
      // Silently handle parsing errors to maintain hook functionality
    }
  }, [queryClient]);

  // Attempt to reconnect with exponential backoff
  const attemptReconnect = useCallback(() => {
    if (reconnectAttempts.current >= maxReconnectAttempts) {
      return;
    }

    reconnectAttempts.current++;
    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current - 1), 30000);

    reconnectTimeoutRef.current = setTimeout(() => {
      connectRef.current?.();
    }, delay);
  }, []);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (!token) {
      return;
    }

    try {
      const wsUrl = getWebSocketUrl();
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        setIsConnected(true);
        reconnectAttempts.current = 0;
      };

      wsRef.current.onmessage = handleMessage;

      wsRef.current.onclose = () => {
        setIsConnected(false);
        attemptReconnect();
      };

      wsRef.current.onerror = () => {
        setIsConnected(false);
      };
    } catch (error) {
      attemptReconnect();
    }
  }, [token, handleMessage, attemptReconnect]);

  connectRef.current = connect;

  // Disconnect from WebSocket
  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setIsConnected(false);
    reconnectAttempts.current = 0;
  };

  // Effect to manage WebSocket connection
  useEffect(() => {
    if (token) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [token, connect]);

  return {
    isConnected,
    connect,
    disconnect
  };
};