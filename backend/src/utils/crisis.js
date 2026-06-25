/* crisis.js — improved with severity scoring, context-aware responses, and India-first resources */

const CRISIS_PATTERNS = [
  {
    severity: 'critical',
    weight: 3,
    patterns: [
      /\b(suicide|suicidal)\b/i,
      /\bkill\s+myself\b/i,
      /\bend\s+my\s+life\b/i,
      /\btake\s+my\s+life\b/i,
      /\bi\s+want\s+to\s+die\b/i,
      /\bi('m| am)\s+going\s+to\s+kill\s+myself\b/i,
      /\bi\s+plan\s+to\s+(kill|end|hurt)\s+myself\b/i,
      /\bno\s+point\s+(in\s+)?living\b/i,
      /\bbetter\s+off\s+dead\b/i,
    ],
  },
  {
    severity: 'high',
    weight: 2,
    patterns: [
      /\bself[- ]?harm\b/i,
      /\bhurt\s+myself\b/i,
      /\bcut\s+myself\b/i,
      /\boverdose\b/i,
      /\bjump\s+off\b/i,
      /\bhang\s+myself\b/i,
      /\bwrist\s+(cut|slit)\b/i,
      /\bpills?\s+(to\s+)?(kill|end|overdose)\b/i,
    ],
  },
  {
    severity: 'medium',
    weight: 1,
    patterns: [
      /\bcan'?t\s+go\s+on\b/i,
      /\bno\s+reason\s+to\s+live\b/i,
      /\bwant\s+to\s+disappear\s+forever\b/i,
      /\blife\s+is\s+not\s+worth\s+(living|it)\b/i,
      /\beveryone\s+would\s+be\s+better\s+(off\s+)?without\s+me\b/i,
      /\bwish\s+i\s+was\s+never\s+born\b/i,
      /\bwish\s+i\s+wasn'?t\s+here\b/i,
      /\bgoodbye\s+(forever|everyone|world)\b/i,
    ],
  },
];

export function detectCrisis(text = '') {
  const normalized = text.trim();
  let totalWeight = 0;
  let severity = null;

  for (const group of CRISIS_PATTERNS) {
    const hits = group.patterns.filter((p) => p.test(normalized));
    if (hits.length > 0) {
      totalWeight += hits.length * group.weight;
      if (!severity || group.severity === 'critical') severity = group.severity;
      else if (severity === 'medium' && group.severity === 'high') severity = 'high';
    }
  }

  return {
    isCrisis:   totalWeight > 0,
    severity,
    confidence: Math.min(totalWeight / 5, 1),
    weight:     totalWeight,
  };
}

export const crisisResources = [
  { label: 'India — iCall',       value: '9152987821',  type: 'phone' },
  { label: 'India — Vandrevala',  value: '1860-2662-345',type: 'phone' },
  { label: 'India — AASRA',       value: '9820466627',  type: 'phone' },
  { label: 'India — Emergency',   value: '112',         type: 'phone' },
  { label: 'US/Canada — 988',     value: '988',         type: 'phone' },
  { label: 'UK — Samaritans',     value: '116 123',     type: 'phone' },
  { label: 'Text crisis line',    value: 'Text HOME to 741741', type: 'text' },
  { label: 'Global directory',    value: 'findahelpline.com', type: 'web' },
];

export function buildCrisisReply(severity = 'medium') {
  const base = "I'm really concerned about you right now, and I'm glad you told me.";

  const bySeverity = {
    critical: `${base} What you're feeling is real and it matters — and so does your life. Please reach out to emergency services or a crisis line right now. You don't have to be alone in this moment.`,
    high:     `${base} What you're going through sounds incredibly painful. Please don't hurt yourself — there are people ready to help right now, even if it doesn't feel that way. Can you tell me where you are?`,
    medium:   `${base} Those feelings of wanting to escape are more common than you might think, but they're also a sign you need real support right now — more than I can give alone. Please reach out to one of the resources below.`,
  };

  return bySeverity[severity] || bySeverity.medium;
}