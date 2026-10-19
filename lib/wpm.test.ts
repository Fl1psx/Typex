import assert from "node:assert/strict";
import test from "node:test";
import {
  applyTypingInput,
  calculateAccuracy,
  charsEqual,
  countCorrect,
  normalizeChar,
} from "./wpm";

test("normalizeChar treats ё and е as equal in both directions", () => {
  assert.equal(normalizeChar("ё"), "е");
  assert.equal(normalizeChar("Ё"), "е");
  assert.equal(normalizeChar("е"), "е");
  assert.equal(normalizeChar("Е"), "е");
  assert.equal(charsEqual("ё", "е"), true);
  assert.equal(charsEqual("е", "ё"), true);
  assert.equal(charsEqual("Ё", "Е"), true);
});

test("a mistake in strict mode does not advance the accepted text", () => {
  const first = applyTypingInput(
    { accepted: "", errors: 0 },
    "кот",
    "к",
    true,
  );

  assert.equal(first.accepted, "к");
  assert.equal(first.errors, 0);

  const mistake = applyTypingInput(first, "кот", "а", true);

  assert.equal(mistake.accepted, "к");
  assert.equal(mistake.errors, 1);
  assert.equal(mistake.errorIndex, 1);
  assert.equal(mistake.rejected, true);
});

test("free mode accepts a wrong character but counts the error", () => {
  const result = applyTypingInput(
    { accepted: "к", errors: 0 },
    "кот",
    "а",
    false,
  );

  assert.equal(result.accepted, "ка");
  assert.equal(result.errors, 1);
  assert.equal(result.errorIndex, 1);
  assert.equal(result.rejected, true);
});

test("typing е where the target has ё counts as correct and keeps the target", () => {
  const result = applyTypingInput(
    { accepted: "", errors: 0 },
    "ёж",
    "е",
    true,
  );

  assert.equal(result.accepted, "е");
  assert.equal(result.errors, 0);
  assert.equal(countCorrect(result.accepted, "ёж"), 1);
});

test("accuracy uses correct attempts over all attempts", () => {
  assert.equal(calculateAccuracy(10, 0), 100);
  assert.equal(calculateAccuracy(9, 1), 90);
  assert.equal(calculateAccuracy(0, 0), 100);
  assert.equal(calculateAccuracy(0, 1), 0);
});
