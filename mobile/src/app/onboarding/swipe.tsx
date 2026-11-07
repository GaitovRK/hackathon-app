import { router } from "expo-router";
import { useEffect, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ButtonPrimary } from "@/components/Buttons/ButtonPrimary";
import { ButtonSecondary } from "@/components/Buttons/ButtonSecondary";
import { LookCard } from "@/components/Cards/LookCard";
import { Screen } from "@/components/Layout/Screen";
import { SegmentedProgress } from "@/components/Status/SegmentedProgress";
import { looksFor } from "@/content/looks";
import { t } from "@/i18n/t";
import { useAppDispatch, useAppSelector } from "@/store";
import { lookSwiped, stepChanged } from "@/store/onboardingSlice";
import { useTheme } from "@/theme/useTheme";

/** The swipe deck: ~20 curated looks, like / pass with buttons, a segmented "7 / 20" bar on top. */
export default function SwipeScreen() {
  const { spacing, colors, fontSize, fontFamily } = useTheme();
  const dispatch = useAppDispatch();
  const { deckIndex, wardrobe } = useAppSelector((s) => s.onboarding);
  const deck = useMemo(() => looksFor(wardrobe), [wardrobe]);
  const look = deck[deckIndex];
  const done = !look;

  useEffect(() => {
    if (done) {
      dispatch(stepChanged("questions"));
      router.replace("/onboarding/questions");
    }
  }, [dispatch, done]);

  const swipe = (liked: boolean) => {
    if (look) dispatch(lookSwiped({ lookId: look.id, liked }));
  };

  return (
    <Screen title={t("onboarding.swipeTitle")} scroll={false}>
      <SegmentedProgress testID="swipe-progress" index={Math.min(deckIndex, deck.length)} total={deck.length} label={t("onboarding.swipeHint", { index: Math.min(deckIndex + 1, deck.length), total: deck.length })} />
      {look ? <LookCard look={look} /> : <Text style={{ color: colors.muted, fontSize: fontSize.md, fontFamily: fontFamily.body }}>{t("onboarding.swipeDone")}</Text>}
      <View style={[styles.row, { gap: spacing.md }]}>
        <View style={styles.flex}>
          <ButtonSecondary testID="swipe-dislike" label={t("onboarding.dislike")} onPress={() => swipe(false)} disabled={done} />
        </View>
        <View style={styles.flex}>
          <ButtonPrimary testID="swipe-like" label={t("onboarding.like")} onPress={() => swipe(true)} disabled={done} />
        </View>
      </View>
      <ButtonSecondary testID="swipe-skip" label={t("common.skip")} onPress={() => router.replace("/onboarding/questions")} />
    </Screen>
  );
}

const styles = StyleSheet.create({ row: { flexDirection: "row" }, flex: { flex: 1 } });
