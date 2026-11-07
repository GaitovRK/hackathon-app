import { render, screen } from "@testing-library/react-native";
import { starterImageFor } from "@/content/starterImages";
import { GarmentCutout, type TileGarment } from "./ItemTile";

const tee: TileGarment = { name: "White t-shirt", category: "top", subcategory: "tshirt", primaryColor: "white", starterKey: "white-tee" };

describe("GarmentCutout", () => {
  it("shows the bundled product cutout for a common starter basic", async () => {
    await render(<GarmentCutout garment={tee} />);
    expect(screen.getByLabelText("White t-shirt").props.source).toEqual(expect.anything());
    expect(starterImageFor("white-tee")).toBeDefined();
  });

  it("has no photo for starter items outside the common basics", () => {
    expect(starterImageFor("silver-watch")).toBeUndefined();
    expect(starterImageFor(null)).toBeUndefined();
  });

  it("covers the most common basics", () => {
    for (const key of ["white-tee", "black-tee", "blue-jeans", "white-sneakers", "white-oxford-shirt", "grey-hoodie", "black-midi-dress"]) expect(starterImageFor(key)).toBeDefined();
  });
});
