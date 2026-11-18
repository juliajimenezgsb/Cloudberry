import {
  Check,
  Lock,
  ArrowRight,
  Star,
  Flower2,
  Wind,
  Music2,
} from "lucide-react";
import { modes } from "../engine";
import { levels, isLevelOpen, type LevelId } from "../levels";
import type { PlayerSave } from "../progression";
export default function JourneyLevels({
  save,
  onStart,
  onMusic,
  onDifficulty,
}: {
  save: PlayerSave;
  onStart: (id: LevelId) => void;
  onMusic: () => void;
  onDifficulty: () => void;
}) {
  return (
    <>
      <span className="eyebrow">CLOUD GARDEN · FIVE LITTLE CHAPTERS</span>
      <h2>A path through the clouds</h2>
      <p>One little destination at a time.</p>
      <button className="chapter-difficulty" onClick={onDifficulty}>
        {modes[save.difficulty].name}
        <small>Change difficulty →</small>
      </button>
      <div className="journey-intro">
        <Flower2 size={24} />
        <span>
          Follow the flower trail.
          <small>
            Clear each garden to open the next. First clears earn stars; the
            final garden also earns a Daisy Crown.
          </small>
        </span>
      </div>
      <button
        className={"music-pill " + (save.music ? "on" : "")}
        role="switch"
        aria-checked={save.music}
        onClick={onMusic}
      >
        <Music2 size={14} />
        {save.music ? "Jump-reactive music on" : "Jump-reactive music off"}
        <span>{save.music ? "Turn off" : "Turn on"}</span>
      </button>
      <div className="level-list">
        {levels.map((level) => {
          const complete = save.completedLevels.includes(level.id),
            open = isLevelOpen(level.id, save.completedLevels);
          return (
            <article
              key={level.id}
              className={
                "level-card " +
                (!open ? "locked " : "") +
                (complete ? "cleared" : "")
              }
            >
              <div className="level-number">
                {complete ? (
                  <Check size={19} />
                ) : open ? (
                  String(level.number).padStart(2, "0")
                ) : (
                  <Lock size={16} />
                )}
              </div>
              <div className="level-copy">
                <small>
                  {complete
                    ? "A LOVELY LITTLE KEEPSAKE"
                    : `CHAPTER ${level.number}`}
                </small>
                <h3>{level.name}</h3>
                <p>{level.description}</p>
                <div className="level-goals">
                  <span>
                    <Star size={11} />
                    {level.stars} stars
                  </span>
                  {level.flowers > 0 && (
                    <span>
                      <Flower2 size={11} />
                      {level.flowers} bounces
                    </span>
                  )}
                  {level.gusts > 0 && (
                    <span>
                      <Wind size={11} />
                      {level.gusts} breeze
                    </span>
                  )}
                </div>
                <div className="level-reward">
                  {complete
                    ? `Best ${save.levelBests[level.id] || 0}m · first-clear reward collected`
                    : `First clear: +${level.reward} stars${level.cosmetic ? " + Daisy Crown" : ""}`}
                </div>
                <button
                  className="level-start"
                  disabled={!open}
                  onClick={() => onStart(level.id)}
                >
                  {!open
                    ? "Complete the previous chapter"
                    : complete
                      ? "Wander again"
                      : "Begin this chapter"}
                  {open && <ArrowRight size={15} />}
                </button>
              </div>
            </article>
          );
        })}
      </div>
      <p className="controls-note">
        Your selected difficulty applies to every chapter.
        <br />
        At the finish garden, you can collect any missed goal stars.
      </p>
    </>
  );
}
