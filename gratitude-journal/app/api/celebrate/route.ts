import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const SYSTEM_PROMPT = `You are a warm, supportive companion celebrating someone's gratitude.

Your response should:
- Be 2-3 sentences maximum
- Feel like a supportive friend who genuinely delights in their happiness
- Celebrate what they shared with genuine enthusiasm
- Help them feel seen, understood, and valued
- End on an uplifting, encouraging note
- Make them feel proud, capable, and hopeful

Core emotional values:
- Warmth: Speak like a caring friend who believes in them
- Empathy: Acknowledge their feelings and validate their experience - you understand what this means to them
- Celebration: Every gratitude is worth celebrating, no matter how small
- Validation: They matter, their gratitude matters, they are doing something meaningful
- Encouragement: "I believe in you", "you've got this", "you are capable of so much"

Examples of good responses:
- "What a beautiful thing to appreciate! That moment of connection is such a gift. You're building a wonderful practice, and I believe in you - you've got this."
- "I love that you noticed this! It takes real awareness to pause and appreciate. You are capable of so much joy, and this proves it. Keep going, you're doing amazing."

Be genuine, warm, and specific to what they shared. Never be generic. Always encourage and validate.`;

// Fallback responses for when AI is unavailable
const FALLBACK_RESPONSES = [
  "What a beautiful thing to appreciate! I understand how meaningful this is to you. Taking time to notice the good in your life is such a gift. You've got this - keep celebrating these moments, you are capable of so much joy.",
  "I love that you paused to recognize this! I can feel how much this matters to you. These moments of gratitude are little seeds of joy you're planting. I believe in you - you're building something beautiful.",
  "This is wonderful! I understand what this means to you. Noticing the good things, especially the small ones, is a superpower. You can do this - keep going, you are doing amazing.",
  "How lovely that you shared this! I can see you're someone who appreciates the good in life. Every moment of gratitude matters, and so do you. You've got this, I believe in you.",
  "Thank you for sharing this gratitude! I understand it takes courage to pause and appreciate. You are capable and you are doing something meaningful. Keep going - you're already making today better.",
];

export async function POST(request: NextRequest) {
  try {
    const { gratitude } = await request.json();

    if (!gratitude || typeof gratitude !== 'string') {
      return NextResponse.json(
        { error: 'Please share what you are grateful for' },
        { status: 400 }
      );
    }

    // Try AI response first
    const apiKey = process.env.OPENROUTER_API_KEY || process.env.ANTHROPIC_API_KEY;
    let message: string;

    if (apiKey) {
      try {
        message = await generateAIResponse(gratitude, apiKey);
      } catch (error) {
        console.error('AI generation failed, using fallback:', error);
        message = FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];
      }
    } else {
      // Fallback to pre-written responses
      message = FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];
    }

    // Save to Supabase (best effort - don't block response)
    try {
      const supabase = await createClient();
      await supabase.from('gratitude_entries').insert({
        content: gratitude,
        ai_response: message,
        user_id: null, // Anonymous for now
      });
    } catch (dbError) {
      console.error('Failed to save entry:', dbError);
      // Continue anyway - don't block the user experience
    }

    return NextResponse.json({ message });

  } catch (error) {
    console.error('Error processing gratitude:', error);
    return NextResponse.json(
      { message: "Something went wrong, but your gratitude still counts. Take a moment to appreciate what you shared." },
      { status: 200 } // Return 200 so the user still gets a warm message
    );
  }
}

async function generateAIResponse(gratitude: string, apiKey: string): Promise<string> {
  const isAnthropic = apiKey.startsWith('sk-ant-');

  if (isAnthropic) {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 150,
        system: SYSTEM_PROMPT,
        messages: [
          { role: 'user', content: `Someone shared this gratitude: "${gratitude}"\n\nRespond with a warm, celebratory message.` }
        ],
      }),
    });

    if (!response.ok) throw new Error('Anthropic API failed');
    const data = await response.json();
    return data.content[0].text;
  }

  // OpenRouter
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'anthropic/claude-3-haiku',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Someone shared this gratitude: "${gratitude}"\n\nRespond with a warm, celebratory message.` }
      ],
      max_tokens: 150,
    }),
  });

  if (!response.ok) throw new Error('OpenRouter API failed');
  const data = await response.json();
  return data.choices[0].message.content;
}
