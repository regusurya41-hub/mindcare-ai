const crisisPatterns = [
  /\b(suicide|suicidal|kill myself|end my life|take my life)\b/i,
  /\b(self[- ]?harm|hurt myself|cut myself)\b/i,
  /\b(can'?t go on|no reason to live|want to disappear forever)\b/i,
  /\b(overdose|jump off|hang myself)\b/i
];

export function detectCrisis(text = '') {
  return crisisPatterns.some((pattern) => pattern.test(text));
}

export const crisisResponse = {
  isCrisis: true,
  reply:
    "I'm really sorry you're carrying this right now. You deserve immediate support from a real person. If you may be in danger, please call emergency services now or go to the nearest emergency room. If you can, reach out to a trusted adult, friend, family member, counselor, or local crisis line and stay near someone safe.",
  resources: [
    { label: 'United States and Canada', value: 'Call or text 988 for the Suicide & Crisis Lifeline' },
    { label: 'India', value: 'Call 112 for emergency help, or contact a local mental health crisis service' },
    { label: 'United Kingdom and ROI', value: 'Call Samaritans at 116 123' },
    { label: 'Immediate danger', value: 'Call your local emergency number now' }
  ]
};
