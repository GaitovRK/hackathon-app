import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useState } from "react";
import { ButtonPrimary } from "@/components/Buttons/ButtonPrimary";
import { ButtonSecondary, ButtonVolt } from "@/components/Buttons/ButtonSecondary";
import { IconButton } from "@/components/Buttons/IconButton";
import { OutfitCard } from "@/components/Cards/OutfitCard";
import { ChipRow } from "@/components/Chips/ChipRow";
import { HomeShortcuts } from "@/components/Home/HomeShortcuts";
import { Icon } from "@/components/Icons/Icon";
import { Screen } from "@/components/Layout/Screen";
import { SetupChecklist } from "@/components/Status/SetupChecklist";
import { StatusMessage } from "@/components/Status/StatusMessage";
import { useToday } from "@/hooks/outfits/useToday";
import { t, type MessageKey } from "@/i18n/t";
import { OCCASIONS, type Occasion } from "@/services/api/types";
import { openAddItems, openAddPhoto, openSettings } from "@/services/navigation/routes";
import { presentPaywall } from "@/services/purchases/presentPaywall";
import { useAppSelector } from "@/store";
import { useItemsQuery, useMeQuery } from "@/store/api";
import { displayStyle, useTheme } from "@/theme/useTheme";

const occasionLabel = (o: Occasion) => t(`occasion.${o}` as MessageKey);
/** Work first (OCCASIONS starts with work). */
const occasionOptions = OCCASIONS.map((o) => ({ value: o, label: occasionLabel(o) }));
const CARD_WIDTH = 256;
const SETUP_STEPS = 4;
const PHOTOS_GOAL = 3;

/**
 * Home / Today (board screen 03): wordmark + Try Pro pill, Work-first occasion chips, today's 3 outfits as a
 * peeking carousel with the italic reason line under each, the free refresh count, and a setup checklist.
 */
export default function TodayScreen() {
  const { colors, spacing, fontSize, fontFamily, radius } = useTheme();
  const [occasion, setOccasion] = useState<Occasion>("work");
  const today = useToday(occasion);
  const ready = useAppSelector((s) => s.session.status === "ready");
  const me = useMeQuery(undefined, { skip: !ready });
  const items = useItemsQuery(undefined, { skip: !ready });
  const isPro = me.data?.isPro ?? false;
  const photos = (items.data ?? []).filter((i) => i.source === "photo").length;
  const worn = today.outfits.some((o) => o.status === "worn");
  // Basics picked + looks swiped are done once you're on Today.
  const done = 2 + (photos >= PHOTOS_GOAL ? 1 : 0) + (worn ? 1 : 0);
  const nextIsPhotos = photos < PHOTOS_GOAL;
  const dateLabel = new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });

  return (
    <Screen>
      <View style={styles.between}>
        <View style={styles.row}>
          <Text accessibilityRole="header" style={displayStyle(fontSize.xxl, colors.ink)}>
            flick
          </Text>
          <View style={[styles.dot, { backgroundColor: colors.volt, borderColor: colors.line }]} />
        </View>
        <View style={[styles.row, { gap: spacing.sm }]}>
          {isPro ? null : <ButtonVolt testID="try-pro" small inline label={t("home.tryPro")} onPress={() => void presentPaywall()} icon={<Icon name="spark" size={16} />} />}
          <IconButton testID="open-settings" accessibilityLabel={t("home.settings")} onPress={openSettings} icon={<Icon name="user" />} />
        </View>
      </View>
      <Text style={{ color: colors.ink2, fontSize: fontSize.sm + 1, fontFamily: fontFamily.bodySemibold, marginTop: -spacing.sm }}>{dateLabel}</Text>
      <ChipRow testID="occasion" options={occasionOptions} value={occasion} onChange={setOccasion} scroll />
      <HomeShortcuts />

      <View style={styles.between}>
        <Text style={{ color: colors.ink, fontSize: fontSize.xl, fontFamily: fontFamily.bodyBold }}>{t("home.todays3")}</Text>
        {today.outfits.length > 0 ? (
          <Pressable testID="today-refresh" accessibilityRole="button" onPress={today.refresh} disabled={today.busy} style={[styles.row, { gap: spacing.xs + 2 }]}>
            <Icon name="refresh" size={17} color={colors.ink2} />
            <Text style={{ color: colors.ink2, fontSize: fontSize.sm, fontFamily: fontFamily.bodySemibold }}>{t("home.newSet")}</Text>
            {today.refreshesLeft === 0 ? (
              <View style={[styles.pro, { backgroundColor: colors.volt, borderRadius: radius.full }]}>
                <Icon name="lock" size={11} strokeWidth={2.6} />
                <Text style={{ color: colors.ink, fontSize: 10.5, fontFamily: fontFamily.bodyBold, letterSpacing: 0.5 }}>{t("home.pro")}</Text>
              </View>
            ) : null}
          </Pressable>
        ) : null}
      </View>
      {today.outfits.length > 0 ? (
        <Text testID="refresh-count" style={{ color: colors.ink3, fontSize: fontSize.sm, fontFamily: fontFamily.bodySemibold, marginTop: -spacing.md }}>
          {today.refreshesLeft < 0 ? t("today.refreshPro") : t("today.refreshLeft", { count: today.refreshesLeft })}
        </Text>
      ) : null}

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
          <ButtonPrimary testID="today-add-items" label={t("today.addItems")} onPress={openAddItems} />
        </>
      ) : null}
      {today.outfits.length > 0 ? (
        <ScrollView
          testID="outfit-stack"
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={CARD_WIDTH + spacing.md}
          decelerationRate="fast"
          style={{ marginHorizontal: -spacing.gutter }}
          contentContainerStyle={{ paddingHorizontal: spacing.gutter, gap: spacing.md }}
        >
          {today.outfits.map((o, i) => (
            <OutfitCard
              key={o.id}
              outfit={o}
              width={CARD_WIDTH}
              badge={t("home.badge", { index: String(i + 1).padStart(2, "0"), occasion: occasionLabel(occasion) })}
              busy={today.busy}
              feedback={today.feedback[o.id] ?? null}
              onWear={() => today.wear(o.id)}
              onSave={() => today.save(o.id)}
              onFeedback={(v) => today.giveFeedback(o.id, v)}
            />
          ))}
        </ScrollView>
      ) : null}

      {done < SETUP_STEPS ? (
        <SetupChecklist
          testID="setup-checklist"
          done={done}
          total={SETUP_STEPS}
          progressLabel={t("home.checklistProgress", { done, total: SETUP_STEPS })}
          title={nextIsPhotos ? t("home.checklistPhotos") : t("home.checklistWear")}
          subtitle={nextIsPhotos ? t("home.checklistPhotosBody") : t("home.checklistWearBody")}
          onPress={nextIsPhotos ? openAddPhoto : undefined}
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  between: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  row: { flexDirection: "row", alignItems: "center" },
  dot: { width: 9, height: 9, borderRadius: 5, marginLeft: 3, marginTop: 10, borderWidth: 1 },
  pro: { flexDirection: "row", alignItems: "center", gap: 3, height: 20, paddingHorizontal: 7 },
});
