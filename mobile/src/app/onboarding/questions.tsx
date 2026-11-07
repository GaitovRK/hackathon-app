import { router } from "expo-router";
import { Text } from "react-native";
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

/** Three questions: dress code, city, wardrobe. Kept in the onboarding slice; sent with the starter closet. */
export default function QuestionsScreen() {
  const { colors, fontSize, fontFamily } = useTheme();
  const dispatch = useAppDispatch();
  const { dressCode, city, wardrobe } = useAppSelector((s) => s.onboarding);
  const label = (text: string) => <Text style={{ color: colors.foreground, fontSize: fontSize.md, fontFamily: fontFamily.bodyBold }}>{text}</Text>;

  return (
    <Screen title={t("onboarding.questionsTitle")}>
      {label(t("onboarding.dressCode"))}
      <ChipRow testID="q-dresscode" options={dressCodeOptions} value={dressCode} onChange={(v) => dispatch(answersChanged({ dressCode: v }))} />
      {label(t("onboarding.city"))}
      <TextField testID="q-city" value={city} onChangeText={(v) => dispatch(answersChanged({ city: v }))} placeholder={t("onboarding.cityPlaceholder")} />
      {label(t("onboarding.wardrobe"))}
      <ChipRow testID="q-wardrobe" options={wardrobeOptions} value={wardrobe} onChange={(v) => dispatch(answersChanged({ wardrobe: v }))} />
      <ButtonPrimary
        testID="q-next"
        label={t("common.next")}
        onPress={() => {
          dispatch(stepChanged("closet"));
          router.push("/onboarding/closet");
        }}
      />
    </Screen>
  );
}
