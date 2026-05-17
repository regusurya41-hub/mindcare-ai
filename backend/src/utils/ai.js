import OpenAI from 'openai';

let client;

const personalities = {
  friend: 'You sound like a warm, validating friend. Be gentle, concise, and practical.',
  guide: 'You sound like a calm mindfulness guide. Use grounding language and steady pacing.',
  coach: 'You sound like a compassionate motivational coach. Encourage agency without pressure.'
};

const languageNames = {
  'en-US': 'English',
  'hi-IN': 'Hindi',
  'te-IN': 'Telugu',
  'ta-IN': 'Tamil',
  'kn-IN': 'Kannada',
  'es-ES': 'Spanish'
};

const localizedFallbacks = {
  'hi-IN': {
    casual: 'नमस्ते। आपका दिन कैसा चल रहा है?',
    positive: 'यह सुनकर अच्छा लगा। आज क्या चीज बेहतर महसूस करा रही है?',
    support: 'मैं समझ रहा हूं। क्या आप एक छोटा grounding exercise साथ में करना चाहेंगे?',
    'deep-support': 'मुझे दुख है कि आप इतना भारी महसूस कर रहे हैं। आप अकेले नहीं हैं। किसी भरोसेमंद व्यक्ति से भी बात करें।',
    motivation: 'चलिए इसे छोटा बनाते हैं। अभी आपका सबसे छोटा अगला कदम क्या हो सकता है?',
    neutral: 'मैं सुन रहा हूं। थोड़ा और बताइए।'
  },
  'te-IN': {
    casual: 'నమస్తే. మీ రోజు ఎలా సాగుతోంది?',
    positive: 'అది వినడం ఆనందంగా ఉంది. ఈ రోజు ఏది కొంచెం బాగుంది?',
    support: 'మీకు కష్టం అనిపిస్తోంది. మనం చిన్న grounding exercise ప్రయత్నించాలా?',
    'deep-support': 'మీరు చాలా భారంగా అనుభవిస్తున్నందుకు బాధగా ఉంది. మీరు ఒంటరిగా లేరు. నమ్మకమైన వ్యక్తితో కూడా మాట్లాడండి.',
    motivation: 'దీనిని చిన్నదిగా చేద్దాం. ఇప్పుడు మీరు చేయగల చిన్న తదుపరి అడుగు ఏది?',
    neutral: 'నేను వింటున్నాను. ఇంకాస్త చెప్పండి.'
  },
  'ta-IN': {
    casual: 'வணக்கம். இன்று நாள் எப்படி செல்கிறது?',
    positive: 'அதை கேட்க மகிழ்ச்சி. இன்று எது சிறிது நன்றாக உணர வைத்தது?',
    support: 'இது கடினமாக இருக்கிறது போல. ஒரு சிறிய grounding exercise முயற்சிக்கலாமா?',
    'deep-support': 'நீங்கள் மிகவும் கனமாக உணர்கிறீர்கள் என்பதில் வருந்துகிறேன். நீங்கள் தனியாக இல்லை. நம்பகமான ஒருவரிடமும் பேசுங்கள்.',
    motivation: 'இதை சிறியதாக மாற்றலாம். இப்போது செய்யக்கூடிய அடுத்த சிறிய படி என்ன?',
    neutral: 'நான் கேட்கிறேன். இன்னும் கொஞ்சம் சொல்லுங்கள்.'
  },
  'kn-IN': {
    casual: 'ನಮಸ್ಕಾರ. ನಿಮ್ಮ ದಿನ ಹೇಗೆ ಸಾಗುತ್ತಿದೆ?',
    positive: 'ಅದು ಕೇಳಿ ಸಂತೋಷವಾಯಿತು. ಇಂದು ಯಾವುದು ಸ್ವಲ್ಪ ಚೆನ್ನಾಗಿ ಅನಿಸಿತು?',
    support: 'ಇದು ಕಷ್ಟಕರವಾಗಿ ಅನಿಸುತ್ತಿದೆ. ನಾವು ಚಿಕ್ಕ grounding exercise ಪ್ರಯತ್ನಿಸೋಣವೇ?',
    'deep-support': 'ನೀವು ತುಂಬಾ ಭಾರವಾಗಿರುವಂತೆ ಅನುಭವಿಸುತ್ತಿದ್ದೀರಿ ಎಂಬುದು ಕೇಳಿ ಬೇಸರವಾಗಿದೆ. ನೀವು ಒಬ್ಬರಲ್ಲ. ನಂಬಿಕೆಯ ವ್ಯಕ್ತಿಯೊಂದಿಗೆ ಮಾತನಾಡಿ.',
    motivation: 'ಇದನ್ನು ಚಿಕ್ಕದಾಗಿಸೋಣ. ಈಗ ಮಾಡಬಹುದಾದ ಅತಿ ಚಿಕ್ಕ ಮುಂದಿನ ಹೆಜ್ಜೆ ಯಾವುದು?',
    neutral: 'ನಾನು ಕೇಳುತ್ತಿದ್ದೇನೆ. ಸ್ವಲ್ಪ ಇನ್ನಷ್ಟು ಹೇಳಿ.'
  },
  'es-ES': {
    casual: 'Hola. ¿Cómo va tu día?',
    positive: 'Me alegra oír eso. ¿Qué hizo que hoy se sintiera mejor?',
    support: 'Siento que esto esté pesando. ¿Quieres probar un ejercicio breve de grounding juntos?',
    'deep-support': 'Siento mucho que te sientas así de cargado. No tienes que pasar por esto a solas; habla también con alguien de confianza.',
    motivation: 'Hagámoslo pequeño. ¿Cuál sería el siguiente paso más fácil ahora?',
    neutral: 'Estoy escuchando. Cuéntame un poco más.'
  }
};

