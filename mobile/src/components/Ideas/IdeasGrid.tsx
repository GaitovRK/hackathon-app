import { StyleSheet, View } from "react-native";
import type { Idea, LockedIdea } from "@/services/api/types";
import { useTheme } from "@/theme/useTheme";
import { IdeaCard, LockedIdeaCard } from "./IdeaCard";

type Props = {
  ideas: Idea[];
  locked: LockedIdea[];
  /** Liked idea keys. */
  selected: string[];
  width: number;
  onToggle: (key: string) => void;
  onOpen: (key: string) => void;
  onUnlock: () => void;
  testID?: string;
};

/** Two-column grid (board 06): the free ideas first, then the locked silhouettes in the same grid. */
export function IdeasGrid({ ideas, locked, selected, width, onToggle, onOpen, onUnlock, testID }: Props) {
  const { spacing } = useTheme();
  const cardWidth = Math.floor((width - spacing.md) / 2);
  return (
    <View testID={testID} style={[styles.grid, { gap: spacing.md }]}>
      {ideas.map((idea) => (
        <IdeaCard key={idea.key} idea={idea} width={cardWidth} liked={selected.includes(idea.key)} onToggle={() => onToggle(idea.key)} onOpen={() => onOpen(idea.key)} />
      ))}
      {locked.map((idea) => (
        <LockedIdeaCard key={idea.key} idea={idea} width={cardWidth} onPress={onUnlock} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({ grid: { flexDirection: "row", flexWrap: "wrap" } });
