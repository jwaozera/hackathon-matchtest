import React, { useRef, useEffect, useState } from 'react';
import MessageBubble from './MessageBubble';
import './ChatPanel.css';
import type { IChatMessage } from '../../shared/types';

interface ChatPanelProps {
  messages: IChatMessage[];
  onSendMessage: (content: string) => void;
  isTyping: boolean;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ messages, onSendMessage, isTyping }) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <span className="channel-icon">#</span>
        <span className="channel-name">equipe-pagamentos</span>
      </div>
      
      <div className="chat-messages">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {isTyping && (
          <div className="typing-indicator-container">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <span className="typing-text">Someone is typing...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-area" onSubmit={handleSubmit}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Message #equipe-pagamentos"
          className="chat-input"
        />
        <button type="submit" className="chat-send-btn" disabled={!inputValue.trim()}>
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatPanel;
