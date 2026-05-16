import assert from "node:assert/strict"
import test from "node:test"

import {
  assertBlobWriteTokenConfigured,
  MissingBlobTokenError,
} from "./blob.ts"

test("assertBlobWriteTokenConfigured throws when blob token is missing", () => {
  const previous = process.env.BLOB_READ_WRITE_TOKEN

  delete process.env.BLOB_READ_WRITE_TOKEN

  try {
    assert.throws(() => assertBlobWriteTokenConfigured(), MissingBlobTokenError)
  } finally {
    if (previous === undefined) {
      delete process.env.BLOB_READ_WRITE_TOKEN
    } else {
      process.env.BLOB_READ_WRITE_TOKEN = previous
    }
  }
})

test("assertBlobWriteTokenConfigured accepts a non-empty blob token", () => {
  const previous = process.env.BLOB_READ_WRITE_TOKEN

  process.env.BLOB_READ_WRITE_TOKEN = "test-token"

  try {
    assert.doesNotThrow(() => assertBlobWriteTokenConfigured())
  } finally {
    if (previous === undefined) {
      delete process.env.BLOB_READ_WRITE_TOKEN
    } else {
      process.env.BLOB_READ_WRITE_TOKEN = previous
    }
  }
})
