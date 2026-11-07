import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ButtonPrimary } from "@/components/Buttons/ButtonPrimary";
import { Chip } from "@/components/Chips/Chip";
import { Screen } from "@/components/Layout/Screen";
import { FlowHeader } from "@/components/Outfit/FlowHeader";
import { ProBadge } from "@/components/Outfit/ProBadge";
import { StatusMessage } from "@/components/Status/StatusMessage";
import { useProPaywall } from "@/hooks/purchases/useProPaywall";
import { t, type MessageKey } from "@/i18n/t";
import { localDate, VIBES, type Occasion, type Vibe } from "@/services/api/types";
import { useAppDispatch } from "@/store";
import { useGenerateIdeasMutation } from "@/store/api";
import { ideasReceived } from "@/store/ideasSlice";
import { useTheme } from "@/theme/useTheme";

/** "What's it for?" rows (board 05) → the server's occasion enum. */
const FOR: Occasion[] = ["work", "event", "friends", "date", "casual"];
const FORMALITY = [1, 2, 3, 4, 5];

/** Generate (board 05): one open question, vibe chips, a formality bar, and the weather row locked as Pro. Nothing is persisted until ideas are saved. */
export default function GenerateScreen() {
  const { colors, radius, spacing, fontSize, fontFamily } = useTheme();
  const dispatch = useAppDispatch();
  const pro = useProPaywall();
  const [occasion, setOccasion] = useState<Occasion>("work");
  const [vibe, setVibe] = useState<Vibe>("sharp");
  const [formality, setFormality] = useState(4);
  const [generate, state] = useGenerateIdeasMutation();

  const show = async () => {
    const brief = { occasion, vibe, formality, date: localDate() };
    try {
      const result = await generate(brief).unwrap();
      dispatch(ideasReceived({ brief, result }));
      router.push("/ideas");
    } catch {
      /* state.isError renders the message */
    }
  };

  const card = { backgroundColor: colors.surface, borderRadius: radius.card, padding: spacing.lg, gap: spacing.sm };
  const label = { color: colors.foreground, fontSize: fontSize.md, fontFamily: fontFamily.bodySemibold };

  return (
    <Screen background={colors.surfaceAlt}>
      <FlowHeader title={t("ideas.generateTitle")} subtitle={t("ideas.generateSub")} />

      <View style={card}>
        <Text style={{ color: colors.foreground, fontSize: fontSize.xl, fontFamily: fontFamily.display }}>{t("ideas.whatFor")}</Text>
        {FOR.map((o) => {
          const on = o === occasion;
          return (
            <Pressable
              key={o}
              testID={`generate-for-${o}`}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              onPress={() => setOccasion(o)}
              style={[styles.optionRow, { height: 52, borderRadius: radius.tile, paddingHorizontal: spacing.lg, backgroundColor: colors.surfaceAlt, borderWidth: 2, borderColor: on ? colors.border : "transparent" }]}
            >
              <Text style={[label, styles.flex]}>{t(`ideas.for.${o}` as MessageKey)}</Text>
              {on ? <Text style={{ color: colors.foreground, fontSize: fontSize.md }}>✓</Text> : null}
            </Pressable>
          );
        })}
      </View>

      <View style={card}>
        <View style={[styles.between, { minHeight: 44 }]}>
          <Text style={label}>{t("ideas.vibe")}</Text>
          <View style={[styles.row, { gap: spacing.xs }]}>
            {VIBES.map((v) => (
              <Chip key={v} testID={`generate-vibe-${v}`} label={t(`ideas.vibe.${v}` as MessageKey)} selected={v === vibe} onPress={() => setVibe(v)} />
            ))}
          </View>
        </View>
        <View style={{ gap: spacing.sm, paddingVertical: spacing.sm, borderTopWidth: 1, borderTopColor: colors.borderSoft }}>
          <View style={styles.between}>
            <Text style={label}>{t("ideas.formality")}</Text>
            <Text style={{ color: colors.foreground, fontSize: fontSize.md, fontFamily: fontFamily.bodyBold }}>
              {formality} · {t(`ideas.formality.${formality}` as MessageKey)}
            </Text>
          </View>
          <View style={[styles.row, { gap: spacing.xs }]}>
            {FORMALITY.map((f) => (
              <Pressable
                key={f}
                testID={`generate-formality-${f}`}
                accessibilityRole="button"
                accessibilityLabel={t(`ideas.formality.${f}` as MessageKey)}
                accessibilityState={{ selected: f === formality }}
                onPress={() => setFormality(f)}
                hitSlop={8}
                style={[styles.flex, { height: 10, borderRadius: radius.sm, backgroundColor: f <= formality ? colors.foreground : colors.surfaceAlt }]}
              />
            ))}
          </View>
        </View>
        <Pressable testID="generate-weather" accessibilityRole="button" onPress={() => void pro.open()} style={[styles.between, { minHeight: 52, borderTopWidth: 1, borderTopColor: colors.borderSoft }]}>
          <Text style={[label, { color: colors.muted }]}>{t("ideas.weather")}</Text>
          <ProBadge testID="generate-weather-pro" />
        </Pressable>
      </View>

      {state.isError ? <StatusMessage kind="error" message={t("ideas.failed")} /> : null}
      <Text style={{ color: colors.muted, fontSize: fontSize.xs, fontFamily: fontFamily.bodySemibold, textAlign: "center" }}>{t("ideas.freeNote")}</Text>
      <ButtonPrimary testID="generate-show" label={t("ideas.show")} onPress={() => void show()} loading={state.isLoading} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center" },
  between: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  optionRow: { flexDirection: "row", alignItems: "center" },
  flex: { flex: 1 },
});
