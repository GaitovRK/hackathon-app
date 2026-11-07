import { useEffect, useState } from "react";
import { localDate, type FeedbackValue, type Occasion } from "@/services/api/types";
import { openPaywallScreen } from "@/services/purchases/paywallRoute";
import { FIRST_WOW_FLAG, flagStorage } from "@/services/storage/flags";
import { useAppDispatch, useAppSelector } from "@/store";
import { useOutfitFeedbackMutation, useRefreshTodayMutation, useSaveOutfitMutation, useTodayQuery, useWearOutfitMutation } from "@/store/api";
import { firstWowShown } from "@/store/onboardingSlice";

const FIRST_WOW_DELAY_MS = 1500;

/** Today's outfits for an occasion + the card actions. Opens the paywall once, right after the first outfits are shown. */
export function useToday(occasion: Occasion) {
  const dispatch = useAppDispatch();
  const ready = useAppSelector((s) => s.session.status === "ready");
  const wowShown = useAppSelector((s) => s.onboarding.firstWowShown);
  const date = localDate();
  const query = useTodayQuery({ occasion, date }, { skip: !ready });
  const [refresh, refreshState] = useRefreshTodayMutation();
  const [wear, wearState] = useWearOutfitMutation();
  const [save, saveState] = useSaveOutfitMutation();
  const [sendFeedback] = useOutfitFeedbackMutation();
  const [feedback, setFeedback] = useState<Record<string, FeedbackValue>>({});

  const outfits = query.data?.outfits ?? [];

  useEffect(() => {
    if (wowShown || outfits.length === 0) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    void flagStorage.get(FIRST_WOW_FLAG).then((already) => {
      if (cancelled) return;
      dispatch(firstWowShown());
      if (already) return;
      void flagStorage.set(FIRST_WOW_FLAG);
      timer = setTimeout(() => openPaywallScreen("FIRST_WOW"), FIRST_WOW_DELAY_MS);
    });
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [dispatch, outfits.length, wowShown]);

  return {
    date,
    outfits,
    refreshesLeft: query.data?.refreshesLeft ?? 0,
    closetTooSmall: query.data?.closetTooSmall ?? false,
    loading: query.isLoading || (query.isFetching && !query.data),
    error: query.isError,
    busy: refreshState.isLoading || wearState.isLoading || saveState.isLoading,
    feedback,
    retry: () => void query.refetch(),
    refresh: () => void refresh({ occasion, date }),
    wear: (id: string) => void wear({ id, date }),
    save: (id: string) => void save(id),
    giveFeedback: (id: string, value: FeedbackValue) => {
      setFeedback((prev) => ({ ...prev, [id]: value }));
      void sendFeedback({ id, value });
    },
  };
}
