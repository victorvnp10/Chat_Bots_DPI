import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, Chat } from '@google/genai';
import type { Chatbot, Conversation, Message, MessagePart } from '../types';
import useLocalStorage from '../hooks/useLocalStorage';

// Safely access Framer Motion from the window object with fallbacks
const Framer = (window as any).FramerMotion;
const motion = Framer ? Framer.motion : {
  div: React.forwardRef<HTMLDivElement, any>((props, ref) => <div ref={ref} {...props} />),
};
motion.div.displayName = 'motion.div';
const AnimatePresence = Framer ? Framer.AnimatePresence : ({ children }: { children: React.ReactNode }) => <>{children}</>;

// --- Icon Components ---
const ArrowLeftIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-6 h-6"}><path fillRule="evenodd" d="M7.72 12.53a.75.75 0 010-1.06l7.5-7.5a.75.75 0 111.06 1.06L9.31 12l6.97 6.97a.75.75 0 11-1.06 1.06l-7.5-7.5z" clipRule="evenodd" /></svg>
);
const PaperAirplaneIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-6 h-6"}><path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" /></svg>
);
const PaperClipIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-6 h-6"}><path fillRule="evenodd" d="M18.97 3.659a2.25 2.25 0 00-3.182 0l-10.5 10.5a.75.75 0 001.061 1.06l10.5-10.5a.75.75 0 011.06 0l-10.5 10.5a.75.75 0 001.06 1.06l10.5-10.5a2.25 2.25 0 00-3.182-3.182l-10.5 10.5a4.5 4.5 0 106.364 6.364l10.5-10.5a.75.75 0 00-1.06-1.06l-10.5 10.5a2.25 2.25 0 01-3.182-3.182l8.25-8.25a.75.75 0 011.06 1.06l-8.25 8.25a.75.75 0 001.06 1.06l8.25-8.25a2.25 2.25 0 000-3.182z" clipRule="evenodd" /></svg>
);
const PlusIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-6 h-6"}><path fillRule="evenodd" d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z" clipRule="evenodd" /></svg>
);
const XCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-6 h-6"}><path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" clipRule="evenodd" /></svg>
);
const UserIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-6 h-6"}><path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" /></svg>
);
const BotIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-6 h-6"}><path fillRule="evenodd" d="M4.5 7.5a3 3 0 013-3h9a3 3 0 013 3v9a3 3 0 01-3 3h-9a3 3 0 01-3-3v-9zM6 7.5a1.5 1.5 0 011.5-1.5h9A1.5 1.5 0 0118 7.5v9a1.5 1.5 0 01-1.5 1.5h-9A1.5 1.5 0 016 16.5v-9zM8.25 9.75a.75.75 0 01.75-.75h6a.75.75 0 010 1.5h-6a.75.75 0 01-.75-.75zm.75 2.25a.75.75 0 000 1.5h3a.75.75 0 000-1.5h-3z" clipRule="evenodd" /></svg>
);
const DocumentTextIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-6 h-6"}><path fillRule="evenodd" d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0016.5 9h-1.875a.375.375 0 01-.375-.375V6.75A3.75 3.75 0 009 3H5.625zM12.75 12.75a.75.75 0 000-1.5h-3a.75.75 0 000 1.5h3zM11.25 15a.75.75 0 01.75-.75h3a.75.75 0 010 1.5h-3a.75.75 0 01-.75-.75zM12 9.75a.75.75 0 000-1.5h-3a.75.75 0 000 1.5h3z" clipRule="evenodd" /><path d="M14.25 7.5a.75.75 0 00-.75.75v1.5a.75.75 0 00.75.75h1.5a.75.75 0 00.75-.75V9a.75.75 0 00-.75-.75h-1.5z" /><path d="M15 3.75a2.25 2.25 0 012.25 2.25v1.5a2.25 2.25 0 01-2.25 2.25h-1.5a2.25 2.25 0 01-2.25-2.25v-1.5A2.25 2.25 0 0113.5 3h1.5a.75.75 0 01.75.75z" /></svg>
);


interface Attachment {
    name: string;
    type: string;
    data: string; // base64
    previewUrl: string;
}

