import { GoogleGenAI, Chat, GenerateContentResponse, Part } from "@google/genai";
import { Chatbot, ChatMessage, AttachedFile } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

function buildSystemInstruction(bot: Chatbot): string {
    return `
      **Persona:**
      ${bot.persona}

      **Task:**
      ${bot.task}

      **Instruction:**
      ${bot.instruction}

      **Output Format:**
      ${bot.outputFormat}
    `;
}

function convertFileToPart(file: AttachedFile): Part {
  return {
    inlineData: {
      mimeType: file.type,
      data: file.base64.split(',')[1],
    },
  };
}

export const getChatResponse = async (bot: Chatbot, history: ChatMessage[], newMessage: ChatMessage): Promise<string> => {
  try {
    const chat: Chat = ai.chats.create({
      model: bot.model,
      config: {
        systemInstruction: buildSystemInstruction(bot),
      },
    });

    // Replay history to build context. Gemini SDK doesn't directly take history array for a single call in chat mode.
    // Instead we send messages sequentially. A better approach for single-turn might be generateContent.
    // But for continuous chat, sendMessage is appropriate. Let's build a proper history for sendMessage.
    
    const geminiHistory = history.flatMap(msg => {
        const parts: Part[] = [{ text: msg.text }];
        if (msg.files) {
            msg.files.forEach(file => parts.push(convertFileToPart(file)));
        }
        return { role: msg.role, parts };
    });

    const userMessageParts: Part[] = [{ text: newMessage.text }];
    if (newMessage.files) {
        newMessage.files.forEach(file => userMessageParts.push(convertFileToPart(file)));
    }
    
    // FIX: The `message` parameter should be an array of `Part`s, not an object containing a `parts` property.
    const response: GenerateContentResponse = await chat.sendMessage({ 
        history: geminiHistory,
        message: userMessageParts
    });

    return response.text;
  } catch (error) {
    console.error("Error getting chat response from Gemini:", error);
    return "Sorry, I encountered an error while processing your request. Please check the console for details.";
  }
};
