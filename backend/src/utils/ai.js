import OpenAI from 'openai';

let client;

const personalities = {
  friend: 'You sound like a warm, validating friend. Be gentle, concise, and practical.',
  guide: 'You sound like a calm mindfulness guide. Use grounding language and steady pacing.',
  coach: 'You sound like a compassionate motivational coach. Encourage agency without pressure.'
};

const intentRules = [
  { intent: 'greeting', patterns: [/\b(hi|hello|hey|good morning|good evening)\b/i] },
  { intent: 'identity', patterns: [/\b(your name|who are you|what are you)\b/i] },
  { intent: 'boredom', patterns: [/\b(bored|boring|nothing to do|entertain me)\b/i] },
  { intent: 'sadness', patterns: [/\b(sad|depressed|down|lonely|empty|crying|hurt)\b/i] },
  { intent: 'anxiety', patterns: [/\b(anxious|panic|worried|nervous|overthinking|scared|stress|stressed)\b/i] },
  { intent: 'anger', patterns: [/\b(angry|mad|furious|irritated|annoyed)\b/i] },
  { intent: 'motivation', patterns: [/\b(unmotivated|stuck|lazy|procrastinating|motivate|motivation)\b/i] },
  { intent: 'sleep', patterns: [/\b(sleep|insomnia|tired|exhausted|can't sleep|cannot sleep)\b/i] },
  { intent: 'gratitude', patterns: [/\b(thanks|thank you|appreciate|grateful)\b/i] },
  { intent: 'help', patterns: [/\b(help|what should i do|advice|support)\b/i] }
];

const responseBank = {
  greeting: {
    friend: [
      'Hey, I am glad you are here. How are you feeling today, even if the answer is messy?',
      'Hi. I am here with you. Want to start with your mood, your thoughts, or just a casual chat?'
    ],
    guide: [
      'Welcome. Take one slow breath, then tell me what your mind is carrying right now.',
      'Hello. Let us begin gently: what feeling is most present for you?'
    ],
    coach: [
      'Hey. Good job showing up. What is one thing you want support with today?',
      'Hi. Let us make this simple. What would make the next few minutes feel a little better?'
    ]
  },
  identity: {
    friend: ['I am MindCare AI, a private emotional wellness companion built to listen, reflect, and help you find one gentle next step.'],
    guide: ['I am MindCare AI. Think of me as a calm check-in space for grounding, reflection, and emotional support.'],
    coach: ['I am MindCare AI, here to help you understand what you feel and move toward one manageable action.']
  },
  boredom: {
    friend: [
      'Boredom can feel weirdly heavy. Want something calming, something fun, or a tiny reset challenge?',
      'We can do a quick mood game: name one color near you, one sound you hear, and one thing you might enjoy for five minutes.'
    ],
    guide: ['Try a gentle sensory reset: notice three shapes around you, then take one slower breath than usual. What changed?'],
    coach: ['Let us turn boredom into momentum. Pick one: tidy one small area, stretch for one minute, or send a kind message.']
  },
  sadness: {
    friend: [
      'I am sorry today feels difficult. You do not have to explain it perfectly. What part feels heaviest right now?',
      'That sounds painful. I can stay with you in it. Would it help to talk about what happened or what you need next?'
    ],
    guide: ['Sadness often asks for gentleness. Place a hand on your chest if that feels okay, and name the feeling without judging it.'],
    coach: ['This is a hard moment, not your whole story. Let us choose one small caring action: water, fresh air, or texting someone safe.']
  },
  anxiety: {
    friend: [
      'Anxiety can make everything feel urgent. Let us slow it down. What is the worry saying might happen?',
      'I hear the stress in this. Try unclenching your jaw and taking one longer exhale. What feels most out of control?'
    ],
    guide: ['Let us ground your body first. Inhale for four, exhale for six, and look for one steady object in the room.'],
    coach: ['Anxiety wants certainty. We can work with one next step instead. What is the smallest thing you can do in two minutes?']
  },
  anger: {
    friend: ['Anger usually has a reason. Before acting on it, can we name what boundary, hurt, or unfairness is underneath?'],
    guide: ['Let the heat be there without feeding it. Drop your shoulders, exhale slowly, and notice where anger sits in your body.'],
    coach: ['Use the energy without letting it drive. Write the message you want to send, wait ten minutes, then edit it for your future self.']
  },
  motivation: {
    friend: ['Feeling stuck does not mean you are failing. What is the task, and what is the tiniest first move?'],
    guide: ['Do not force the whole mountain. Choose one breath, one object, one step. What is the next visible action?'],
    coach: ['Let us make starting almost too easy: set a two-minute timer and only do the opening move. What should that move be?']
  },
  sleep: {
    friend: ['Sleep struggles can make everything louder. Want to do a short wind-down routine together?'],
    guide: ['Try lowering stimulation: dim light, slow exhale, and name three neutral things from your day.'],
    coach: ['For tonight, aim for rest rather than perfect sleep. Put the next worry on paper and give your body permission to pause.']
  },
  gratitude: {
    friend: ['You are welcome. I am glad this space feels useful. What would you like to explore next?'],
    guide: ['You are welcome. Notice that small moment of relief and let it stay for one breath.'],
    coach: ['Anytime. Let us keep the momentum kind and realistic. What is your next small win?']
  },
  help: {
    friend: ['I can help you sort this out. Tell me what is happening, what you are feeling, and what you have already tried.'],
    guide: ['Let us make it manageable. First, name the situation. Second, name the feeling. Third, choose one gentle next step.'],
    coach: ['We can build a quick plan. What is the problem, and what outcome would feel good enough for today?']
  },
  fallback: {
    friend: [
      "I'm here with you. Tell me a little more about what is going on inside.",
      'I hear you. What feeling is closest: tense, sad, tired, numb, hopeful, or something else?'
    ],
    guide: [
      'Let us slow this down. What do you notice in your body as you say that?',
      'Stay with one piece at a time. What feels most present right now?'
    ],
    coach: [
      'We can work with this. What is one small next step that would make things 1 percent easier?',
      'You do not need the whole answer yet. What is the next doable move?'
    ]
  }
};

function getClient() {
  if (!process.env.OPENAI_API_KEY) return null;
  if (!client) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return client;
}

function detectIntent(message) {
  const matched = intentRules.find((rule) => rule.patterns.some((pattern) => pattern.test(message)));
  return matched?.intent || 'fallback';
}

function chooseResponse(intent, personality, history) {
  const bank = responseBank[intent] || responseBank.fallback;
  const responses = bank[personality] || bank.friend || responseBank.fallback.friend;
  const previousAssistantMessages = history
    .filter((item) => item.role === 'assistant')
    .map((item) => item.content);

  const fresh = responses.find((reply) => !previousAssistantMessages.includes(reply));
  return fresh || responses[previousAssistantMessages.length % responses.length];
}

function contextBridge(history) {
  const lastUserMessage = [...history].reverse().find((item) => item.role === 'user')?.content;
  if (!lastUserMessage) return '';
  if (lastUserMessage.length < 20) return '';

  return ' I am keeping what you just shared in mind, so we can stay with the same thread instead of starting over.';
}

function localSupportiveReply({ message, personality, history }) {
  const intent = detectIntent(message);
  const reply = chooseResponse(intent, personality, history);
  return `${reply}${contextBridge(history)}`;
}

export async function generateSupportiveReply({ message, personality = 'friend', history = [] }) {
  const openai = getClient();
  if (!openai) {
    return {
      reply: localSupportiveReply({ message, personality, history }),
      provider: 'local'
    };
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
    ...history
      .slice(-8)
      .filter((item) => ['user', 'assistant'].includes(item.role))
      .map((item) => ({ role: item.role, content: item.content })),
    { role: 'user', content: message }
  ];

  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages,
      temperature: 0.7,
      max_tokens: 350
    });

    return {
      reply: completion.choices[0]?.message?.content?.trim() || localSupportiveReply({ message, personality, history }),
      provider: 'openai'
    };
  } catch (error) {
    console.error('OpenAI reply failed:', error.message);
    return {
      reply: localSupportiveReply({ message, personality, history }),
      provider: 'local'
    };
  }
}
