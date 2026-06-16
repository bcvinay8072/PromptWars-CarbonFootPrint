import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { getEcoAdvice } from '../lib/openai';
import { EmissionData, ChatMessage } from '../lib/utils';

interface EcoAssistantProps {
  footprintData?: EmissionData;
}

export const EcoAssistant: React.FC<EcoAssistantProps> = ({ footprintData }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      text: "Hello! I'm your EcoAssistant. How can I help you reduce your carbon footprint today?",
      isUser: false,
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      text: input.trim(),
      isUser: true,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      let footprintContext;
      if (footprintData && footprintData.total > 0) {
        footprintContext = {
          total: footprintData.total,
          breakdown: `Transport: ${footprintData.transport}, Diet: ${footprintData.diet}, Energy: ${footprintData.energy}, Shopping: ${footprintData.shopping}`
        };
      }

      const botMsgId = (Date.now() + 1).toString();
      
      // Add empty bot message that we will stream into
      setMessages(prev => [
        ...prev, 
        { id: botMsgId, text: '', isUser: false, timestamp: new Date().toISOString() }
      ]);

      await getEcoAdvice(userMsg.text, footprintContext, (chunk) => {
        setMessages(prev => prev.map(msg => 
          msg.id === botMsgId ? { ...msg, text: msg.text + chunk } : msg
        ));
      });
      
    } catch (error: any) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: error.message || 'An error occurred while fetching advice.',
        isUser: false,
        timestamp: new Date().toISOString(),
        isError: true
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '500px' }}>
      <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Bot color="var(--accent-primary)" aria-hidden="true" />
        <h2 className="text-xl font-semibold">EcoAssistant</h2>
      </div>

      <div 
        role="log" 
        aria-label="Chat messages" 
        aria-live="polite"
        style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}
      >
        {messages.map(msg => (
          <div 
            key={msg.id} 
            style={{ 
              alignSelf: msg.isUser ? 'flex-end' : 'flex-start',
              maxWidth: '85%',
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'flex-start'
            }}
          >
            {!msg.isUser && <div style={{ marginTop: '0.25rem' }}><Bot size={20} color="var(--accent-primary)" /></div>}
            <div 
              style={{ 
                background: msg.isUser ? 'var(--accent-secondary)' : 'var(--bg-secondary)',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-lg)',
                borderBottomRightRadius: msg.isUser ? '0' : 'var(--radius-lg)',
                borderBottomLeftRadius: !msg.isUser ? '0' : 'var(--radius-lg)',
                color: msg.isError ? 'var(--error-color)' : 'var(--text-primary)',
                wordBreak: 'break-word'
              }}
            >
              {msg.isUser ? (
                msg.text
              ) : (
                <div className="markdown-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
            <Loader2 className="animate-spin" size={20} />
            <span>Thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} style={{ padding: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '0.5rem' }}>
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask for advice on reducing your footprint..."
          aria-label="Chat input message"
          style={{ 
            flex: 1, 
            padding: '0.75rem 1rem', 
            background: 'var(--bg-secondary)', 
            border: '1px solid var(--border-color)', 
            borderRadius: 'var(--radius-full)',
            color: 'var(--text-primary)',
            outline: 'none'
          }}
          disabled={isLoading}
        />
        <button 
          type="submit" 
          aria-label="Send message"
          disabled={isLoading || !input.trim()}
          style={{ 
            background: (isLoading || !input.trim()) ? 'var(--bg-secondary)' : 'var(--accent-primary)', 
            color: (isLoading || !input.trim()) ? 'var(--text-muted)' : 'var(--bg-primary)', 
            border: '1px solid',
            borderColor: (isLoading || !input.trim()) ? 'var(--border-color)' : 'var(--accent-primary)',
            borderRadius: '50%', 
            width: '44px', 
            height: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: (isLoading || !input.trim()) ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s'
          }}
        >
          {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
        </button>
      </form>
    </div>
  );
};
