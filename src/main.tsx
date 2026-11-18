import React, {
  useCallback,
  useEffect,
  useSyncExternalStore,
  useState,
} from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowLeft,
  ArrowRight,
  Star,
  Settings,
  Volume2,
  VolumeX,
  Check,
  Leaf,
  Wind,
  Sparkles,
  Mountain,
  Flower2,
  Heart,
  Cloud,
} from "lucide-react";
import GameCanvas from "./GameCanvas";
import JourneyLevels from "./components/JourneyLevels";
import { levels, levelById, type LevelId } from "./levels";
import Home from "./components/Home";
import Boutique from "./components/Boutique";
import Worlds from "./components/Worlds";
import Achievements from "./components/Achievements";
import { worldById } from "./worlds";
import { modes, type Difficulty } from "./engine";
import {
  PlayerStore,
  buyItem,
  equipItem,
  creditRun,
  selectWorld,
  collectMilestones,
  type RunSummary,
  type PlayerSave,
} from "./progression";
import "./style.css";
import "./expansion.css";
import "./journey.css";
let storage: Storage | undefined;
try {
  storage = localStorage;
} catch {
  /* In-memory play still works. */
}
const player = new PlayerStore(storage);
function App() {
  const save = useSyncExternalStore(player.subscribe, player.getSnapshot),
    [screen, setScreen] = useState("home"),
    [playMode, setPlayMode] = useState<"endless" | "levels">("endless"),
    [levelId, setLevelId] = useState<LevelId>("first-leap");
  useEffect(() => {
    window.addEventListener("storage", player.refresh);
    return () => window.removeEventListener("storage", player.refresh);
  }, []);
  const update = useCallback(
    (patch: Partial<Pick<PlayerSave, "sound" | "difficulty" | "music">>) =>
      player.transact((s) => ({
        save: { ...s, ...patch },
        ok: true,
        message: "",
      })),
    [],
  );
  const end = useCallback(
    (run: RunSummary) => player.transact((s) => creditRun(s, run)),
    [],
  );
  return (
    <div className="app-shell">
      <header className="topbar">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            if (screen !== "game") setScreen("home");
          }}
          className="wordmark"
        >
          <Cloud size={23} /> cloudberry<span>little leaps, lovely places</span>
        </a>
        <div className="top-right">
          <span className="garden-status">
            <i /> A little escape, just for you
          </span>
          <button
            className="icon-button"
            aria-label="Settings"
            onClick={() => setScreen("settings")}
            disabled={screen === "game"}
          >
            <Settings size={19} />
          </button>
        </div>
      </header>
      <main className={screen === "game" ? "playing" : ""}>
        {screen === "game" ? (
          <GameCanvas
            key={playMode === "levels" ? levelId : "endless"}
            levelId={playMode === "levels" ? levelId : undefined}
            music={save.music}
            onMusic={() => {
              void update({ music: !save.music });
            }}
            onNextLevel={() => {
              const next = levels[levelById(levelId)?.number || 1];
              if (next) setLevelId(next.id);
              else setScreen("levels");
            }}
            difficulty={save.difficulty}
            world={playMode === "levels" ? "garden" : save.selectedWorld}
            equipment={save.equipment}
            sound={save.sound}
            best={
              playMode === "levels"
                ? save.levelBests[levelId] || 0
                : save.stats[save.selectedWorld].best
            }
            onEnd={end}
            onHome={() => setScreen(playMode === "levels" ? "levels" : "home")}
          />
        ) : (
          <>
            <div className="sky-decoration">
              <div className="cloud cloud-one" />
              <div className="cloud cloud-two" />
              <div className="cloud cloud-three" />
              <div className="cloud cloud-four" />
              <span className="spark s1">✧</span>
              <span className="spark s2">✦</span>
              <span className="spark s3">✧</span>
              <span className="spark s4">✦</span>
            </div>
            <div className="progress-bar">
              <button
                className="location location-button"
                onClick={() => setScreen("worlds")}
              >
                <Flower2 size={16} />{" "}
                {worldById(save.selectedWorld).name.toUpperCase()}
              </button>
              <div>
                <span title="Spendable stars">
                  <Star size={16} />
                  {save.stars}
                  <small> stars</small>
                </span>
                <span title="Personal best">
                  <Mountain size={16} />
                  {save.best}
                  <small> m best</small>
                </span>
              </div>
            </div>
            {screen === "home" ? (
              <Home equipment={save.equipment} onNavigate={setScreen} />
            ) : (
              <section className={"subscreen expanded " + screen}>
                <button className="back" onClick={() => setScreen("home")}>
                  <ArrowLeft size={16} /> Back to your little sky
                </button>
                {screen === "levels" ? (
                  <JourneyLevels
                    save={save}
                    onDifficulty={() => {
                      setPlayMode("levels");
                      setScreen("journey");
                    }}
                    onStart={(id) => {
                      setLevelId(id);
                      setPlayMode("levels");
                      setScreen("game");
                    }}
                    onMusic={() => {
                      void update({ music: !save.music });
                    }}
                  />
                ) : screen === "journey" ? (
                  <>
                    <span className="eyebrow">
                      EVERY ADVENTURE STARTS WITH A LEAP
                    </span>
                    <h2>Choose Your Journey</h2>
                    <p>Find a pace that feels like you.</p>
                    <div
                      className="mode-picker"
                      role="group"
                      aria-label="Game mode"
                    >
                      <button
                        aria-pressed={playMode === "endless"}
                        onClick={() => setPlayMode("endless")}
                      >
                        Endless sky<small>Your familiar free climb</small>
                      </button>
                      <button
                        aria-pressed={playMode === "levels"}
                        onClick={() => setPlayMode("levels")}
                      >
                        Journey chapters<small>5 Cloud Garden levels</small>
                      </button>
                    </div>
                    {playMode === "endless" && (
                      <button
                        className="journey-world"
                        onClick={() => setScreen("worlds")}
                      >
                        <Flower2 size={14} />
                        {worldById(save.selectedWorld).name}
                        <small>Change sky →</small>
                      </button>
                    )}
                    <div className="difficulty-list">
                      {(["easy", "medium", "hard"] as Difficulty[]).map(
                        (d, i) => {
                          const Icon = [Leaf, Wind, Sparkles][i];
                          return (
                            <button
                              key={d}
                              className={
                                "difficulty " +
                                d +
                                (save.difficulty === d ? " selected" : "")
                              }
                              onClick={() => void update({ difficulty: d })}
                            >
                              <div className="difficulty-icon">
                                <Icon size={25} />
                              </div>
                              <div>
                                <small>
                                  {["EASY", "MEDIUM", "HARD"][i]} ·{" "}
                                  {modes[d].mult}× STARS
                                </small>
                                <h3>{modes[d].name}</h3>
                                <p>
                                  {
                                    [
                                      "Room to land. Time to daydream.",
                                      "A little drift, a little discovery.",
                                      "Brave little leaps into the unknown.",
                                    ][i]
                                  }
                                </p>
                              </div>
                              <span className="radio">
                                {save.difficulty === d && <Check size={13} />}
                              </span>
                            </button>
                          );
                        },
                      )}
                    </div>
                    <button
                      className="primary"
                      onClick={() =>
                        setScreen(playMode === "levels" ? "levels" : "game")
                      }
                    >
                      {playMode === "levels"
                        ? "Choose a chapter"
                        : "Start journey"}{" "}
                      <ArrowRight size={18} />
                    </button>
                    <p className="controls-note">
                      Auto-bounce, always. Hold either side to drift.
                      <br />
                      On a keyboard, use ← → or A / D.
                    </p>
                  </>
                ) : screen === "characters" ? (
                  <Boutique
                    stars={save.stars}
                    owned={save.owned}
                    equipment={save.equipment}
                    onPurchase={(id) => player.transact((s) => buyItem(s, id))}
                    onEquip={(id) => player.transact((s) => equipItem(s, id))}
                  />
                ) : screen === "worlds" ? (
                  <Worlds
                    save={save}
                    onSelect={(id) =>
                      player.transact((s) => selectWorld(s, id))
                    }
                    onPlay={() => {
                      setPlayMode("endless");
                      setScreen("journey");
                    }}
                  />
                ) : screen === "achievements" ? (
                  <Achievements
                    save={save}
                    onCollect={() => player.transact(collectMilestones)}
                  />
                ) : (
                  <>
                    <span className="eyebrow">MAKE YOURSELF AT HOME</span>
                    <h2>A few little comforts</h2>
                    <p>Set the mood for your next journey.</p>
                    <div className="setting-row">
                      {save.sound ? <Volume2 /> : <VolumeX />}
                      <div>
                        <h3>Gentle sounds</h3>
                        <p>Soft notes for little leaps & stars.</p>
                      </div>
                      <button
                        className={"toggle " + (save.sound ? "on" : "")}
                        role="switch"
                        aria-checked={save.sound}
                        aria-label="Gentle sounds"
                        onClick={() => void update({ sound: !save.sound })}
                      >
                        <i />
                      </button>
                    </div>
                    <div className="setting-row">
                      <Sparkles />
                      <div>
                        <h3>Jump-reactive music</h3>
                        <p>Soft chords, with every leap in harmony.</p>
                      </div>
                      <button
                        className={"toggle " + (save.music ? "on" : "")}
                        role="switch"
                        aria-checked={save.music}
                        aria-label="Jump-reactive music"
                        onClick={() => void update({ music: !save.music })}
                      >
                        <i />
                      </button>
                    </div>
                    <div className="help-card">
                      <h3>A little field guide</h3>
                      <p>
                        Hold the left or right half of the sky to drift. On
                        desktop, use arrow keys or A / D. Screen edges wrap.
                      </p>
                      <p>{worldById(save.selectedWorld).guide}</p>
                      <p>
                        A feather gives you 7 seconds of higher jumps. The HUD
                        shows your world and difficulty; pause for a breather
                        anytime.
                      </p>
                      <p>
                        Escape pauses your journey. Stars are saved when a run
                        ends. Restarting or leaving an unfinished journey
                        forfeits its stars.
                      </p>
                      <p>
                        Your outfit, purchases, milestones and progress are
                        saved in this browser. Spending stars never reduces
                        lifetime world progress.
                      </p>
                      <div className="save-summary">
                        <span>{save.stars} spendable stars</span>
                        <span>{save.lifetimeStars} lifetime stars</span>
                      </div>
                    </div>
                    {!player.storageAvailable && (
                      <p role="status">
                        Browser storage is unavailable. Progress lasts for this
                        visit only.
                      </p>
                    )}
                    <p className="gentle">
                      <Heart size={14} /> Made for small, peaceful moments.
                    </p>
                  </>
                )}
              </section>
            )}
            <div className="landscape">
              <div className="hill hill-back" />
              <div className="hill hill-front" />
              <div className="ground-flowers">
                ✿ <span>✧</span> ❀ <span>✿</span> ❀
              </div>
            </div>
          </>
        )}
      </main>
      <footer>
        <span>
          CLOUDBERRY <i>✦</i> A POCKETFUL OF WONDER
        </span>
        <span>Made for the joy of the journey.</span>
      </footer>
    </div>
  );
}
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
