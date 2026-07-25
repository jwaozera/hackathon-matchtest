import React from 'react';
import type { IChatMessage } from '../../shared/types';
import './ChatPanel.css';

interface MessageBubbleProps {
  message: IChatMessage;
}

const PERSONA_CONFIG = {
  system: { avatar: '⚙️', name: 'Sistema', accentClass: '' },
  pm: { avatar: '👔', name: 'Rafael (PM)', accentClass: 'message-pm' },
  dev_jr: { avatar: '👩‍💻', name: 'Ana (Dev Jr)', accentClass: 'message-dev-jr' },
  candidate: { avatar: '🧑‍💻', name: 'Você', accentClass: 'message-candidate' },
};

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const { sender, content, timestamp } = message;
  const config = PERSONA_CONFIG[sender] || PERSONA_CONFIG.system;

  // System messages have special styling
  if (sender === 'system') {
    return (
      <div className="message-system">
        <span className="message-system__icon">⚙️</span>
        <span>{content}</span>
      </div>
    );
  }

  const isCandidate = sender === 'candidate';
  const formattedTime = new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={`message-bubble-container ${isCandidate ? 'message-right' : 'message-left'}`}>
      {!isCandidate && <div className="message-avatar">{config.avatar}</div>}

      <div className={`message-bubble ${config.accentClass}`}>
        <div className="message-header">
          <span className="message-sender">{config.name}</span>
          <span className="message-time">{formattedTime}</span>
        </div>
        <div className="message-content">
          {content}
        </div>
      </div>

      {isCandidate && <div className="message-avatar">{config.avatar}</div>}
    </div>
  );
};

export default MessageBubble;
