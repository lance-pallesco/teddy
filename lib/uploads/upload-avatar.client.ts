export async function uploadAvatar(file: File): Promise<string> {
  const formData = new FormData()
  formData.append("file", file)

  const response = await fetch("/api/uploads/avatar", {
    method: "POST",
    body: formData,
  })

  const data = (await response.json()) as { url?: string; error?: string }

  if (!response.ok) {
    throw new Error(data.error ?? "Avatar upload failed. Please try again.")
  }

  if (!data.url) {
    throw new Error("Avatar upload finished without a file URL.")
  }

  return data.url
}
