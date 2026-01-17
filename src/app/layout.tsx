export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import Sidebar from '@/components/Sidebar';
import { Toaster } from 'sonner';
import ThemeProvider from '@/components/theme/Provider';
import configManager from '@/lib/config';
import SetupWizard from '@/components/Setup/SetupWizard';
import { ChatProvider } from '@/lib/hooks/useChat';
import { ClerkProvider } from '@clerk/nextjs';

const montserrat = Montserrat({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  fallback: ['Arial', 'sans-serif'],
});

export const metadata: Metadata = {
  title: 'DesireFinder - AI-Powered Shopping Assistant',
  description:
    "DesireFinder is an AI-powered shopping assistant that helps you discover products based on your needs, style, and preferences. Describe what you want, and we'll find the perfect products for you.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const setupComplete = configManager.isSetupComplete();
  const configSections = configManager.getUIConfigSections();

  return (
    <ClerkProvider>
      <html className="h-full" lang="en" suppressHydrationWarning>
        <body className={cn('h-full antialiased', montserrat.className)}>
          <ThemeProvider>
            {setupComplete ? (
              <ChatProvider>
                <Sidebar>{children}</Sidebar>
                <Toaster
                  toastOptions={{
                    unstyled: true,
                    classNames: {
                      toast:
                        'bg-light-secondary dark:bg-dark-secondary dark:text-white/70 text-black-70 rounded-lg p-4 flex flex-row items-center space-x-2',
                    },
                  }}
                />
              </ChatProvider>
            ) : (
              <SetupWizard configSections={configSections} />
            )}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
