import type { ReactNode } from "react";
import { View } from "react-native";
import { ButtonPrimary } from "@/components/Buttons/ButtonPrimary";
import { ButtonSecondary } from "@/components/Buttons/ButtonSecondary";
import { LookCard } from "@/components/Cards/LookCard";
import { OutfitCard } from "@/components/Cards/OutfitCard";
import { ClosetView } from "@/components/Closet/ClosetView";
import { ChipRow } from "@/components/Chips/ChipRow";
import { ItemTile } from "@/components/Items/ItemTile";
import { IdeasGrid } from "@/components/Ideas/IdeasGrid";
import { ColorBlocks } from "@/components/Layout/ColorBlocks";
import { flatLaySlotsOf, flatLaySlotsOfLocked, OutfitFlatLay } from "@/components/Outfit/OutfitFlatLay";
import { ItemMeter } from "@/components/Status/ItemMeter";
import { SegmentedProgress } from "@/components/Status/SegmentedProgress";
import { LOOKS } from "@/content/looks";
import type { Idea, Item, LockedIdea, Outfit } from "@/services/api/types";

/** Dev-only previews of this PR's UI, opened from the floating "Preview" button (coding-conventions). Mock data only. */
export type Preview = { title: string; render: () => ReactNode };

const item = (id: string, name: string, category: Item["category"], subcategory: string, primaryColor: Item["primaryColor"], pattern: Item["pattern"] = "solid"): Item => ({
  id,
  name,
  category,
  subcategory,
  primaryColor,
  pattern,
  source: "starter",
  formality: 3,
  warmth: 2,
  seasons: ["autumn"],
  occasions: ["work"],
  createdAt: new Date(0).toISOString(),
});

export const mockItems: Item[] = [
  item("i1", "White oxford shirt", "top", "shirt", "white"),
  item("i2", "Navy chinos", "bottom", "chinos", "navy"),
  item("i3", "Brown loafers", "shoes", "loafers", "brown"),
  item("i4", "Camel coat", "outerwear", "coat", "camel"),
  item("i5", "Blue striped shirt", "top", "shirt", "white", "stripe"),
  item("i6", "Black midi dress", "dress", "midi", "black"),
  item("i7", "Silver watch", "accessory", "watch", "grey"),
  item("i8", "White sneakers", "shoes", "sneakers", "white"),
];

/** Closet previews + tests: a women-first closet with distinct `createdAt`s (newest last). */
export const closetMockItems: Item[] = [
  ...mockItems,
  item("i9", "Blush tie blouse", "top", "blouse", "pink"),
  item("i10", "Black midi skirt", "bottom", "skirt", "black"),
  item("i11", "Black ballet flats", "shoes", "flats", "black"),
  item("i12", "Tan leather tote", "accessory", "tote", "camel"),
  item("i13", "Grey merino knit", "top", "knit", "grey"),
  item("i14", "Straight blue jeans", "bottom", "jeans", "blue"),
].map((i, n) => ({ ...i, createdAt: new Date(Date.UTC(2026, 10, 1, 0, n)).toISOString() }));

export const mockOutfit: Outfit = {
  id: "o1",
  date: "2026-11-07",
  occasion: "work",
  score: 84,
  reason: "Navy + camel reads sharp for work; the camel coat ties it together.",
  template: "separates_layered",
  status: "suggested",
  items: [
    { slot: "top", item: mockItems[0] },
    { slot: "bottom", item: mockItems[1] },
    { slot: "shoes", item: mockItems[2] },
    { slot: "outerwear", item: mockItems[3] },
  ],
};

/** Ideas (#9): two free ideas (one layered, one with a dress) and two locked silhouettes. */
export const mockIdeas: Idea[] = [
  { key: "i1+i2+i3+i4", template: "separates_layered", score: 84, reason: mockOutfit.reason, items: mockOutfit.items },
  {
    key: "i6+i7+i8",
    template: "dress",
    score: 78,
    reason: "Black head to toe reads polished for an event.",
    items: [
      { slot: "dress", item: mockItems[5] },
      { slot: "shoes", item: mockItems[7] },
      { slot: "accessory", item: mockItems[6] },
    ],
  },
];

