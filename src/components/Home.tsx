import {
  ArrowRight,
  Shirt,
  Flower2,
  Settings,
  Heart,
  Trophy,
} from "lucide-react";
import type { Equipment } from "../catalog";
import CharacterPreview from "./CharacterPreview";
export default function Home({
  equipment,
  onNavigate,
}: {
  equipment: Equipment;
  onNavigate: (screen: string) => void;
}) {
  return (
    <section className="home">
      <div className="intro">
        <span className="eyebrow">
          <span /> A COZY CLIMBING ADVENTURE <span />
        </span>
        <h1>
          cloudberry<span className="title-star">✧</span>
        </h1>
        <p>A little leap. A lighter heart.</p>
      </div>
      <div className="hero-art">
        <div className="halo" />
        <span className="hero-spark hs1">✦</span>
        <span className="hero-spark hs2">✧</span>
        <span className="mini-star">★</span>
        <div className="bouncing">
          <CharacterPreview equipment={equipment} />
        </div>
        <div className="island">
          <i />
          <i />
          <i />
          <span>✿</span>
          <b>✿</b>
        </div>
        <div className="little-island li1" />
        <div className="little-island li2" />
      </div>
      <div className="home-actions">
        <button className="primary play" onClick={() => onNavigate("journey")}>
          Let's play <ArrowRight size={20} />
        </button>
        <button className="chapter-home" onClick={() => onNavigate("levels")}>
          <Flower2 size={17} />
          <span>
            Journey chapters
            <small>Five little paths through Cloud Garden</small>
          </span>
          <ArrowRight size={16} />
        </button>
        <div className="nav-cards">
          <button onClick={() => onNavigate("characters")}>
            <Shirt size={22} />
            <span>Characters</span>
          </button>
          <button onClick={() => onNavigate("worlds")}>
            <Flower2 size={22} />
            <span>Worlds</span>
          </button>
          <button onClick={() => onNavigate("settings")}>
            <Settings size={22} />
            <span>Settings</span>
          </button>
        </div>
        <button
          className="achievement-link"
          onClick={() => onNavigate("achievements")}
        >
          <Trophy size={15} /> Little milestones <ArrowRight size={14} />
        </button>
        <p className="gentle">
          <Heart size={13} /> No rush. Just a little higher.
        </p>
      </div>
    </section>
  );
}
