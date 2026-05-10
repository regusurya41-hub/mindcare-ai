import OpenAI from 'openai';

const client = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

const personalities = {
  friend: 'You sound like a warm, validating friend. Be gentle, concise, and practical.',
  guide: 'You sound like a calm mindfulness guide. Use grounding language and steady pacing.',
  coach: 'You sound like a compassionate motivational coach. Encourage agency without pressure.'
};

export async function generateSupportiveReply({ message, personality = 'friend', history = [] }) {
  if (!client) {
    return "I'm here with you. Try naming one feeling and one small thing your body needs right now, like water, breathing room, or a short walk. What feels most doable?";
  }

  const system = [
    'You are MindCare AI, a supportive emotional wellness assistant.',
    'You are not a doctor or therapist and must not diagnose, prescribe, or give medical advice.',
    'Encourage healthy coping, reflection, and reaching trusted people or professionals when needed.',
    'If crisis or imminent harm appears, encourage emergency services and crisis support.',
    personalities[personality] || personalities.friend
  ].join(' ');

  const messages = [
    { role: 'system', content: system },
    ...history.slice(-8).map((item) => ({ role: item.role, content: item.content })),
    { role: 'user', content: message }
  ];

  const completion = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    messages,
    temperature: 0.7,
    max_tokens: 350
  });

  return completion.choices[0]?.message?.content?.trim() || 'I hear you. Could you tell me a little more about what feels heaviest right now?';
}
