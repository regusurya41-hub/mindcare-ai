const goalPatterns = [
  /\bmy goal is to ([^.?!]+)/i,
  /\bi want to ([^.?!]+)/i,
  /\bi need to ([^.?!]+)/i
];

const routinePatterns = [
  /\bi usually ([^.?!]+)/i,
  /\bevery day i ([^.?!]+)/i,
  /\bat night i ([^.?!]+)/i,
  /\bin the morning i ([^.?!]+)/i
];

function cleanSnippet(value = '') {
  return value.trim().replace(/\s+/g, ' ').slice(0, 160);
}

function firstMatch(text, patterns) {
  const match = patterns.map((pattern) => text.match(pattern)?.[1]).find(Boolean);
  return match ? cleanSnippet(match) : null;
}

function addUnique(list, value, limit = 6) {
  if (!value) return list;
  const exists = list.some((item) => item.toLowerCase() === value.toLowerCase());
  return exists ? list : [value, ...list].slice(0, limit);
}

export function extractMemoryPatch(message = '', emotion = null) {
  const patch = {};
  const goal = firstMatch(message, goalPatterns);
  const routine = firstMatch(message, routinePatterns);

  if (goal) patch.goal = goal;
  if (routine) patch.routine = routine;
  if (emotion?.label) patch.pattern = `${emotion.label} mentioned during chat`;

  return patch;
}

export function applyMemoryPatch(memory, patch) {
  if (patch.goal) memory.goals = addUnique(memory.goals || [], patch.goal);
  if (patch.routine) memory.routines = addUnique(memory.routines || [], patch.routine);
  if (patch.pattern) memory.patterns = addUnique(memory.patterns || [], patch.pattern);
  return memory;
}
