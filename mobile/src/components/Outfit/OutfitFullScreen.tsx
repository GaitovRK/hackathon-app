import { Modal, Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { IconButton } from "@/components/Buttons/IconButton";
import { Icon } from "@/components/Icons/Icon";
import type { TileGarment } from "@/components/Items/ItemTile";
import { t } from "@/i18n/t";
import { reasonStyle, useTheme } from "@/theme/useTheme";
import { OutfitFlatLay } from "./OutfitFlatLay";

type Props = {
  garments: TileGarment[];
  reason?: string;
  onClose: () => void;
};

/** Room kept for the safe areas, the close button row and the reason line around the flat-lay. */
const CHROME = 240;

/** One outfit's flat-lay as large as the screen allows, on paper, with the reason line. Tap anywhere to close. Mount it only while open. */
export function OutfitFullScreen({ garments, reason, onClose }: Props) {
  const { colors, spacing, fontSize } = useTheme();
  const { width, height } = useWindowDimensions();
  const flatLayWidth = Math.round(Math.min(width - spacing.gutter * 2, (height - CHROME) * 0.68));

  return (
    <Modal visible animationType="fade" presentationStyle="fullScreen" onRequestClose={onClose}>
      <SafeAreaView style={[styles.fill, { backgroundColor: colors.paper }]}>
        <Pressable testID="outfit-fullscreen" accessibilityLabel={t("common.close")} onPress={onClose} style={[styles.fill, { paddingBottom: spacing.lg }]}>
          <View style={[styles.close, { paddingHorizontal: spacing.gutter }]}>
            <IconButton testID="outfit-fullscreen-close" accessibilityLabel={t("common.close")} onPress={onClose} icon={<Icon name="x" />} />
          </View>
          <View style={styles.center}>
            <OutfitFlatLay garments={garments} width={flatLayWidth} />
          </View>
          {reason ? <Text style={[reasonStyle(fontSize.xl, colors.ink), { textAlign: "center", paddingHorizontal: spacing.gutter }]}>{reason}</Text> : null}
        </Pressable>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  close: { alignItems: "flex-end" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
});
