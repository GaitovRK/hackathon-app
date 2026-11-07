import { useEffect, useRef } from "react";
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { GarmentSticker } from "@/components/Items/ItemTile";
import { t } from "@/i18n/t";
import type { Item } from "@/services/api/types";
import { useTheme } from "@/theme/useTheme";

const ITEM = 112;
const GAP = 24;
const PLATE_W = 160;
const PLATE_H = 124;

type Props = {
  label: string;
  items: Item[];
  /** Index of the centered pick. */
  index: number;
  pinned: boolean;
  onIndexChange: (index: number) => void;
  onTogglePin: () => void;
  testID: string;
};

/**
 * One Dress-me row (board 04 `RowSwiper`): label + count + pin, a horizontal swipe of cutouts where the
 * centered one is the pick (on a mist plate, ink-outlined when pinned). Neighbours peek off both edges.
 * A pinned row stops scrolling, so Shuffle leaves it alone.
 */
export function RowSwiper({ label, items, index, pinned, onIndexChange, onTogglePin, testID }: Props) {
  const { colors, radius, spacing, fontSize, fontFamily } = useTheme();
  const { width } = useWindowDimensions();
  const ref = useRef<ScrollView>(null);
  const step = ITEM + GAP;
  const side = (width - ITEM) / 2;

  useEffect(() => {
    ref.current?.scrollTo({ x: index * step, animated: true });
  }, [index, step]);

  return (
    <View testID={testID} style={{ gap: spacing.xs }}>
      <View style={[styles.between, { paddingHorizontal: spacing.lg }]}>
        <Text style={{ color: colors.muted, fontSize: fontSize.xs, fontFamily: fontFamily.bodySemibold }}>
          {label} <Text style={{ color: colors.borderSoft }}>· {items.length}</Text>
        </Text>
        <Pressable testID={`${testID}-pin`} accessibilityRole="button" accessibilityState={{ selected: pinned }} onPress={onTogglePin} hitSlop={8}>
          <Text style={{ color: pinned ? colors.foreground : colors.muted, fontSize: fontSize.xs, fontFamily: fontFamily.bodyBold }}>{pinned ? `📌 ${t("dressMe.pinned")}` : t("dressMe.pin")}</Text>
        </Pressable>
      </View>
      <View style={{ height: PLATE_H + spacing.sm }}>
        <View
          pointerEvents="none"
          style={[styles.plate, { left: (width - PLATE_W) / 2, width: PLATE_W, height: PLATE_H, borderRadius: radius.tile, backgroundColor: colors.surfaceAlt, borderWidth: pinned ? 2 : 0, borderColor: colors.border }]}
        />
        <ScrollView
          ref={ref}
          testID={`${testID}-scroll`}
          horizontal
          scrollEnabled={!pinned}
          showsHorizontalScrollIndicator={false}
          snapToInterval={step}
          decelerationRate="fast"
          contentContainerStyle={{ paddingHorizontal: side, gap: GAP, alignItems: "center", paddingTop: spacing.sm }}
          onMomentumScrollEnd={(e) => onIndexChange(Math.max(0, Math.min(items.length - 1, Math.round(e.nativeEvent.contentOffset.x / step))))}
        >
          {items.map((item, i) => (
            <View key={item.id} testID={`${testID}-item-${i}`} style={{ width: ITEM, alignItems: "center" }}>
              <GarmentSticker garment={item} size={i === index ? ITEM : ITEM - 16} />
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  between: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  plate: { position: "absolute", top: 0 },
});
