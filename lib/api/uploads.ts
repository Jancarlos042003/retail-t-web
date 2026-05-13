import type { StorageUploadRead } from "../types"
import { apiFetchForm } from "./base"

export function uploadImage(file: File): Promise<StorageUploadRead> {
  const form = new FormData()
  form.append("file", file)
  return apiFetchForm<StorageUploadRead>("/storage/upload", form)
}
