import { router } from "expo-router";
import type { ReactNode } from "react";
import { Text, View } from "react-native";
import { ButtonPrimary } from "@/components/Buttons/ButtonPrimary";
import { ChipRow } from "@/components/Chips/ChipRow";
import { TextField } from "@/components/Inputs/TextField";
import { Screen } from "@/components/Layout/Screen";
import { t, type MessageKey } from "@/i18n/t";
import { DRESS_CODES, WARDROBES } from "@/services/api/types";
import { useAppDispatch, useAppSelector } from "@/store";
import { answersChanged, stepChanged } from "@/store/onboardingSlice";
import { useTheme } from "@/theme/useTheme";

const dressCodeOptions = DRESS_CODES.map((d) => ({ value: d, label: t(`dressCode.${d}` as MessageKey) }));
const wardrobeOptions = WARDROBES.map((w) => ({ value: w, label: t(`wardrobe.${w}` as MessageKey) }));

/** Three questions: dress code, city, wardrobe, each on a mist card. Kept in the onboarding slice; sent with the starter closet. */
export default function QuestionsScreen() {
  const { colors, fontSize, fontFamily, spacing, radius } = useTheme();
  const dispatch = useAppDispatch();
  const { dressCode, city, wardrobe } = useAppSelector((s) => s.onboarding);
  const card = (label: string, body: ReactNode) => (
    <View style={{ backgroundColor: colors.mist, borderRadius: radius.tile + 4, padding: spacing.lg, gap: spacing.md }}>
      <Text style={{ color: colors.ink, fontSize: fontSize.md, fontFamily: fontFamily.bodyBold }}>{label}</Text>
      {body}
    </View>
  );

  return (
    <Screen
      title={t("onboarding.questionsTitle")}
      footer={
        <ButtonPrimary
          testID="q-next"
          label={t("common.next")}
          onPress={() => {
            dispatch(stepChanged("closet"));
            router.push("/onboarding/closet");
          }}
        />
      }
    >
      <Text style={{ color: colors.ink2, fontSize: fontSize.md, fontFamily: fontFamily.body, marginTop: -spacing.sm }}>{t("onboarding.questionsSub")}</Text>
      {card(t("onboarding.wardrobe"), <ChipRow testID="q-wardrobe" options={wardrobeOptions} value={wardrobe} onChange={(v) => dispatch(answersChanged({ wardrobe: v }))} />)}
      {card(t("onboarding.dressCode"), <ChipRow testID="q-dresscode" options={dressCodeOptions} value={dressCode} onChange={(v) => dispatch(answersChanged({ dressCode: v }))} />)}
      {card(
        t("onboarding.city"),
        <TextField testID="q-city" value={city} onChangeText={(v) => dispatch(answersChanged({ city: v }))} placeholder={t("onboarding.cityPlaceholder")} style={{ backgroundColor: colors.paper }} />,
      )}
    </Screen>
  );
}