export const mockLockedIdeas: LockedIdea[] = [
  { key: "locked-1", template: "separates", slots: [{ slot: "top", category: "top", subcategory: "knit" }, { slot: "bottom", category: "bottom", subcategory: "jeans" }, { slot: "shoes", category: "shoes", subcategory: "sneakers" }] },
  { key: "locked-2", template: "separates_layered", slots: [{ slot: "outerwear", category: "outerwear", subcategory: "blazer" }, { slot: "top", category: "top", subcategory: "shirt" }, { slot: "bottom", category: "bottom", subcategory: "trousers" }, { slot: "shoes", category: "shoes", subcategory: "loafers" }] },
];

export const previews: Preview[] = [
  { title: "Outfit — half-and-half flat-lay", render: () => <OutfitFlatLay slots={flatLaySlotsOf(mockOutfit.items)} width={280} /> },
  { title: "Outfit — locked silhouette", render: () => <OutfitFlatLay slots={flatLaySlotsOfLocked(mockLockedIdeas[1].slots)} width={200} ghost /> },
  { title: "Ideas — grid (liked + locked)", render: () => <IdeasGrid ideas={mockIdeas} locked={mockLockedIdeas} selected={[mockIdeas[0].key]} width={340} onToggle={() => undefined} onOpen={() => undefined} onUnlock={() => undefined} /> },
  { title: "Today — outfit card", render: () => <OutfitCard outfit={mockOutfit} onWear={() => undefined} onSave={() => undefined} onFeedback={() => undefined} /> },
  {
    title: "Today — card on color blocks",
    render: () => (
      <ColorBlocks colors={mockOutfit.items.map((i) => i.item.primaryColor)} style={{ borderRadius: 26, padding: 16 }}>
        <OutfitCard outfit={{ ...mockOutfit, status: "worn" }} />
      </ColorBlocks>
    ),
  },
  { title: "Onboarding — look card", render: () => <LookCard look={LOOKS[2]} /> },
  { title: "Onboarding — progress 7 / 20", render: () => <SegmentedProgress index={7} total={20} label="7 of 20" /> },
  {
    title: "Items — sticker tiles",
    render: () => (
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {mockItems.map((i, n) => (
          <ItemTile key={i.id} garment={i} label thickCut selected={n % 3 === 0} onPress={() => undefined} />
        ))}
      </View>
    ),
  },
  { title: "Closet — item meter", render: () => <ItemMeter count={23} limit={50} /> },
  { title: "Chips — occasions", render: () => <ChipRow options={[{ value: "work", label: "Work" }, { value: "friends", label: "Friends" }, { value: "date", label: "Date" }]} value="work" onChange={() => undefined} /> },
  {
    title: "Buttons — chunky",
    render: () => (
      <View style={{ gap: 12 }}>
        <ButtonPrimary label="Build my outfits" onPress={() => undefined} />
        <ButtonSecondary label="Pass" onPress={() => undefined} />
        <ButtonPrimary label="Loading" onPress={() => undefined} loading />
      </View>
    ),
  },
  {
    title: "Closet — wardrobe grid, 3 new to check",
    render: () => <ClosetView items={closetMockItems} itemCount={closetMockItems.length} itemLimit={50} toCheckCount={3} onOpenItem={() => undefined} onAddBasics={() => undefined} onCheckNew={() => undefined} />,
  },
  { title: "Closet — Pro (unlimited)", render: () => <ClosetView items={closetMockItems} itemCount={closetMockItems.length} itemLimit={null} toCheckCount={0} onOpenItem={() => undefined} onAddBasics={() => undefined} /> },
  { title: "Closet — empty", render: () => <ClosetView items={[]} itemCount={0} itemLimit={50} toCheckCount={0} onOpenItem={() => undefined} onAddBasics={() => undefined} /> },
];
