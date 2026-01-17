import { UIConfigSections } from '@/lib/config/types';
import { motion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const SetupConfig = ({
  configSections,
  setupState,
  setSetupState,
}: {
  configSections: UIConfigSections;
  setupState: number;
  setSetupState: (state: number) => void;
}) => {
  const [isFinishing, setIsFinishing] = useState(false);

  // Auto-complete setup immediately (no model configuration needed for SaaS)
  useEffect(() => {
    if (setupState === 2) {
      const timer = setTimeout(() => {
        handleFinish();
      }, 2000); // Show welcome message for 2 seconds
      return () => clearTimeout(timer);
    }
  }, [setupState]);

  const handleFinish = async () => {
    try {
      setIsFinishing(true);
      const res = await fetch('/api/config/setup-complete', {
        method: 'POST',
      });

      if (!res.ok) throw new Error('Failed to complete setup');

      window.location.reload();
    } catch (error) {
      console.error('Error completing setup:', error);
      toast.error('Failed to complete setup');
      setIsFinishing(false);
    }
  };

  return (
    <div className="w-[95vw] md:w-[80vw] lg:w-[65vw] mx-auto px-2 sm:px-4 md:px-6 flex flex-col space-y-6">
      {setupState === 2 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, delay: 0.1 },
          }}
          className="w-full h-[calc(95vh-80px)] bg-light-primary dark:bg-dark-primary border border-light-200 dark:border-dark-200 rounded-xl shadow-sm flex flex-col items-center justify-center overflow-hidden"
        >
          <div className="flex flex-col items-center justify-center text-center px-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-6"
            >
              <Sparkles className="w-16 h-16 md:w-20 md:h-20 text-[#24A0ED]" />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl md:text-3xl font-medium text-black dark:text-white mb-3"
            >
              Welcome to DesireFinder!
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-sm md:text-base text-black/70 dark:text-white/70 mb-6 max-w-md"
            >
              Your AI-powered search engine is ready to use. We've configured
              everything for you with our uncensored AI models.
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col items-center space-y-2 text-xs md:text-sm text-black/50 dark:text-white/50"
            >
              <p>✨ 100 free credits to get started</p>
              <p>🛍️ AI-powered product recommendations</p>
              <p>🤖 Powered by advanced AI</p>
            </motion.div>
            {isFinishing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-6 flex items-center space-x-2 text-[#24A0ED]"
              >
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#24A0ED]"></div>
                <span className="text-sm">Setting up...</span>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default SetupConfig;
