import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { ButtonPrimary } from "@/components/Buttons/ButtonPrimary";
import { FlatLay } from "@/components/Items/FlatLay";
import { Screen } from "@/components/Layout/Screen";
import { LOOKS } from "@/content/looks";
import { t } from "@/i18n/t";
import { useAppDispatch } from "@/store";
import { onboardingReset, stepChanged } from "@/store/onboardingSlice";
import { displayStyle, useTheme } from "@/theme/useTheme";

/** Welcome + privacy line, on the brand butter block (board screen 1). */
export default function WelcomeScreen() {
  const { colors, spacing, fontSize, fontFamily, radius } = useTheme();
  const dispatch = useAppDispatch();
  const start = () => {
    dispatch(onboardingReset());
    dispatch(stepChanged("swipe"));
    router.push("/onboarding/swipe");
  };
  return (
    <Screen scroll={false}>
      <View style={[styles.hero, { backgroundColor: colors.accentSoft, borderRadius: radius.card, padding: spacing.xl }]}>
        <FlatLay garments={LOOKS[0].items} tileSize={110} />
      </View>
      <Text style={displayStyle(fontSize.display, colors.foreground)}>{t("onboarding.welcomeTitle")}</Text>
      <Text style={{ color: colors.foreground, fontSize: fontSize.lg, fontFamily: fontFamily.body, lineHeight: 24 }}>{t("onboarding.welcomeBody")}</Text>
      <Text style={{ color: colors.muted, fontSize: fontSize.sm, fontFamily: fontFamily.body }}>{t("onboarding.privacy")}</Text>
      <ButtonPrimary testID="onboarding-start" label={t("onboarding.start")} onPress={start} />
    </Screen>
  );
}

const styles = StyleSheet.create({ hero: { alignItems: "center" } });
