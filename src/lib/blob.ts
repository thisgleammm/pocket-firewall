import { put } from "@vercel/blob"

export class MissingBlobTokenError extends Error {
  constructor() {
    super(
      "BLOB_READ_WRITE_TOKEN belum dikonfigurasi. Tambahkan env ini lalu generate ulang laporan."
    )
    this.name = "MissingBlobTokenError"
  }
}

export class BlobUploadError extends Error {
  constructor() {
    super("Upload PDF ke Vercel Blob gagal. Coba lagi beberapa saat lagi.")
    this.name = "BlobUploadError"
  }
}

export function assertBlobWriteTokenConfigured() {
  if (!process.env.BLOB_READ_WRITE_TOKEN?.trim()) {
    throw new MissingBlobTokenError()
  }
}

export async function uploadPdfReport(pathname: string, buffer: Buffer) {
  assertBlobWriteTokenConfigured()

  try {
    return await put(pathname, buffer, {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/pdf",
    })
  } catch {
    throw new BlobUploadError()
  }
}
