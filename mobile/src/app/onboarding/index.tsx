import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { ButtonPrimary } from "@/components/Buttons/ButtonPrimary";
import { Screen } from "@/components/Layout/Screen";
import { OutfitFlatLay } from "@/components/Outfit/OutfitFlatLay";
import { LOOKS } from "@/content/looks";
import { t } from "@/i18n/t";
import { useAppDispatch } from "@/store";
import { onboardingReset, stepChanged } from "@/store/onboardingSlice";
import { displayStyle, useTheme } from "@/theme/useTheme";

/** Welcome: a flat-lay on a mist plate, the serif promise, the privacy line and one ink pill. */
export default function WelcomeScreen() {
  const { colors, spacing, fontSize, fontFamily, radius } = useTheme();
  const dispatch = useAppDispatch();
  const start = () => {
    dispatch(onboardingReset());
    dispatch(stepChanged("swipe"));
    router.push("/onboarding/swipe");
  };
  return (
    <Screen
      footer={
        <>
          <ButtonPrimary testID="onboarding-start" label={t("onboarding.start")} onPress={start} />
          <Text style={{ color: colors.ink2, fontSize: fontSize.xs, fontFamily: fontFamily.body, textAlign: "center" }}>{t("onboarding.privacy")}</Text>
        </>
      }
    >
      <View style={[styles.hero, { backgroundColor: colors.mist, borderRadius: radius.card, paddingVertical: spacing.xl }]}>
        <OutfitFlatLay garments={LOOKS[0].items} width={190} />
      </View>
      <Text style={displayStyle(fontSize.display, colors.ink)}>{t("onboarding.welcomeTitle")}</Text>
      <Text style={{ color: colors.ink2, fontSize: fontSize.lg, fontFamily: fontFamily.body, lineHeight: 23 }}>{t("onboarding.welcomeBody")}</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({ hero: { alignItems: "center" } });
