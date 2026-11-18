import { useEffect, useRef, useState } from "react";
import {
  Pause,
  Play,
  RotateCcw,
  House,
  Star,
  Music2,
  ArrowRight,
  Flower2,
  Wind,
} from "lucide-react";
import { Game, modes, type Difficulty } from "./engine";
import { star } from "./art";
import { drawCharacter } from "./characterArt";
import { findCosmetic, type Equipment } from "./catalog";
import { levelById, type LevelId } from "./levels";
import { JumpMusic } from "./music";
import type { RunSummary, TransactionResult, WorldId } from "./progression";
import { worldById } from "./worlds";
import { drawBackground, drawPlatform, drawItem } from "./worldArt";
export default function GameCanvas({
  difficulty,
  levelId,
  music,
  onMusic,
  onNextLevel,
  equipment,
  world,
  sound,
  best,
  onEnd,
  onHome,
}: {
  difficulty: Difficulty;
  levelId?: LevelId;
  music: boolean;
  onMusic: () => void;
  onNextLevel: () => void;
  world: WorldId;
  equipment: Equipment;
  sound: boolean;
  best: number;
  onEnd: (run: RunSummary) => Promise<TransactionResult>;
  onHome: () => void;
}) {
  const [initialGame] = useState(
    () => new Game(difficulty, Math.random, world, levelId),
  );
  const [soundtrack] = useState(() => new JumpMusic());
  const level = levelById(levelId);
  const startedRef = useRef(!levelId);
  const [started, setStarted] = useState(!levelId);
  const canvas = useRef<HTMLCanvasElement>(null),
    game = useRef(initialGame),
    keys = useRef(new Set<string>()),
    touch = useRef(new Map<number, number>()),
    pausedRef = useRef(false),
    ended = useRef(false),
    runId = useRef(crypto.randomUUID());
  const [paused, setPaused] = useState(false),
    [hud, setHud] = useState({ score: 0, stars: 0, feather: 0 }),
    [result, setResult] = useState<{
      score: number;
      stars: number;
      bonus?: number;
      achievements?: string[];
      worlds?: WorldId[];
      completed?: boolean;
      cosmetics?: string[];
      levelBonus?: number;
    } | null>(null),
    [run, setRun] = useState(0),
    [saving, setSaving] = useState(false);
  useEffect(() => {
    soundtrack.configure(music, sound);
  }, [music, sound, soundtrack]);
  function unlockAudio() {
    soundtrack.configure(music, sound);
    soundtrack.unlock();
  }
  useEffect(() => () => soundtrack.dispose(), [soundtrack]);
  function begin() {
    unlockAudio();
    startedRef.current = true;
    setStarted(true);
    pause(false);
  }
  function pause(v: boolean) {
    if (!v) unlockAudio();
    soundtrack.setPaused(v);
    pausedRef.current = v;
    setPaused(v);
    keys.current.clear();
    touch.current.clear();
  }
  function restart() {
    game.current = new Game(difficulty, Math.random, world, levelId);
    soundtrack.reset();
    runId.current = crypto.randomUUID();
    ended.current = false;
    setResult(null);
    pause(false);
    setRun((v) => v + 1);
  }
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      unlockAudio();
      if (["ArrowLeft", "ArrowRight", "a", "d", "A", "D", " "].includes(e.key))
        e.preventDefault();
      keys.current.add(e.key);
      if (e.key === "Escape" && !e.repeat) pause(!pausedRef.current);
    };
    const up = (e: KeyboardEvent) => keys.current.delete(e.key);
    const blur = () => pause(true);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    const visibility = () => {
      if (document.hidden) pause(true);
    };
    document.addEventListener("visibilitychange", visibility);
    let frame = 0,
      last = 0,
      tick = 0;
    const tone = (kind: string) => soundtrack.event(kind, game.current.score);
    const draw = (time: number) => {
      const dt = last ? Math.min((time - last) / 1000, 0.05) : 1 / 60;
      last = time;
      const g = game.current;
      if (startedRef.current && !pausedRef.current && !g.over) {
        const k = keys.current;
        let dir =
          Number(k.has("ArrowRight") || k.has("d") || k.has("D")) -
          Number(k.has("ArrowLeft") || k.has("a") || k.has("A"));
        for (const d of touch.current.values()) dir += d;
        let remaining = dt;
        while (remaining > 0) {
          const step = Math.min(remaining, 1 / 120);
          g.step(step, Math.sign(dir), tone);
          remaining -= step;
        }
      }
      if (startedRef.current && !pausedRef.current && !g.over)
        soundtrack.tick(g.score);
      if (g.over && !ended.current) {
        soundtrack.finish(g.completed, g.score);
        ended.current = true;
        setSaving(true);
        setResult({ score: g.score, stars: g.earned, completed: g.completed });
        void onEnd(g.summary(runId.current))
          .then((receipt) => {
            setResult({
              score: g.score,
              stars: g.earned,
              bonus: receipt.bonus,
              achievements: receipt.newAchievements,
              worlds: receipt.newWorlds,
              completed: g.completed,
              cosmetics: receipt.newCosmetics,
              levelBonus: receipt.levelBonus,
            });
          })
          .finally(() => setSaving(false));
      }
      if (time - tick > 100) {
        tick = time;
        setHud({
          score: g.score,
          stars: g.stars,
          feather: Math.ceil(g.feather),
        });
      }
      const el = canvas.current;
      if (el) {
        const box = el.getBoundingClientRect(),
          dpr = Math.min(devicePixelRatio || 1, 2);
        if (
          el.width !== Math.floor(box.width * dpr) ||
          el.height !== Math.floor(box.height * dpr)
        ) {
          el.width = Math.floor(box.width * dpr);
          el.height = Math.floor(box.height * dpr);
        }
        const c = el.getContext("2d")!;
        c.setTransform(el.width / 390, 0, 0, el.height / 720, 0, 0);
        c.clearRect(0, 0, 390, 720);
        drawBackground(c, world, g.time, g.camera);
        c.save();
        c.translate(0, -g.camera);
        for (const p of g.platforms) drawPlatform(c, p, g);
        for (const item of g.items) drawItem(c, item, g);
        for (const p of g.particles)
          star(c, p.x, p.y - (0.7 - p.t) * 45, (5 * p.t) / 0.7);
        if (g.feather > 0) {
          c.strokeStyle = "#fff6c8";
          c.lineWidth = 3;
          c.beginPath();
          c.arc(g.x, g.y, 27, 0, 7);
          c.stroke();
        }
        drawCharacter(c, g.x, g.y, equipment, 0.62, g.squash, g.time, g.vy);
        c.restore();
      }
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [
    difficulty,
    equipment,
    world,
    sound,
    music,
    levelId,
    soundtrack,
    run,
    onEnd,
  ]);
  return (
    <div className={"game world-" + world}>
      <canvas
        ref={canvas}
        aria-label={
          worldById(world).name +
          " jumping game. Use arrow keys or hold either half to move."
        }
        onPointerDown={(e) => {
          unlockAudio();
          e.currentTarget.setPointerCapture(e.pointerId);
          touch.current.set(
            e.pointerId,
            e.nativeEvent.offsetX < e.currentTarget.clientWidth / 2 ? -1 : 1,
          );
        }}
        onPointerUp={(e) => touch.current.delete(e.pointerId)}
        onPointerCancel={(e) => touch.current.delete(e.pointerId)}
      />
      <div className="game-hud">
        <div>
          <small>
            {level
              ? `Chapter ${level.number} · ${level.name}`
              : worldById(world).name + " · " + modes[difficulty].name}
          </small>
          <strong>
            {hud.score}
            <span> m</span>
          </strong>
        </div>
        <span className="star-count">
          <Star size={17} />
          {hud.stars}
        </span>
        <button
          className={"icon-button game-music " + (music ? "on" : "")}
          aria-label={music ? "Turn music off" : "Turn music on"}
          aria-pressed={music}
          onClick={() => {
            soundtrack.configure(!music, sound);
            soundtrack.unlock();
            onMusic();
          }}
        >
          <Music2 size={17} />
        </button>
        <button
          className="icon-button"
          aria-label="Pause game"
          onClick={() => pause(true)}
        >
          <Pause size={20} />
        </button>
      </div>
      {level && (
        <div className="level-hud" aria-label="Chapter objectives">
          <span>
            <Star size={11} />
            {Math.min(hud.stars, level.stars)}/{level.stars}
          </span>
          {level.flowers > 0 && (
            <span>
              <Flower2 size={11} />
              {Math.min(game.current.flowers, level.flowers)}/{level.flowers}
            </span>
          )}
          {level.gusts > 0 && (
            <span>
              <Wind size={11} />
              {Math.min(game.current.gusts, level.gusts)}/{level.gusts}
            </span>
          )}
          <span className="destination-progress">
            {game.current.visitedFinish
              ? "Finish garden"
              : Math.min(
                  100,
                  Math.round(
                    (game.current.height /
                      Math.max(1, 570 - (game.current.finishY || 0))) *
                      100,
                  ),
                ) + "% to garden"}
          </span>
        </div>
      )}
      {hud.feather > 0 && (
        <div className="feather-label">Feather float · {hud.feather}s</div>
      )}
      {game.current.wind !== 0 && (
        <div className="wind-indicator" role="status">
          {game.current.wind > 0 ? "A little breeze →" : "← A little breeze"}
        </div>
      )}
      <div className="touch-hint">
        ← hold to drift <span>hold to drift →</span>
      </div>
      {(!started || paused || result) && (
        <div className="overlay">
          <div className="modal">
            <span className="eyebrow">
              {!started
                ? "A LITTLE JOURNEY AWAITS"
                : result?.completed
                  ? "YOU FOUND YOUR LITTLE GARDEN"
                  : result
                    ? "UNTIL THE NEXT LITTLE LEAP"
                    : "TAKE A LITTLE BREATHER"}
            </span>
            <h2>
              {!started
                ? level?.name
                : result?.completed
                  ? "A chapter to treasure!"
                  : result
                    ? "A lovely little journey!"
                    : "Among the clouds"}
            </h2>
            <p>
              {!started
                ? level?.description
                : result?.completed
                  ? "Your next little adventure is waiting."
                  : result
                    ? "Every leap is a little adventure."
                    : "Your garden will be right here."}
            </p>
            {result && (
              <div className="result-stats">
                <div>
                  <strong>{result.score}m</strong>
                  <small>Altitude</small>
                </div>
                <div>
                  <strong>{Math.max(best, result.score)}m</strong>
                  <small>Personal best</small>
                </div>
                <div>
                  <strong>+{result.stars} ★</strong>
                  <small>Stars earned</small>
                </div>
              </div>
            )}
            {!started && (
              <div className="chapter-brief">
                <p>
                  Reach the finish garden with {level?.stars} stars
                  {level?.flowers ? `, ${level.flowers} flower bounces` : ""}
                  {level?.gusts ? ` and ${level.gusts} passing breeze` : ""}.
                </p>
                <p>
                  Hold either side to drift, or use ← → / A / D.
                  <br />
                  The finish garden helps with missed goal stars.
                </p>
                <button className="primary" onClick={begin}>
                  <Play size={17} /> Begin journey
                </button>
                <button
                  className="text-button"
                  onClick={() => {
                    soundtrack.configure(!music, sound);
                    soundtrack.unlock();
                    onMusic();
                  }}
                >
                  <Music2 size={14} />
                  {music
                    ? "Music on · a melody in every leap"
                    : "Turn on jump-reactive music"}
                </button>
              </div>
            )}
            {started && !result && (
              <button className="primary" onClick={() => pause(false)}>
                <Play size={17} /> Keep floating
              </button>
            )}
            {result?.completed && (
              <button
                disabled={saving}
                className="primary next-chapter"
                onClick={onNextLevel}
              >
                {level?.number === 5
                  ? "Back to your five chapters"
                  : "Next little chapter"}
                <ArrowRight size={17} />
              </button>
            )}
            {started && (
              <button
                disabled={saving}
                className={
                  result && !result.completed ? "primary" : "secondary"
                }
                onClick={restart}
              >
                <RotateCcw size={17} />
                {result ? "Play again" : "Restart journey"}
              </button>
            )}
            {result && (
              <div className="run-rewards" role="status">
                {saving ? (
                  <p>Tucking your stars away…</p>
                ) : (
                  <>
                    {!!result.levelBonus && (
                      <p>✦ +{result.levelBonus} first-clear stars</p>
                    )}
                    {!!((result.bonus || 0) - (result.levelBonus || 0)) && (
                      <p>
                        ✦ +{(result.bonus || 0) - (result.levelBonus || 0)}{" "}
                        milestone stars
                      </p>
                    )}
                    {result.cosmetics?.map((id) => (
                      <p key={id}>
                        ✿ {findCosmetic(id)?.name} is yours in the Boutique!
                      </p>
                    ))}
                    {!!result.achievements?.length && (
                      <p>
                        {result.achievements.length} little milestone
                        {result.achievements.length > 1 ? "s" : ""} completed
                      </p>
                    )}
                    {result.worlds?.map((w) => (
                      <p key={w}>✧ {worldById(w).name} is now open!</p>
                    ))}
                  </>
                )}
              </div>
            )}
            <button disabled={saving} className="text-button" onClick={onHome}>
              <House size={16} /> {level ? "Back to chapters" : "Return home"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