const intentRules = [
  { intent: 'greeting', patterns: [/\b(hi|hello|hey|good morning|good evening)\b/i] },
  { intent: 'identity', patterns: [/\b(your name|who are you|what are you)\b/i] },
  { intent: 'positive', patterns: [/\b(i am good|i'm good|im good|feeling good|doing good|great|happy|better|fine|okay today)\b/i] },
  { intent: 'boredom', patterns: [/\b(bored|boring|nothing to do|entertain me)\b/i] },
  { intent: 'sadness', patterns: [/\b(sad|depressed|down|lonely|empty|crying|hurt)\b/i] },
  { intent: 'anxiety', patterns: [/\b(anxious|panic|worried|nervous|overthinking|scared|stress|stressed)\b/i] },
  { intent: 'anger', patterns: [/\b(angry|mad|furious|irritated|annoyed)\b/i] },
  { intent: 'motivation', patterns: [/\b(unmotivated|stuck|lazy|procrastinating|motivate|motivation)\b/i] },
  { intent: 'sleep', patterns: [/\b(sleep|insomnia|tired|exhausted|can't sleep|cannot sleep)\b/i] },
  { intent: 'gratitude', patterns: [/\b(thanks|thank you|appreciate|grateful)\b/i] },
  { intent: 'help', patterns: [/\b(help|what should i do|advice|support)\b/i] }
];

const toneByIntent = {
  greeting: 'casual',
  identity: 'casual',
  positive: 'positive',
  boredom: 'casual',
  gratitude: 'positive',
  sadness: 'support',
  anxiety: 'support',
  anger: 'support',
  sleep: 'support',
  motivation: 'motivation',
  help: 'neutral',
  fallback: 'neutral'
};

const deepSupportPatterns = [
  /\b(depressed|hopeless|empty|can't do this|cannot do this|breaking down|panic attack|overwhelmed|worthless)\b/i,
  /\b(really anxious|very anxious|so anxious|really sad|very sad|so sad)\b/i
];

const responseBank = {
  greeting: {
    friend: [
      "Hey. How's your day going?",
      'Hi. Good to see you here. What are you up to today?'
    ],
    guide: [
      'Hello. I am here. Want to chat lightly or check in with how you feel?',
      'Hi there. What would feel useful right now?'
    ],
    coach: [
      "Hey. Let's make today a little easier. What's going on?",
      'Hi. Want a quick boost, a plan, or just a friendly chat?'
    ]
  },
  positive: {
    friend: [
      "That's nice to hear. What made today feel better?",
      'I love that. What is one good thing you want to remember from today?'
    ],
    guide: [
      'That sounds peaceful. Stay with that feeling for a second. What helped create it?',
      'Good to hear. What would help you carry that steadiness into the rest of the day?'
    ],
    coach: [
      'Great. Let us build on it. What is one small win you can stack next?',
      'That is a solid sign. What helped, and how can you repeat a tiny piece of it?'
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
      'I am here with you. Tell me a little more.',
      'Got it. Do you want to talk casually, reflect, or get a small suggestion?'
    ],
    guide: [
      'I am listening. What part should we focus on first?',
      'We can keep this simple. What feels most relevant right now?'
    ],
    coach: [
      'We can work with that. What would be a useful next step?',
      'Makes sense. Want a quick idea or do you want to talk it through first?'
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

export function classifyMessageTone(message = '') {
  const intent = detectIntent(message);
  const isDeepSupport = deepSupportPatterns.some((pattern) => pattern.test(message));
  return {
    intent,
    mode: isDeepSupport ? 'deep-support' : toneByIntent[intent] || 'neutral'
  };
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

function localSupportiveReply({ message, personality, history, language }) {
  const { intent, mode } = classifyMessageTone(message);
  const localized = localizedFallbacks[language]?.[mode] || localizedFallbacks[language]?.neutral;
  if (localized) return localized;
  const reply = chooseResponse(intent, personality, history);
  return ['casual', 'positive'].includes(mode) ? reply : `${reply}${contextBridge(history)}`;
}

function formatMemory(memory) {
  if (!memory) return 'No saved memory yet.';
  const goals = memory.goals?.length ? `Goals: ${memory.goals.join('; ')}.` : '';
  const routines = memory.routines?.length ? `Routines: ${memory.routines.join('; ')}.` : '';
  const patterns = memory.patterns?.length ? `Patterns: ${memory.patterns.join('; ')}.` : '';
  return [goals, routines, patterns].filter(Boolean).join(' ') || 'No saved memory yet.';
}

export async function generateSupportiveReply({ message, personality = 'friend', history = [], language = 'en-US', memory = null }) {
  const tone = classifyMessageTone(message);
  const openai = getClient();
  if (!openai) {
    return {
      reply: localSupportiveReply({ message, personality, history, language }),
      provider: 'local',
      mode: tone.mode
    };
  }

  const system = [
    'You are MindCare AI, a supportive emotional wellness assistant.',
    'Use emotional balance logic: casual messages get casual friendly replies; positive messages get warm encouragement; emotional distress gets supportive grounding; deep distress gets extra gentleness and recommends trusted human support when appropriate.',
    'Do not turn every message into therapy. Feel human first and therapeutic second.',
    `Current tone mode: ${tone.mode}. Current detected intent: ${tone.intent}.`,
    `Reply in ${languageNames[language] || 'the same language the user is using'}.`,
    `User memory, if useful and relevant: ${formatMemory(memory)}`,
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
      reply: completion.choices[0]?.message?.content?.trim() || localSupportiveReply({ message, personality, history, language }),
      provider: 'openai',
      mode: tone.mode
    };
  } catch (error) {
    console.error('OpenAI reply failed:', error.message);
    return {
      reply: localSupportiveReply({ message, personality, history, language }),
      provider: 'local',
      mode: tone.mode
    };
  }
}
