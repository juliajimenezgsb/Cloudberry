export type Category =
  "characters" | "colors" | "hats" | "outfits" | "accessories";
export type Slot = "character" | "color" | "hat" | "outfit" | "accessory";
export type Equipment = Record<Slot, string>;
export type Cosmetic = {
  id: string;
  category: Category;
  slot: Slot;
  name: string;
  price: number;
  description: string;
  swatch?: string;
};
export const categories: { id: Category; name: string; slot: Slot }[] = [
  { id: "characters", name: "Characters", slot: "character" },
  { id: "colors", name: "Colors", slot: "color" },
  { id: "hats", name: "Hats", slot: "hat" },
  { id: "outfits", name: "Outfits", slot: "outfit" },
  { id: "accessories", name: "Accessories", slot: "accessory" },
];
const item = (
  id: string,
  category: Category,
  slot: Slot,
  name: string,
  price: number,
  description: string,
  swatch?: string,
): Cosmetic => ({ id, category, slot, name, price, description, swatch });
export const catalog: Cosmetic[] = [
  item(
    "berri",
    "characters",
    "character",
    "Berri the Bunny",
    0,
    "A floppy-eared friend who follows the flowers.",
  ),
  item(
    "mochi",
    "characters",
    "character",
    "Mochi the Cat",
    400,
    "A fluffy daydreamer with a curious little smile.",
  ),
  item(
    "pip",
    "characters",
    "character",
    "Pip the Bear",
    500,
    "A soft teddy with a heart full of honey.",
  ),
  item(
    "clover",
    "characters",
    "character",
    "Clover the Frog",
    600,
    "Big eyes, tiny toes, and a very happy hop.",
  ),
  item(
    "puff",
    "characters",
    "character",
    "Puff the Cloud",
    800,
    "A pocket of sky with a rosy-cheeked smile.",
  ),
  item(
    "lavender",
    "colors",
    "color",
    "Lavender",
    0,
    "A little lavender daydream.",
    "#eee4ff",
  ),
  item(
    "blush",
    "colors",
    "color",
    "Blush Pink",
    50,
    "The color of a shy little smile.",
    "#f8d9d9",
  ),
  item(
    "butter",
    "colors",
    "color",
    "Butter Yellow",
    50,
    "A spoonful of gentle sunshine.",
    "#f6e7ad",
  ),
  item(
    "sage",
    "colors",
    "color",
    "Sage Green",
    50,
    "Fresh from a peaceful little garden.",
    "#dcebd7",
  ),
  item(
    "powder",
    "colors",
    "color",
    "Powder Blue",
    50,
    "A clear-sky kind of blue.",
    "#d5e9f5",
  ),
  item(
    "cream",
    "colors",
    "color",
    "Warm Cream",
    50,
    "Warm milk and a cozy morning.",
    "#f6eddb",
  ),
  item(
    "hat-none",
    "hats",
    "hat",
    "Just your ears",
    0,
    "A little breeze through your ears.",
  ),
  item(
    "bow",
    "hats",
    "hat",
    "Little Bow",
    100,
    "A petal-pink ribbon, tied with love.",
  ),
  item(
    "mushroom",
    "hats",
    "hat",
    "Mushroom Hat",
    150,
    "A tiny toadstool for a woodland wanderer.",
  ),
  item(
    "daisy",
    "hats",
    "hat",
    "Daisy Crown",
    150,
    "Fresh-picked flowers for your little crown.",
  ),
  item(
    "headband",
    "hats",
    "hat",
    "Star Headband",
    175,
    "A pair of stars to light the way.",
  ),
  item(
    "beanie",
    "hats",
    "hat",
    "Cozy Beanie",
    200,
    "A warm knit with a fluffy little pom-pom.",
  ),
  item(
    "outfit-none",
    "outfits",
    "outfit",
    "Simply you",
    0,
    "Your everyday, perfectly lovely self.",
  ),
  item(
    "sweater",
    "outfits",
    "outfit",
    "Oversized Sweater",
    250,
    "Big sleeves for small adventures.",
  ),
  item(
    "overalls",
    "outfits",
    "outfit",
    "Little Overalls",
    275,
    "Powder-blue pockets for treasures.",
  ),
  item(
    "strawberry",
    "outfits",
    "outfit",
    "Strawberry Outfit",
    300,
    "A sweet berry suit with golden seeds.",
  ),
  item(
    "pajamas",
    "outfits",
    "outfit",
    "Cloud Pajamas",
    325,
    "Sleepy little clouds, all day long.",
  ),
  item(
    "cape",
    "outfits",
    "outfit",
    "Starry Cape",
    400,
    "A lilac cape dusted with starlight.",
  ),
  item(
    "accessory-none",
    "accessories",
    "accessory",
    "Travel light",
    0,
    "All you need is a little curiosity.",
  ),
  item(
    "backpack",
    "accessories",
    "accessory",
    "Tiny Backpack",
    150,
    "Bring a snack and a little wonder.",
  ),
  item(
    "wings",
    "accessories",
    "accessory",
    "Angel Wings",
    250,
    "Feather-soft wings. Just for dress-up!",
  ),
  item(
    "glasses",
    "accessories",
    "accessory",
    "Heart-Shaped Glasses",
    200,
    "See the lovely in everything.",
  ),
  item(
    "scarf",
    "accessories",
    "accessory",
    "Mini Scarf",
    175,
    "A warm hug for a breezy day.",
  ),
  item(
    "clip",
    "accessories",
    "accessory",
    "Flower Hair Clip",
    150,
    "One small flower, one big smile.",
  ),
];
export const defaultEquipment: Equipment = {
  character: "berri",
  color: "lavender",
  hat: "hat-none",
  outfit: "outfit-none",
  accessory: "accessory-none",
};
export const defaultOwned = catalog
  .filter((i) => i.price === 0)
  .map((i) => i.id);
export const findCosmetic = (id: string) => catalog.find((i) => i.id === id);
export function fitEquipment(
  equipment: Equipment,
  id: string,
): { equipment: Equipment; note: string } {
  const i = findCosmetic(id);
  if (!i) return { equipment, note: "" };
  const next = { ...equipment, [i.slot]: id };
  let note = "";
  // Reserve the head decoration and back silhouette so wearables remain legible.
  if (i.slot === "hat" && id !== "hat-none" && next.accessory === "clip") {
    next.accessory = "accessory-none";
    note = "Flower clip set aside to make room for your hat.";
  }
  if (id === "clip" && next.hat !== "hat-none") {
    next.hat = "hat-none";
    note = "Hat set aside for your little flower.";
  }
  if (id === "cape" && ["backpack", "wings"].includes(next.accessory)) {
    next.accessory = "accessory-none";
    note = "Back accessory set aside so your cape can flutter.";
  }
  if (["backpack", "wings"].includes(id) && next.outfit === "cape") {
    next.outfit = "outfit-none";
    note = "Cape set aside for your back accessory.";
  }
  return { equipment: next, note };
}
