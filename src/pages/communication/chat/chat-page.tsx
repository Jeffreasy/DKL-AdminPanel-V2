import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChatBubbleLeftRightIcon, PlusIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { Modal } from '@/components/ui/modal';
import { useAuth } from '@/hooks/use-auth';
import { useChatSocket } from '@/hooks/use-chat-socket';
import { chatService } from '@/services/communication/chat.service';
import { ChatChannel, CreateChannelRequest, SendMessageRequest } from '@/api/types/chat.types';

export default function ChatPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<ChatChannel | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [showCreateChannelModal, setShowCreateChannelModal] = useState(false);
  const [channelName, setChannelName] = useState('');
  const [channelDescription, setChannelDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch channels
  const { data: channels = [] } = useQuery({
    queryKey: ['chat-channels'],
    queryFn: chatService.getChannels,
    enabled: isOpen,
  });

  // Fetch messages for selected channel
  const { data: messages = [] } = useQuery({
    queryKey: ['chat-messages', selectedChannel?.id],
    queryFn: () => selectedChannel ? chatService.getMessages(selectedChannel.id) : [],
    enabled: !!selectedChannel && isOpen,
  });

  // WebSocket for real-time updates
  useChatSocket(selectedChannel?.id || null);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (req: SendMessageRequest) =>
      selectedChannel ? chatService.sendMessage(selectedChannel.id, req) : Promise.reject('No channel selected'),
    onSuccess: () => {
      setNewMessage('');
      queryClient.invalidateQueries({ queryKey: ['chat-messages', selectedChannel?.id] });
    },
  });

  // Create channel mutation
  const createChannelMutation = useMutation({
    mutationFn: (req: CreateChannelRequest) => chatService.createChannel(req),
    onSuccess: () => {
      setShowCreateChannelModal(false);
      setChannelName('');
      setChannelDescription('');
      queryClient.invalidateQueries({ queryKey: ['chat-channels'] });
    },
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedChannel) return;
    sendMessageMutation.mutate({ content: newMessage });
  };

  const handleCreateChannel = () => {
    if (!channelName.trim()) return;
    createChannelMutation.mutate({
      name: channelName,
      description: channelDescription,
      is_public: isPublic,
    });
  };

  const groupedChannels = {
    public: channels.filter(c => c.type === 'public'),
    private: channels.filter(c => c.type === 'private'),
    direct: channels.filter(c => c.type === 'direct'),
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg z-40"
        aria-label="Open Chat"
      >
        <ChatBubbleLeftRightIcon className="h-6 w-6" />
      </button>

      {/* Chat Modal */}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Chat">
        <div className="flex h-96">
          {/* Sidebar */}
          <div className="w-1/3 border-r border-gray-200 pr-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Channels</h3>
              <button
                onClick={() => setShowCreateChannelModal(true)}
                className="text-blue-600 hover:text-blue-800"
              >
                <PlusIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Public Channels */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Public</h4>
              {groupedChannels.public.map(channel => (
                <button
                  key={channel.id}
                  onClick={() => setSelectedChannel(channel)}
                  className={`w-full text-left p-2 rounded mb-1 ${
                    selectedChannel?.id === channel.id ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'
                  }`}
                >
                  # {channel.name}
                </button>
              ))}
            </div>

            {/* Private Channels */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Private</h4>
              {groupedChannels.private.map(channel => (
                <button
                  key={channel.id}
                  onClick={() => setSelectedChannel(channel)}
                  className={`w-full text-left p-2 rounded mb-1 ${
                    selectedChannel?.id === channel.id ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'
                  }`}
                >
                  🔒 {channel.name}
                </button>
              ))}
            </div>

            {/* Direct Messages */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Direct</h4>
              {groupedChannels.direct.map(channel => (
                <button
                  key={channel.id}
                  onClick={() => setSelectedChannel(channel)}
                  className={`w-full text-left p-2 rounded mb-1 ${
                    selectedChannel?.id === channel.id ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'
                  }`}
                >
                  👤 {channel.name}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Window */}
          <div className="w-2/3 flex flex-col pl-4">
            {selectedChannel ? (
              <>
                <div className="border-b border-gray-200 pb-2 mb-4">
                  <h3 className="text-lg font-semibold">{selectedChannel.name}</h3>
                  {selectedChannel.description && (
                    <p className="text-sm text-gray-600">{selectedChannel.description}</p>
                  )}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto mb-4">
                  {messages.map(message => (
                    <div
                      key={message.id}
                      className={`mb-2 p-2 rounded ${
                        message.user_id === user?.id ? 'bg-blue-100 ml-auto max-w-xs' : 'bg-gray-100 max-w-xs'
                      }`}
                    >
                      <div className="text-xs text-gray-600 mb-1">
                        {message.user_name || 'Unknown'} • {new Date(message.created_at).toLocaleTimeString()}
                      </div>
                      <div>{message.content}</div>
                      {message.file_url && (
                        <img src={message.file_url} alt={message.file_name} className="max-w-full mt-2" />
                      )}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="flex">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 border border-gray-300 rounded-l px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sendMessageMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r disabled:opacity-50"
                  >
                    <PaperAirplaneIcon className="h-5 w-5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                Select a channel to start chatting
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Create Channel Modal */}
      <Modal
        isOpen={showCreateChannelModal}
        onClose={() => setShowCreateChannelModal(false)}
        title="Create New Channel"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Channel Name</label>
            <input
              type="text"
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter channel name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
            <textarea
              value={channelDescription}
              onChange={(e) => setChannelDescription(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Enter channel description"
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="mr-2"
            />
            <label className="text-sm text-gray-700">Make this channel public</label>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setShowCreateChannelModal(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateChannel}
              disabled={!channelName.trim() || createChannelMutation.isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              Create
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}