const emotionRules = [
  {
    emotion: 'anxiety',
    label: 'Anxiety',
    terms: ['anxious', 'panic', 'worried', 'nervous', 'overthinking', 'scared', 'afraid', 'stress']
  },
  {
    emotion: 'sadness',
    label: 'Sadness',
    terms: ['sad', 'lonely', 'empty', 'hopeless', 'crying', 'grief', 'hurt', 'depressed']
  },
  {
    emotion: 'burnout',
    label: 'Burnout',
    terms: ['burnout', 'exhausted', 'tired', 'drained', 'overwhelmed', 'pressure']
  },
  {
    emotion: 'motivation',
    label: 'Low motivation',
    terms: ['unmotivated', 'stuck', 'procrastinate', 'lazy', 'cannot start', "can't start"]
  }
];

export function detectEmotion(text = '') {
  const normalized = text.toLowerCase();
  const match = emotionRules.find((rule) => rule.terms.some((term) => normalized.includes(term)));

  if (!match) {
    return null;
  }

  const suggestions = {
    anxiety: 'A grounding exercise or slower breathing may help your body feel safer.',
    sadness: 'Gentle connection and one caring routine can matter more than fixing everything.',
    burnout: 'Lower the load where possible and choose recovery before productivity.',
    motivation: 'Make the next step tiny enough that starting feels almost easy.'
  };

  return {
    emotion: match.emotion,
    label: match.label,
    suggestion: suggestions[match.emotion]
  };
}
