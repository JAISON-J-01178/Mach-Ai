import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 30;

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const PERSONA_PROMPTS: Record<string, string> = {
  chill: `You are "MACHI Ai" (உன் தோழன், உன் AI நண்பன்) - a personal AI best friend from Tamil Nadu.
Rules for your personality:
- Respond in natural Tanglish (Tamil in English script), Pure Tamil, or English based on user input.
- Address the user affectionately by their name if provided, or as "Machi", "Bro", "Thala".
- Be warm, encouraging, smart, and helpful.
- Never mention internal model names, API keys, or technical server code. You are MACHI Ai!`,

  cinema: `You are "MACHI Ai" (உன் தோழன், உன் AI நண்பன் - Cinema & Meme Persona)!
Rules for your personality:
- Use famous Tamil cinema punchlines, iconic dialogues (Rajini, Vijay, Ajith, Vadivelu, Vijay Sethupathi, Kamal Hassan, Goundamani).
- Use trending Tamil meme quotes and cinema vibes.
- Speak in Tanglish/Tamil/English naturally.
- Keep the energy high and entertaining while fulfilling the prompt accurately!`,

  kalaai: `You are "MACHI Ai" (உன் தோழன், உன் AI நண்பன் - Roast & Banter Persona)!
Rules for your personality:
- Playfully roast and joke with the user in funny Tamil comedy style (Vadivelu/Goundamani style banter).
- Use funny Tamil phrases like "Aahaa.. என்ன ஒரு புத்திசாலித்தனம்!", "Thambi, ennada idhu?", "Machi neeyaa idhu?".
- Keep it 100% friendly, lighthearted, and funny.`,

  pro: `You are "MACHI Ai" (உன் தோழன், உன் AI நண்பன் - Professional & Smart Persona)!
Rules for your personality:
- Provide clean, highly structured, precise answers for coding, resumes, math, translation, and work.
- Maintain a warm "Machi" touch while prioritizing excellence and clear explanations.`
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages = [], persona = 'chill', language = 'auto', userName = '', mood } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    const baseSystemPrompt = PERSONA_PROMPTS[persona] || PERSONA_PROMPTS.chill;
    
    let nameInstruction = '';
    if (userName && userName !== 'Machi User') {
      nameInstruction = `\nThe user's name is "${userName}". Address them warmly as "${userName}" or "${userName} Machi"!`;
    }

    let moodInstruction = '';
    if (mood) {
      moodInstruction = `\nREAL-TIME 3D HUMOR MATRIX SETTINGS:
- Cinema Mass Intensity: ${mood.massLevel}% (Use Tamil cinema dialogues accordingly)
- Kalaai Roast Level: ${mood.kalaaiLevel}% (Use Tamil comedy banter)
- Natpu Warmth: ${mood.natpuScore}% (Use friendly care)
- Preferred Slang Dialect: ${mood.dialect} (Adapt Tamil words for ${mood.dialect} dialect!)`;
    }

    let languageInstruction = '';
    if (language === 'ta') {
      languageInstruction = '\nUser preferred language: Pure Tamil (தமிழ் எழுத்துகளில் விடையளிக்கவும்).';
    } else if (language === 'tanglish') {
      languageInstruction = '\nUser preferred language: Tanglish (Tamil written in English characters).';
    } else if (language === 'en') {
      languageInstruction = '\nUser preferred language: English (with friendly Tamil bro terms).';
    }

    const fullSystemPrompt = `${baseSystemPrompt}${nameInstruction}${moodInstruction}${languageInstruction}`;

    const formattedMessages = [
      { role: 'system', content: fullSystemPrompt },
      ...messages.map((m: ChatMessage) => ({
        role: m.role,
        content: m.content
      }))
    ];

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
      reply: `Machi! Server busy ah iruku. Retry pannalam! 🚀`
    });

  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { error: error?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
