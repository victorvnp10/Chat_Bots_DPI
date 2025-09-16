
import React, { createContext, useContext, ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface SettingsContextType {
  apiKey: string;
  setApiKey: (key: string) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [apiKey, setApiKey] = useLocalStorage<string>('openai_api_key', '');

  return (
    <SettingsContext.Provider value={{ apiKey, setApiKey }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
