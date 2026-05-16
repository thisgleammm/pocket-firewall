import assert from "node:assert/strict"
import test from "node:test"

import { isLastDayOfMonth } from "./report-notification.ts"

test("isLastDayOfMonth true only on calendar last day", () => {
  assert.equal(isLastDayOfMonth(new Date("2026-02-28T10:00:00.000Z")), true)
  assert.equal(isLastDayOfMonth(new Date("2026-02-27T10:00:00.000Z")), false)
  assert.equal(isLastDayOfMonth(new Date("2026-12-31T10:00:00.000Z")), true)
  assert.equal(isLastDayOfMonth(new Date("2026-05-16T10:00:00.000Z")), false)
})
