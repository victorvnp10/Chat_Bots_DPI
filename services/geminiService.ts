
import { Chatbot, ChatMessage } from '../types';

// Per user request, this service is being updated to use the OpenAI API instead of Gemini.
// The filename is kept as `geminiService.ts` to minimize changes required in other parts of the application.

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
    `.trim();
}

// Interfaces for OpenAI API structure
interface OpenAIMessageContentPart {
    type: 'text' | 'image_url';
    text?: string;
    image_url?: {
        url: string;
        detail?: 'low' | 'high' | 'auto';
    };
}

interface OpenAIMessage {
    role: 'system' | 'user' | 'assistant';
    content: string | OpenAIMessageContentPart[];
}

export const getChatResponse = async (bot: Chatbot, history: ChatMessage[], newMessage: ChatMessage, apiKey: string): Promise<string> => {
    const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

    if (!apiKey || !apiKey.startsWith('sk-')) {
      const errorMsg = "OpenAI API key is missing or invalid. Please set it in the settings.";
      console.error(errorMsg);
      return `Configuration error: ${errorMsg}`;
    }

    // Filter out the initial greeting message from the history sent to the API
    const conversationHistory = history.filter((msg, index) => 
        !(index === 0 && msg.role === 'model' && msg.text === bot.initialMessage)
    );

    const fullHistory = [...conversationHistory, newMessage];

    const mappedMessages = fullHistory.map((msg): OpenAIMessage => {
        const role = msg.role === 'model' ? 'assistant' : 'user';

        if (role === 'user' && msg.files && msg.files.length > 0) {
            const content: OpenAIMessageContentPart[] = [{ type: 'text', text: msg.text }];
            let fileContentText = '';

            msg.files.forEach(file => {
                if (file.type.startsWith('image/')) {
                    content.push({ type: 'image_url', image_url: { url: file.base64 } });
                } else if (file.textContent) {
                    fileContentText += `\n\n--- Start of attached file: ${file.name} ---\n${file.textContent}\n--- End of attached file: ${file.name} ---`;
                }
            });

            if (content[0].text) {
                content[0].text += fileContentText;
            } else {
                content[0].text = fileContentText.trim();
            }

            return { role, content };
        }
        
        return { role, content: msg.text };
    });

    const finalMessages: OpenAIMessage[] = [
        { role: 'system', content: buildSystemInstruction(bot) },
        ...mappedMessages
    ];

    try {
        const response = await fetch(OPENAI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: bot.model,
                messages: finalMessages,
                max_tokens: 4096,
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("OpenAI API Error:", errorData);
            const errorMessage = errorData.error?.message || `HTTP error! status: ${response.status}`;
            return `Sorry, there was an error communicating with the AI model. Details: ${errorMessage}`;
        }

        const data = await response.json();
        return data.choices[0]?.message?.content || "Sorry, I received an empty response from the AI.";

    } catch (error) {
        console.error("Error calling OpenAI API:", error);
        return "Sorry, I encountered a network error while trying to reach the AI. Please check your network connection and the browser console for more details.";
    }
};
