
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useChatbots } from '../contexts/ChatbotContext';
import { ChatMessage, Conversation, AttachedFile } from '../types';
import { getChatResponse } from '../services/geminiService';
import { PlusIcon } from '../components/icons/PlusIcon';
import { PaperclipIcon } from '../components/icons/PaperclipIcon';
import { SendIcon } from '../components/icons/SendIcon';
import { BotIcon } from '../components/icons/BotIcon';
import { TrashIcon } from '../components/icons/TrashIcon';
import { XIcon } from '../components/icons/XIcon';

const ChatPage: React.FC = () => {
  const { botId, conversationId } = useParams<{ botId: string; conversationId?: string }>();
  const navigate = useNavigate();
  const { getBot, addConversation, updateConversation, getConversation, deleteConversation } = useChatbots();

  const [bot, setBot] = useState(getBot(botId || ''));
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadedBot = getBot(botId || '');
    if (!loadedBot) {
      navigate('/');
      return;
    }
    setBot(loadedBot);
    
    let activeConversation: Conversation | undefined;
    if (conversationId) {
      activeConversation = getConversation(loadedBot.id, conversationId);
    } else if (loadedBot.conversations.length > 0) {
      activeConversation = loadedBot.conversations[0];
      navigate(`/chat/${loadedBot.id}/${activeConversation.id}`, { replace: true });
    } else {
      const newConv = addConversation(loadedBot.id, 'New Chat');
      navigate(`/chat/${loadedBot.id}/${newConv.id}`, { replace: true });
      activeConversation = newConv;
    }

    if (activeConversation) {
      setCurrentConversation(activeConversation);
      if (activeConversation.messages.length > 0) {
        setMessages(activeConversation.messages);
      } else {
        const initialMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'model',
          text: loadedBot.initialMessage,
          timestamp: new Date().toISOString(),
        };
        setMessages([initialMessage]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [botId, conversationId, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleNewConversation = () => {
    if (bot) {
      const newConv = addConversation(bot.id, `Chat ${bot.conversations.length + 1}`);
      navigate(`/chat/${bot.id}/${newConv.id}`);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      const filePromises = files.map(file => {
        return new Promise<AttachedFile>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            resolve({
              name: file.name,
              type: file.type,
              size: file.size,
              base64: e.target?.result as string,
            });
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      });
      Promise.all(filePromises).then(newFiles => {
        setAttachedFiles(prev => [...prev, ...newFiles]);
      });
    }
  };
  
  const handleRemoveFile = (fileName: string) => {
    setAttachedFiles(files => files.filter(f => f.name !== fileName));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() && attachedFiles.length === 0) return;
    if (!bot || !currentConversation) return;

    setIsLoading(true);

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      text: userInput,
      files: attachedFiles,
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setUserInput('');
    setAttachedFiles([]);
    
    const responseText = await getChatResponse(bot, messages, userMessage);
    
    const modelMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'model',
      text: responseText,
      timestamp: new Date().toISOString(),
    };
    
    const finalMessages = [...updatedMessages, modelMessage];
    setMessages(finalMessages);
    updateConversation(bot.id, { ...currentConversation, messages: finalMessages });
    setIsLoading(false);
  };
  
  if (!bot) {
    return <div className="flex justify-center items-center h-full">Loading chatbot...</div>;
  }
  
  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <aside className="w-64 bg-brand-surface flex-shrink-0 flex flex-col p-2">
        <button onClick={handleNewConversation} className="w-full bg-brand-primary text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-opacity-80 transition-colors mb-4">
          <PlusIcon className="w-5 h-5" />
          New Chat
        </button>
        <div className="flex-grow overflow-y-auto">
          {bot.conversations.map(conv => (
            <div key={conv.id} className={`group flex justify-between items-center p-2 rounded-md mb-1 ${conv.id === conversationId ? 'bg-brand-secondary' : 'hover:bg-brand-secondary/50'}`}>
              <Link to={`/chat/${bot.id}/${conv.id}`} className="block w-full text-sm truncate">{conv.title}</Link>
               <button onClick={(e) => { e.stopPropagation(); deleteConversation(bot.id, conv.id); navigate(`/chat/${bot.id}`);}} className="text-brand-text-secondary hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <TrashIcon className="w-4 h-4"/>
              </button>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col p:2 sm:p-4 bg-brand-bg">
        <div className="flex-grow overflow-y-auto mb-4 pr-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex items-start gap-3 my-4 ${message.role === 'user' ? 'justify-end' : ''}`}>
              {message.role === 'model' && <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center flex-shrink-0"><BotIcon className="w-5 h-5 text-white"/></div>}
              <div className={`p-4 rounded-lg max-w-xl ${message.role === 'user' ? 'bg-brand-primary text-white rounded-br-none' : 'bg-brand-surface rounded-bl-none'}`}>
                 <div className="whitespace-pre-wrap">{message.text}</div>
                 {message.files && message.files.length > 0 && (
                     <div className="mt-2 grid grid-cols-2 gap-2">
                        {message.files.map(file => (
                          file.type.startsWith('image/') ? <img key={file.name} src={file.base64} alt={file.name} className="max-w-full h-auto rounded-md" /> : <div key={file.name} className="text-xs p-2 bg-black/20 rounded-md truncate">{file.name}</div>
                        ))}
                    </div>
                 )}
              </div>
            </div>
          ))}
           {isLoading && (
            <div className="flex items-start gap-3 my-4">
                <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center flex-shrink-0"><BotIcon className="w-5 h-5 text-white"/></div>
                <div className="p-4 rounded-lg max-w-xl bg-brand-surface rounded-bl-none flex items-center">
                    <div className="w-2 h-2 bg-brand-text-secondary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
	                <div className="w-2 h-2 bg-brand-text-secondary rounded-full animate-bounce [animation-delay:-0.15s] mx-1"></div>
	                <div className="w-2 h-2 bg-brand-text-secondary rounded-full animate-bounce"></div>
                </div>
            </div>
           )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="mt-auto bg-brand-bg pt-2">
            {attachedFiles.length > 0 && (
                 <div className="p-2 mb-2 bg-brand-surface rounded-lg flex flex-wrap gap-2">
                    {attachedFiles.map(file => (
                        <div key={file.name} className="bg-brand-secondary p-1 rounded-md flex items-center gap-2 text-sm">
                            <span className="truncate max-w-[100px]">{file.name}</span>
                            <button onClick={() => handleRemoveFile(file.name)} className="hover:text-red-500"><XIcon className="w-4 h-4" /></button>
                        </div>
                    ))}
                 </div>
            )}
            <form onSubmit={handleSubmit} className="flex items-center gap-2 p-4 bg-brand-surface rounded-lg">
              <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-brand-text-secondary hover:text-brand-primary">
                <PaperclipIcon className="w-6 h-6" />
              </button>
              <input type="file" multiple ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,text/plain,.pdf" />
              <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e);
                    }
                }}
                placeholder="Type your message..."
                rows={1}
                className="flex-1 bg-transparent focus:outline-none resize-none max-h-40"
              />
              <button type="submit" disabled={isLoading} className="bg-brand-primary p-2 rounded-full text-white disabled:bg-brand-secondary">
                <SendIcon className="w-6 h-6" />
              </button>
            </form>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
