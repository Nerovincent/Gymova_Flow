export function getSpecialtyEmoji(specialties: string[]): string {
  const joined = specialties.join(" ").toLowerCase()
  if (joined.includes("boxing") || joined.includes("mma") || joined.includes("kickbox")) return "🥊"
  if (joined.includes("yoga") || joined.includes("mobility") || joined.includes("flexibility")) return "🧘"
  if (joined.includes("crossfit") || joined.includes("olympic")) return "🏋️"
  if (joined.includes("bodybuilding") || joined.includes("strength") || joined.includes("powerlifting")) return "💪"
  if (joined.includes("hiit") || joined.includes("cardio") || joined.includes("weight loss")) return "🔥"
  if (joined.includes("swimming") || joined.includes("cycling") || joined.includes("spin")) return "🚴"
  if (joined.includes("pilates") || joined.includes("stretch")) return "🤸"
  if (joined.includes("nutrition") || joined.includes("diet")) return "🥗"
  return "🏃"
}
