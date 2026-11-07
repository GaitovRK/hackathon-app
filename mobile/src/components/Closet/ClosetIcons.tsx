import Svg, { Circle, Path } from "react-native-svg";

type IconProps = { color: string; size?: number };

const stroke = { fill: "none", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" } as const;

/** Board `#i-search`. */
export function SearchIcon({ color, size = 18 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={11} cy={11} r={6.5} stroke={color} {...stroke} />
      <Path d="M16 16l4.5 4.5" stroke={color} {...stroke} />
    </Svg>
  );
}

/** Board `#i-sort`. */
export function SortIcon({ color, size = 20 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M4 7h16M7 12h10M10 17h4" stroke={color} {...stroke} />
    </Svg>
  );
}

/** Board `#i-chev` (points right; `down` rotates it). */
export function ChevronIcon({ color, size = 14, down = false }: IconProps & { down?: boolean }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" style={down ? { transform: [{ rotate: "90deg" }] } : undefined}>
      <Path d="M9 5l7 7-7 7" stroke={color} {...stroke} />
    </Svg>
  );
}
