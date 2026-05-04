type ErrorLike = {
  code?: string | null
  message?: string | null
}

export function isMissingProfileColumnError(error: ErrorLike | null | undefined): boolean {
  if (!error) return false

  if (error.code === "PGRST204" || error.code === "42703") return true

  const message = (error.message ?? "").toLowerCase()
  return message.includes("column profiles.") || message.includes("could not find the")
}
