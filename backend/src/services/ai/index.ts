import { AIService } from './AIService';
import { OpenAIService } from './OpenAIService';
import { DemoAIService } from './DemoAIService';

let instance: AIService | null = null;

export function getAIService(): AIService {
  if (instance) return instance;

  const apiKey = process.env.OPENAI_API_KEY;
  if (apiKey && apiKey.trim() !== '' && !apiKey.includes('your-openai-api-key')) {
    console.log('🤖 Initializing OpenAIService (API Key found)');
    instance = new OpenAIService(apiKey);
  } else {
    console.log('💡 Initializing DemoAIService (No OpenAI API Key found - Running Demo Mode)');
    instance = new DemoAIService();
  }

  return instance;
}
