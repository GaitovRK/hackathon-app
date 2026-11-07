import { useState } from "react";
import { ButtonPrimary } from "@/components/Buttons/ButtonPrimary";
import { GenerationCard } from "@/components/Cards/GenerationCard";
import { TextField } from "@/components/Inputs/TextField";
import { Screen } from "@/components/Layout/Screen";
import { FreeLeftBadge } from "@/components/Status/FreeLeftBadge";
import { StatusMessage } from "@/components/Status/StatusMessage";
import { useGenerate } from "@/hooks/generation/useGenerate";
import { t } from "@/i18n/t";
import { useAppSelector } from "@/store";
import { useMeQuery } from "@/store/api";

export default function HomeScreen() {
  const ready = useAppSelector((s) => s.session.status === "ready");
  const me = useMeQuery(undefined, { skip: !ready });
  const [prompt, setPrompt] = useState("");
  const { generate, generation, busy, failed } = useGenerate();

  return (
    <Screen title={t("home.title")}>
      {me.data ? <FreeLeftBadge freeLeftToday={me.data.freeLeftToday} isPro={me.data.isPro} /> : null}
      <TextField testID="prompt-input" value={prompt} onChangeText={setPrompt} placeholder={t("home.placeholder")} multiline />
      <ButtonPrimary
        testID="generate-button"
        label={busy ? t("home.generating") : t("home.generate")}
        onPress={() => void generate(prompt.trim())}
        disabled={!ready || busy || !prompt.trim()}
        loading={busy}
      />
      {failed ? <StatusMessage kind="error" message={t("home.failed")} /> : null}
      {generation ? <GenerationCard generation={generation} large /> : null}
    </Screen>
  );
}
