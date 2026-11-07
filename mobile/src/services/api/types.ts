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

export type ItemPatch = Partial<Pick<GarmentTags, "name" | "subcategory" | "primaryColor" | "secondaryColor" | "pattern" | "material" | "formality" | "warmth" | "seasons" | "occasions">>;

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
