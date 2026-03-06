import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  Copy,
  Headphones,
  Mail,
  MessageCircle,
  Phone,
  Send,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const CONTACT_EMAIL = "support@faktahirani.app";

// ─── FAQ Item ─────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: "How do I upload a video?",
    qMr: "व्हिडिओ कसा अपलोड करायचा?",
    a: "Go to the Upload tab (+ icon in the bottom nav). You need an active Artist subscription (₹600/year) to upload. Select your video, add a caption and hashtags, then tap Post.",
    aMr: "खालील नेव्हिगेशन मधील + बटण दाबा. व्हिडिओ अपलोड करण्यासाठी आर्टिस्ट सबस्क्रिप्शन (₹600/वर्ष) असणे आवश्यक आहे.",
  },
  {
    q: "How do I withdraw my earnings?",
    qMr: "माझी कमाई कशी काढायची?",
    a: "Open Wallet → Earnings tab. Enter your UPI ID or bank details and request a withdrawal (minimum ₹200). Admin (Samadhan Mali) will review and approve your request.",
    aMr: "वॉलेट → कमाई टॅब उघडा. UPI ID किंवा बँक तपशील टाका आणि काढण्याची विनंती करा (किमान ₹200). अॅडमिन मंजूर करेल.",
  },
  {
    q: "What is the artist subscription?",
    qMr: "आर्टिस्ट सबस्क्रिप्शन काय आहे?",
    a: "Artists must subscribe for ₹600/year to upload videos on फक्त अहिराणी. Your subscription unlocks video uploads, ad revenue sharing (60%), and premium content access.",
    aMr: "आर्टिस्ट सबस्क्रिप्शन ₹600/वर्ष आहे. यामुळे व्हिडिओ अपलोड, जाहिरात महसूल (60%) आणि प्रीमियम सामग्री उपलब्ध होते.",
  },
  {
    q: "How does the referral system work?",
    qMr: "रेफरल सिस्टम कसे काम करते?",
    a: "Share your unique referral link from the Wallet → Refs tab. When a new user signs up using your link and watches 3 videos, you earn ₹5–₹10. Artists earn ₹60 when their referred user subscribes.",
    aMr: "वॉलेट → रेफरल टॅब मधून तुमची लिंक शेअर करा. नवीन वापरकर्ता 3 व्हिडिओ पाहिल्यानंतर तुम्हाला ₹5–₹10 मिळतात.",
  },
  {
    q: "How do I report a video?",
    qMr: "व्हिडिओ कसा रिपोर्ट करायचा?",
    a: "Tap the ••• (three dots) menu on any video and select 'Report'. Your report will be reviewed by the admin. Videos violating our Terms will be removed.",
    aMr: "कोणत्याही व्हिडिओवर ••• बटण दाबा आणि 'रिपोर्ट' निवडा. अॅडमिन तपासणी करेल आणि नियम मोडणारे व्हिडिओ काढून टाकेल.",
  },
];

