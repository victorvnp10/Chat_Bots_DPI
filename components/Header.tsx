
import React from 'react';
import { Link } from 'react-router-dom';
import { BotIcon } from './icons/BotIcon';

const Header: React.FC = () => {
  return (
    <header className="bg-brand-surface p-4 shadow-md flex items-center justify-between z-10">
      <Link to="/" className="flex items-center gap-3">
        <BotIcon className="w-8 h-8 text-brand-primary" />
        <h1 className="text-xl font-bold text-brand-text">AI Chatbot Builder</h1>
      </Link>
    </header>
  );
};

export default Header;
