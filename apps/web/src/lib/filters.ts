const BANNED_WORDS = [
  "spam", "scam", "nude", "sexting", "vulgar", "abuse", "hate", "kill"
];

export function filterContent(text: string): string {
  let filtered = text;
  BANNED_WORDS.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, "gi");
    filtered = filtered.replace(regex, "****");
  });
  return filtered;
}

export function hasBannedContent(text: string): boolean {
  return BANNED_WORDS.some(word => {
    const regex = new RegExp(`\\b${word}\\b`, "gi");
    return regex.test(text);
  });
}
