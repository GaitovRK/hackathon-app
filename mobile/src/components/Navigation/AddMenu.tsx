import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Icon, type IconName } from "@/components/Icons/Icon";
import { t } from "@/i18n/t";
import { useTheme } from "@/theme/useTheme";

export type AddAction = { key: string; label: string; hint: string; icon: IconName; onPress: () => void };

type Props = {
  actions: AddAction[];
  /** Distance from the screen bottom to the top of the raised +; the bubble's tail points at it. */
  anchorBottom: number;
  onClose: () => void;
};

const TAIL = 14;

/** Bubble above the tab bar + (#33): one row per action on a light scrim; tap outside to close. Mount it only while open. */
export function AddMenu({ actions, anchorBottom, onClose }: Props) {
  const { colors, radius, spacing, fontSize, fontFamily } = useTheme();
  const pick = (action: AddAction) => {
    onClose();
    action.onPress();
  };
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable testID="add-menu-backdrop" accessibilityLabel={t("common.close")} onPress={onClose} style={[StyleSheet.absoluteFill, { backgroundColor: colors.scrim }]} />
      <View testID="add-menu" pointerEvents="box-none" style={[styles.anchor, { bottom: anchorBottom + spacing.sm + TAIL / 2, paddingHorizontal: spacing.gutter }]}>
        <View style={[styles.bubble, { backgroundColor: colors.paper, borderRadius: radius.card, padding: spacing.sm }]}>
          {actions.map((action) => (
            <Pressable
              key={action.key}
              testID={`add-menu-${action.key}`}
              accessibilityRole="button"
              accessibilityLabel={action.label}
              onPress={() => pick(action)}
              style={({ pressed }) => [styles.row, { gap: spacing.md, padding: spacing.md, borderRadius: radius.tile }, pressed && { backgroundColor: colors.mist }]}
            >
              <View style={[styles.icon, { backgroundColor: colors.mist }]}>
                <Icon name={action.icon} size={22} />
              </View>
              <View style={styles.text}>
                <Text style={{ color: colors.ink, fontSize: fontSize.md, fontFamily: fontFamily.bodyBold }}>{action.label}</Text>
                <Text style={{ color: colors.ink2, fontSize: fontSize.xs, fontFamily: fontFamily.bodySemibold }}>{action.hint}</Text>
              </View>
            </Pressable>
          ))}
          <View style={[styles.tail, { backgroundColor: colors.paper }]} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  anchor: { position: "absolute", left: 0, right: 0, alignItems: "center" },
  bubble: { width: 280 },
  row: { flexDirection: "row", alignItems: "center" },
  icon: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  text: { flex: 1, gap: 2 },
  tail: { position: "absolute", bottom: -TAIL / 2, alignSelf: "center", width: TAIL, height: TAIL, borderRadius: 2, transform: [{ rotate: "45deg" }] },
});
