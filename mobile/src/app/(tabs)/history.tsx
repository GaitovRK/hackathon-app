import { GenerationCard } from "@/components/Cards/GenerationCard";
import { Screen } from "@/components/Layout/Screen";
import { StatusMessage } from "@/components/Status/StatusMessage";
import { t } from "@/i18n/t";
import { useAppSelector } from "@/store";
import { useListGenerationsQuery } from "@/store/api";

export default function HistoryScreen() {
  const ready = useAppSelector((s) => s.session.status === "ready");
  const { data, isLoading, isError } = useListGenerationsQuery(undefined, { skip: !ready });

  return (
    <Screen title={t("history.title")}>
      {isLoading ? <StatusMessage kind="loading" message={t("status.loading")} /> : null}
      {isError ? <StatusMessage kind="error" message={t("status.error")} /> : null}
      {data?.length === 0 ? <StatusMessage kind="info" message={t("history.empty")} /> : null}
      {data?.map((g) => <GenerationCard key={g.id} generation={g} />)}
    </Screen>
  );
}
