import { StyleSheet, Text, View } from "react-native";
import { FlatLay } from "@/components/Items/FlatLay";
import { ColorBlocks } from "@/components/Layout/ColorBlocks";
import type { LookContent } from "@/content/looks";
import { displayStyle, useTheme } from "@/theme/useTheme";

type Props = { look: LookContent };

/** A curated look in the onboarding deck (board `.lc`): stickers on blocks of the look's colors + title. */
export function LookCard({ look }: Props) {
  const { colors, radius, spacing, fontSize, block } = useTheme();
  return (
    <View testID={`look-${look.id}`} style={{ paddingBottom: block.cardShadowOffset }}>
      <View style={[styles.shadow, { backgroundColor: colors.border, borderRadius: radius.card, top: block.cardShadowOffset }]} />
      <ColorBlocks colors={look.items.map((i) => i.primaryColor)} style={{ borderRadius: radius.card, borderWidth: block.cardBorder, borderColor: colors.border }}>
        <View style={{ padding: spacing.xl, gap: spacing.lg, alignItems: "center" }}>
          <FlatLay garments={look.items} tileSize={104} />
          <Text style={[styles.title, displayStyle(fontSize.xl, colors.onBlock)]}>{look.title}</Text>
        </View>
      </ColorBlocks>
    </View>
  );
}

const styles = StyleSheet.create({ shadow: { position: "absolute", left: 0, right: 0, bottom: 0 }, title: { textAlign: "center" } });
