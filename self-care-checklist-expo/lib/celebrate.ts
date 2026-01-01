/**
 * Celebration API - Get AI-powered encouragement
 */

// Warm fallback responses by category
const FALLBACK_RESPONSES: Record<string, string[]> = {
  Hydration: [
    "You drank water! Your body is thanking you right now. You can do this! We are SO proud of you!",
    "Look at you staying hydrated! This is such a wonderful gift to yourself. You've got this!",
  ],
  Movement: [
    "You moved your body! That's incredible! Every step shows how powerful you are. You're doing amazing!",
    "Moving your body is such an act of self-love! We are so proud of you! You've got this!",
  ],
  Rest: [
    "You took a break! That takes real wisdom. Rest is how you recharge. So proud of you!",
    "Taking a break is one of the bravest things you can do. You matter, your energy matters.",
  ],
  'Fresh Air': [
    "You got fresh air! Connecting with the outside world shows how resourceful you are. Amazing!",
    "Fresh air for your lungs and soul! You deserve to feel renewed. You are so strong!",
  ],
  Nourishment: [
    "You nourished yourself! You deserve to feel fueled. So proud of you!",
    "You ate something! Your body and mind need fuel, and you're honoring that.",
  ],
  Connection: [
    "You connected with someone! That takes courage. We're so proud of you!",
    "Reaching out to another person takes courage! You are capable and brave.",
  ],
  Mindfulness: [
    "You took deep breaths! Pausing to be present shows how strong you are. You've got this!",
    "Breathing mindfully shows such wisdom. You are capable and resourceful.",
  ],
};

const MILESTONE_RESPONSES: Record<number, string[]> = {
  3: [
    "Three acts of self-care! You're building something beautiful. We are SO proud of you!",
    "Look at you go! Three check marks prove how capable you are. Keep going!",
  ],
  5: [
    "FIVE acts of self-care! You are absolutely crushing it! We believe in you completely!",
    "Five! You're on fire! You are capable, strong, and we are SO proud of you!",
  ],
  7: [
    "YOU DID THEM ALL! A perfect day of self-care! You are incredible! We believe in you!",
    "A PERFECT day! You proved you can do this! You are capable, strong, and amazing!",
  ],
};

interface CelebrateParams {
  action: string;
  category: string;
  totalChecked: number;
}

interface CelebrateResult {
  message: string;
  source: 'ai' | 'milestone' | 'fallback';
}

export async function celebrate(params: CelebrateParams): Promise<CelebrateResult> {
  const { action, category, totalChecked } = params;

  // Check for milestone responses first
  if (MILESTONE_RESPONSES[totalChecked]) {
    const responses = MILESTONE_RESPONSES[totalChecked];
    const message = responses[Math.floor(Math.random() * responses.length)];
    return { message, source: 'milestone' };
  }

  // Try AI response (would need API key in production)
  // For now, use fallback responses

  // Fallback response by category
  const responses = FALLBACK_RESPONSES[category] || [
    "You did something wonderful for yourself! Every act of self-care matters. We are so proud of you!",
  ];
  const message = responses[Math.floor(Math.random() * responses.length)];

  return { message, source: 'fallback' };
}