const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
    const isUser = message.role === 'user';
    return (
        <div className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser ? 'bg-blue-500 text-white order-2' : 'bg-gray-700 text-white'}`}>
                {isUser ? <UserIcon className="w-5 h-5"/> : <BotIcon className="w-5 h-5"/>}
            </div>
            <div className={`w-full max-w-xl p-4 rounded-xl ${isUser ? 'bg-blue-500 text-white order-1' : 'bg-white dark:bg-gray-700'}`}>
                {message.parts.map((part, index) => {
                    if (part.text) {
                        return <p key={index} className="whitespace-pre-wrap">{part.text}</p>;
                    }
                    if (part.inlineData) {
                        if (part.inlineData.mimeType.startsWith('image/')) {
                             return <img key={index} src={`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`} alt="attachment" className="mt-2 rounded-lg max-w-xs" />;
                        }
                         if (part.inlineData.mimeType === 'application/pdf') {
                            return (
                                <div key={index} className="mt-2 flex items-center gap-2 p-2 rounded-lg bg-gray-100 dark:bg-gray-600">
                                    <DocumentTextIcon className="w-8 h-8 text-red-500 flex-shrink-0" />
                                    <span className="text-sm text-gray-700 dark:text-gray-200 truncate">Documento PDF</span>
                                </div>
                            );
                        }
                    }
                    return null;
                })}
                 <p className="text-xs mt-2 opacity-60 text-right">{new Date(message.timestamp).toLocaleTimeString()}</p>
            </div>
        </div>
    );
};

export default function ChatView({ chatbotId, onBack }: { chatbotId: string, onBack: () => void }) {
    const [chatbots, setChatbots] = useLocalStorage<Chatbot[]>('chatbots', []);
    const chatbot = chatbots.find(c => c.id === chatbotId);

    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [attachment, setAttachment] = useState<Attachment | null>(null);
    const chatSession = useRef<Chat | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const activeConversation = chatbot?.conversations.find(c => c.id === activeConversationId);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const initOrLoadConversation = useCallback((conversation: Conversation | undefined) => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        
        const systemInstruction = `
### PERSONA ###
${chatbot?.persona}

### TASK ###
${chatbot?.task}

### INSTRUCTION ###
${chatbot?.instruction}

