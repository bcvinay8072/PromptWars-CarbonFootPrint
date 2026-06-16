import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { getEcoAdvice } from '../lib/openai';
import { EmissionData, ChatMessage } from '../lib/utils';

/**
 * Custom hook that manages the EcoAssistant chat state and streaming AI responses.
 * Encapsulates message management, input handling, streaming, and auto-scrolling
 * logic to keep the EcoAssistant component focused on rendering.
 *
 * @param footprintData - Optional user footprint data for personalized AI context
 * @returns Chat state and handler functions
 */
export function useChat(footprintData?: EmissionData) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      text: "Hello! I'm your EcoAssistant. How can I help you reduce your carbon footprint today?",
      isUser: false,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  /** Scrolls the chat log to the bottom when new messages arrive */
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  /** Memoized footprint context object to avoid re-creating on every render */
  const footprintContext = useMemo(() => {
    if (footprintData && footprintData.total > 0) {
      return {
        total: footprintData.total,
        breakdown: `Transport: ${footprintData.transport}, Diet: ${footprintData.diet}, Energy: ${footprintData.energy}, Shopping: ${footprintData.shopping}`,
      };
    }
    return undefined;
  }, [footprintData]);

  /** Handles sending a message and streaming the AI response */
  const handleSend = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim() || isLoading) return;

      const userMsg: ChatMessage = {
        id: Date.now().toString(),
        text: input.trim(),
        isUser: true,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput('');
      setIsLoading(true);

      try {
        const botMsgId = (Date.now() + 1).toString();

        // Add an empty bot message that will be streamed into
        setMessages((prev) => [
          ...prev,
          { id: botMsgId, text: '', isUser: false, timestamp: new Date().toISOString() },
        ]);

        await getEcoAdvice(userMsg.text, footprintContext, (chunk) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === botMsgId ? { ...msg, text: msg.text + chunk } : msg
            )
          );
        });
      } catch (error: any) {
        const errorMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: error.message || 'An error occurred while fetching advice.',
          isUser: false,
          timestamp: new Date().toISOString(),
          isError: true,
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsLoading(false);
      }
    },
    [input, isLoading, footprintContext]
  );

  /** Handles input field changes */
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  }, []);

  return {
    messages,
    input,
    isLoading,
    messagesEndRef,
    handleSend,
    handleInputChange,
    setInput,
  };
}
