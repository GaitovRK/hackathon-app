import { LOOKS } from "@/content/looks";
import { WOMEN_SHAPES } from "./garmentPaths.women";
import { SHAPES, shapeFor } from "./garmentShapes";

describe("womenswear garment shapes", () => {
  it("are registered in the shape map", () => {
    for (const [key, shape] of Object.entries(WOMEN_SHAPES)) expect(SHAPES[key as keyof typeof SHAPES]).toBe(shape);
  });

  it("cover the new womenswear subcategories", () => {
    const subs = ["shell", "cardigan", "breton", "midi_skirt", "pleated_skirt", "wide_leg", "cropped_blazer", "blazer_dress", "slip_dress", "flats", "block_heels", "ankle_boots", "tote"];
    for (const sub of subs) expect(Object.keys(WOMEN_SHAPES)).toContain(sub);
    expect(shapeFor("dress", "slip_dress")).toBe(WOMEN_SHAPES.slip_dress);
  });

  it("draws every garment in the swipe deck with its own silhouette (no category fallback)", () => {
    for (const item of LOOKS.flatMap((l) => l.items)) expect(Object.keys(SHAPES)).toContain(item.subcategory);
  });

  it("uses closed die-cut bodies", () => {
    for (const shape of Object.values(WOMEN_SHAPES)) expect(shape.body.trim().endsWith("Z")).toBe(true);
  });
});