### OUTPUT FORMAT ###
${chatbot?.output}
        `.trim();

        const history = conversation?.messages
            .filter(m => m.id !== 'initial') // Don't include the initial greeting in history
            .map(m => ({
                role: m.role,
                parts: m.parts.map(p => {
                    if (p.text) return { text: p.text };
                    if (p.inlineData) return { inlineData: { mimeType: p.inlineData.mimeType, data: p.inlineData.data } };
                    return { text: ''}; // Should not happen
                }),
            })) || [];

        chatSession.current = ai.chats.create({
            model: chatbot?.model || 'gemini-2.5-flash',
            history,
            config: { systemInstruction },
        });

        if (conversation) {
            setMessages(conversation.messages);
        } else {
            // This is a new conversation
            const initialMessage: Message = {
                id: 'initial',
                role: 'model',
                parts: [{ text: chatbot?.initialMessage || 'Olá! Como posso te ajudar hoje?' }],
                timestamp: new Date().toISOString(),
            };
            setMessages([initialMessage]);
        }
    }, [chatbot]);

    useEffect(() => {
        if (chatbot) {
            if (chatbot.conversations.length > 0) {
                const lastConversation = chatbot.conversations[0];
                setActiveConversationId(lastConversation.id);
                initOrLoadConversation(lastConversation);
            } else {
                handleNewConversation();
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chatbot?.id, initOrLoadConversation]);

    const handleNewConversation = useCallback(() => {
        if (!chatbot) return;

        const newConversation: Conversation = {
            id: `convo_${Date.now()}`,
            messages: [],
            createdAt: new Date().toISOString(),
        };

        const initialMessage: Message = {
            id: 'initial',
            role: 'model',
            parts: [{ text: chatbot.initialMessage || 'Olá!' }],
            timestamp: new Date().toISOString(),
        };
        newConversation.messages.push(initialMessage);

        const updatedChatbot: Chatbot = {
            ...chatbot,
            conversations: [newConversation, ...chatbot.conversations],
        };

        setChatbots(prev => prev.map(c => (c.id === chatbotId ? updatedChatbot : c)));
        setActiveConversationId(newConversation.id);
        setMessages([initialMessage]);
        initOrLoadConversation(undefined); // undefined to get initial message
    }, [chatbot, chatbotId, setChatbots, initOrLoadConversation]);
    
     const switchConversation = (conversationId: string) => {
        const conversation = chatbot?.conversations.find(c => c.id === conversationId);
        if(conversation){
            setActiveConversationId(conversation.id);
            initOrLoadConversation(conversation);
        }
    };


    const handleSend = async () => {
        if ((!inputValue.trim() && !attachment) || isLoading) return;

        const userParts: MessagePart[] = [];
        if (attachment) {
            userParts.push({ inlineData: { mimeType: attachment.type, data: attachment.data } });
        }
        if (inputValue.trim()) {
            userParts.push({ text: inputValue.trim() });
        }

        const userMessage: Message = {
            id: `msg_${Date.now()}`,
            role: 'user',
            parts: userParts,
            timestamp: new Date().toISOString(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setAttachment(null);
        setIsLoading(true);

        const modelMessageId = `msg_${Date.now() + 1}`;
        // Add a placeholder for the bot's response
        setMessages(prev => [...prev, { id: modelMessageId, role: 'model', parts: [{ text: '...' }], timestamp: new Date().toISOString() }]);

        try {
            if (!chatSession.current) throw new Error('Chat session not initialized.');
            
            const result = await chatSession.current.sendMessageStream({ message: userParts });

            let fullResponse = '';
            for await (const chunk of result) {
                fullResponse += chunk.text;
                setMessages(prev =>
                    prev.map(m =>
                        m.id === modelMessageId ? { ...m, parts: [{ text: fullResponse + '...' }] } : m
                    )
                );
            }
            
             setMessages(prev =>
                prev.map(m =>
                    m.id === modelMessageId ? { ...m, parts: [{ text: fullResponse.trim() }], timestamp: new Date().toISOString() } : m
                )
            );


            const finalModelMessage: Message = {
                id: modelMessageId,
                role: 'model',
                parts: [{ text: fullResponse.trim() }],
                timestamp: new Date().toISOString()
            };

            setChatbots(prev =>
                prev.map(c =>
                    c.id === chatbotId
                        ? {
                            ...c,
                            conversations: c.conversations.map(convo =>
                                convo.id === activeConversationId
                                    ? { ...convo, messages: [...messages, userMessage, finalModelMessage] }
                                    : convo
                            ),
                        }
                        : c
                )
            );

        } catch (error) {
            console.error('Error sending message:', error);
            const errorMessage = "Desculpe, encontrei um erro. Por favor, tente novamente.";
            setMessages(prev =>
                prev.map(m =>
                    m.id === modelMessageId ? { ...m, parts: [{ text: errorMessage }] } : m
                )
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const result = event.target?.result as string;
                const base64Data = result.split(',')[1];
                setAttachment({ name: file.name, type: file.type, data: base64Data, previewUrl: result });
            };
            reader.readAsDataURL(file);
        } else if (file.type === 'application/pdf') {
            const readerForData = new FileReader();
            readerForData.onload = (event) => {
                const dataUrl = event.target?.result as string;
                const base64Data = dataUrl.split(',')[1];

                const readerForPreview = new FileReader();
                readerForPreview.onload = async (event) => {
                    const arrayBuffer = event.target?.result as ArrayBuffer;
                    const pdfjsLib = (window as any).pdfjsLib;
                    if (!pdfjsLib) {
                        console.error("PDF.js is not loaded.");
                        setAttachment({ name: file.name, type: file.type, data: base64Data, previewUrl: '' });
                        return;
                    }
                    try {
                        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                        const page = await pdf.getPage(1);
                        const viewport = page.getViewport({ scale: 1 });
                        const canvas = document.createElement('canvas');
                        const context = canvas.getContext('2d');
                        canvas.height = viewport.height;
                        canvas.width = viewport.width;
                        if (context) {
                            await page.render({ canvasContext: context, viewport: viewport }).promise;
                            setAttachment({ name: file.name, type: file.type, data: base64Data, previewUrl: canvas.toDataURL() });
                        }
                    } catch (pdfError) {
                        console.error("Error rendering PDF preview:", pdfError);
                        setAttachment({ name: file.name, type: file.type, data: base64Data, previewUrl: '' }); // Provide fallback
                    }
                };
                readerForPreview.readAsArrayBuffer(file);
            };
            readerForData.readAsDataURL(file);
        } else {
            alert('Apenas arquivos de imagem e PDF são suportados.');
        }
        e.target.value = ''; // Reset file input
    };

    if (!chatbot) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
                <p className="text-xl text-gray-500">Chatbot não encontrado.</p>
                <button onClick={onBack} className="ml-4 px-4 py-2 bg-brand-secondary text-white rounded-md">Voltar</button>
            </div>
        );
    }
    
    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center">
                    <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 mr-2">
                        <ArrowLeftIcon className="w-5 h-5" />
                    </button>
                    <h2 className="font-bold text-lg truncate">{chatbot.name}</h2>
                </div>
                <div className="p-2">
                    <button onClick={handleNewConversation} className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-white bg-brand-secondary hover:bg-brand-primary rounded-md">
                        <PlusIcon className="w-4 h-4" /> Novo Chat
                    </button>
                </div>
                <nav className="flex-1 overflow-y-auto p-2 space-y-1">
                    {chatbot.conversations.map(convo => (
                        <a href="#" key={convo.id} onClick={(e) => { e.preventDefault(); switchConversation(convo.id); }}
                           className={`block px-3 py-2 text-sm rounded-md truncate ${activeConversationId === convo.id ? 'bg-blue-100 dark:bg-blue-900/50 text-brand-primary dark:text-blue-300 font-semibold' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                            {convo.messages[1]?.parts[0]?.text || `Chat de ${new Date(convo.createdAt).toLocaleDateString()}`}
                        </a>
                    ))}
                </nav>
            </aside>
    
            {/* Main Chat Area */}
            <main className="flex-1 flex flex-col">
                <div className="flex-1 p-6 overflow-y-auto">
                    <div className="max-w-4xl mx-auto space-y-6">
                        <AnimatePresence initial={false}>
                            {messages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <MessageBubble message={msg} />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-700 text-white flex items-center justify-center"><BotIcon className="w-5 h-5"/></div>
                                    <div className="p-4 bg-white dark:bg-gray-700 rounded-xl animate-subtle-pulse">
                                        <div className="flex items-center justify-center space-x-1">
                                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>
    
                {/* Input Area */}
                <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                    <div className="max-w-4xl mx-auto">
                        {attachment && (
                            <div className="relative inline-block mb-2 p-2 border rounded-lg dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
                                <div className="flex items-center gap-3">
                                    <img 
                                        src={attachment.previewUrl || undefined}
                                        alt={attachment.name} 
                                        className="h-16 w-16 object-cover rounded-md bg-gray-200 dark:bg-gray-600 flex items-center justify-center" 
                                    >
                                    </img>
                                    <span className="text-sm font-medium truncate max-w-xs">{attachment.name}</span>
                                </div>
                                <button onClick={() => setAttachment(null)} className="absolute -top-2 -right-2 bg-gray-800 text-white rounded-full p-0.5">
                                    <XCircleIcon className="w-5 h-5"/>
                                </button>
                            </div>
                        )}
                        <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-xl p-2">
                            <input ref={fileInputRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={handleFileChange} />
                            <button onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-500 dark:text-gray-300 hover:text-brand-primary dark:hover:text-blue-400 rounded-full">
                                <PaperClipIcon className="w-6 h-6" />
                            </button>
                            <textarea
                                value={inputValue}
                                onChange={e => setInputValue(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                                placeholder="Digite sua mensagem ou anexe um arquivo (imagem/pdf)..."
                                rows={1}
                                className="flex-1 bg-transparent border-none focus:ring-0 resize-none mx-2 py-2 dark:placeholder-gray-400"
                            />
                            <button onClick={handleSend} disabled={isLoading || (!inputValue.trim() && !attachment)} className="p-2.5 text-white bg-brand-secondary rounded-full disabled:bg-gray-400 dark:disabled:bg-gray-600 hover:bg-brand-primary transition-colors">
                                <PaperAirplaneIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}