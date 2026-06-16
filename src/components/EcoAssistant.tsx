import React from 'react';
import { Send, Bot, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { EmissionData } from '../lib/utils';
import { useChat } from '../hooks/useChat';

interface EcoAssistantProps {
  /** Optional user footprint data for personalized AI context */
  footprintData?: EmissionData;
}

/**
 * AI-powered EcoAssistant chat component.
 * Provides a streaming conversation interface where users can ask for
 * personalized sustainability advice. Uses the `useChat` custom hook
 * for all state management and API interaction logic.
 */
const EcoAssistantComponent: React.FC<EcoAssistantProps> = ({ footprintData }) => {
  const {
    messages,
    input,
    isLoading,
    messagesEndRef,
    handleSend,
    handleInputChange,
  } = useChat(footprintData);

  return (
    <div className="glass-panel animate-fade-in chat-container">
      <div className="chat-header">
        <Bot color="var(--accent-primary)" aria-hidden="true" />
        <h2 className="heading-section">EcoAssistant</h2>
      </div>

      <div role="log" aria-label="Chat messages" aria-live="polite" className="chat-log">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`msg-row ${msg.isUser ? 'msg-row-user' : 'msg-row-bot'}`}
            style={{ maxWidth: '85%' }}
          >
            {!msg.isUser && (
              <div className="msg-bot-icon">
                <Bot size={20} color="var(--accent-primary)" />
              </div>
            )}
            <div
              className={`chat-bubble ${msg.isUser ? 'chat-bubble-user' : 'chat-bubble-bot'}`}
              style={{ color: msg.isError ? 'var(--error-color)' : undefined }}
            >
              {msg.isUser ? (
                msg.text
              ) : (
                <div className="markdown-body">
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="thinking-indicator text-muted">
            <Loader2 className="animate-spin" size={20} />
            <span>Thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="chat-form">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="Ask for advice on reducing your footprint..."
          aria-label="Chat input message"
          className="chat-input"
          disabled={isLoading}
        />
        <button
          type="submit"
          aria-label="Send message"
          disabled={isLoading || !input.trim()}
          className="chat-send-btn"
          style={{
            background: isLoading || !input.trim() ? 'var(--bg-secondary)' : 'var(--accent-primary)',
            color: isLoading || !input.trim() ? 'var(--text-muted)' : 'var(--bg-primary)',
            borderColor: isLoading || !input.trim() ? 'var(--border-color)' : 'var(--accent-primary)',
          }}
        >
          {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
        </button>
      </form>
    </div>
  );
};

/** Memoized EcoAssistant to prevent unnecessary re-renders */
export const EcoAssistant = React.memo(EcoAssistantComponent);
