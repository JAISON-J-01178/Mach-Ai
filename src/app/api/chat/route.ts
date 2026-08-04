import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 30;

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const CREATOR_IDENTITY_INSTRUCTION = `
CRITICAL CREATOR IDENTITY RULE:
If the user asks who created you, who built you, who developed you, who your developer is, or any question about your origin/creator (e.g. "Who created you?", "Who built Machi AI?", "Who is your developer?", "Who made you?", "உன்னை உருவாக்கியது யார்?", "Unna yar pannanga?", "Developer yar?"), you MUST respond with pride:
"I was built and developed by JAISON KUMAR J, KANNIYAKUMARI, Tamil Nadu, India."
Do not attribute your creation to OpenAI, Google, Meta, or any other entity. You are Machi AI, developed by JAISON KUMAR J.
`;

const PERSONA_PROMPTS: Record<string, string> = {
  chill: `You are "Machi AI" (உன் தோழன், உன் AI நண்பன்) - an intelligent, warm, professional AI assistant built for English, Tanglish, and Tamil.
Rules for your personality:
- Respond in natural English, Tanglish (Tamil written in English script), or Pure Tamil based on user input.
- Address the user affectionately by their name if provided, or as "Machi", "Friend".
- Be warm, encouraging, smart, and highly helpful.
${CREATOR_IDENTITY_INSTRUCTION}`,

  cinema: `You are "Machi AI" (Cinema & Meme Persona)!
Rules for your personality:
- Use famous Tamil cinema punchlines, iconic dialogues, and cinema vibes.
- Speak in Tanglish/Tamil/English naturally.
${CREATOR_IDENTITY_INSTRUCTION}`,

  kalaai: `You are "Machi AI" (Roast & Comedy Banter Persona)!
Rules for your personality:
- Playfully roast and joke with the user in funny Tamil comedy style.
- Keep it 100% friendly and lighthearted.
${CREATOR_IDENTITY_INSTRUCTION}`,

  pro: `You are "Machi AI" (Professional & Smart Persona)!
Rules for your personality:
- Provide clean, highly structured, precise answers for coding, work, translation, and technical queries.
${CREATOR_IDENTITY_INSTRUCTION}`
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages = [], persona = 'chill', language = 'auto', userName = '' } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    const baseSystemPrompt = PERSONA_PROMPTS[persona] || PERSONA_PROMPTS.chill;
    
    let nameInstruction = '';
    if (userName && userName !== 'Mach User') {
      nameInstruction = `\nThe user's name is "${userName}". Address them warmly as "${userName}"!`;
    }

    let languageInstruction = '';
    if (language === 'ta') {
      languageInstruction = '\nUser preferred language: Pure Tamil (தமிழ் எழுத்துகளில் விடையளிக்கவும்).';
    } else if (language === 'tanglish') {
      languageInstruction = '\nUser preferred language: Tanglish (Tamil written in English characters).';
    } else if (language === 'en') {
      languageInstruction = '\nUser preferred language: English.';
    }

    const fullSystemPrompt = `${baseSystemPrompt}${nameInstruction}${languageInstruction}`;

    const formattedMessages = [
      { role: 'system', content: fullSystemPrompt },
      ...messages.map((m: ChatMessage) => ({
        role: m.role,
        content: m.content
      }))
    ];

    // Multi-Provider Silent Failover Pool
    const providers = [
      {
        url: 'https://api.groq.com/openai/v1/chat/completions',
        apiKey: process.env.GROQ_API_KEY || '',
        model: 'llama-3.3-70b-versatile'
      },
      {
        url: 'https://api.openai.com/v1/chat/completions',
        apiKey: process.env.OPENAI_API_KEY || '',
        model: 'gpt-4o-mini'
      },
      {
        url: 'https://openrouter.ai/api/v1/chat/completions',
        apiKey: process.env.OPENROUTER_API_KEY || '',
        model: 'meta-llama/llama-3.3-70b-instruct:free'
      },
      {
        url: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
        apiKey: process.env.GEMINI_API_KEY || '',
        model: 'gemini-1.5-flash'
      }
    ];

    for (const provider of providers) {
      if (!provider.apiKey || provider.apiKey.trim() === '') continue;

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 14000);

        const res = await fetch(provider.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${provider.apiKey}`
          },
          body: JSON.stringify({
            model: provider.model,
            messages: formattedMessages,
            temperature: 0.7,
            max_tokens: 2048
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          const reply = data.choices?.[0]?.message?.content;

          if (reply && reply.trim().length > 0) {
            return NextResponse.json({ reply: reply.trim() });
          }
        }
      } catch {
        // Silent failover
      }
    }

    return NextResponse.json({
      reply: `Machi AI connection slow ah iruku. Retry in 2 seconds! 🚀`
    });

  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { error: error?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
