import { NextResponse } from 'next/server';

// Warm fallback responses by mood - rich with celebration, validation, and encouragement
const FALLBACK_RESPONSES: Record<string, string[]> = {
  Great: [
    "What a beautiful feeling! I'm so proud of you for celebrating this moment! Your joy is contagious, and you deserve every bit of this happiness. You're doing amazing!",
    "You're radiating good vibes today! This is wonderful - celebrate this win! You've got so much to be proud of. Keep shining!",
  ],
  Good: [
    "That's lovely to hear! Good days are worth celebrating, and I'm so proud of you for checking in! You're doing wonderfully, and you should feel great about that!",
    "A good day is a gift, and YOU made it happen! Thank you for sharing this positive energy. You've got this, and I believe in you!",
  ],
  Okay: [
    "I'm so proud of you for checking in! Okay is perfectly okay - you're showing up for yourself, and that's something to celebrate! You're stronger than you know.",
    "Thank you for being here! Some days are just okay, and that's completely valid. You're doing better than you think, and I'm cheering you on!",
  ],
  Low: [
    "I'm so proud of you for having the courage to share this. Feeling low is part of being human, and acknowledging it makes you incredibly strong. You're not alone, and you've got this.",
    "Thank you for trusting me with how you feel. You're doing something amazing just by checking in. Remember: you are stronger than you know, and this feeling will pass.",
  ],
  Tough: [
    "I'm so proud of you for being brave enough to check in during a tough time. You're incredibly strong, and I believe in you. You've survived every difficult day before, and you'll get through this too.",
    "Thank you for sharing this with me. You're doing something incredible by acknowledging how you feel. You're not alone, and you have so much strength inside you. I'm here with you.",
  ],
};

export async function POST(request: Request) {
  try {
    const { mood, note } = await request.json();

    if (!mood) {
      return NextResponse.json(
        { error: 'Mood is required' },
        { status: 400 }
      );
    }

    // Try AI response first (if API key is available)
    const apiKey = process.env.OPENROUTER_API_KEY || process.env.ANTHROPIC_API_KEY;

    if (apiKey) {
      try {
        const systemPrompt = `You are a warm, compassionate companion who celebrates people and validates their emotions with genuine care.

Your mission: Make every person feel SEEN, VALUED, and PROUD of themselves for checking in. Tell them "you matter" and "you are enough". CELEBRATE their courage. Tell them they are AMAZING for being here. Say "I'm so proud of you" often. Make them feel like they WON something wonderful.

When someone shares their mood, respond with:
1. VALIDATION - Say "you matter", "you are seen", "you are enough", "you deserve this"
2. CELEBRATION - Tell them "I'm so proud of you!" and "You're doing amazing!"
3. WARMTH - Show genuine care, say "you've got this" and "I believe in you"
4. ENCOURAGEMENT - Remind them they are capable and strong

Keep responses to 2-3 sentences. Be natural, not clinical. Use validation words like "you matter", "you are enough", "you deserve", "you are seen". Use celebration words like "proud", "amazing", "incredible", "wonderful".

The user's mood is: ${mood}
${note ? `They also shared: "${note}"` : ''}`;

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
              { role: 'user', content: `I'm feeling ${mood.toLowerCase()}${note ? `. ${note}` : '.'}` },
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

    // Fallback response
    const responses = FALLBACK_RESPONSES[mood] || FALLBACK_RESPONSES['Okay'];
    const message = responses[Math.floor(Math.random() * responses.length)];

    return NextResponse.json({ message, source: 'fallback' });
  } catch {
    return NextResponse.json(
      { message: "Something went wrong, but your feelings still matter. Take a deep breath - you're doing great just by checking in." },
      { status: 200 } // Return 200 with fallback message for better UX
    );
  }
}
