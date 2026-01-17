'use client';

import { useEffect, useState } from 'react';
import { Coins, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CreditDisplay() {
  const router = useRouter();
  const [credits, setCredits] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCredits();
    // Refresh credits every 30 seconds
    const interval = setInterval(fetchCredits, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchCredits = async () => {
    try {
      const res = await fetch('/api/credits');
      if (res.ok) {
        const data = await res.json();
        setCredits(data.credits || 0);
      }
    } catch (error) {
      console.error('Error fetching credits:', error);
      setCredits(0);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-light-secondary dark:bg-dark-secondary">
        <div className="w-4 h-4 border-2 border-[#24A0ED] border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs text-black/70 dark:text-white/70">
          Loading...
        </span>
      </div>
    );
  }

  const isLow = credits !== null && credits < 10;

  return (
    <button
      onClick={() => router.push('/pricing')}
      className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-all ${
        isLow
          ? 'bg-red-500/10 hover:bg-red-500/20 border border-red-500/30'
          : 'bg-light-secondary dark:bg-dark-secondary hover:bg-light-200 dark:hover:bg-dark-200'
      }`}
    >
      <Coins
        className={`w-4 h-4 ${
          isLow ? 'text-red-500' : 'text-[#24A0ED]'
        }`}
      />
      <span
        className={`text-sm font-medium ${
          isLow
            ? 'text-red-500'
            : 'text-black/70 dark:text-white/70'
        }`}
      >
        {credits !== null ? credits.toFixed(0) : '0'} credits
      </span>
      {isLow && (
        <Zap className="w-3 h-3 text-red-500 animate-pulse" />
      )}
    </button>
  );
}
