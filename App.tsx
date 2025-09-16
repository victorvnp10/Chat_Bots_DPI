
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { ChatbotProvider } from './contexts/ChatbotContext';
import { SettingsProvider } from './contexts/SettingsContext';
import HomePage from './pages/HomePage';
import EditBotPage from './pages/EditBotPage';
import ChatPage from './pages/ChatPage';
import Header from './components/Header';

const App: React.FC = () => {
  return (
    <SettingsProvider>
      <ChatbotProvider>
        <HashRouter>
          <div className="flex flex-col h-screen bg-brand-bg text-brand-text">
            <Header />
            <main className="flex-grow overflow-y-auto">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/bot/new" element={<EditBotPage />} />
                <Route path="/bot/edit/:botId" element={<EditBotPage />} />
                <Route path="/chat/:botId" element={<ChatPage />} />
                <Route path="/chat/:botId/:conversationId" element={<ChatPage />} />
              </Routes>
            </main>
          </div>
        </HashRouter>
      </ChatbotProvider>
    </SettingsProvider>
  );
};

export default App;
