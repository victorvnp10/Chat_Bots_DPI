import React, { useState, useCallback } from 'react';
import type { Chatbot } from './types';
import { AVAILABLE_MODELS } from './types';
import useLocalStorage from './hooks/useLocalStorage';
import ChatView from './components/ChatView';

// Safely access Framer Motion from the window object with fallbacks
const Framer = (window as any).FramerMotion;
const motion = Framer ? Framer.motion : {
  div: React.forwardRef<HTMLDivElement, any>((props, ref) => <div ref={ref} {...props} />),
};
motion.div.displayName = 'motion.div';
const AnimatePresence = Framer ? Framer.AnimatePresence : ({ children }: { children: React.ReactNode }) => <>{children}</>;


// --- Icon Components ---
const PlusIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-6 h-6"}><path fillRule="evenodd" d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z" clipRule="evenodd" /></svg>
);
const ChatBubbleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-6 h-6"}><path fillRule="evenodd" d="M4.848 2.771A49.144 49.144 0 0112 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 01-3.476.383.39.39 0 00-.297.15l-2.11 2.109a.75.75 0 01-1.06 0l-2.11-2.109a.39.39 0 00-.297-.15 48.9 48.9 0 01-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97zM6.75 8.25a.75.75 0 01.75-.75h9a.75.75 0 010 1.5h-9a.75.75 0 01-.75-.75zm.75 2.25a.75.75 0 000 1.5H12a.75.75 0 000-1.5H7.5z" clipRule="evenodd" /></svg>
);
const PencilIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-6 h-6"}><path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32l8.4-8.4z" /><path d="M5.25 5.25a3 3 0 00-3 3v10.5a3 3 0 003 3h10.5a3 3 0 003-3V13.5a.75.75 0 00-1.5 0v5.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5V8.25a1.5 1.5 0 011.5-1.5h5.25a.75.75 0 000-1.5H5.25z" /></svg>
);
const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-6 h-6"}><path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.006a.75.75 0 01-.749.684H7.08a.75.75 0 01-.749-.684L5.33 6.63a.75.75 0 01.256-1.478l.209.035A48.816 48.816 0 0112 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0gM12 10.5a.75.75 0 01.75.75v6a.75.75 0 01-1.5 0v-6a.75.75 0 01.75-.75zm-3.75 0a.75.75 0 01.75.75v6a.75.75 0 01-1.5 0v-6a.75.75 0 01.75-.75zm7.5 0a.75.75 0 01.75.75v6a.75.75 0 01-1.5 0v-6a.75.75 0 01.75-.75z" clipRule="evenodd" /></svg>
);
const XMarkIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-6 h-6"}><path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" /></svg>
);

const initialChatbotState: Omit<Chatbot, 'id' | 'createdAt' | 'conversations'> = {
    name: '',
    persona: '',
    task: '',
    instruction: '',
    output: '',
    initialMessage: '',
    model: AVAILABLE_MODELS[0],
};

const FormTextarea: React.FC<{id: string, label: string, value: string, onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void, placeholder: string, rows?: number}> = ({ id, label, value, onChange, placeholder, rows = 3 }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
        <textarea
            id={id}
            name={id}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={rows}
            className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
        />
    </div>
);

const ChatbotFormModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (chatbot: Omit<Chatbot, 'id' | 'createdAt' | 'conversations'> & { id?: string }) => void;
    chatbotToEdit: Chatbot | null;
}> = ({ isOpen, onClose, onSave, chatbotToEdit }) => {
    const [chatbotData, setChatbotData] = useState(chatbotToEdit || initialChatbotState);

    React.useEffect(() => {
        setChatbotData(chatbotToEdit || initialChatbotState);
    }, [chatbotToEdit, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setChatbotData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...chatbotData, id: chatbotToEdit?.id });
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 relative"
                        onClick={e => e.stopPropagation()}
                    >
                        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                            {chatbotToEdit ? 'Editar Chatbot' : 'Criar Novo Chatbot'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome do Chatbot</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={chatbotData.name}
                                    onChange={handleChange}
                                    placeholder="Ex: Escritor Criativo"
                                    required
                                    className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                                />
                            </div>
                            <FormTextarea id="persona" label="Persona" value={chatbotData.persona} onChange={handleChange} placeholder="Quem é o chatbot? Ex: Um assistente prestativo e criativo." />
                            <FormTextarea id="task" label="Tarefa" value={chatbotData.task} onChange={handleChange} placeholder="O que ele deve fazer? Ex: Ajudar usuários a ter ideias e escrever histórias." />
                            <FormTextarea id="instruction" label="Instrução" value={chatbotData.instruction} onChange={handleChange} placeholder="Como ele deve realizar a tarefa? Ex: Seja sempre encorajador e forneça pelo menos três sugestões diferentes." />
                            <FormTextarea id="output" label="Saída" value={chatbotData.output} onChange={handleChange} placeholder="Como ele deve entregar a resposta? Ex: Formate a resposta em Markdown com títulos claros." />
                            <FormTextarea id="initialMessage" label="Mensagem Inicial" value={chatbotData.initialMessage} onChange={handleChange} placeholder="Como o chatbot deve se apresentar? Ex: Olá! Estou aqui para te ajudar a escrever. O que você tem em mente?" rows={2} />
                            
                            <div>
                                <label htmlFor="model" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Modelo de IA</label>
                                <select
                                    id="model"
                                    name="model"
                                    value={chatbotData.model}
                                    onChange={handleChange}
                                    className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                                >
                                    {AVAILABLE_MODELS.map(model => (
                                        <option key={model} value={model}>{model}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex justify-end pt-4 space-x-3">
                                <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 dark:bg-gray-600 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-500">
                                    Cancelar
                                </button>
                                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-brand-secondary hover:bg-brand-primary rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-primary">
                                    {chatbotToEdit ? 'Salvar Alterações' : 'Criar Chatbot'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default function App() {
    const [chatbots, setChatbots] = useLocalStorage<Chatbot[]>('chatbots', []);
    const [view, setView] = useState<'dashboard' | 'chat'>('dashboard');
    const [activeChatbotId, setActiveChatbotId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingChatbot, setEditingChatbot] = useState<Chatbot | null>(null);

    const handleSaveChatbot = useCallback((chatbotData: Omit<Chatbot, 'createdAt' | 'conversations'> & { id?: string }) => {
        setChatbots(prev => {
            if (chatbotData.id) {
                return prev.map(bot => bot.id === chatbotData.id ? { ...bot, ...chatbotData } : bot);
            } else {
                const newBot: Chatbot = {
                    ...chatbotData,
                    id: `bot_${Date.now()}`,
                    createdAt: new Date().toISOString(),
                    conversations: []
                };
                return [newBot, ...prev];
            }
        });
        setEditingChatbot(null);
    }, [setChatbots]);

    const handleDeleteChatbot = useCallback((id: string) => {
        if (window.confirm('Tem certeza que deseja excluir este chatbot e todas as suas conversas?')) {
            setChatbots(prev => prev.filter(bot => bot.id !== id));
        }
    }, [setChatbots]);

    const handleOpenEditModal = (chatbot: Chatbot) => {
        setEditingChatbot(chatbot);
        setIsModalOpen(true);
    };
    
    const handleOpenCreateModal = () => {
        setEditingChatbot(null);
        setIsModalOpen(true);
    };

    const handleSelectChat = (id: string) => {
        setActiveChatbotId(id);
        setView('chat');
    };

    const handleBackToDashboard = () => {
        setActiveChatbotId(null);
        setView('dashboard');
    };

    if (view === 'chat' && activeChatbotId) {
        return <ChatView chatbotId={activeChatbotId} onBack={handleBackToDashboard} />;
    }

    return (
        <div className="min-h-screen text-gray-900 dark:text-gray-200 p-4 sm:p-6 lg:p-8">
            <ChatbotFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveChatbot}
                chatbotToEdit={editingChatbot}
            />

            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                <div>
                    <h1 className="text-4xl font-bold text-gray-800 dark:text-white">Fábrica de Bots DPI</h1>
                    <p className="mt-1 text-gray-500 dark:text-gray-400">Seu centro de comando pessoal para criar assistentes de IA.</p>
                </div>
                <button
                    onClick={handleOpenCreateModal}
                    className="mt-4 sm:mt-0 flex items-center justify-center gap-2 px-4 py-2 text-white bg-brand-secondary hover:bg-brand-primary rounded-md shadow-lg transition-transform transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-primary"
                >
                    <PlusIcon className="w-5 h-5" />
                    Criar Novo Chatbot
                </button>
            </header>

            <main>
                {chatbots.length === 0 ? (
                     <div className="text-center py-20">
                        <ChatBubbleIcon className="mx-auto w-16 h-16 text-gray-300 dark:text-gray-600" />
                        <h3 className="mt-4 text-xl font-semibold text-gray-800 dark:text-white">Nenhum chatbot ainda</h3>
                        <p className="mt-1 text-gray-500 dark:text-gray-400">Comece criando seu primeiro chatbot de IA.</p>
                        <button
                            onClick={handleOpenCreateModal}
                            className="mt-6 flex items-center mx-auto justify-center gap-2 px-4 py-2 text-white bg-brand-secondary hover:bg-brand-primary rounded-md shadow-lg transition-transform transform hover:scale-105"
                        >
                            <PlusIcon className="w-5 h-5" />
                            Criar Chatbot
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        <AnimatePresence>
                        {chatbots.map(bot => (
                            <motion.div
                                key={bot.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.3 }}
                                className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col"
                            >
                                <div className="p-5 flex-grow">
                                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">{bot.name}</h3>
                                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 line-clamp-3">{bot.persona}</p>
                                </div>
                                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700 flex justify-end items-center gap-2">
                                     <button onClick={() => handleOpenEditModal(bot)} className="p-2 text-gray-500 hover:text-brand-primary dark:text-gray-400 dark:hover:text-blue-400 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                                        <PencilIcon className="w-5 h-5" />
                                    </button>
                                     <button onClick={() => handleDeleteChatbot(bot.id)} className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-500 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleSelectChat(bot.id)}
                                        className="flex-1 ml-2 flex items-center justify-center gap-2 px-4 py-2 text-sm text-white bg-brand-secondary hover:bg-brand-primary rounded-md shadow-sm transition-colors"
                                    >
                                        <ChatBubbleIcon className="w-5 h-5" />
                                        Conversar
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                        </AnimatePresence>
                    </div>
                )}
            </main>
        </div>
    );
}