import { ScrollView, StyleSheet, View } from "react-native";
import { useTheme } from "@/theme/useTheme";
import { Chip } from "./Chip";

export type ChipOption<T extends string> = { value: T; label: string };

type Props<T extends string> = {
  options: ChipOption<T>[];
  value: T | T[];
  onChange: (value: T) => void;
  /** Horizontal scroll (occasion row) or wrapping (forms). */
  scroll?: boolean;
  testID?: string;
};

/** A row of chips with single (`value: T`) or multi (`value: T[]`) selection; `onChange` toggles one value. */
export function ChipRow<T extends string>({ options, value, onChange, scroll = false, testID }: Props<T>) {
  const { spacing } = useTheme();
  const selected = (v: T) => (Array.isArray(value) ? value.includes(v) : value === v);
  const chips = options.map((o) => <Chip key={o.value} testID={testID ? `${testID}-${o.value}` : undefined} label={o.label} selected={selected(o.value)} onPress={() => onChange(o.value)} />);
  if (scroll) {
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }} testID={testID}>
        {chips}
      </ScrollView>
    );
  }
  return (
    <View testID={testID} style={[styles.wrap, { gap: spacing.sm }]}>
      {chips}
    </View>
  );
}

const styles = StyleSheet.create({ wrap: { flexDirection: "row", flexWrap: "wrap" } });
