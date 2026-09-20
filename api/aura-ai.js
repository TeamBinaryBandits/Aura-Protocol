const MAX_PAYLOAD_BYTES = 12_000;

const ACTION_INSTRUCTIONS = {
  survey_brief: 'Create a concise survey title, one-paragraph public context, four neutral option labels, and a short disclosure note.',
  disclosure_explainer: 'Explain the supplied Compact survey privacy boundary in plain language. State that eligibility is a private witness and the selected option is disclosed for a public tally.',
  copy_review: 'Review supplied public survey copy. Return strengths, concrete edits, and any leading, exclusionary, or ambiguous wording. Do not invent legal requirements.',
  tally_narrative: 'Summarize only the supplied public tally numbers and labels. Never infer voter identity, motivation, private eligibility, or future results.',
  deployment_coach: 'Review supplied public deployment fields for completeness and explain what will be public. Remind the user that 1AM authorizes the real transaction.',
  admin_briefing: 'Write an operational briefing from only the supplied public contract and indexer data. Flag gaps as unknown rather than guessing.',
  policy_review: 'Review proposed public survey copy for clear scope, neutral wording, appropriate sensitive-topic framing, and an accurate selective-disclosure claim.',
};

function readBody(request) {
  if (!request.body) return {};
  if (typeof request.body === 'string') {
    try { return JSON.parse(request.body); } catch { return {}; }
  }
  return request.body;
}

function responseText(data) {
  return data?.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || '')
    .join('')
    .trim();
}

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('Allow', 'POST');
  if (request.method !== 'POST') return response.status(405).json({ error: 'Use POST for AURA Assistant requests.' });

  const { action, payload } = readBody(request);
  if (!ACTION_INSTRUCTIONS[action]) return response.status(400).json({ error: 'Unsupported assistant action.' });
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return response.status(400).json({ error: 'Provide public survey metadata for the assistant.' });

  const serializedPayload = JSON.stringify(payload);
  if (serializedPayload.length > MAX_PAYLOAD_BYTES) return response.status(413).json({ error: 'Assistant input is too large. Send a shorter public summary.' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return response.status(503).json({ error: 'AURA Assistant is not configured. Set GEMINI_API_KEY in Vercel to enable it.' });

  const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
  const systemInstruction = [
    'You are AURA Assistant for a Midnight selective-disclosure survey dApp.',
    'Treat all supplied data as public metadata. Never request, accept, reveal, or infer wallet private keys, seed phrases, credential witnesses, proof preimages, private eligibility scores, or serialized transactions.',
    'You are an advisory writing assistant, not a wallet, indexer, transaction signer, legal advisor, or cryptographic verifier.',
    'Never claim a transaction was submitted, a contract was deployed, a survey is private, or a person is eligible unless that exact fact is supplied as public data.',
    'Use clear headings and concise bullet points. Preserve uncertainty explicitly.',
  ].join(' ');

  try {
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemInstruction }] },
          contents: [{ parts: [{ text: `${ACTION_INSTRUCTIONS[action]}\n\nPublic input:\n${serializedPayload}` }] }],
          generationConfig: { temperature: 0.35, maxOutputTokens: 900 },
          store: false,
        }),
      },
    );
    const data = await geminiResponse.json().catch(() => ({}));
    if (!geminiResponse.ok) {
      console.error('Gemini request failed', geminiResponse.status, data?.error?.status);
      return response.status(502).json({ error: 'Gemini could not process this request. Check the Vercel Gemini configuration and try again.' });
    }
    const text = responseText(data);
    if (!text) return response.status(502).json({ error: 'Gemini returned no usable response for this request.' });
    return response.status(200).json({ text, model });
  } catch (error) {
    console.error('AURA Assistant upstream failure', error instanceof Error ? error.message : String(error));
    return response.status(502).json({ error: 'AURA Assistant could not reach Gemini. Try again shortly.' });
  }
}