function FaqCard({
  item,
  index,
}: {
  item: (typeof FAQ_ITEMS)[0];
  index: number;
}) {
  const [open, setOpen] = useState(false);
  const ocid = `contact.faq_item.${index}` as
    | "contact.faq_item.1"
    | "contact.faq_item.2"
    | "contact.faq_item.3"
    | "contact.faq_item.4"
    | "contact.faq_item.5";

  return (
    <div
      data-ocid={ocid}
      className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden transition-colors hover:bg-white/[0.07]"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-start gap-3 px-4 py-3.5 text-left"
        aria-expanded={open}
      >
        <span
          className="mt-0.5 w-1.5 h-1.5 rounded-full shrink-0 mt-2"
          style={{ background: "oklch(0.62 0.17 185)" }}
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white leading-snug">
            {item.q}
          </p>
          <p className="text-[11px] text-white/40 mt-0.5">{item.qMr}</p>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-white/40 shrink-0 mt-1 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="px-4 pb-4 pt-0 border-t border-white/8">
          <p className="text-sm text-white/65 leading-relaxed mt-3">{item.a}</p>
          <p className="text-xs text-white/35 mt-2 leading-relaxed">
            {item.aMr}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ContactPage() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    contact?: string;
    message?: string;
  }>({});

  function copyEmail() {
    navigator.clipboard.writeText(CONTACT_EMAIL).then(() => {
      toast.success("ईमेल कॉपी झाला! / Email copied!");
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors: typeof errors = {};
    if (!name.trim()) newErrors.name = "Name is required / नाव आवश्यक आहे";
    if (!contact.trim())
      newErrors.contact = "Phone or email required / फोन/ईमेल आवश्यक आहे";
    if (!message.trim())
      newErrors.message = "Message is required / संदेश आवश्यक आहे";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setSubmitted(true);
  }

  return (
    <div
      data-ocid="contact.page"
      className="min-h-dvh flex flex-col"
      style={{
        background:
          "radial-gradient(ellipse at top, oklch(0.08 0.04 185) 0%, oklch(0 0 0) 65%)",
      }}
    >
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 flex items-center gap-3 px-4 py-4 border-b border-white/10 backdrop-blur-md bg-black/40">
        <button
          type="button"
          data-ocid="contact.back_button"
          onClick={() => navigate({ to: "/" })}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/15 transition-colors"
          aria-label="Back"
        >
          <ArrowLeft className="w-4 h-4 text-white" />
        </button>
        <div className="flex items-center gap-2">
          <Headphones
            className="w-4 h-4"
            style={{ color: "oklch(0.62 0.17 185)" }}
          />
          <div>
            <h1 className="text-sm font-semibold text-white leading-tight">
              Contact &amp; Support
            </h1>
            <p className="text-[10px] text-white/40">संपर्क आणि मदत</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6 max-w-lg mx-auto w-full">
        {/* Hero Card */}
        <div
          className="rounded-2xl p-5 border border-white/10"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.55 0.18 185 / 0.14), oklch(0.55 0.18 195 / 0.08))",
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <MessageCircle
              className="w-5 h-5"
              style={{ color: "oklch(0.62 0.17 185)" }}
            />
            <p className="text-base font-bold text-white">We're here to help</p>
          </div>
          <p className="text-xs text-white/50 mb-3">आम्ही मदतीसाठी आहोत</p>
          <p className="text-xs text-white/40 leading-relaxed">
            अहिराणी कलाकार आणि प्रेक्षकांसाठी खास रील प्लॅटफॉर्म ·{" "}
            <span className="text-white/30">
              A dedicated short video platform for Ahirani/Khandeshi artists and
              viewers.
            </span>
          </p>
        </div>

        {/* Email Support Card */}
        <div
          className="rounded-2xl p-5 border border-white/10 space-y-4"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.55 0.18 185 / 0.10), oklch(0.55 0.18 200 / 0.05))",
          }}
        >
          <div className="flex items-center gap-2">
            <Mail
              className="w-4 h-4"
              style={{ color: "oklch(0.62 0.17 185)" }}
            />
            <p className="text-sm font-semibold text-white">
              Email Support{" "}
              <span className="text-white/40 font-normal">/ ईमेल सपोर्ट</span>
            </p>
          </div>
          <p className="text-xs text-white/55 leading-relaxed">
            Send us an email and we'll respond within 24 hours.
            <br />
            <span className="text-white/35">
              ईमेल पाठवा, आम्ही 24 तासांत उत्तर देऊ.
            </span>
          </p>

          {/* Email + actions row */}
          <div className="flex items-center gap-2 flex-wrap">
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              data-ocid="contact.email_link"
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-80 active:opacity-70"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.55 0.18 185), oklch(0.50 0.18 200))",
              }}
            >
              <Mail className="w-4 h-4" />
              {CONTACT_EMAIL}
            </a>
            <button
              type="button"
              data-ocid="contact.email_copy_button"
              onClick={copyEmail}
              aria-label="Copy email address"
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/15 transition-colors border border-white/10"
            >
              <Copy className="w-4 h-4 text-white/60" />
            </button>
          </div>
        </div>

        {/* Contact Form Card */}
        <div className="rounded-2xl p-5 border border-white/10 bg-white/5">
          <div className="flex items-center gap-2 mb-4">
            <Send
              className="w-4 h-4"
              style={{ color: "oklch(0.62 0.17 185)" }}
            />
            <p className="text-sm font-semibold text-white">
              Send a Message{" "}
              <span className="text-white/40 font-normal">/ संदेश पाठवा</span>
            </p>
          </div>

          {submitted ? (
            <div
              data-ocid="contact.form_success_state"
              className="flex flex-col items-center gap-3 py-6 text-center"
            >
              <CheckCircle2
                className="w-10 h-10"
                style={{ color: "oklch(0.62 0.17 185)" }}
              />
              <p className="text-base font-semibold text-white">
                Message Sent! / संदेश पाठवला!
              </p>
              <p className="text-xs text-white/50 leading-relaxed max-w-xs">
                We'll reply to{" "}
                <span className="text-white/70">{CONTACT_EMAIL}</span> within 24
                hours. / आम्ही 24 तासांत उत्तर देऊ.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setName("");
                  setContact("");
                  setMessage("");
                }}
                className="mt-2 text-xs underline underline-offset-2 text-white/40 hover:text-white/60 transition-colors"
              >
                Send another message / आणखी संदेश पाठवा
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3" noValidate>
              {/* Name */}
              <div className="space-y-1">
                <Input
                  data-ocid="contact.form_name_input"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name)
                      setErrors((p) => ({ ...p, name: undefined }));
                  }}
                  placeholder="Your Name / तुमचे नाव"
                  className="bg-white/8 border-white/12 text-white placeholder:text-white/30 focus:border-white/25 text-sm h-11"
                  autoComplete="name"
                />
                {errors.name && (
                  <p className="text-xs text-red-400">{errors.name}</p>
                )}
              </div>

              {/* Phone / Email */}
              <div className="space-y-1">
                <Input
                  data-ocid="contact.form_contact_input"
                  value={contact}
                  onChange={(e) => {
                    setContact(e.target.value);
                    if (errors.contact)
                      setErrors((p) => ({ ...p, contact: undefined }));
                  }}
                  placeholder="Phone / Email"
                  className="bg-white/8 border-white/12 text-white placeholder:text-white/30 focus:border-white/25 text-sm h-11"
                  autoComplete="email"
                  inputMode="email"
                />
                {errors.contact && (
                  <p className="text-xs text-red-400">{errors.contact}</p>
                )}
              </div>

              {/* Message */}
              <div className="space-y-1">
                <Textarea
                  data-ocid="contact.form_message_textarea"
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    if (errors.message)
                      setErrors((p) => ({ ...p, message: undefined }));
                  }}
                  placeholder="Your message... / तुमचा संदेश..."
                  rows={4}
                  className="bg-white/8 border-white/12 text-white placeholder:text-white/30 focus:border-white/25 text-sm resize-none"
                />
                {errors.message && (
                  <p className="text-xs text-red-400">{errors.message}</p>
                )}
              </div>

              <Button
                type="submit"
                data-ocid="contact.form_submit_button"
                className="w-full h-11 font-semibold text-white transition-opacity hover:opacity-90"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.55 0.18 185), oklch(0.50 0.18 200))",
                  border: "none",
                }}
              >
                <Send className="w-4 h-4 mr-2" />
                Send Message / संदेश पाठवा
              </Button>
            </form>
          )}
        </div>

        {/* FAQ Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-white/40" />
            <p className="text-sm font-semibold text-white">
              Frequently Asked Questions
            </p>
          </div>
          <p className="text-xs text-white/35">वारंवार विचारले जाणारे प्रश्न</p>
          <div className="space-y-2 mt-2">
            {FAQ_ITEMS.map((item, idx) => (
              <FaqCard key={item.q} item={item} index={idx + 1} />
            ))}
          </div>
        </div>

        <div className="border-t border-white/8" />

        {/* Footer */}
        <p className="text-center text-xs text-white/25 pb-2">
          फक्त अहिराणी · {CONTACT_EMAIL}
        </p>

        <div className="h-4" />
      </div>
    </div>
  );
}
