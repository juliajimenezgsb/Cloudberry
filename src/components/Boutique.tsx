import { useState } from "react";
import { Check, Star, Lock, Sparkles } from "lucide-react";
import {
  catalog,
  categories,
  defaultEquipment,
  fitEquipment,
  findCosmetic,
  type Category,
  type Equipment,
} from "../catalog";
import CharacterPreview from "./CharacterPreview";
export type BoutiqueAction = (
  id: string,
) => Promise<{ ok: boolean; message: string }>;
export default function Boutique({
  stars,
  owned,
  equipment,
  onPurchase,
  onEquip,
}: {
  stars: number;
  owned: string[];
  equipment: Equipment;
  onPurchase: BoutiqueAction;
  onEquip: BoutiqueAction;
}) {
  const [category, setCategory] = useState<Category>("characters"),
    [selected, setSelected] = useState(equipment.character),
    [preview, setPreview] = useState(equipment),
    [message, setMessage] = useState(""),
    [celebrate, setCelebrate] = useState(false),
    [busy, setBusy] = useState(false);
  const item = findCosmetic(selected)!,
    isOwned = owned.includes(item.id),
    equipped = equipment[item.slot] === item.id;
  function choose(id: string) {
    setSelected(id);
    setPreview((p) => fitEquipment(p, id).equipment);
    setMessage("");
    setCelebrate(false);
  }
  async function act() {
    if (busy) return;
    setBusy(true);
    try {
      const result = await (isOwned ? onEquip(item.id) : onPurchase(item.id));
      setMessage(result.message);
      if (result.ok) {
        setCelebrate(!isOwned);
        if (isOwned) setPreview(fitEquipment(equipment, item.id).equipment);
      }
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <span className="eyebrow">A LITTLE SOMETHING THAT’S SO YOU</span>
      <div className="section-heading">
        <h2>The Little Boutique</h2>
        <span className="balance">
          <Star size={15} />
          {stars}
        </span>
      </div>
      <p className="section-subtitle">Try a little wonder on.</p>
      <div className={"boutique-stage" + (celebrate ? " unlocked" : "")}>
        <div className="boutique-arch" />
        <span className="boutique-spark bs1">✧</span>
        <span className="boutique-spark bs2">✦</span>
        <CharacterPreview equipment={preview} />
        <span className="preview-label">
          {celebrate ? "A lovely new treasure!" : "DRESSING ROOM · PREVIEW"}
        </span>
        {celebrate && (
          <div className="confetti" aria-hidden="true">
            ✦ ✧ ✦ ✧ ✦
          </div>
        )}
      </div>
      <div
        className="boutique-tabs"
        role="tablist"
        aria-label="Boutique categories"
      >
        {categories.map((c) => (
          <button
            key={c.id}
            role="tab"
            aria-selected={category === c.id}
            onClick={() => {
              setCategory(c.id);
              setSelected(preview[c.slot]);
              setMessage("");
              setCelebrate(false);
            }}
          >
            {c.name}
          </button>
        ))}
      </div>
      <div
        className="item-collection"
        role="tabpanel"
        aria-label={category + " collection"}
      >
        {catalog
          .filter((i) => i.category === category)
          .map((i) => {
            const eq = equipment[i.slot] === i.id,
              own = owned.includes(i.id);
            const itemPreview = fitEquipment(
              category === "characters"
                ? { ...defaultEquipment, color: preview.color }
                : preview,
              i.id,
            ).equipment;
            return (
              <button
                key={i.id}
                className={
                  "boutique-item" + (selected === i.id ? " active" : "")
                }
                onClick={() => choose(i.id)}
                aria-pressed={selected === i.id}
              >
                <span className="item-picture">
                  {category === "colors" ? (
                    <span className="swatch" style={{ background: i.swatch }} />
                  ) : (
                    <CharacterPreview
                      equipment={itemPreview}
                      small
                      animate={false}
                    />
                  )}
                </span>
                <strong>{i.name}</strong>
                <span className="item-price">
                  {eq ? (
                    <>
                      <Check size={11} /> Equipped
                    </>
                  ) : own ? (
                    "Owned"
                  ) : (
                    <>
                      <Star size={11} />
                      {i.price}
                    </>
                  )}
                </span>
                {!own && <Lock className="item-lock" size={11} />}
              </button>
            );
          })}
      </div>
      <div className="purchase-panel">
        <div>
          <h3>{item.name}</h3>
          <p>{item.description}</p>
        </div>
        <button
          className="primary"
          disabled={busy || equipped || (isOwned ? false : stars < item.price)}
          onClick={act}
        >
          {equipped ? (
            <>
              <Check size={16} /> Equipped
            </>
          ) : isOwned ? (
            "Equip"
          ) : stars < item.price ? (
            <>
              <Lock size={14} /> Need {item.price - stars} more stars
            </>
          ) : (
            <>
              <Star size={16} /> Unlock for {item.price}
            </>
          )}
        </button>
        {!isOwned && (
          <small>Unlock first, then equip. Every item is cosmetic.</small>
        )}
        <p className="shop-message" role="status">
          {message ||
            "Preview freely. Your saved outfit stays on until you equip."}
        </p>
      </div>
      <button
        className="text-button reset-preview"
        onClick={() => {
          setPreview(equipment);
          setSelected(
            equipment[categories.find((c) => c.id === category)!.slot],
          );
          setMessage("Back to your equipped look.");
        }}
      >
        <Sparkles size={14} /> Show my equipped look
      </button>
    </>
  );
}
