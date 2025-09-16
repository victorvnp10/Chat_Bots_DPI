
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BotIcon } from './icons/BotIcon';
import { SettingsIcon } from './icons/SettingsIcon';
import ApiKeyModal from './ApiKeyModal';

const Header: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <header className="bg-brand-surface p-4 shadow-md flex items-center justify-between z-10">
        <Link to="/" className="flex items-center gap-3">
          <BotIcon className="w-8 h-8 text-brand-primary" />
          <h1 className="text-xl font-bold text-brand-text">AI Chatbot Builder</h1>
        </Link>
        <button onClick={() => setIsModalOpen(true)} className="text-brand-text-secondary hover:text-brand-primary p-2 rounded-full hover:bg-brand-secondary transition-colors">
          <SettingsIcon className="w-6 h-6"/>
        </button>
      </header>
      <ApiKeyModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

export default Header;
