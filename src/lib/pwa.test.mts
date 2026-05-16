import assert from "node:assert/strict"
import test from "node:test"

import { shouldShowInstallPrompt } from "./pwa.ts"

test("shouldShowInstallPrompt only when prompt available and not dismissed", () => {
  assert.equal(
    shouldShowInstallPrompt({
      dismissed: false,
      hasPrompt: true,
      installed: false,
      standalone: false,
    }),
    true
  )

  assert.equal(
    shouldShowInstallPrompt({
      dismissed: true,
      hasPrompt: true,
      installed: false,
      standalone: false,
    }),
    false
  )

  assert.equal(
    shouldShowInstallPrompt({
      dismissed: false,
      hasPrompt: false,
      installed: false,
      standalone: false,
    }),
    false
  )

  assert.equal(
    shouldShowInstallPrompt({
      dismissed: false,
      hasPrompt: true,
      installed: true,
      standalone: false,
    }),
    false
  )

  assert.equal(
    shouldShowInstallPrompt({
      dismissed: false,
      hasPrompt: true,
      installed: false,
      standalone: true,
    }),
    false
  )
})
