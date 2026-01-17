import configManager from '@/lib/config';
import { NextRequest } from 'next/server';
import { initializeDefaultModels } from '@/lib/config/defaultModels';

export const POST = async (req: NextRequest) => {
  try {
    // Ensure default models are configured
    initializeDefaultModels(configManager);
    
    // Mark setup as complete (no model configuration needed for SaaS)
    configManager.markSetupComplete();

    return Response.json(
      {
        message: 'Setup marked as complete.',
      },
      {
        status: 200,
      },
    );
  } catch (err) {
    console.error('Error marking setup as complete: ', err);
    return Response.json(
      { message: 'An error has occurred.' },
      { status: 500 },
    );
  }
};
