'use client';

import { useState } from 'react';

const MOODS = [
  { emoji: '😊', label: 'Great', color: 'bg-green-100 hover:bg-green-200 border-green-300' },
  { emoji: '🙂', label: 'Good', color: 'bg-blue-100 hover:bg-blue-200 border-blue-300' },
  { emoji: '😐', label: 'Okay', color: 'bg-yellow-100 hover:bg-yellow-200 border-yellow-300' },
  { emoji: '😔', label: 'Low', color: 'bg-orange-100 hover:bg-orange-200 border-orange-300' },
  { emoji: '😢', label: 'Tough', color: 'bg-red-100 hover:bg-red-200 border-red-300' },
];

export default function Home() {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!selectedMood) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood: selectedMood, note }),
      });
      const data = await res.json();
      setResponse(data.message);
    } catch {
      setResponse("We hit a small bump, but your feelings still matter. Take a deep breath - you're doing great just by checking in.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedMood(null);
    setNote('');
    setResponse(null);
  };

  if (response) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-b from-purple-50 to-white">
        <div className="max-w-xl text-center space-y-8">
          <div className="text-6xl mb-4">
            {MOODS.find(m => m.label === selectedMood)?.emoji}
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg border border-purple-100">
            <p className="text-xl text-gray-700 leading-relaxed">
              {response}
            </p>
          </div>

          <p className="text-sm text-purple-600">
            You did something amazing today. We celebrate you and we are so proud of you!
          </p>

          <button
            onClick={handleReset}
            className="text-purple-600 hover:text-purple-700 font-medium"
          >
            Check in again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-b from-purple-50 to-white">
      <div className="max-w-xl text-center space-y-8">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
          How are you feeling?
        </h1>

        <p className="text-lg text-gray-600">
          Your feelings matter. We are so proud of you for taking this amazing step
          to check in with yourself. You are doing something incredible!
        </p>

        {/* Mood Selection */}
        <div className="flex justify-center gap-4 flex-wrap">
          {MOODS.map((mood) => (
            <button
              key={mood.label}
              onClick={() => setSelectedMood(mood.label)}
              className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                selectedMood === mood.label
                  ? `${mood.color} border-4 scale-110`
                  : `${mood.color} border-transparent`
              }`}
            >
              <span className="text-4xl mb-1">{mood.emoji}</span>
              <span className="text-sm font-medium text-gray-700">{mood.label}</span>
            </button>
          ))}
        </div>

        {/* Optional Note */}
        {selectedMood && (
          <div className="space-y-4 animate-fade-in">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Want to share more? (optional)"
              className="w-full p-4 rounded-xl border border-gray-200 focus:border-purple-300 focus:ring focus:ring-purple-100 resize-none"
              rows={3}
            />

            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full rounded-full bg-purple-600 px-8 py-4 text-lg font-semibold text-white shadow-lg hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? 'Sending warmth your way...' : 'Check In'}
            </button>
          </div>
        )}

        <p className="text-sm text-gray-400">
          Every feeling is valid. You matter so much. You are enough exactly as you are.
          You deserve to be seen and heard. We are so proud of you for being here!
        </p>
      </div>
    </main>
  );
}
