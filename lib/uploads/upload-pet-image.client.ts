export async function uploadPetImage(file: File): Promise<string> {
  const formData = new FormData()
  formData.append("file", file)

  const response = await fetch("/api/uploads/pet-image", {
    method: "POST",
    body: formData,
  })

  const data = (await response.json()) as { url?: string; error?: string }

  if (!response.ok) {
    throw new Error(data.error ?? "Image upload failed. Please try again.")
  }

  if (!data.url) {
    throw new Error("Image upload finished without a file URL.")
  }

  return data.url
}
