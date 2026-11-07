import type { ReactNode } from "react";
import { View } from "react-native";
import type { GarmentColor } from "@/services/api/types";
import { useTheme } from "@/theme/useTheme";

type Props = { colors: GarmentColor[]; children?: ReactNode; style?: object };

/**
 * @deprecated The Reference Direction board is gallery-white: the clothes are the color. Kept so older
 * imports compile; renders a plain mist surface and ignores `colors`.
 */
export function ColorBlocks({ children, style }: Props) {
  const { colors } = useTheme();
  return <View style={[{ backgroundColor: colors.mist, overflow: "hidden" }, style]}>{children}</View>;
}
