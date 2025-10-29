import React, { useState, useRef, useEffect } from 'react';
import { X, Send } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { ChatMessage } from '../../types';

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  onClose: () => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  onSendMessage,
  onClose,
}) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom of chat when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (inputValue.trim()) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };
  
  return (
    <div className="bg-white h-full flex flex-col rounded-lg shadow-md border border-gray-200">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Chat</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          aria-label="Close chat"
        >
          <X size={20} />
        </Button>
      </div>
      
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>No messages yet</p>
            <p className="text-sm">Be the first to send a message!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex flex-col max-w-xs mx-2 p-3 rounded-lg ${
                message.senderId === 'currentUser'
                  ? 'ml-auto bg-primary-100 text-primary-900'
                  : 'mr-auto bg-gray-100 text-gray-800'
              }`}
            >
              {message.senderId !== 'currentUser' && (
                <span className="text-xs font-medium mb-1">{message.senderName}</span>
              )}
              <p className="text-sm">{message.text}</p>
              <span className="text-xs text-gray-500 mt-1 self-end">
                {new Date(message.timestamp).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <Input
            type="text"
            placeholder="Type a message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-grow"
          />
          <Button
            type="submit"
            disabled={!inputValue.trim()}
            variant="primary"
          >
            <Send size={16} />
          </Button>
        </div>
      </form>
    </div>
  );
};