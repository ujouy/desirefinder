'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Coins, Check, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

const PACKAGES = [
  {
    id: 'trial',
    name: 'Voyeur',
    subtitle: 'Free Trial',
    credits: 3,
    price: 0,
    features: ['3 free searches', 'Try all features', 'No credit card required'],
    popular: false,
  },
  {
    id: '50-credits',
    name: 'Explorer',
    subtitle: 'Most Popular',
    credits: 50,
    price: 5,
    features: ['50 searches', 'Full access', 'Crypto payments'],
    popular: true,
  },
  {
    id: '200-credits',
    name: 'Collector',
    subtitle: 'Best Value',
    credits: 200,
    price: 15,
    features: ['200 searches', 'Full access', 'Crypto payments', 'Best value'],
    popular: false,
  },
];

export default function PricingPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState<string | null>(null);
  const [credits, setCredits] = useState<number | null>(null);

  useEffect(() => {
    // Check for success/cancel params
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');

    if (success) {
      toast.success('Payment successful! Credits have been added to your account.');
      fetchCredits();
    } else if (canceled) {
      toast.error('Payment was canceled.');
    }
  }, [searchParams]);

  useEffect(() => {
    if (isLoaded && user) {
      fetchCredits();
    }
  }, [isLoaded, user]);

  const fetchCredits = async () => {
    try {
      const res = await fetch('/api/credits');
      const data = await res.json();
      setCredits(data.credits || 0);
    } catch (error) {
      console.error('Error fetching credits:', error);
    }
  };

  const handlePurchase = async (packageId: string) => {
    if (!user) {
      router.push('/sign-in?redirect=/pricing');
      return;
    }

    setLoading(packageId);

    try {
      const res = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create payment');
      }

      // Free trial - just refresh credits
      if (packageId === 'trial') {
        toast.success('Free credits added!');
        fetchCredits();
        setLoading(null);
        return;
      }

      // Redirect to payment page
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        throw new Error('No payment URL received');
      }
    } catch (error: any) {
      console.error('Error creating payment:', error);
      toast.error(error.message || 'Failed to create payment. Please try again.');
      setLoading(null);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#24A0ED]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-primary dark:bg-dark-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-black dark:text-white mb-4">
            Choose Your Plan
          </h1>
          <p className="text-lg text-black/70 dark:text-white/70 max-w-2xl mx-auto">
            Get started with free credits or unlock unlimited searches with crypto payments
          </p>
          {user && credits !== null && (
            <div className="mt-4 inline-flex items-center space-x-2 px-4 py-2 bg-light-secondary dark:bg-dark-secondary rounded-lg">
              <Coins className="w-5 h-5 text-[#24A0ED]" />
              <span className="text-sm font-medium text-black dark:text-white">
                Your Credits: <span className="text-[#24A0ED]">{credits}</span>
              </span>
            </div>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {PACKAGES.map((pkg) => (
            <div
              key={pkg.id}
              className={`relative bg-light-secondary dark:bg-dark-secondary rounded-2xl border-2 p-8 ${
                pkg.popular
                  ? 'border-[#24A0ED] shadow-lg scale-105'
                  : 'border-light-200 dark:border-dark-200'
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-[#24A0ED] text-white text-xs font-semibold px-4 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-black dark:text-white mb-1">
                  {pkg.name}
                </h3>
                <p className="text-sm text-black/60 dark:text-white/60 mb-4">
                  {pkg.subtitle}
                </p>
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-bold text-black dark:text-white">
                    ${pkg.price}
                  </span>
                  {pkg.price > 0 && (
                    <span className="text-lg text-black/60 dark:text-white/60 ml-2">
                      /one-time
                    </span>
                  )}
                </div>
                <div className="mt-2 flex items-center justify-center space-x-1">
                  <Coins className="w-5 h-5 text-[#24A0ED]" />
                  <span className="text-lg font-semibold text-black dark:text-white">
                    {pkg.credits} Credits
                  </span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {pkg.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <Check className="w-5 h-5 text-[#24A0ED] mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-black/70 dark:text-white/70">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {user ? (
                <button
                  onClick={() => handlePurchase(pkg.id)}
                  disabled={loading !== null}
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
                    pkg.popular
                      ? 'bg-[#24A0ED] text-white hover:bg-[#1e8fd1]'
                      : pkg.price === 0
                        ? 'bg-light-200 dark:bg-dark-200 text-black dark:text-white hover:bg-light-300 dark:hover:bg-dark-300'
                        : 'bg-light-200 dark:bg-dark-200 text-black dark:text-white hover:bg-light-300 dark:hover:bg-dark-300'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loading === pkg.id ? (
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  ) : pkg.price === 0 ? (
                    'Claim Free Credits'
                  ) : (
                    'Buy with Crypto'
                  )}
                </button>
              ) : (
                <Link
                  href="/sign-in?redirect=/pricing"
                  className="block w-full py-3 px-4 rounded-lg font-semibold text-center bg-[#24A0ED] text-white hover:bg-[#1e8fd1] transition-all"
                >
                  Sign In to Purchase
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* Footer Note */}
        <div className="mt-12 text-center">
          <p className="text-sm text-black/50 dark:text-white/50">
            All payments are processed securely via NowPayments. We accept Bitcoin, Ethereum, and other cryptocurrencies.
          </p>
          <p className="text-xs text-black/40 dark:text-white/40 mt-2">
            By purchasing, you confirm you are 18+ and agree to our{' '}
            <Link href="/legal/terms" className="underline">
              Terms of Service
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
