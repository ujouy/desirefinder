'use client';

import { useState } from 'react';
import { toast } from 'sonner';

export default function DMCAPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    copyrightOwner: '',
    infringedWork: '',
    infringingUrl: '',
    goodFaith: false,
  });

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // In production, send to your backend/email service
      const response = await fetch('/api/legal/dmca', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('DMCA request submitted successfully. We will process it within 48 hours.');
        setFormData({
          name: '',
          email: '',
          copyrightOwner: '',
          infringedWork: '',
          infringingUrl: '',
          goodFaith: false,
        });
      } else {
        throw new Error('Failed to submit request');
      }
    } catch (error) {
      toast.error('Failed to submit DMCA request. Please try again or email legal@desirefinder.com');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-light-primary dark:bg-dark-primary py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-black dark:text-white mb-8">
          DMCA Takedown Request
        </h1>

        <div className="prose prose-lg dark:prose-invert max-w-none mb-8">
          <p className="text-black/70 dark:text-white/70 mb-4">
            DesireFinder respects intellectual property rights. If you believe that content indexed by our search engine infringes your copyright, you may submit a DMCA takedown request.
          </p>
          <p className="text-black/70 dark:text-white/70 mb-4">
            <strong>Important:</strong> DesireFinder is a search engine that indexes publicly available content from third-party websites. We do not host or store any content files. We will remove links from our search index upon valid DMCA requests.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-light-secondary dark:bg-dark-secondary p-8 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-black dark:text-white mb-2">
              Your Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-light-primary dark:bg-dark-primary border border-light-200 dark:border-dark-200 text-black dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black dark:text-white mb-2">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-light-primary dark:bg-dark-primary border border-light-200 dark:border-dark-200 text-black dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black dark:text-white mb-2">
              Copyright Owner *
            </label>
            <input
              type="text"
              required
              value={formData.copyrightOwner}
              onChange={(e) => setFormData({ ...formData, copyrightOwner: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-light-primary dark:bg-dark-primary border border-light-200 dark:border-dark-200 text-black dark:text-white"
              placeholder="Name of the copyright owner"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black dark:text-white mb-2">
              Description of Infringed Work *
            </label>
            <textarea
              required
              value={formData.infringedWork}
              onChange={(e) => setFormData({ ...formData, infringedWork: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 rounded-lg bg-light-primary dark:bg-dark-primary border border-light-200 dark:border-dark-200 text-black dark:text-white"
              placeholder="Describe the copyrighted work that has been infringed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black dark:text-white mb-2">
              Infringing URL(s) *
            </label>
            <textarea
              required
              value={formData.infringingUrl}
              onChange={(e) => setFormData({ ...formData, infringingUrl: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 rounded-lg bg-light-primary dark:bg-dark-primary border border-light-200 dark:border-dark-200 text-black dark:text-white"
              placeholder="Paste the URL(s) from DesireFinder search results that link to infringing content"
            />
          </div>

          <div className="flex items-start">
            <input
              type="checkbox"
              required
              checked={formData.goodFaith}
              onChange={(e) => setFormData({ ...formData, goodFaith: e.target.checked })}
              className="mt-1 mr-3"
            />
            <label className="text-sm text-black/70 dark:text-white/70">
              I have a good faith belief that the use of the copyrighted material described above is not authorized by the copyright owner, its agent, or the law. *
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-4 bg-[#24A0ED] text-white rounded-lg font-semibold hover:bg-[#1e8fd1] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Submitting...' : 'Submit DMCA Request'}
          </button>
        </form>

        <div className="mt-8 p-6 bg-light-secondary dark:bg-dark-secondary rounded-lg">
          <h2 className="text-xl font-semibold text-black dark:text-white mb-4">
            Processing Time
          </h2>
          <p className="text-sm text-black/70 dark:text-white/70">
            Valid DMCA requests will be processed within 48 hours. You will receive a confirmation email once the links have been removed from our search index.
          </p>
        </div>
      </div>
    </div>
  );
}
