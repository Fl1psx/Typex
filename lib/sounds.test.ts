import assert from "node:assert/strict";
import test from "node:test";
import { isAudioSupported, playClick, playError } from "./sounds";

test("sound helpers are safe without an AudioContext", () => {
  assert.equal(isAudioSupported(), false);
  assert.doesNotThrow(() => playError());
  assert.doesNotThrow(() => playClick());
  assert.equal(playError(), false);
  assert.equal(playClick(), false);
});
