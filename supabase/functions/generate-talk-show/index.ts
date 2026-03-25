import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

interface Persona {
  name: string;
  personality_traits: { tone: string; style: string };
}

interface RequestBody {
  topic: string;
  tone: string;
  length: string;
  personas: Persona[];
}

function getLengthGuide(length: string): string {
  switch (length) {
    case 'short': return '4-6 dialogue exchanges, 1-2 highlights';
    case 'medium': return '8-12 dialogue exchanges, 3-4 highlights';
    case 'long': return '15-20 dialogue exchanges, 5-6 highlights';
    default: return '8-12 dialogue exchanges, 3-4 highlights';
  }
}

function buildPrompt(body: RequestBody): string {
  const personaDescriptions = body.personas
    .map(p => `- ${p.name}: Tone is ${p.personality_traits.tone}, style is ${p.personality_traits.style}`)
    .join('\n');

  return `You are a Vietnamese talk show script generator. Generate a structured AI talk show episode entirely in Vietnamese.

Topic: ${body.topic}
Tone: ${body.tone}
Length: ${getLengthGuide(body.length)}

Participating personas:
${personaDescriptions}

Each persona MUST stay in character throughout. The ${body.tone} tone must be maintained.

Generate the output as a valid JSON object with this exact structure (no markdown, no code fences, just raw JSON):
{
  "intro": "An engaging opening introduction in Vietnamese",
  "discussion": [
    { "speaker": "PersonaName", "text": "What they say in Vietnamese" }
  ],
  "highlights": [
    "Key interesting moment or quote in Vietnamese"
  ],
  "summary": "A closing summary in Vietnamese"
}

Rules:
- intro: 2-3 sentences introducing the topic and personas
- discussion: Back-and-forth dialogue between ALL personas, each staying in their defined character
- highlights: Notable quotes or moments from the discussion
- summary: 2-3 sentences concluding the episode
- ALL content MUST be written in Vietnamese language
- Make the conversation feel natural and entertaining`;
}

async function getGeminiApiKey(): Promise<string> {
  // Try env var first
  const envKey = Deno.env.get('GEMINI_API_KEY');
  if (envKey) return envKey;

  // Fallback: read from Supabase Vault
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const { data } = await supabase.rpc('vault_read_secret', { secret_name: 'GEMINI_API_KEY' });
    if (data) return data;
  } catch { /* ignore */ }

  throw new Error('GEMINI_API_KEY not found');
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    const apiKey = await getGeminiApiKey();
    const body: RequestBody = await req.json();

    if (!body.topic || !body.personas || body.personas.length === 0) {
      return new Response(
        JSON.stringify({ error: 'topic and personas are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const prompt = buildPrompt(body);

    const geminiResponse = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.9,
          topP: 0.95,
          maxOutputTokens: 8192,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text();
      throw new Error(`Gemini API error: ${geminiResponse.status} - ${errText}`);
    }

    const geminiData = await geminiResponse.json();
    const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      throw new Error('Empty response from Gemini');
    }

    const parsed = JSON.parse(rawText);

    if (!parsed.intro || !parsed.discussion || !parsed.highlights || !parsed.summary) {
      throw new Error('Invalid response structure from AI');
    }

    return new Response(JSON.stringify(parsed), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
});
