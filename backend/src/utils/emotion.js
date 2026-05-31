const EMOTION_RULES = [
  {
    emotion: "anxiety",
    label: "Anxiety",
    terms: [
      "anxious",
      "anxiety",
      "panic",
      "worried",
      "worry",
      "nervous",
      "overthinking",
      "scared",
      "afraid",
      "stress",
      "stressed",
      "stressful",
    ],
    suggestion:
      "A grounding exercise or slower breathing may help your body feel safer.",
  },

  {
    emotion: "sadness",
    label: "Sadness",
    terms: [
      "sad",
      "lonely",
      "empty",
      "hopeless",
      "crying",
      "grief",
      "hurt",
      "depressed",
      "heartbroken",
    ],
    suggestion:
      "Gentle connection and one caring routine can matter more than fixing everything.",
  },

  {
    emotion: "burnout",
    label: "Burnout",
    terms: [
      "burnout",
      "burned out",
      "exhausted",
      "tired",
      "drained",
      "overwhelmed",
      "pressure",
      "fatigue",
    ],
    suggestion:
      "Lower the load where possible and choose recovery before productivity.",
  },

  {
    emotion: "motivation",
    label: "Low Motivation",
    terms: [
      "unmotivated",
      "stuck",
      "procrastinate",
      "procrastinating",
      "lazy",
      "cannot start",
      "can't start",
      "no motivation",
    ],
    suggestion:
      "Make the next step tiny enough that starting feels almost easy.",
  },
];

function countMatches(text, terms) {
  let count = 0;

  for (const term of terms) {
    const regex = new RegExp(
      `\\b${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
      "gi"
    );

    const matches = text.match(regex);

    if (matches) {
      count += matches.length;
    }
  }

  return count;
}

export function detectEmotion(text = "") {
  const normalized = text.toLowerCase();

  let bestMatch = null;
  let highestScore = 0;

  for (const rule of EMOTION_RULES) {
    const score = countMatches(
      normalized,
      rule.terms
    );

    if (score > highestScore) {
      highestScore = score;
      bestMatch = rule;
    }
  }

  if (!bestMatch || highestScore === 0) {
    return null;
  }

  return {
    emotion: bestMatch.emotion,
    label: bestMatch.label,
    confidence: Math.min(
      highestScore / 3,
      1
    ),
    suggestion: bestMatch.suggestion,
  };
}