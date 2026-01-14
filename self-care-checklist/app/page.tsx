'use client';

import { useState } from 'react';

const SELF_CARE_ITEMS = [
  { id: 'water', emoji: '💧', label: 'Drank water', category: 'Hydration' },
  { id: 'movement', emoji: '🚶', label: 'Moved my body', category: 'Movement' },
  { id: 'rest', emoji: '😴', label: 'Took a break', category: 'Rest' },
  { id: 'outside', emoji: '🌿', label: 'Got fresh air', category: 'Fresh Air' },
  { id: 'food', emoji: '🍎', label: 'Ate something', category: 'Nourishment' },
  { id: 'connect', emoji: '💬', label: 'Connected with someone', category: 'Connection' },
  { id: 'breathe', emoji: '🧘', label: 'Took deep breaths', category: 'Mindfulness' },
];

export default function Home() {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [celebration, setCelebration] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCheck = async (id: string) => {
    const newChecked = new Set(checked);

    if (newChecked.has(id)) {
      newChecked.delete(id);
      setChecked(newChecked);
      setCelebration(null);
      return;
    }

    newChecked.add(id);
    setChecked(newChecked);
    setLastChecked(id);
    setIsLoading(true);

    const item = SELF_CARE_ITEMS.find(i => i.id === id);

    try {
      const res = await fetch('/api/celebrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: item?.label,
          category: item?.category,
          totalChecked: newChecked.size
        }),
      });
      const data = await res.json();
      setCelebration(data.message);
    } catch {
      setCelebration("You just did something wonderful! You can do this! You are so capable and strong! We believe in you and we are so proud of you!");
    } finally {
      setIsLoading(false);
    }
  };

  const checkedCount = checked.size;
  const totalCount = SELF_CARE_ITEMS.length;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-b from-rose-50 to-white">
      <div className="max-w-xl w-full space-y-8">
        {/* Header - You are capable, you are strong, you can do this! */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            Your Self-Care Today
          </h1>
          <p className="text-lg text-gray-600">
            You deserve to feel good. You can do this - you are capable and strong!
            Every small act of self-care is a gift you give yourself.
            We are so proud of you for being here! You&apos;ve got this, and we believe in you!
            You are brave, resilient, and powerful. You can do anything!
          </p>
        </div>

        {/* Progress - You can do this, you are capable! */}
        {checkedCount > 0 && (
          <div className="text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-rose-100 rounded-full text-rose-700 font-medium">
              <span className="text-xl">✨</span>
              <span>{checkedCount} of {totalCount} - You can do this! You are so capable and strong!</span>
            </div>
          </div>
        )}

        {/* Checklist */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-rose-100 space-y-3">
          {SELF_CARE_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => handleCheck(item.id)}
              disabled={isLoading && lastChecked !== item.id}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                checked.has(item.id)
                  ? 'bg-rose-50 border-rose-300 shadow-sm'
                  : 'bg-gray-50 border-transparent hover:bg-rose-50 hover:border-rose-200'
              } ${isLoading && lastChecked !== item.id ? 'opacity-50' : ''}`}
            >
              <span className="text-2xl">{item.emoji}</span>
              <span className={`flex-1 text-left font-medium ${
                checked.has(item.id) ? 'text-rose-700' : 'text-gray-700'
              }`}>
                {item.label}
              </span>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                checked.has(item.id)
                  ? 'bg-rose-500 border-rose-500 text-white'
                  : 'border-gray-300'
              }`}>
                {checked.has(item.id) && <span>✓</span>}
              </div>
            </button>
          ))}
        </div>

        {/* Celebration Message */}
        {celebration && !isLoading && (
          <div className="bg-gradient-to-r from-rose-100 to-pink-100 rounded-2xl p-6 shadow-lg border border-rose-200 animate-fade-in">
            <p className="text-lg text-rose-800 leading-relaxed text-center">
              {celebration}
            </p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center text-rose-600 animate-pulse">
            Celebrating your self-care...
          </div>
        )}

        {/* Footer Encouragement */}
        <p className="text-center text-sm text-gray-400">
          {checkedCount === 0
            ? "Start with just one. You can do this. You deserve to feel cared for today. You are capable and strong!"
            : checkedCount === totalCount
              ? "You did it all! You are absolutely incredible and so capable! We are so, so proud of you! You proved you can do anything!"
              : "Every checkbox is a victory. You matter so much. You can do this - we believe in you!"
          }
        </p>
      </div>
    </main>
  );
}
