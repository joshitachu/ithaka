// lib/utils.ts

export function cn(
  ...inputs: Array<string | number | boolean | null | undefined>
) {
  return inputs
    .filter((value) => {
      if (value === null || value === undefined || value === false) return false
      return String(value).trim().length > 0
    })
    .join(" ")
}
