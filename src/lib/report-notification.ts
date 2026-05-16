export function isLastDayOfMonth(date = new Date()): boolean {
  const lastDay = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)
  ).getUTCDate()

  return date.getUTCDate() === lastDay
}
