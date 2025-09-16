
import React, { useState, useEffect } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { XIcon } from './icons/XIcon';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose }) => {
  const { apiKey, setApiKey } = useSettings();
  const [localKey, setLocalKey] = useState(apiKey);

  useEffect(() => {
    setLocalKey(apiKey);
  }, [apiKey, isOpen]);

  const handleSave = () => {
    setApiKey(localKey);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-brand-surface rounded-lg shadow-xl p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">OpenAI API Key</h2>
          <button onClick={onClose} className="text-brand-text-secondary hover:text-brand-text">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        <p className="text-brand-text-secondary mb-4 text-sm">
          Your API key is stored securely in your browser's local storage and is never sent anywhere else.
        </p>
        <div className="space-y-4">
           <div>
              <label htmlFor="apiKey" className="block text-sm font-medium text-brand-text-secondary mb-1">Your Key</label>
              <input
                type="password"
                id="apiKey"
                value={localKey}
                onChange={(e) => setLocalKey(e.target.value)}
                placeholder="sk-..."
                className="w-full bg-brand-secondary p-2 rounded-md border border-brand-secondary focus:ring-2 focus:ring-brand-primary focus:outline-none"
              />
           </div>
           <div className="flex justify-end gap-4">
             <button onClick={onClose} className="bg-brand-secondary text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-80 transition-colors">
               Cancel
             </button>
             <button onClick={handleSave} className="bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-80 transition-colors">
               Save Key
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;
