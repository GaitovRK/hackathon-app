import en from "../../messages/en.json";

export type MessageKey = keyof typeof en;

/** Copy lookup with `{name}` placeholders: `t("home.freeLeft", { count: 3 })`. */
export function t(key: MessageKey, vars?: Record<string, string | number>): string {
  const template: string = en[key];
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) => (name in vars ? String(vars[name]) : match));
}
