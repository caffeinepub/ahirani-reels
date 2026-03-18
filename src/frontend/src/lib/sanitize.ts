// Strip HTML tags and dangerous characters from user input
export function sanitizeText(input: string): string {
  return input
    .replace(/<[^>]*>/g, "") // strip HTML tags
    .replace(/javascript:/gi, "") // strip js: protocol
    .replace(/on\w+\s*=/gi, "") // strip event handlers
    .trim();
}
