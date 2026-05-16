import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

const VALID_MODES = ['suggest', 'rewrite'] as const;
type Mode = (typeof VALID_MODES)[number];

const VALID_TONES = [
  'professional',
  'friendly',
  'short',
  'detailed',
  'urdu',
  'english',
  'roman_urdu',
] as const;
type Tone = (typeof VALID_TONES)[number];

const MAX_INPUT_LENGTH = 2000;
const TIMEOUT_MS = 15000;

const TONE_SYSTEM_PROMPTS: Record<Tone, string> = {
  professional:
    'You are a professional business communication assistant for WhatFlow CRM (a WhatsApp marketing tool). Generate polite, formal responses.',
  friendly:
    'You are a friendly customer support assistant for WhatFlow CRM. Generate warm, approachable responses.',
  short:
    'Generate very brief, concise replies (1-2 sentences max).',
  detailed:
    'Generate comprehensive, detailed responses with all relevant information.',
  urdu:
    'اردو میں جواب لکھیں۔ You are a business communication assistant. Reply in Urdu script.',
  english:
    'Generate the reply in English.',
  roman_urdu:
    'Roman Urdu mein reply likhein. You are a business assistant. Reply in Roman Urdu (Urdu written in English letters).',
};

function createSuggestPrompt(
  customerMessage: string,
  tone: Tone,
  context?: string
): string {
  const contextPart = context ? `\n\nBusiness context: ${context}` : '';
  return `A customer sent this message: "${customerMessage}"${contextPart}

Generate 3 different reply suggestions. Format each suggestion on a separate line prefixed with "SUGGESTION_1:", "SUGGESTION_2:", and "SUGGESTION_3:".

Example format:
SUGGESTION_1: First reply suggestion here.
SUGGESTION_2: Second reply suggestion here.
SUGGESTION_3: Third reply suggestion here.`;
}

function createRewritePrompt(message: string, tone: Tone): string {
  return `Rewrite the following message to improve it based on the desired tone. Output only the rewritten message, nothing else.

Original message: "${message}"

Provide exactly one improved version of this message.`;
}

function parseSuggestions(raw: string): string[] {
  const suggestions: string[] = [];

  for (let i = 1; i <= 3; i++) {
    const regex = new RegExp(`SUGGESTION_${i}:\\s*([\\s\\S]*?)(?=SUGGESTION_${i + 1}:|$)`, 'i');
    const match = raw.match(regex);
    if (match && match[1].trim()) {
      suggestions.push(match[1].trim());
    }
  }

  // Fallback: if structured parsing failed, split by newlines and clean up
  if (suggestions.length === 0) {
    const lines = raw
      .split('\n')
      .map((l) => l.replace(/^\d+[\.\)]\s*/, '').trim())
      .filter((l) => l.length > 10);
    return lines.slice(0, 3);
  }

  return suggestions;
}

async function callAIWithTimeout(
  messages: { role: string; content: string }[]
): Promise<string> {
  const zai = await ZAI.create();

  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('AI service timeout')), TIMEOUT_MS);
  });

  const completionPromise = zai.chat.completions.create({
    messages,
    thinking: { type: 'disabled' },
  });

  const completion = await Promise.race([completionPromise, timeoutPromise]);

  return completion.choices[0]?.message?.content || '';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mode, tone: rawTone } = body;

    // Validate mode
    if (!mode || !VALID_MODES.includes(mode)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid mode. Must be one of: ${VALID_MODES.join(', ')}`,
        },
        { status: 200 }
      );
    }

    // Validate tone
    const tone = rawTone as Tone;
    if (!tone || !VALID_TONES.includes(tone)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid tone. Must be one of: ${VALID_TONES.join(', ')}`,
        },
        { status: 200 }
      );
    }

    const systemPrompt = TONE_SYSTEM_PROMPTS[tone];

    if (mode === 'suggest') {
      const { customerMessage, context } = body;

      // Validate customerMessage
      if (!customerMessage || typeof customerMessage !== 'string' || !customerMessage.trim()) {
        return NextResponse.json(
          { success: false, error: 'customerMessage is required and must be non-empty' },
          { status: 200 }
        );
      }

      if (customerMessage.length > MAX_INPUT_LENGTH) {
        return NextResponse.json(
          { success: false, error: `customerMessage must not exceed ${MAX_INPUT_LENGTH} characters` },
          { status: 200 }
        );
      }

      // Validate optional context
      if (context && context.length > MAX_INPUT_LENGTH) {
        return NextResponse.json(
          { success: false, error: `context must not exceed ${MAX_INPUT_LENGTH} characters` },
          { status: 200 }
        );
      }

      const userPrompt = createSuggestPrompt(customerMessage, tone, context);
      const rawResponse = await callAIWithTimeout([
        { role: 'assistant', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ]);

      const suggestions = parseSuggestions(rawResponse);

      return NextResponse.json({
        success: true,
        suggestions,
        tone,
      });
    }

    if (mode === 'rewrite') {
      const { message } = body;

      // Validate message
      if (!message || typeof message !== 'string' || !message.trim()) {
        return NextResponse.json(
          { success: false, error: 'message is required and must be non-empty' },
          { status: 200 }
        );
      }

      if (message.length > MAX_INPUT_LENGTH) {
        return NextResponse.json(
          { success: false, error: `message must not exceed ${MAX_INPUT_LENGTH} characters` },
          { status: 200 }
        );
      }

      const userPrompt = createRewritePrompt(message, tone);
      const rewritten = await callAIWithTimeout([
        { role: 'assistant', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ]);

      return NextResponse.json({
        success: true,
        rewritten: rewritten.trim(),
        tone,
      });
    }
  } catch (error) {
    console.error('AI reply error:', error);
    return NextResponse.json(
      { success: false, error: 'AI service temporarily unavailable' },
      { status: 200 }
    );
  }

  // Fallback (should not be reached)
  return NextResponse.json(
    { success: false, error: 'Invalid request' },
    { status: 200 }
  );
}
