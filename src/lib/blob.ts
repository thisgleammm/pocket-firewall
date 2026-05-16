import { put } from "@vercel/blob"

export async function uploadPdfReport(pathname: string, buffer: Buffer) {
  return put(pathname, buffer, {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/pdf",
  })
}
