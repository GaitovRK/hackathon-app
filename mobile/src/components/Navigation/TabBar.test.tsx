import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { TabBar } from "./TabBar";

const metrics = { frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 47, left: 0, right: 0, bottom: 34 } };

async function renderBar() {
  const upload = jest.fn();
  const outfit = jest.fn();
  await render(
    <SafeAreaProvider initialMetrics={metrics}>
      <TabBar
        tabs={[
          { name: "index", label: "Today", icon: "sun" },
          { name: "closet", label: "Closet", icon: "hanger" },
        ]}
        active="index"
        onTab={jest.fn()}
        addLabel="Add"
        addActions={[
          { key: "upload", label: "Upload clothes", hint: "Photo", icon: "camera", onPress: upload },
          { key: "outfit", label: "Create an outfit", hint: "Rows", icon: "hanger", onPress: outfit },
        ]}
      />
    </SafeAreaProvider>,
  );
  return { upload, outfit };
}

describe("TabBar +", () => {
  it("opens the bubble instead of navigating and runs the picked action", async () => {
    const { upload, outfit } = await renderBar();
    expect(screen.queryByTestId("add-menu")).toBeNull();
    fireEvent.press(screen.getByTestId("tab-add"));
    await waitFor(() => expect(screen.getByTestId("add-menu")).toBeTruthy());
    expect(upload).not.toHaveBeenCalled();
    fireEvent.press(screen.getByTestId("add-menu-outfit"));
    await waitFor(() => expect(screen.queryByTestId("add-menu")).toBeNull());
    expect(outfit).toHaveBeenCalledTimes(1);
    expect(upload).not.toHaveBeenCalled();
  });

  it("closes on a tap outside without running anything", async () => {
    const { upload, outfit } = await renderBar();
    fireEvent.press(screen.getByTestId("tab-add"));
    await waitFor(() => expect(screen.getByTestId("add-menu-upload")).toBeTruthy());
    fireEvent.press(screen.getByTestId("add-menu-backdrop"));
    await waitFor(() => expect(screen.queryByTestId("add-menu")).toBeNull());
    expect(upload).not.toHaveBeenCalled();
    expect(outfit).not.toHaveBeenCalled();
  });
});
