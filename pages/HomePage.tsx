
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useChatbots } from '../contexts/ChatbotContext';
import { PlusIcon } from '../components/icons/PlusIcon';
import { EditIcon } from '../components/icons/EditIcon';
import { TrashIcon } from '../components/icons/TrashIcon';

const HomePage: React.FC = () => {
  const { chatbots, deleteBot } = useChatbots();
  const navigate = useNavigate();

  const handleDelete = (e: React.MouseEvent, botId: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this chatbot and all its conversations?')) {
      deleteBot(botId);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Your Chatbots</h1>
        <Link
          to="/bot/new"
          className="bg-brand-primary text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-opacity-80 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          Create New
        </Link>
      </div>
      {chatbots.length === 0 ? (
        <div className="text-center py-20 bg-brand-surface rounded-lg">
          <p className="text-brand-text-secondary text-lg">You haven't created any chatbots yet.</p>
          <p className="text-brand-text-secondary">Click "Create New" to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {chatbots.map(bot => (
            <div
              key={bot.id}
              onClick={() => navigate(`/chat/${bot.id}`)}
              className="bg-brand-surface rounded-lg shadow-lg p-6 cursor-pointer hover:ring-2 hover:ring-brand-primary transition-all group"
            >
              <div className="flex justify-between items-start">
                  <h2 className="text-xl font-bold mb-2 text-brand-text">{bot.name}</h2>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => { e.stopPropagation(); navigate(`/bot/edit/${bot.id}`);}} className="text-brand-text-secondary hover:text-brand-primary">
                          <EditIcon className="w-5 h-5"/>
                      </button>
                      <button onClick={(e) => handleDelete(e, bot.id)} className="text-brand-text-secondary hover:text-red-500">
                          <TrashIcon className="w-5 h-5"/>
                      </button>
                  </div>
              </div>
              <p className="text-brand-text-secondary text-sm mb-4 line-clamp-2">{bot.persona}</p>
              <div className="text-xs text-gray-400">
                Model: {bot.model}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage;
