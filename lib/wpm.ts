export function normalizeChar(char: string): string {
  return char.toLowerCase().replace("ё", "е");
}

export function charsEqual(input: string, expected: string): boolean {
  return normalizeChar(input) === normalizeChar(expected);
}

export function countCorrect(input: string, target: string): number {
  const inputChars = Array.from(input);
  const targetChars = Array.from(target);
  let correct = 0;

  for (let index = 0; index < inputChars.length; index += 1) {
    if (index >= targetChars.length) {
      break;
    }

    if (charsEqual(inputChars[index], targetChars[index])) {
      correct += 1;
    }
  }

  return correct;
}

export type TypingState = {
  accepted: string;
  errors: number;
};

export type TypingUpdate = TypingState & {
  acceptedChars: number;
  correctChars: number;
  rejected: boolean;
  errorIndex: number | null;
};

export function applyTypingInput(
  state: TypingState,
  target: string,
  input: string,
  strictMode: boolean,
): TypingUpdate {
  const targetChars = Array.from(target);
  const acceptedChars = Array.from(state.accepted);
  let errors = state.errors;
  let acceptedCharsFromInput = 0;
  let correctCharsFromInput = 0;
  let errorIndex: number | null = null;

  for (const char of Array.from(input)) {
    const index = acceptedChars.length;

    if (index >= targetChars.length) {
      break;
    }

    if (charsEqual(char, targetChars[index])) {
      acceptedChars.push(char);
      acceptedCharsFromInput += 1;
      correctCharsFromInput += 1;
      continue;
    }

    errors += 1;

    if (errorIndex === null) {
      errorIndex = index;
    }

    if (strictMode) {
      break;
    }

    acceptedChars.push(char);
    acceptedCharsFromInput += 1;
  }

  return {
    accepted: acceptedChars.join(""),
    errors,
    acceptedChars: acceptedCharsFromInput,
    correctChars: correctCharsFromInput,
    rejected: errorIndex !== null,
    errorIndex,
  };
}

export function calculateAccuracy(correctChars: number, errors: number): number {
  const attempts = correctChars + errors;

  if (attempts === 0) {
    return 100;
  }

  return (correctChars / attempts) * 100;
}

export function calculateWpm(correctChars: number, durationMs: number): number {
  const minutes = Math.max(durationMs, 1) / 60000;
  return correctChars / 5 / minutes;
}
