import { PillButton, type ButtonProps } from "./ButtonPrimary";

/** Mist pill (Shuffle, Not mine, Retry). */
export function ButtonSecondary(props: ButtonProps) {
  return <PillButton {...props} variant="secondary" />;
}

/** Text-only pill (Skip, Not now). */
export function ButtonGhost(props: ButtonProps) {
  return <PillButton {...props} variant="ghost" />;
}

/** Volt pill for every Pro / upsell action (Try Pro, Unlock). */
export function ButtonVolt(props: ButtonProps) {
  return <PillButton {...props} variant="pop" />;
}
