
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChatbots } from '../contexts/ChatbotContext';
import { Chatbot } from '../types';
import { AVAILABLE_MODELS } from '../constants';

const EditBotPage: React.FC = () => {
  const { botId } = useParams<{ botId: string }>();
  const navigate = useNavigate();
  const { getBot, addBot, updateBot } = useChatbots();
  const isEditing = Boolean(botId);

  const [botData, setBotData] = useState<Omit<Chatbot, 'id' | 'conversations' | 'createdAt'>>({
    name: '',
    persona: '',
    task: '',
    instruction: '',
    outputFormat: '',
    initialMessage: '',
    model: AVAILABLE_MODELS[0].id,
  });

  useEffect(() => {
    if (isEditing && botId) {
      const existingBot = getBot(botId);
      if (existingBot) {
        setBotData(existingBot);
      }
    }
  }, [botId, isEditing, getBot]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBotData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && botId) {
      updateBot({ ...botData, id: botId, conversations: getBot(botId)?.conversations || [], createdAt: getBot(botId)?.createdAt || new Date().toISOString() });
    } else {
      addBot(botData);
    }
    navigate('/');
  };

  const FormField = ({ label, name, value, children }: { label: string, name: string, value: string, children: React.ReactNode }) => (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-brand-text-secondary mb-1">{label}</label>
      {children}
    </div>
  );

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">{isEditing ? 'Edit Chatbot' : 'Create New Chatbot'}</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormField label="Chatbot Name" name="name" value={botData.name}>
          <input
            type="text"
            id="name"
            name="name"
            value={botData.name}
            onChange={handleChange}
            required
            className="w-full bg-brand-secondary p-2 rounded-md border border-brand-secondary focus:ring-2 focus:ring-brand-primary focus:outline-none"
          />
        </FormField>
        
        <h2 className="text-xl font-semibold border-b border-brand-secondary pb-2">Fundamentals</h2>

        <FormField label="Persona" name="persona" value={botData.persona}>
          <textarea
            id="persona"
            name="persona"
            value={botData.persona}
            onChange={handleChange}
            required
            rows={3}
            placeholder="Who is the chatbot? e.g., A friendly and helpful assistant for cooking."
            className="w-full bg-brand-secondary p-2 rounded-md border border-brand-secondary focus:ring-2 focus:ring-brand-primary focus:outline-none"
          />
        </FormField>

        <FormField label="Task" name="task" value={botData.task}>
          <textarea
            id="task"
            name="task"
            value={botData.task}
            onChange={handleChange}
            required
            rows={3}
            placeholder="What should it do? e.g., Provide recipes, cooking tips, and ingredient substitutions."
            className="w-full bg-brand-secondary p-2 rounded-md border border-brand-secondary focus:ring-2 focus:ring-brand-primary focus:outline-none"
          />
        </FormField>

        <FormField label="Instruction" name="instruction" value={botData.instruction}>
          <textarea
            id="instruction"
            name="instruction"
            value={botData.instruction}
            onChange={handleChange}
            required
            rows={3}
            placeholder="How should it perform the task? e.g., Be concise, use simple language, and always ask clarifying questions if the user is vague."
            className="w-full bg-brand-secondary p-2 rounded-md border border-brand-secondary focus:ring-2 focus:ring-brand-primary focus:outline-none"
          />
        </FormField>

        <FormField label="Output" name="outputFormat" value={botData.outputFormat}>
          <textarea
            id="outputFormat"
            name="outputFormat"
            value={botData.outputFormat}
            onChange={handleChange}
            required
            rows={3}
            placeholder="How should it deliver the response? e.g., Format recipes with clear ingredient lists and step-by-step instructions. Use markdown for formatting."
            className="w-full bg-brand-secondary p-2 rounded-md border border-brand-secondary focus:ring-2 focus:ring-brand-primary focus:outline-none"
          />
        </FormField>

        <h2 className="text-xl font-semibold border-b border-brand-secondary pb-2">Configuration</h2>
        
        <FormField label="Initial Message" name="initialMessage" value={botData.initialMessage}>
          <input
            type="text"
            id="initialMessage"
            name="initialMessage"
            value={botData.initialMessage}
            onChange={handleChange}
            required
            placeholder="e.g., Hello! I'm your cooking assistant. How can I help you today?"
            className="w-full bg-brand-secondary p-2 rounded-md border border-brand-secondary focus:ring-2 focus:ring-brand-primary focus:outline-none"
          />
        </FormField>

        <FormField label="AI Model" name="model" value={botData.model}>
          <select
            id="model"
            name="model"
            value={botData.model}
            onChange={handleChange}
            className="w-full bg-brand-secondary p-2 rounded-md border border-brand-secondary focus:ring-2 focus:ring-brand-primary focus:outline-none"
          >
            {AVAILABLE_MODELS.map(model => (
              <option key={model.id} value={model.id}>{model.name}</option>
            ))}
          </select>
        </FormField>
        
        <div className="flex justify-end gap-4 pt-4">
          <button type="button" onClick={() => navigate(-1)} className="bg-brand-secondary text-white font-bold py-2 px-6 rounded-lg hover:bg-opacity-80 transition-colors">
            Cancel
          </button>
          <button type="submit" className="bg-brand-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-opacity-80 transition-colors">
            {isEditing ? 'Save Changes' : 'Create Chatbot'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditBotPage;
