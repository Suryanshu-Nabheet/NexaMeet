import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { ChatMessage } from '../../types';

interface ChatProps {
  messages: ChatMessage[];
  onSendMessage: (content: string) => void;
  onClose: () => void;
}

export const Chat: React.FC<ChatProps> = ({ messages, onSendMessage, onClose }) => {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  return (
    <motion.div
      className="flex flex-col h-full bg-dark-400"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="flex items-center justify-between p-4 border-b border-dark-300">
        <h2 className="text-lg font-semibold text-white">Chat</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-gray-400 hover:text-white"
        >
          <X size={20} />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            className="flex flex-col space-y-1"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-blue-400">{msg.senderName}</span>
              <span className="text-xs text-gray-400">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <p className="text-white text-sm">{msg.text}</p>
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="p-4 border-t border-dark-300">
        <div className="flex space-x-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-dark-300 text-white border-dark-300 focus:border-blue-500"
          />
          <Button
            type="submit"
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
            disabled={!message.trim()}
          >
            <Send size={20} />
          </Button>
        </div>
      </form>
    </motion.div>
  );
}; 