import { test } from "node:test";
import assert from "node:assert/strict";
import {
  JumpMusic,
  CHORDS,
  chordForBeat,
  eventNotes,
  frequency,
} from "./music";
test("landing, boost, star and completion notes stay within the current chord across heights", () => {
  for (let beat = 0; beat < 64; beat++)
    for (const kind of ["jump", "boost", "star", "complete"])
      for (const height of [0, 55, 200, 800]) {
        const chord = chordForBeat(beat);
        for (const n of eventNotes(kind, beat, height, beat)) {
          assert.ok(chord.some((c) => c % 12 === n % 12));
          assert.ok(n >= 60 && n <= 100);
        }
      }
  assert.equal(frequency(69), 440);
  assert.deepEqual(chordForBeat(16), CHORDS[0]);
});
test("audio starts only after a gesture, stays bounded, pauses, and disposes its context", () => {
  let created = 0,
    started = 0,
    stopped = 0,
    closed = 0;
  const original = Object.getOwnPropertyDescriptor(globalThis, "AudioContext");
  class Param {
    value = 0;
    setValueAtTime() {}
    linearRampToValueAtTime() {}
    exponentialRampToValueAtTime() {}
  }
  class Node {
    gain = new Param();
    frequency = new Param();
    type = "sine";
    onended: (() => void) | null = null;
    connect() {}
    disconnect() {}
    start() {
      started++;
    }
    stop() {
      stopped++;
    }
  }
  class Context {
    currentTime = 0;
    state = "running";
    destination = {};
    constructor() {
      created++;
    }
    createGain() {
      return new Node();
    }
    createOscillator() {
      return new Node();
    }
    resume() {
      return Promise.resolve();
    }
    close() {
      closed++;
      return Promise.resolve();
    }
  }
  Object.defineProperty(globalThis, "AudioContext", {
    configurable: true,
    value: Context,
  });
  try {
    const score = new JumpMusic();
    score.configure(true, false);
    score.tick(300);
    score.event("jump", 300);
    assert.equal(created, 0);
    score.unlock();
    assert.equal(created, 1);
    score.tick(300);
    score.event("boost", 300);
    assert.ok(started > 0 && started < 20);
    score.setPaused(true);
    assert.ok(stopped > 0);
    const paused = started;
    score.tick(500);
    score.event("star", 500);
    assert.equal(started, paused);
    score.setPaused(false);
    score.event("star", 300);
    assert.ok(started > paused);
    score.configure(false, false);
    const muted = started;
    score.tick(500);
    score.event("jump", 500);
    assert.equal(started, muted);
    score.dispose();
    assert.equal(closed, 1);
  } finally {
    if (original) Object.defineProperty(globalThis, "AudioContext", original);
    else Reflect.deleteProperty(globalThis, "AudioContext");
  }
});
