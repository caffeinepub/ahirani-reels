import { toast } from "sonner";

/**
 * Generate the canonical referral link for a given code.
 * Uses the current app's origin so it works on any domain (draft, live, custom).
 */
export function getReferralLink(referralCode: string): string {
  const origin = window.location.origin;
  return `${origin}/join?ref=${referralCode}`;
}

/**
 * Share a referral link using the native Web Share API.
 * Falls back to clipboard copy if navigator.share is not available.
 */
export async function shareReferralLink(referralCode: string): Promise<void> {
  const referralLink = getReferralLink(referralCode);

  try {
    if (navigator.share) {
      await navigator.share({
        title: "फक्त अहिराणी",
        text: "खान्देशी कलाकारांसाठी Reel App. माझ्या लिंकने जॉइन करा.",
        url: referralLink,
      });
    } else {
      await navigator.clipboard.writeText(referralLink);
      toast.success("लिंक कॉपी झाली!", {
        description: referralLink,
      });
    }
  } catch (err) {
    // User cancelled the share dialog — not an error we need to surface
    if (err instanceof Error && err.name === "AbortError") return;
    // Fallback: try clipboard
    try {
      await navigator.clipboard.writeText(referralLink);
      toast.success("लिंक कॉपी झाली!");
    } catch {
      toast.error("लिंक शेअर होऊ शकली नाही");
    }
  }
}

/**
 * Read the ?ref= query param from the current URL.
 * Returns the referral code if present, or null.
 */
export function getReferralCodeFromUrl(): string | null {
  try {
    const params = new URLSearchParams(window.location.search);
    return params.get("ref");
  } catch {
    return null;
  }
}
