import assert from "node:assert/strict";
import test from "node:test";
import { DEFAULT_APPEARANCE, parseAppearance } from "./appearance";

test("appearance defaults keep strict mode and error sound enabled", () => {
  assert.equal(DEFAULT_APPEARANCE.strictMode, true);
  assert.equal(DEFAULT_APPEARANCE.errorSound, true);
  assert.equal(DEFAULT_APPEARANCE.typingSound, false);
  assert.deepEqual(parseAppearance(null), DEFAULT_APPEARANCE);
});

test("legacy sound setting maps to typingSound", () => {
  const parsed = parseAppearance(
    JSON.stringify({
      theme: "dark",
      accent: "lime",
      raceFont: "jetbrains",
      raceFontSize: 20,
      sound: true,
    }),
  );

  assert.equal(parsed.typingSound, true);
  assert.equal(parsed.strictMode, true);
  assert.equal(parsed.errorSound, true);
});
