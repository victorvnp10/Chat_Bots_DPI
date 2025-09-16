
export interface AttachedFile {
  name: string;
  type: string;
  size: number;
  base64: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  files?: AttachedFile[];
  timestamp: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  lastUpdated: string;
}

export interface Chatbot {
  id: string;
  name: string;
  persona: string;
  task: string;
  instruction: string;
  outputFormat: string;
  initialMessage: string;
  model: string;
  conversations: Conversation[];
  createdAt: string;
}
