export type ChannelType = 'public' | 'private' | 'direct';
export type MessageType = 'text' | 'image' | 'file' | 'system';

export interface ChatChannel {
  id: string;
  name: string;
  description?: string;
  type: ChannelType;
  created_by: string;
  is_active: boolean;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  last_message_at?: string;
}

export interface ChatMessage {
  id: string;
  channel_id: string;
  user_id: string;
  content: string;
  message_type: MessageType;
  file_url?: string;
  file_name?: string;
  thumbnail_url?: string;
  created_at: string;
  updated_at: string;
  user_name?: string;
}

export interface ChatParticipant {
  id: string;
  user_id: string;
  channel_id: string;
  role: 'owner' | 'admin' | 'member';
  last_seen_at: string;
}

export interface ChatUser {
  id: string;
  naam: string;
  email: string;
  is_online?: boolean;
}

export interface CreateChannelRequest {
  name: string;
  description?: string;
  is_public: boolean;
}

export interface SendMessageRequest {
  content?: string;
  image?: File;
}