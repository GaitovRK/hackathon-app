import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon, type IconName } from "@/components/Icons/Icon";
import { AddMenu, type AddAction } from "./AddMenu";
import { useTheme } from "@/theme/useTheme";

export type TabItem = { name: string; label: string; icon: IconName };

type Props = {
  /** Visible tabs, in order; the raised + sits in the middle. */
  tabs: TabItem[];
  active: string;
  onTab: (name: string) => void;
  /** Actions in the bubble the + opens. */
  addActions: AddAction[];
  addLabel: string;
};

/** How far the raised + sits above the bar's top edge (bar paddingTop 10, fab marginTop -26). */
const FAB_RISE = 16;

/** Board `.tabbar`: paper bar with a hairline, ink3 inactive / ink + dot active, and a raised 60pt ink + with a 6pt paper ring that opens the add bubble. */
export function TabBar({ tabs, active, onTab, addActions, addLabel }: Props) {
  const { colors, fontFamily, block } = useTheme();
  const insets = useSafeAreaInsets();
  const [menuOpen, setMenuOpen] = useState(false);
  const half = Math.ceil(tabs.length / 2);
  const tab = (item: TabItem) => {
    const on = item.name === active;
    const color = on ? colors.ink : colors.ink3;
    return (
      <Pressable key={item.name} testID={`tab-${item.name}`} accessibilityRole="tab" accessibilityState={{ selected: on }} accessibilityLabel={item.label} onPress={() => onTab(item.name)} style={styles.tab}>
        <Icon name={item.icon} size={24} color={color} filled={false} />
        <Text style={{ color, fontSize: 11, fontFamily: fontFamily.bodySemibold }}>{item.label}</Text>
        <View style={[styles.dot, { backgroundColor: on ? colors.ink : "transparent" }]} />
      </Pressable>
    );
  };
  return (
    <View style={[styles.bar, { height: block.tabBarHeight + insets.bottom, paddingBottom: insets.bottom, backgroundColor: colors.paper, borderTopColor: colors.line }]}>
      {tabs.slice(0, half).map(tab)}
      <Pressable
        testID="tab-add"
        accessibilityRole="button"
        accessibilityLabel={addLabel}
        accessibilityState={{ expanded: menuOpen }}
        onPress={() => setMenuOpen(true)}
        style={({ pressed }) => [
          styles.fab,
          { width: block.fab + block.fabRing * 2, height: block.fab + block.fabRing * 2, borderRadius: block.fab, borderWidth: block.fabRing, borderColor: colors.paper, backgroundColor: colors.ink, marginTop: -26 },
          pressed && styles.pressed,
        ]}
      >
        <Icon name="plus" size={26} color={colors.paper} strokeWidth={2.2} />
      </Pressable>
      {tabs.slice(half).map(tab)}
      {menuOpen ? <AddMenu actions={addActions} anchorBottom={block.tabBarHeight + insets.bottom + FAB_RISE} onClose={() => setMenuOpen(false)} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: "row", justifyContent: "space-around", alignItems: "flex-start", paddingTop: 10, borderTopWidth: 1 },
  tab: { alignItems: "center", gap: 3, width: 64 },
  dot: { width: 5, height: 5, borderRadius: 3 },
  fab: { alignItems: "center", justifyContent: "center" },
  pressed: { transform: [{ scale: 0.95 }] },
});
