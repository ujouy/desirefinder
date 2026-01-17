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
    // Only throw at runtime, not during build
    const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' || 
                       (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL?.includes('dummy'));
    if (isBuildTime) {
      // Return a placeholder during build
      return {
        id: 'default-gemini-provider',
        name: 'DesireFinder AI (Gemini)',
        type: 'gemini',
        config: {
          apiKey: '', // Will be set at runtime
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
 * Skips initialization during build time if GEMINI_API_KEY is not available
 */
export function initializeDefaultModels(configManager: any) {
  // Skip initialization during build if API key is not available
  // This allows the build to complete without requiring env vars
  const geminiApiKey = process.env.GEMINI_API_KEY || '';
  if (!geminiApiKey) {
    // During build, this is expected - initialization will happen at runtime
    if (process.env.NEXT_PHASE === 'phase-production-build' || process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL?.includes('dummy')) {
      return; // Skip during build
    }
    // At runtime, we still want to warn but not crash
    console.warn('GEMINI_API_KEY not set - default models will not be initialized. Set GEMINI_API_KEY in your .env file.');
    return;
  }

  const existingProviders = configManager.getConfig('modelProviders', []);
  
  // Check if default provider already exists
  const hasDefaultProvider = existingProviders.some(
    (p: ConfigModelProvider) => p.id === 'default-gemini-provider',
  );

  if (!hasDefaultProvider) {
    try {
      const defaultProvider = getDefaultModelProvider();
      configManager.currentConfig.modelProviders.push(defaultProvider);
      configManager.saveConfig();
    } catch (error) {
      // If initialization fails, log but don't crash (allows build to continue)
      console.warn('Failed to initialize default models:', error instanceof Error ? error.message : String(error));
    }
  }
}
