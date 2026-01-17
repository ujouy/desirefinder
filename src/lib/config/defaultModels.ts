/**
 * Default model configuration for DesireFinder SaaS
 * Uses Gemini 3.0 Flash API for cost-effective AI processing
 * These models are auto-configured - users cannot change them
 */

import { ConfigModelProvider } from './types';

/**
 * Get the default model provider configuration
 * This is automatically set up server-side - users don't configure models
 */
export function getDefaultModelProvider(): ConfigModelProvider {
  // Get Gemini API key from environment
  const geminiApiKey = process.env.GEMINI_API_KEY || '';
  
  // Default chat model - Gemini 3.0 Flash (cost-effective and fast)
  // Model names: gemini-3-flash-preview, gemini-2.0-flash-exp, gemini-1.5-flash
  const chatModel = process.env.DEFAULT_CHAT_MODEL || 'gemini-3-flash-preview';
  
  // Default embedding model - Gemini embedding
  const embeddingModel = process.env.DEFAULT_EMBEDDING_MODEL || 'text-embedding-004';

  if (!geminiApiKey) {
    throw new Error('GEMINI_API_KEY environment variable is required. Please set it in your .env file.');
  }

  return {
    id: 'default-gemini-provider',
    name: 'DesireFinder AI (Gemini)',
    type: 'gemini',
    config: {
      apiKey: geminiApiKey,
    },
    chatModels: [
      {
        key: chatModel,
        name: 'Gemini 3.0 Flash',
      },
    ],
    embeddingModels: [
      {
        key: embeddingModel,
        name: 'Gemini Embedding',
      },
    ],
    hash: 'default-gemini-hash',
  };
}

/**
 * Initialize default models in config if not already set
 */
export function initializeDefaultModels(configManager: any) {
  const existingProviders = configManager.getConfig('modelProviders', []);
  
  // Check if default provider already exists
  const hasDefaultProvider = existingProviders.some(
    (p: ConfigModelProvider) => p.id === 'default-gemini-provider',
  );

  if (!hasDefaultProvider) {
    const defaultProvider = getDefaultModelProvider();
    configManager.currentConfig.modelProviders.push(defaultProvider);
    configManager.saveConfig();
  }
}
