import apiClient from '../../api/axios.client';
import {
  ChatChannel,
  ChatMessage,
  ChatUser,
  CreateChannelRequest,
  SendMessageRequest
} from '../../api/types/chat.types';

type UsersResponse = ChatUser[] | { users: ChatUser[] };

export const chatService = {
  getChannels: async () => {
    const { data } = await apiClient.get<ChatChannel[]>('/chat/channels');
    return data;
  },
  getPublicChannels: async () => {
    const { data } = await apiClient.get<ChatChannel[]>('/chat/public-channels');
    return data;
  },
  createChannel: async (req: CreateChannelRequest) => {
    const { data } = await apiClient.post<ChatChannel>('/chat/channels', req);
    return data;
  },
  createDirectChannel: async (userId: string) => {
    const { data } = await apiClient.post<ChatChannel>('/chat/direct', { user_id: userId });
    return data;
  },
  joinChannel: async (channelId: string) => {
    return apiClient.post(`/chat/channels/${channelId}/join`);
  },
  leaveChannel: async (channelId: string) => {
    return apiClient.post(`/chat/channels/${channelId}/leave`);
  },
  getMessages: async (channelId: string, limit = 50, offset = 0) => {
    const { data } = await apiClient.get<ChatMessage[]>(`/chat/channels/${channelId}/messages`, {
      params: { limit, offset }
    });
    return data.reverse(); 
  },
  sendMessage: async (channelId: string, req: SendMessageRequest) => {
    if (req.image) {
      const formData = new FormData();
      formData.append('image', req.image);
      if (req.content) formData.append('content', req.content);
      const { data } = await apiClient.post<ChatMessage>(`/chat/channels/${channelId}/messages`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return data;
    } else {
      const { data } = await apiClient.post<ChatMessage>(`/chat/channels/${channelId}/messages`, {
        content: req.content
      });
      return data;
    }
  },
  deleteMessage: async (messageId: string) => {
    return apiClient.delete(`/chat/messages/${messageId}`);
  },
  getUsers: async () => {
    // Adjust based on exact backend response wrapper
    const { data } = await apiClient.get<UsersResponse>('/chat/users');
    return Array.isArray(data) ? data : (data.users || []);
  },
  getOnlineUsers: async () => {
    const { data } = await apiClient.get<ChatUser[]>('/chat/online-users');
    return data;
  }
};