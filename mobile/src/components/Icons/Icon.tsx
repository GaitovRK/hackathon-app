import Svg, { Circle, Path, Rect } from "react-native-svg";
import { useTheme } from "@/theme/useTheme";

type Part = string | { c: readonly [number, number, number] } | { r: readonly [number, number, number, number, number] };

/** Board icon set (24 grid, 1.8 outline, round caps). Paths copied from `docs/design/flick-board.html`. */
const ICONS = {
  sun: [{ c: [12, 12, 4] }, "M12 2.5v2M12 19.5v2M4.6 4.6 6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4"],
  bookmark: ["M7 3.5h10v17l-5-3.8-5 3.8z"],
  hanger: ["M10 5a2 2 0 1 1 2 2c-.6 0-1 .4-1 1v1.2M12 9.2l8.6 6.9c.6.5.3 1.4-.5 1.4H3.9c-.8 0-1.1-.9-.5-1.4z"],
  plus: ["M12 5v14M5 12h14"],
  back: ["M15 5l-7 7 7 7"],
  chev: ["M9 6l6 6-6 6"],
  x: ["M6 6l12 12M18 6 6 18"],
  heart: ["M12 20s-7.5-4.6-7.5-10.2A4.1 4.1 0 0 1 12 7.4a4.1 4.1 0 0 1 7.5 2.4C19.5 15.4 12 20 12 20z"],
  undo: ["M9 14 4 9l5-5M4 9h10a6 6 0 0 1 0 12h-3"],
  refresh: ["M20 12a8 8 0 1 1-2.4-5.7M20 4v5h-5"],
  lock: [{ r: [5, 11, 14, 10, 2.5] }, "M8 11V8a4 4 0 0 1 8 0v3"],
  spark: ["M11 3.5l1.8 5.2L18 10.5l-5.2 1.8L11 17.5l-1.8-5.2L4 10.5l5.2-1.8zM18.5 15.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z"],
  check: ["M5 12.5l4.5 4.5L19 7.5"],
  brief: [{ r: [3, 7, 18, 13, 2.5] }, "M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7M3 13h18"],
  thumb: ["M7.5 11v9h-3v-9zM7.5 11l4-7c1.5 0 2.6 1.1 2.2 2.7L13 10h5.2a2 2 0 0 1 2 2.4l-1.2 6A2 2 0 0 1 17 20H7.5"],
  user: [{ c: [12, 8, 4] }, "M4.5 20.5a7.5 7.5 0 0 1 15 0"],
} as const satisfies Record<string, readonly Part[]>;

export type IconName = keyof typeof ICONS;

type Props = { name: IconName; size?: number; color?: string; filled?: boolean; strokeWidth?: number; rotate?: number };

/** One board icon. `filled` fills the shape (active heart / like). */
export function Icon({ name, size = 20, color, filled = false, strokeWidth = 1.8, rotate }: Props) {
  const { colors } = useTheme();
  const stroke = color ?? colors.ink;
  const fill = filled ? stroke : "none";
  const parts: readonly Part[] = ICONS[name];
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" style={rotate ? { transform: [{ rotate: `${rotate}deg` }] } : undefined} pointerEvents="none">
      {parts.map((part, i) => {
        const common = { stroke, strokeWidth, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, fill };
        if (typeof part === "string") return <Path key={i} {...common} d={part} />;
        if ("c" in part) return <Circle key={i} {...common} cx={part.c[0]} cy={part.c[1]} r={part.c[2]} />;
        return <Rect key={i} {...common} x={part.r[0]} y={part.r[1]} width={part.r[2]} height={part.r[3]} rx={part.r[4]} />;
      })}
    </Svg>
  );
}
