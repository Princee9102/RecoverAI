"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAIService = getAIService;
const OpenAIService_1 = require("./OpenAIService");
const DemoAIService_1 = require("./DemoAIService");
let instance = null;
function getAIService() {
    if (instance)
        return instance;
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey && apiKey.trim() !== '' && !apiKey.includes('your-openai-api-key')) {
        console.log('🤖 Initializing OpenAIService (API Key found)');
        instance = new OpenAIService_1.OpenAIService(apiKey);
    }
    else {
        console.log('💡 Initializing DemoAIService (No OpenAI API Key found - Running Demo Mode)');
        instance = new DemoAIService_1.DemoAIService();
    }
    return instance;
}
