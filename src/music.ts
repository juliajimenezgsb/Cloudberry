export const BPM = 72;
export const CHORDS = [
  [48, 52, 55, 62],
  [45, 48, 52, 55],
  [41, 45, 48, 55],
  [43, 47, 50, 55],
] as const;
export const frequency = (midi: number) => 440 * 2 ** ((midi - 69) / 12);
export const chordForBeat = (beat: number) =>
  CHORDS[Math.floor(beat / 4) % CHORDS.length];
export function eventNotes(
  kind: string,
  beat: number,
  height: number,
  index: number,
) {
  const chord = chordForBeat(beat),
    note = chord[(index + Math.floor(height / 55)) % chord.length] + 24;
  if (kind === "boost")
    return [note, note + 12, chord[(index + 1) % chord.length] + 36];
  if (kind === "star")
    return [
      chord[(index + 2) % chord.length] + 36,
      chord[(index + 3) % chord.length] + 36,
    ];
  if (kind === "complete") return [...chord.map((n) => n + 24), chord[0] + 36];
  if (kind === "bump") return [chord[0] + 12];
  return [note];
}
/** Small, original Web Audio score: slow pads with harmonically matched event notes. */
export class JumpMusic {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private voices = new Set<OscillatorNode>();
  private beat = 0;
  private nextBeat = 0;
  private noteIndex = 0;
  private paused = false;
  private music = false;
  private sound = false;
  configure(music: boolean, sound: boolean) {
    if (this.music && !music) this.stopVoices();
    this.music = music;
    this.sound = sound;
  }
  unlock() {
    if (!this.music && !this.sound) return;
    try {
      if (!this.context) {
        this.context = new AudioContext();
        this.master = this.context.createGain();
        this.master.gain.value = 0.8;
        this.master.connect(this.context.destination);
        this.nextBeat = this.context.currentTime + 0.08;
      }
      void this.context.resume().catch(() => {});
    } catch {
      /* Silent play is always available. */
    }
  }
  private note(
    midi: number,
    time: number,
    duration: number,
    gain: number,
    pad = false,
  ) {
    const a = this.context,
      m = this.master;
    if (!a || !m || this.paused || a.state !== "running") return;
    const o = a.createOscillator(),
      v = a.createGain();
    o.type = "sine";
    o.frequency.value = frequency(midi);
    v.gain.setValueAtTime(0, time);
    v.gain.linearRampToValueAtTime(gain, time + (pad ? 0.25 : 0.012));
    v.gain.exponentialRampToValueAtTime(0.0001, time + duration);
    o.connect(v);
    v.connect(m);
    o.start(time);
    o.stop(time + duration + 0.03);
    this.voices.add(o);
    o.onended = () => {
      this.voices.delete(o);
      o.disconnect();
      v.disconnect();
    };
  }
  tick(height: number) {
    const a = this.context;
    if (!a || !this.music || this.paused || a.state !== "running") return;
    if (this.nextBeat < a.currentTime - 0.2)
      this.nextBeat = a.currentTime + 0.04;
    while (this.nextBeat < a.currentTime + 0.12) {
      const chord = chordForBeat(this.beat),
        t = this.nextBeat;
      if (this.beat % 4 === 0)
        for (const n of chord) this.note(n + 12, t, 3.1, 0.012, true);
      if (height >= 75 && this.beat % 2 === 0)
        this.note(chord[(this.beat / 2) % chord.length] + 24, t, 0.7, 0.012);
      if (height >= 150 && this.beat % 2 === 0)
        this.note(chord[0], t, 1.1, 0.015, true);
      if (height >= 240 && this.beat % 4 === 2)
        this.note(chord[2] + 36, t, 1.2, 0.007);
      this.beat++;
      this.nextBeat += 60 / BPM;
    }
  }
  event(kind: string, height: number) {
    const a = this.context;
    if (
      !a ||
      this.paused ||
      (!this.music && !this.sound) ||
      a.state !== "running"
    )
      return;
    const soundingBeat =
      this.beat - 1 - (this.nextBeat - 60 / BPM > a.currentTime ? 1 : 0);
    const notes = eventNotes(
      kind,
      Math.max(0, soundingBeat),
      height,
      this.noteIndex++,
    );
    notes.forEach((n, i) =>
      this.note(
        n,
        a.currentTime + i * 0.085,
        kind === "complete" ? 1.1 : 0.5,
        this.music ? 0.029 : 0.026,
      ),
    );
  }
  setPaused(paused: boolean) {
    if (paused === this.paused) return;
    this.paused = paused;
    if (paused) this.stopVoices();
    else if (this.context) this.nextBeat = this.context.currentTime + 0.08;
  }
  private stopVoices() {
    const a = this.context;
    if (!a) return;
    for (const voice of this.voices) {
      try {
        voice.stop(a.currentTime + 0.02);
      } catch {}
    }
    this.voices.clear();
  }
  reset() {
    this.stopVoices();
    this.beat = 0;
    this.noteIndex = 0;
    if (this.context) this.nextBeat = this.context.currentTime + 0.08;
  }
  finish(completed: boolean, height: number) {
    this.stopVoices();
    if (completed) this.event("complete", height);
  }
  dispose() {
    this.stopVoices();
    void this.context?.close();
    this.context = null;
    this.master = null;
  }
}
