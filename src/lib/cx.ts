// Tiny className joiner — keeps conditional Tailwind classes readable without
// pulling in clsx/classnames. Falsy values are dropped.

export type ClassValue = string | false | null | undefined

export function cx(...parts: ClassValue[]): string {
  return parts.filter(Boolean).join(' ')
}
