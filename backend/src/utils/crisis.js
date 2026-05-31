const CRISIS_PATTERNS = [
  {
    severity: "critical",
    patterns: [
      /\b(suicide|suicidal)\b/i,
      /\b(kill myself)\b/i,
      /\b(end my life)\b/i,
      /\b(take my life)\b/i,
      /\b(i want to die)\b/i,
      /\b(i am going to kill myself)\b/i,
      /\b(i plan to kill myself)\b/i
    ]
  },

  {
    severity: "high",
    patterns: [
      /\b(self[- ]?harm)\b/i,
      /\b(hurt myself)\b/i,
      /\b(cut myself)\b/i,
      /\b(overdose)\b/i,
      /\b(jump off)\b/i,
      /\b(hang myself)\b/i
    ]
  },

  {
    severity: "medium",
    patterns: [
      /\b(can'?t go on)\b/i,
      /\b(no reason to live)\b/i,
      /\b(want to disappear forever)\b/i,
      /\b(life is not worth living)\b/i,
      /\b(everyone would be better without me)\b/i
    ]
  }
];

export function detectCrisis(text = "") {
  const normalized = text.trim();

  let severity = null;
  let matches = 0;

  for (const group of CRISIS_PATTERNS) {
    const count = group.patterns.filter((pattern) =>
      pattern.test(normalized)
    ).length;

    if (count > 0) {
      matches += count;

      if (
        !severity ||
        group.severity === "critical"
      ) {
        severity = group.severity;
      }
    }
  }

  return {
    isCrisis: matches > 0,
    severity,
    confidence: Math.min(matches / 3, 1),
  };
}

export const crisisResponse = {
  isCrisis: true,

  reply:
    "I'm concerned by what you've shared. If you're in immediate danger or feel at risk of acting on these thoughts, contact emergency services right now or go to the nearest emergency department. If possible, reach out to someone you trust and avoid being alone until support is available.",

  resources: [
    {
      label: "United States & Canada",
      value:
        "Call or text 988 (Suicide & Crisis Lifeline)",
    },

    {
      label: "India",
      value:
        "Call 112 for emergencies or contact a local mental health crisis service",
    },

    {
      label: "United Kingdom & ROI",
      value:
        "Samaritans: 116 123",
    },

    {
      label: "Immediate Danger",
      value:
        "Call your local emergency number now",
    },
  ],
};