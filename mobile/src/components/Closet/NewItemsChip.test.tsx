import { render, screen } from "@testing-library/react-native";
import { NewItemsChip } from "./NewItemsChip";

describe("NewItemsChip", () => {
  it("is hidden when nothing awaits review", async () => {
    await render(<NewItemsChip count={0} />);
    expect(screen.queryByTestId("closet-new-items")).toBeNull();
  });

  it("shows how many items to check", async () => {
    await render(<NewItemsChip count={3} onPress={() => undefined} />);
    expect(screen.getByText("3 new items to check")).toBeTruthy();
  });
});
