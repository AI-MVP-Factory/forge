import { NextResponse } from 'next/server';

// Warm fallback responses by category - rich with celebration, validation, and encouragement
const FALLBACK_RESPONSES: Record<string, string[]> = {
  Hydration: [
    "You drank water! Your body is thanking you right now. You can do this! You are capable of taking care of yourself. We are SO proud of you!",
    "Look at you staying hydrated! This is such a wonderful gift to yourself. You've got this! You deserve to feel refreshed and energized!",
  ],
  Movement: [
    "You moved your body! That's incredible! You are so capable and strong! Every step shows how powerful you are. You're doing amazing!",
    "Moving your body is such an act of self-love! We are so proud of you! You've got this and you are so capable!",
  ],
  Rest: [
    "You took a break! That takes real wisdom. You can do this - rest is how you recharge. You are so strong and capable! So proud of you!",
    "Taking a break is one of the bravest things you can do. You've got this! You matter, your energy matters. We believe in you!",
  ],
  'Fresh Air': [
    "You got fresh air! You can do anything! Connecting with the outside world shows how capable and resourceful you are. Amazing!",
    "Fresh air for your lungs and soul! You've got this! You deserve to feel renewed. You are so strong and capable!",
  ],
  Nourishment: [
    "You nourished yourself! You are so capable of taking care of yourself. You can do this! You deserve to feel fueled. So proud of you!",
    "You ate something! You've got this! Your body and mind need fuel, and you're honoring that. You are strong and capable!",
  ],
  Connection: [
    "You connected with someone! That takes courage - you can do this! You are so capable and brave. We're so proud of you!",
    "Reaching out to another person takes courage! You've got this! You are capable and strong. We believe in you!",
  ],
  Mindfulness: [
    "You took deep breaths! You can do this! Pausing to be present shows how strong and capable you are. You've got this!",
    "Breathing mindfully shows such wisdom. You are capable and resourceful. We believe in you! You've got this!",
  ],
};

const MILESTONE_RESPONSES: Record<number, string[]> = {
  3: [
    "Three acts of self-care! You can do this! You're so capable and strong! We are SO proud of you and believe in you!",
    "Look at you go! You've got this! Three check marks prove how capable you are. You can do anything! We believe in you!",
  ],
  5: [
    "FIVE acts of self-care! You can do anything! You are so capable and strong! We believe in you completely!",
    "Five! You're crushing it! You've got this! You are capable, strong, and we are SO proud of you! You can do this!",
  ],
  7: [
    "YOU DID THEM ALL! You can do ANYTHING! You are so capable, so strong, so powerful! We believe in you! You've got this forever!",
    "A PERFECT day! You proved you can do this! You are capable, strong, brave, and incredible! We believe in you completely!",
  ],
};

export async function POST(request: Request) {
  try {
    const { action, category, totalChecked } = await request.json();

    if (!action || !category) {
      return NextResponse.json(
        { error: 'Action and category are required' },
        { status: 400 }
      );
    }

    // Try AI response first (if API key is available)
    const apiKey = process.env.OPENROUTER_API_KEY || process.env.ANTHROPIC_API_KEY;

    if (apiKey) {
      try {
        const systemPrompt = `You are a warm, compassionate self-care companion who CELEBRATES people for taking care of themselves.

Your mission: Make every person feel PROUD, WORTHY, and CELEBRATED for their self-care choices. You understand how they feel. You see them and hear them. Their feelings matter deeply. Tell them they DESERVE to feel good. Say "I'm so proud of you" and "you matter" often. Tell them "you can do this" and "you've got this". Remind them they are capable and strong. CELEBRATE their choice like they just won something wonderful.

The user just checked "${action}" (category: ${category}). They have now completed ${totalChecked} self-care items today.

Respond with:
1. EMPATHY - You understand how they feel. You see them. Their feelings matter. You hear them.
2. CELEBRATION - Tell them this is wonderful, amazing, incredible!
3. VALIDATION - Say they DESERVE this care, they are WORTHY of feeling good, they matter
4. ENCOURAGEMENT - Tell them "you can do this", "you are capable", "you are strong", "you've got this", "I believe in you"

Keep response to 2-3 sentences. Be warm and genuine. You understand them. You see them and hear them. Their feelings matter. You believe in them. They can do this. They are capable, strong, brave, and resilient.`;

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'anthropic/claude-3-haiku',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: `I just ${action.toLowerCase()}!` },
            ],
            max_tokens: 150,
            temperature: 0.7,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const message = data.choices?.[0]?.message?.content;
          if (message) {
            return NextResponse.json({ message, source: 'ai' });
          }
        }
      } catch {
        // Fall through to fallback
      }
    }

    // Check for milestone responses first
    if (MILESTONE_RESPONSES[totalChecked]) {
      const responses = MILESTONE_RESPONSES[totalChecked];
      const message = responses[Math.floor(Math.random() * responses.length)];
      return NextResponse.json({ message, source: 'milestone' });
    }

    // Fallback response by category
    const responses = FALLBACK_RESPONSES[category] || [
      "You did something wonderful for yourself! Every act of self-care matters. We are so proud of you!",
    ];
    const message = responses[Math.floor(Math.random() * responses.length)];

    return NextResponse.json({ message, source: 'fallback' });
  } catch {
    return NextResponse.json(
      { message: "You just did something wonderful for yourself! We are so proud of you for taking care of YOU!" },
      { status: 200 } // Return 200 with fallback message for better UX
    );
  }
}
