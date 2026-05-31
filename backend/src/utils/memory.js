const LIMITS = {
  GOALS: 20,
  ROUTINES: 20,
  PATTERNS: 50,
};

const goalPatterns = [
  /\bmy goal is to ([^.?!]+)/i,
  /\bi want to ([^.?!]+)/i,
  /\bi need to ([^.?!]+)/i,
  /\bi plan to ([^.?!]+)/i,
  /\bi hope to ([^.?!]+)/i,
  /\bi am trying to ([^.?!]+)/i,
  /\bi would like to ([^.?!]+)/i,
];

const routinePatterns = [
  /\bi usually ([^.?!]+)/i,
  /\bevery day i ([^.?!]+)/i,
  /\bat night i ([^.?!]+)/i,
  /\bin the morning i ([^.?!]+)/i,
  /\bi often ([^.?!]+)/i,
  /\bi always ([^.?!]+)/i,
  /\bi regularly ([^.?!]+)/i,
];

function cleanSnippet(value = "", maxLength = 160) {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[.,!?]+$/, "")
    .slice(0, maxLength);
}

function firstMatch(text, patterns) {
  for (const pattern of patterns) {
    const match = text.match(pattern);

    if (match?.[1]) {
      return cleanSnippet(match[1]);
    }
  }

  return null;
}

function normalize(value) {
  return value.trim().toLowerCase();
}

function addUnique(list = [], value, limit) {
  if (!value) return list;

  const exists = list.some(
    (item) => normalize(item) === normalize(value)
  );

  if (exists) {
    return list;
  }

  return [value, ...list].slice(0, limit);
}

export function extractMemoryPatch(
  message = "",
  emotion = null
) {
  const patch = {};

  const goal = firstMatch(
    message,
    goalPatterns
  );

  const routine = firstMatch(
    message,
    routinePatterns
  );

  if (goal) {
    patch.goal = goal;
  }

  if (routine) {
    patch.routine = routine;
  }

  if (emotion?.label) {
    patch.pattern = `Frequently expresses ${emotion.label}`;
  }

  return patch;
}

export function applyMemoryPatch(
  memory,
  patch
) {
  if (!memory) return memory;

  if (patch.goal) {
    memory.goals = addUnique(
      memory.goals,
      patch.goal,
      LIMITS.GOALS
    );
  }

  if (patch.routine) {
    memory.routines = addUnique(
      memory.routines,
      patch.routine,
      LIMITS.ROUTINES
    );
  }

  if (patch.pattern) {
    memory.patterns = addUnique(
      memory.patterns,
      patch.pattern,
      LIMITS.PATTERNS
    );
  }

  return memory;
}