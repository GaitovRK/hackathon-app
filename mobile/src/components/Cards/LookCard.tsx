import { StyleSheet, Text, View } from "react-native";
import { OutfitFlatLay } from "@/components/Outfit/OutfitFlatLay";
import type { LookContent } from "@/content/looks";
import { useTheme } from "@/theme/useTheme";

type Props = { look: LookContent; width?: number };

/** A curated look in the onboarding deck (board screen 01): white card, the layered flat-lay, a soft shadow (the only one in the app), item caption under it. */
export function LookCard({ look, width = 266 }: Props) {
  const { colors, radius, spacing, fontSize, fontFamily } = useTheme();
  return (
    <View testID={`look-${look.id}`} style={{ width, gap: spacing.md, alignSelf: "center" }}>
      <View style={[styles.card, { height: Math.round(width * 1.4), borderRadius: radius.card, backgroundColor: colors.paper, borderColor: colors.line }]}>
        <OutfitFlatLay garments={look.items} width={Math.round(width * 0.75)} />
      </View>
      <Text style={{ color: colors.ink2, fontSize: fontSize.sm, fontFamily: fontFamily.body, textAlign: "center" }}>{look.title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
});
