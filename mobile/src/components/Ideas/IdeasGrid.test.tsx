import { fireEvent, render, screen } from "@testing-library/react-native";
import { mockLockedIdeas, mockIdeas } from "@/dev/previews";
import { IdeasGrid } from "./IdeasGrid";

describe("IdeasGrid", () => {
  const setup = async (selected: string[] = []) => {
    const onToggle = jest.fn();
    const onOpen = jest.fn();
    const onUnlock = jest.fn();
    await render(<IdeasGrid ideas={mockIdeas} locked={mockLockedIdeas} selected={selected} width={360} onToggle={onToggle} onOpen={onOpen} onUnlock={onUnlock} />);
    return { onToggle, onOpen, onUnlock };
  };

  it("renders the free ideas with their reasons and the locked silhouettes", async () => {
    await setup();
    for (const idea of mockIdeas) {
      expect(screen.getByTestId(`idea-${idea.key}`)).toBeTruthy();
      expect(screen.getByText(idea.reason)).toBeTruthy();
    }
    for (const locked of mockLockedIdeas) expect(screen.getByTestId(`locked-${locked.key}`)).toBeTruthy();
    expect(screen.getAllByText("Unlock with Pro")).toHaveLength(mockLockedIdeas.length);
  });

  it("tapping a card toggles it; the liked state is exposed", async () => {
    const { onToggle } = await setup([mockIdeas[1].key]);
    await fireEvent.press(screen.getByTestId(`idea-${mockIdeas[0].key}`));
    expect(onToggle).toHaveBeenCalledWith(mockIdeas[0].key);
    expect(screen.getByTestId(`idea-${mockIdeas[1].key}`)).toBeSelected();
    expect(screen.getByTestId(`idea-${mockIdeas[0].key}`)).not.toBeSelected();
  });

  it("the caption opens the detail; a locked card asks to unlock", async () => {
    const { onOpen, onUnlock, onToggle } = await setup();
    await fireEvent.press(screen.getByTestId(`idea-open-${mockIdeas[0].key}`));
    expect(onOpen).toHaveBeenCalledWith(mockIdeas[0].key);
    await fireEvent.press(screen.getByTestId(`locked-${mockLockedIdeas[0].key}`));
    expect(onUnlock).toHaveBeenCalledTimes(1);
    expect(onToggle).not.toHaveBeenCalled();
  });

  it("draws the outer layer as a split with the top beside it", async () => {
    await setup();
    expect(screen.getAllByTestId("flatlay-top-split").length).toBeGreaterThan(0);
    expect(screen.getAllByTestId("flatlay-half-left").length).toBeGreaterThan(0);
    expect(screen.getAllByTestId("flatlay-half-right").length).toBeGreaterThan(0);
  });
});
