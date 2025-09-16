
export type Role = 'user' | 'model';

export interface MessagePart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string; // base64
  };
}

export interface Message {
  id: string;
  role: Role;
  parts: MessagePart[];
  timestamp: string;
}

export interface Conversation {
  id: string;
  messages: Message[];
  createdAt: string;
}

export interface Chatbot {
  id: string;
  name: string;
  persona: string;
  task: string;
  instruction: string;
  output: string;
  initialMessage: string;
  model: string;
  conversations: Conversation[];
  createdAt: string;
}

export const AVAILABLE_MODELS = ['gemini-2.5-flash'];
