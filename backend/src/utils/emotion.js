/* emotion.js — improved with more emotions, intensity scoring, and suggestions */

const EMOTION_RULES = [
  {
    emotion: 'anxiety',
    label: 'Anxiety',
    color: '#f472b6',
    terms: ['anxious','anxiety','panic','worried','worry','nervous','overthinking',
            'scared','afraid','stress','stressed','stressful','dread','uneasy',
            'restless','tension','tense','phobia','fear','fearful'],
    suggestion: 'A grounding exercise or slower breathing may help your body feel safer.',
    tips: ['Try box breathing: 4 counts in, hold 4, out 4, hold 4.',
           'Name 5 things you can see right now to anchor to the present.',
           'Your nervous system is trying to protect you — it\'s not broken.'],
  },
  {
    emotion: 'sadness',
    label: 'Sadness',
    color: '#818cf8',
    terms: ['sad','lonely','empty','hopeless','crying','grief','hurt','depressed',
            'heartbroken','down','miserable','unhappy','sorrow','melancholy',
            'tearful','loss','mourning','disconnected'],
    suggestion: 'Gentle connection and one caring routine can matter more than fixing everything.',
    tips: ['Let yourself feel it — sadness is a natural response, not a flaw.',
           'One small act of self-care (tea, a walk, music) can shift the mood.',
           'Reaching out to one person you trust can make a real difference.'],
  },
  {
    emotion: 'burnout',
    label: 'Burnout',
    color: '#fb923c',
    terms: ['burnout','burned out','exhausted','tired','drained','overwhelmed',
            'pressure','fatigue','depleted','no energy','running on empty',
            'overworked','stretched thin','can\'t cope','too much'],
    suggestion: 'Lower the load where possible and choose recovery before productivity.',
    tips: ['Even 10 minutes of genuine rest (no phone) matters.',
           'Identify one thing you can say no to this week.',
           'Sleep quality affects emotional resilience more than anything else.'],
  },
  {
    emotion: 'motivation',
    label: 'Low Motivation',
    color: '#fbbf24',
    terms: ['unmotivated','stuck','procrastinate','procrastinating','lazy',
            'cannot start','can\'t start','no motivation','not productive',
            'stuck in a rut','no drive','apathetic','passive'],
    suggestion: 'Make the next step tiny enough that starting feels almost easy.',
    tips: ['Start with just 2 minutes — momentum builds from action, not mood.',
           'Remove one friction point from your environment.',
           'Ask: what would make this feel 10% easier?'],
  },
  {
    emotion: 'anger',
    label: 'Anger',
    color: '#ef4444',
    terms: ['angry','mad','furious','rage','irritated','frustrated','annoyed',
            'resentment','bitter','hostile','snapping','temper','outraged',
            'fed up','livid','irate'],
    suggestion: 'Anger often signals a boundary was crossed — it\'s worth listening to.',
    tips: ['Give yourself 20 minutes before responding to what triggered you.',
           'Physical movement (walk, stretch) helps metabolise anger faster.',
           'Ask: what boundary or value is being violated here?'],
  },
  {
    emotion: 'loneliness',
    label: 'Loneliness',
    color: '#a78bfa',
    terms: ['lonely','alone','isolated','no one','nobody','disconnected',
            'unseen','invisible','left out','no friends','no support',
            'all alone','no one understands'],
    suggestion: 'Even brief moments of genuine connection can break the cycle of loneliness.',
    tips: ['One message to one person is a real step.',
           'Loneliness is a signal, not a permanent identity.',
           'Being in a crowd and being connected are very different things.'],
  },
  {
    emotion: 'overwhelm',
    label: 'Overwhelm',
    color: '#34d399',
    terms: ['overwhelmed','too much','can\'t handle','swamped','buried',
            'drowning','paralysed','paralyzed','don\'t know where to start',
            'everything at once','too many things'],
    suggestion: 'When everything feels urgent, nothing is. Pick one thing.',
    tips: ['Write everything down — it\'s smaller on paper than in your head.',
           'Choose the one thing that would make today feel okay if done.',
           'Overwhelm is not weakness — it\'s information overload.'],
  },
  {
    emotion: 'gratitude',
    label: 'Gratitude',
    color: '#10b981',
    terms: ['grateful','thankful','blessed','appreciative','happy','content',
            'peaceful','calm','good','great','excited','joyful','relieved',
            'proud','hopeful','inspired'],
    suggestion: 'Notice what\'s working — it strengthens your emotional baseline.',
    tips: ['Name 3 specific things that went well today.',
           'Gratitude isn\'t toxic positivity — it\'s pattern recognition.',
           'Sharing good news amplifies the positive effect.'],
  },
];

function countMatches(text, terms) {
  let count = 0;
  for (const term of terms) {
    const safe  = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${safe}\\b`, 'gi');
    const m     = text.match(regex);
    if (m) count += m.length;
  }
  return count;
}

export function detectEmotion(text = '') {
  const normalized = text.toLowerCase();
  let best = null, highest = 0;

  for (const rule of EMOTION_RULES) {
    const score = countMatches(normalized, rule.terms);
    if (score > highest) { highest = score; best = rule; }
  }

  if (!best || highest === 0) return null;

  return {
    emotion:    best.emotion,
    label:      best.label,
    color:      best.color,
    confidence: Math.min(highest / 3, 1),
    suggestion: best.suggestion,
    tips:       best.tips,
  };
}

export function detectMultipleEmotions(text = '') {
  const normalized = text.toLowerCase();
  const results = [];

  for (const rule of EMOTION_RULES) {
    const score = countMatches(normalized, rule.terms);
    if (score > 0) {
      results.push({
        emotion:    rule.emotion,
        label:      rule.label,
        color:      rule.color,
        confidence: Math.min(score / 3, 1),
        suggestion: rule.suggestion,
        tips:       rule.tips,
        score,
      });
    }
  }

  return results.sort((a, b) => b.score - a.score).slice(0, 3);
}