'use client';

import { useState } from 'react';

export default function Home() {
  const [gratitude, setGratitude] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!gratitude.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/celebrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gratitude }),
      });
      const data = await res.json();
      setResponse(data.message);
      setSubmitted(true);
    } catch {
      setResponse("Something went wrong, but your gratitude still matters. Take a moment to appreciate what you shared.");
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setGratitude('');
    setResponse('');
    setSubmitted(false);
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      <div className="max-w-2xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-amber-900 mb-4">
            Gratitude Journal
          </h1>
          <p className="text-lg text-amber-700">
            Celebrate what&apos;s good in your life, one moment at a time
          </p>
        </div>

        {!submitted ? (
          /* Gratitude Input Form */
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <label htmlFor="gratitude" className="block text-lg font-medium text-gray-700 mb-4">
                What are you grateful for today?
              </label>
              <textarea
                id="gratitude"
                value={gratitude}
                onChange={(e) => setGratitude(e.target.value)}
                placeholder="Today I'm grateful for..."
                className="w-full h-32 p-4 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none text-gray-700"
                disabled={loading}
              />
              <p className="text-sm text-gray-500 mt-2">
                It could be something small — a warm cup of coffee, a kind word, a moment of peace.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !gratitude.trim()}
              className="w-full py-4 px-8 bg-amber-500 text-white font-semibold rounded-xl shadow-lg hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Celebrating...' : 'Share My Gratitude'}
            </button>
          </form>
        ) : (
          /* Celebration Response */
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="mb-6 pb-6 border-b border-amber-100">
                <p className="text-sm text-amber-600 font-medium mb-2">You shared:</p>
                <p className="text-gray-700 italic">&ldquo;{gratitude}&rdquo;</p>
              </div>

              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6">
                <p className="text-gray-800 leading-relaxed text-lg">
                  {response}
                </p>
              </div>
            </div>

            <button
              onClick={handleReset}
              className="w-full py-4 px-8 bg-amber-500 text-white font-semibold rounded-xl shadow-lg hover:bg-amber-600 transition-colors"
            >
              Share Another Gratitude
            </button>
          </div>
        )}

        {/* Footer encouragement */}
        <p className="text-center text-amber-600 text-sm mt-12">
          Every moment of gratitude is a gift you give yourself
        </p>
      </div>
    </main>
  );
}
