
import React, { createContext, useContext, ReactNode, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Chatbot, Conversation } from '../types';

interface ChatbotContextType {
  chatbots: Chatbot[];
  getBot: (botId: string) => Chatbot | undefined;
  addBot: (bot: Omit<Chatbot, 'id' | 'conversations' | 'createdAt'>) => Chatbot;
  updateBot: (bot: Chatbot) => void;
  deleteBot: (botId: string) => void;
  addConversation: (botId: string, title: string) => Conversation;
  updateConversation: (botId: string, conversation: Conversation) => void;
  getConversation: (botId: string, conversationId: string) => Conversation | undefined;
  deleteConversation: (botId: string, conversationId: string) => void;
}

const ChatbotContext = createContext<ChatbotContextType | undefined>(undefined);

export const ChatbotProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [chatbots, setChatbots] = useLocalStorage<Chatbot[]>('chatbots', []);

  const getBot = useCallback((botId: string) => chatbots.find(b => b.id === botId), [chatbots]);

  const addBot = (botData: Omit<Chatbot, 'id' | 'conversations' | 'createdAt'>): Chatbot => {
    const newBot: Chatbot = {
      ...botData,
      id: crypto.randomUUID(),
      conversations: [],
      createdAt: new Date().toISOString(),
    };
    setChatbots([...chatbots, newBot]);
    return newBot;
  };

  const updateBot = (updatedBot: Chatbot) => {
    setChatbots(chatbots.map(b => b.id === updatedBot.id ? updatedBot : b));
  };
  
  const deleteBot = (botId: string) => {
    setChatbots(chatbots.filter(b => b.id !== botId));
  };

  const addConversation = (botId: string, title: string): Conversation => {
    const newConversation: Conversation = {
      id: crypto.randomUUID(),
      title,
      messages: [],
      lastUpdated: new Date().toISOString(),
    };
    
    const bot = getBot(botId);
    if (bot) {
      const updatedBot = {
        ...bot,
        conversations: [newConversation, ...bot.conversations],
      };
      updateBot(updatedBot);
    }
    return newConversation;
  };

  const updateConversation = (botId: string, updatedConversation: Conversation) => {
    const bot = getBot(botId);
    if (bot) {
      const updatedConversations = bot.conversations.map(c => 
        c.id === updatedConversation.id ? { ...updatedConversation, lastUpdated: new Date().toISOString() } : c
      );
      updateBot({ ...bot, conversations: updatedConversations });
    }
  };

  const getConversation = useCallback((botId: string, conversationId: string): Conversation | undefined => {
    const bot = getBot(botId);
    return bot?.conversations.find(c => c.id === conversationId);
  }, [getBot]);

  const deleteConversation = (botId: string, conversationId: string) => {
    const bot = getBot(botId);
    if (bot) {
      const updatedConversations = bot.conversations.filter(c => c.id !== conversationId);
      updateBot({ ...bot, conversations: updatedConversations });
    }
  };

  return (
    <ChatbotContext.Provider value={{ chatbots, getBot, addBot, updateBot, deleteBot, addConversation, updateConversation, getConversation, deleteConversation }}>
      {children}
    </ChatbotContext.Provider>
  );
};

export const useChatbots = (): ChatbotContextType => {
  const context = useContext(ChatbotContext);
  if (!context) {
    throw new Error('useChatbots must be used within a ChatbotProvider');
  }
  return context;
};
