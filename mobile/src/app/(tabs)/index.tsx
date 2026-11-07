import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { ButtonPrimary } from "@/components/Buttons/ButtonPrimary";
import { ButtonSecondary } from "@/components/Buttons/ButtonSecondary";
import { OutfitCard } from "@/components/Cards/OutfitCard";
import { ChipRow } from "@/components/Chips/ChipRow";
import { HomeShortcuts } from "@/components/Home/HomeShortcuts";
import { ColorBlocks } from "@/components/Layout/ColorBlocks";
import { Screen } from "@/components/Layout/Screen";
import { StatusMessage } from "@/components/Status/StatusMessage";
import { useToday } from "@/hooks/outfits/useToday";
import { t, type MessageKey } from "@/i18n/t";
import { OCCASIONS, type Occasion } from "@/services/api/types";
import { useTheme } from "@/theme/useTheme";

const occasionOptions = OCCASIONS.map((o) => ({ value: o, label: t(`occasion.${o}` as MessageKey) }));

/** Today tab: occasion chips, then a stack of 3 outfit cards to flick through, the front card on blocks of its own colors. */
export default function TodayScreen() {
  const { colors, spacing, fontSize, fontFamily, radius } = useTheme();
  const { width } = useWindowDimensions();
  const [occasion, setOccasion] = useState<Occasion>("work");
  const [front, setFront] = useState(0);
  const today = useToday(occasion);
  const cardWidth = width - spacing.lg * 2;
  const frontOutfit = today.outfits[Math.min(front, Math.max(0, today.outfits.length - 1))];

  return (
    <Screen title={t("today.title")}>
      <Text style={{ color: colors.muted, fontSize: fontSize.md, fontFamily: fontFamily.body }}>{t("today.subtitle", { occasion: t(`occasion.${occasion}` as MessageKey).toLowerCase() })}</Text>
      <ChipRow testID="occasion" options={occasionOptions} value={occasion} onChange={(o) => { setOccasion(o); setFront(0); }} scroll />
      <HomeShortcuts />
      {today.loading ? <StatusMessage kind="loading" message={t("status.loading")} /> : null}
      {today.error ? (
        <>
          <StatusMessage kind="error" message={t("today.failed")} />
          <ButtonSecondary label={t("common.retry")} onPress={today.retry} />
        </>
      ) : null}
      {!today.loading && !today.error && today.outfits.length === 0 ? (
        <>
          <StatusMessage kind="info" message={t("today.empty")} />
          <ButtonPrimary testID="today-add-items" label={t("today.addItems")} onPress={() => router.push({ pathname: "/onboarding/closet", params: { mode: "add" } })} />
        </>
      ) : null}
      {today.outfits.length > 0 ? (
        <ColorBlocks colors={frontOutfit?.items.map((i) => i.item.primaryColor) ?? []} style={{ borderRadius: radius.card, marginHorizontal: -spacing.lg }}>
          <ScrollView
            testID="outfit-stack"
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            snapToInterval={cardWidth + spacing.sm}
            decelerationRate="fast"
            contentContainerStyle={{ padding: spacing.lg, gap: spacing.sm }}
            onMomentumScrollEnd={(e) => setFront(Math.round(e.nativeEvent.contentOffset.x / (cardWidth + spacing.sm)))}
          >
            {today.outfits.map((o) => (
              <OutfitCard
                key={o.id}
                outfit={o}
                width={cardWidth}
                busy={today.busy}
                feedback={today.feedback[o.id] ?? null}
                onWear={() => today.wear(o.id)}
                onSave={() => today.save(o.id)}
                onFeedback={(v) => today.giveFeedback(o.id, v)}
              />
            ))}
          </ScrollView>
          <View style={[styles.dots, { gap: spacing.xs, paddingBottom: spacing.md }]}>
            {today.outfits.map((o, i) => (
              <View key={o.id} style={{ width: 8, height: 8, borderRadius: radius.full, backgroundColor: i === front ? colors.foreground : colors.surface, borderWidth: 1.5, borderColor: colors.border }} />
            ))}
          </View>
        </ColorBlocks>
      ) : null}
      {today.outfits.length > 0 ? (
        <>
          <ButtonSecondary testID="today-refresh" label={t("today.refresh")} onPress={today.refresh} loading={today.busy} />
          <Text style={{ color: colors.muted, fontSize: fontSize.sm, fontFamily: fontFamily.body, textAlign: "center" }}>
            {today.refreshesLeft < 0 ? t("today.refreshPro") : t("today.refreshLeft", { count: today.refreshesLeft })}
          </Text>
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({ dots: { flexDirection: "row", justifyContent: "center" } });
