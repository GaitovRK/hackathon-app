export type AuthResponse = { token: string; userId: string };

export type MeResponse = { userId: string; isPro: boolean; freeLeftToday: number; itemCount: number; itemLimit: number | null };

export type GenerationStatus = "queued" | "running" | "done" | "failed";

export type GenerationInput = { prompt: string };

export type Generation = {
  id: string;
  model: string;
  input: GenerationInput;
  status: GenerationStatus;
  resultUrl?: string | null;
  error?: string | null;
  createdAt: string;
};

export type CreateGenerationRequest = { model: string; input: GenerationInput };

/** 402 codes that open the paywall. */
export type PaywallCode = "QUOTA_EXCEEDED" | "ITEM_LIMIT" | "REFRESH_LIMIT";
export const PAYWALL_CODES: ReadonlySet<string> = new Set<PaywallCode>(["QUOTA_EXCEEDED", "ITEM_LIMIT", "REFRESH_LIMIT"]);

/** Body of a 402. */
export type PaywallError = { code: PaywallCode; message?: string; limit?: number | null; count?: number };

export const isFinished = (status: GenerationStatus | undefined) => status === "done" || status === "failed";

// ---------- Closet ----------

export type DressCode = "formal" | "smart_casual" | "casual" | "creative";
export type Wardrobe = "menswear" | "womenswear" | "both";
export type ItemCategory = "top" | "bottom" | "dress" | "outerwear" | "shoes" | "accessory";
export type ItemSource = "starter" | "photo";
export type GarmentColor =
  | "white" | "black" | "grey" | "navy" | "beige" | "camel" | "brown" | "olive" | "blue" | "light_blue"
  | "red" | "burgundy" | "pink" | "green" | "yellow" | "orange" | "purple" | "cream";
export type Pattern = "solid" | "stripe" | "check" | "print" | "texture";
export type Season = "spring" | "summer" | "autumn" | "winter";
export type Occasion = "work" | "friends" | "date" | "event" | "casual" | "sport" | "travel";
export type OutfitSlot = ItemCategory;
export type OutfitTemplate = "separates" | "separates_layered" | "dress" | "dress_layered";
export type OutfitStatus = "suggested" | "saved" | "worn";
export type FeedbackValue = "like" | "dislike";

export const DRESS_CODES: DressCode[] = ["formal", "smart_casual", "casual", "creative"];
/** Onboarding order: womenswear first and pre-selected (decision #2: women first, then men). */
export const WARDROBES: Wardrobe[] = ["womenswear", "menswear", "both"];
export const CATEGORIES: ItemCategory[] = ["top", "bottom", "dress", "outerwear", "shoes", "accessory"];
export const OCCASIONS: Occasion[] = ["work", "friends", "date", "event", "casual", "sport", "travel"];
export const GARMENT_COLORS: GarmentColor[] = ["white", "black", "grey", "navy", "beige", "camel", "brown", "olive", "blue", "light_blue", "red", "burgundy", "pink", "green", "yellow", "orange", "purple", "cream"];

/** Tags shared by starter items, closet items and look items. */
export type GarmentTags = {
  name: string;
  category: ItemCategory;
  subcategory: string;
  primaryColor: GarmentColor;
  secondaryColor?: GarmentColor | null;
  pattern: Pattern;
  material?: string | null;
  formality: number;
  warmth: number;
  seasons: Season[];
  occasions: Occasion[];
};

export type StarterItem = GarmentTags & { starterKey: string; wardrobe: Wardrobe };

export type Look = { id: string; title: string; starterKeys: string[]; wardrobe: Wardrobe };

export type StarterCatalogResponse = { items: StarterItem[]; looks: Look[] };

export type Item = GarmentTags & {
  id: string;
  source: ItemSource;
  imageUrl?: string | null;
  starterKey?: string | null;
  archivedAt?: string | null;
  createdAt: string;
};

export type ItemPatch = Partial<Pick<GarmentTags, "name" | "category" | "subcategory" | "primaryColor" | "secondaryColor" | "pattern" | "material" | "formality" | "warmth" | "seasons" | "occasions">>;

/**
 * `POST /items/photo` (201): one flat-lay cutout item per garment found in the photo (max 4);
 * `tagged: false` = the AI could not tell what it is (one default item, user picks a category).
 */
export type ItemPhotoResponse = { items: Item[]; tagged: boolean };

/** A picked photo to upload (local file URI from expo-image-picker). */
export type ItemPhotoUpload = { uri: string; mimeType?: string | null; fileName?: string | null };

export type StyleSwipe = { lookId: string; liked: boolean };

export type StyleProfile = {
  id: string;
  dressCode: DressCode;
  city: string | null;
  wardrobe: Wardrobe;
  onboardedAt: string | null;
  swipes: StyleSwipe[];
};

export type StyleProfileUpdate = { dressCode?: DressCode; city?: string | null; wardrobe?: Wardrobe; onboarded?: boolean };

export type OutfitItem = { slot: OutfitSlot; item: Item };

export type Outfit = {
  id: string;
  date: string;
  occasion: Occasion;
  score: number;
  reason: string;
  template: OutfitTemplate;
  status: OutfitStatus;
  items: OutfitItem[];
};

export type TodayResponse = { date: string; occasion: Occasion; outfits: Outfit[]; refreshesLeft: number; closetTooSmall: boolean };

export type TodayRequest = { occasion: Occasion; date: string; refresh?: boolean };

/** Local calendar day as YYYY-MM-DD (the server's "today" for this user). */
export function localDate(d: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// ---------- Outfit ideas (#9) ----------

export type Vibe = "sharp" | "relaxed" | "bold";
export const VIBES: Vibe[] = ["sharp", "relaxed", "bold"];

/** The quick questions (board 05): what for, vibe, formality 1–5. */
export type IdeasRequest = { occasion: Occasion; vibe: Vibe; formality: number; date?: string };

/** An idea shown in full; `key` is the sorted item-id key (nothing is persisted until saved). */
export type Idea = { key: string; template: OutfitTemplate; score: number; reason: string; items: OutfitItem[] };

/** A Pro-only idea as a Free user sees it: shapes for a grey silhouette, no ids / names / colors. */
export type LockedSlot = { slot: OutfitSlot; category: ItemCategory; subcategory: string };
export type LockedIdea = { key: string; template: OutfitTemplate; slots: LockedSlot[] };

export type IdeasResponse = {
  date: string;
  occasion: Occasion;
  vibe: Vibe;
  formality: number;
  isPro: boolean;
  ideas: Idea[];
  locked: LockedIdea[];
  lockedCount: number;
  freeVisible: number;
  proMax: number;
  closetTooSmall: boolean;
};

export type SaveIdea = { template: OutfitTemplate; itemIds: string[] };
export type SaveManyRequest = { occasion?: Occasion; date?: string; ideas: SaveIdea[] };

/** The template an item set needs: a dress or separates, layered when outerwear is in. */
export function templateFor(items: Pick<Item, "category">[]): OutfitTemplate {
  const has = (c: ItemCategory) => items.some((i) => i.category === c);
  const base = has("dress") ? "dress" : "separates";
  return has("outerwear") ? `${base}_layered` : base;
}
