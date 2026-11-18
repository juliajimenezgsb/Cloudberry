import { useState } from "react";
import { Check, Lock, ArrowRight, Star, Mountain } from "lucide-react";
import { worlds, worldById } from "../worlds";
import type { PlayerSave, WorldId, TransactionResult } from "../progression";
export default function Worlds({
  save,
  onSelect,
  onPlay,
}: {
  save: PlayerSave;
  onSelect: (id: WorldId) => Promise<TransactionResult>;
  onPlay: () => void;
}) {
  const [preview, setPreview] = useState<WorldId>(save.selectedWorld),
    world = worldById(preview),
    open = save.unlockedWorlds.includes(preview),
    stats = save.stats[preview];
  return (
    <>
      <span className="eyebrow">FOUR LITTLE CORNERS OF WONDER</span>
      <h2>Where shall we wander?</h2>
      <p>Your lifetime stars open new skies.</p>
      <div className="lifetime-progress">
        <Star size={15} />
        <strong>{save.lifetimeStars.toLocaleString()}</strong> lifetime stars{" "}
        <span>Spending never sets you back.</span>
      </div>
      <div className="world-grid">
        {worlds.map((w) => {
          const unlocked = save.unlockedWorlds.includes(w.id),
            selected = save.selectedWorld === w.id;
          return (
            <button
              key={w.id}
              className={
                "world-option " + w.id + (preview === w.id ? " previewing" : "")
              }
              onClick={() => setPreview(w.id)}
              aria-pressed={preview === w.id}
            >
              <div
                className={"world-art " + w.id}
                style={{
                  background: `linear-gradient(155deg,${w.sky[0]},${w.sky[1]})`,
                }}
              >
                <span className="world-orb" />
                <span className="world-mini-cloud" />
                <span className="world-mini-cloud second" />
                <span className="world-mini-hill" />
                <span className="world-twinkle">✧</span>
                {w.id === "garden" && <span className="world-flower">✿</span>}
                {w.id === "sunset" && <div className="world-roofs" />}
                {w.id === "moonlight" && (
                  <span className="world-mushroom">♧</span>
                )}
                {w.id === "starlight" && <span className="world-planet" />}
                <span className="world-state">
                  {selected ? (
                    <>
                      <Check size={10} /> Selected
                    </>
                  ) : unlocked ? (
                    "Open sky"
                  ) : (
                    <>
                      <Lock size={10} />
                      {w.requirement.toLocaleString()} ★
                    </>
                  )}
                </span>
              </div>
              <div className="world-option-caption">
                <h3>{w.name}</h3>
                <p>{w.mechanics[0]}</p>
              </div>
            </button>
          );
        })}
      </div>
      <div className="world-details">
        <span className="eyebrow">
          {open ? "YOUR NEXT LITTLE ESCAPE" : "A LITTLE MORE WONDER AWAITS"}
        </span>
        <h3>{world.name}</h3>
        <p>{world.tagline}</p>
        <div className="mechanic-pills">
          {world.mechanics.map((m) => (
            <span key={m}>{m}</span>
          ))}
        </div>
        <p className="world-guide">{world.guide}</p>
        <div className="world-stats">
          <span>
            <Mountain size={15} />
            <strong>{stats.best}m</strong>
            <small>Personal best</small>
          </span>
          <span>
            <Star size={15} />
            <strong>{stats.stars}</strong>
            <small>{world.collectible}</small>
          </span>
        </div>
        {!open && (
          <>
            <div className="progress-track">
              <div
                style={{
                  width:
                    Math.min(
                      100,
                      (save.lifetimeStars / world.requirement) * 100,
                    ) + "%",
                }}
              />
            </div>
            <p className="unlock-requirement">
              {save.lifetimeStars.toLocaleString()} /{" "}
              {world.requirement.toLocaleString()} lifetime stars · unlocks
              automatically
            </p>
          </>
        )}
        <button
          className="primary"
          disabled={!open}
          onClick={async () => {
            const result = await onSelect(preview);
            if (result.ok) onPlay();
          }}
        >
          {!open ? (
            <>
              <Lock size={15} />
              {(world.requirement - save.lifetimeStars).toLocaleString()} stars
              to this sky
            </>
          ) : (
            <>
              {save.selectedWorld === preview
                ? "Journey here"
                : "Select & journey"}
              <ArrowRight size={17} />
            </>
          )}
        </button>
      </div>
    </>
  );
}
