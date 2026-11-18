import { useState } from "react";
import { Trophy, Star, Check, Lock } from "lucide-react";
import { achievements, achievementProgress } from "../achievements";
import { worlds } from "../worlds";
import type { PlayerSave, TransactionResult } from "../progression";
export default function Achievements({
  save,
  onCollect,
}: {
  save: PlayerSave;
  onCollect: () => Promise<TransactionResult>;
}) {
  const [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  const unclaimed = achievements.some(
    (a) =>
      achievementProgress(save, a) >= a.target &&
      !save.claimedAchievements.includes(a.id),
  );
  return (
    <>
      <span className="eyebrow">SMALL LEAPS BECOME LOVELY STORIES</span>
      <h2>Little milestones</h2>
      <p>A keepsake for every kind of wanderer.</p>
      <div className="milestone-summary">
        <Trophy size={23} />
        <strong>
          {save.claimedAchievements.length} / {achievements.length}
        </strong>
        <span>little wonders celebrated</span>
      </div>
      {unclaimed && (
        <button
          className="primary milestone-claim"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            try {
              const r = await onCollect();
              setMessage(r.message);
            } finally {
              setBusy(false);
            }
          }}
        >
          <Star size={15} /> Collect completed milestone rewards
        </button>
      )}
      {message && <p role="status">{message}</p>}
      <p className="milestone-note">
        Rewards arrive automatically when your journey ends.
        <br />
        Each milestone gives bonus stars once, forever.
      </p>
      <div className="achievement-groups">
        {worlds.map((w) => (
          <section key={w.id}>
            <h3>
              <span style={{ background: w.platform }} />
              {w.name}
              {!save.unlockedWorlds.includes(w.id) && <Lock size={12} />}
            </h3>
            {achievements
              .filter((a) => a.world === w.id)
              .map((a) => {
                const progress = achievementProgress(save, a),
                  complete = save.claimedAchievements.includes(a.id);
                return (
                  <div
                    key={a.id}
                    className={"achievement " + (complete ? "complete" : "")}
                  >
                    <span className="achievement-icon">
                      {complete ? <Check size={17} /> : <Trophy size={17} />}
                    </span>
                    <div className="achievement-copy">
                      <h4>{a.name}</h4>
                      <p>{a.description}</p>
                      <div className="progress-track">
                        <div
                          style={{ width: (progress / a.target) * 100 + "%" }}
                        />
                      </div>
                      <small>
                        {complete
                          ? "A lovely achievement, celebrated."
                          : `${progress.toLocaleString()} / ${a.target.toLocaleString()}`}
                      </small>
                    </div>
                    <span className="achievement-reward">
                      {complete ? <Check size={11} /> : <Star size={11} />}+
                      {a.reward}
                    </span>
                  </div>
                );
              })}
          </section>
        ))}
      </div>
    </>
  );
}
