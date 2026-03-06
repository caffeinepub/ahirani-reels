import { Link, useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowLeft,
  Ban,
  Flag,
  Mail,
  MessageSquareX,
  Shield,
  ShieldCheck,
} from "lucide-react";

const CONTACT_EMAIL = "support@faktahirani.app";

interface SectionProps {
  title: string;
  titleMr: string;
  children: React.ReactNode;
}

function Section({ title, titleMr, children }: SectionProps) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-base font-semibold text-white">{title}</h2>
        <p className="text-xs text-white/40 mt-0.5">{titleMr}</p>
      </div>
      <div className="text-sm text-white/70 space-y-2 leading-relaxed">
        {children}
      </div>
    </section>
  );
}

const PLATFORM_RULES = [
  {
    icon: <Ban className="w-4 h-4 text-rose-400" />,
    en: "No Nudity",
    mr: "नग्नता नाही",
    desc: "No sexually explicit, nude, or pornographic content is allowed on the platform.",
    descMr: "प्लॅटफॉर्मवर लैंगिकदृष्ट्या स्पष्ट, नग्न किंवा अश्लील सामग्रीस परवानगी नाही.",
    color: "border-rose-500/20 bg-rose-500/5",
    dotColor: "bg-rose-500",
  },
  {
    icon: <AlertTriangle className="w-4 h-4 text-orange-400" />,
    en: "No Violence",
    mr: "हिंसा नाही",
    desc: "Graphic violence, gore, or content that promotes or glorifies harm to others is prohibited.",
    descMr:
      "ग्राफिक हिंसा किंवा इतरांना हानी पोहोचवण्याचे समर्थन करणारी सामग्री प्रतिबंधित आहे.",
    color: "border-orange-500/20 bg-orange-500/5",
    dotColor: "bg-orange-500",
  },
  {
    icon: <MessageSquareX className="w-4 h-4 text-amber-400" />,
    en: "No Hate Speech",
    mr: "द्वेषपूर्ण भाषण नाही",
    desc: "Content that attacks, demeans, or incites hatred toward individuals or groups based on religion, caste, gender, or ethnicity is not allowed.",
    descMr:
      "धर्म, जात, लिंग किंवा वांशिकतेच्या आधारावर द्वेष पसरवणारी सामग्री अनुमत नाही.",
    color: "border-amber-500/20 bg-amber-500/5",
    dotColor: "bg-amber-500",
  },
  {
    icon: <Flag className="w-4 h-4 text-red-400" />,
    en: "No Illegal Content",
    mr: "बेकायदेशीर सामग्री नाही",
    desc: "Content that promotes illegal activities, substances, or violates any Indian law is strictly prohibited.",
    descMr:
      "बेकायदेशीर कृती किंवा भारतीय कायद्याचे उल्लंघन करणाऱ्या सामग्रीस कठोरपणे प्रतिबंध आहे.",
    color: "border-red-500/20 bg-red-500/5",
    dotColor: "bg-red-500",
  },
];

export default function AgePolicyPage() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-dvh flex flex-col"
      style={{
        background:
          "radial-gradient(ellipse at top, oklch(0.10 0.04 30) 0%, oklch(0 0 0) 60%)",
      }}
      data-ocid="age_policy.page"
    >
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-3 px-4 py-4 border-b border-white/10 backdrop-blur-md bg-black/40">
        <button
          type="button"
          data-ocid="age_policy.back_button"
          onClick={() => navigate({ to: "/" })}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/15 transition-colors"
          aria-label="Back"
        >
          <ArrowLeft className="w-4 h-4 text-white" />
        </button>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-400" />
          <div>
            <h1 className="text-sm font-semibold text-white leading-tight">
              Age Policy & Platform Rules
            </h1>
            <p className="text-[10px] text-white/40">वय धोरण आणि नियम</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-8 max-w-lg mx-auto w-full">
        {/* App identity + 13+ badge */}
        <div
          className="rounded-2xl p-5 border border-amber-500/20 flex items-start gap-4"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.65 0.18 60 / 0.12), oklch(0.55 0.22 30 / 0.08))",
          }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.65 0.22 50), oklch(0.55 0.28 20))",
            }}
          >
            <Shield className="w-7 h-7 text-white" />
          </div>
          <div>
            <p className="text-base font-bold text-white">फक्त अहिराणी</p>
            <p className="text-xs text-white/50 mt-0.5">
              अहिराणी कलाकार आणि प्रेक्षकांसाठी खास रील प्लॅटफॉर्म
            </p>
            <div
              className="mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold text-white"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.65 0.22 50), oklch(0.55 0.28 20))",
              }}
            >
              <Shield className="w-3 h-3" />
              13+ Only
            </div>
          </div>
        </div>

        {/* Section 1: Minimum Age */}
        <Section
          title="1. Minimum Age Requirement"
          titleMr="१. किमान वय आवश्यकता"
        >
          <p>
            <strong className="text-white">फक्त अहिराणी</strong> is intended for
            users who are{" "}
            <strong className="text-amber-400">13 years of age or older</strong>
            . By creating an account, you confirm that you meet this minimum age
            requirement.
          </p>
          <p className="text-white/50 text-xs">
            <strong className="text-white/70">फक्त अहिराणी</strong> हे ॲप{" "}
            <strong className="text-amber-400">
              १३ वर्षे किंवा त्यापेक्षा मोठ्या
            </strong>{" "}
            वापरकर्त्यांसाठी आहे. खाते तयार करताना तुम्ही हे मान्य करता की तुम्ही या
            वयोमर्यादेची पूर्तता करता.
          </p>
          <div className="rounded-xl p-3 border border-amber-500/20 bg-amber-500/8 mt-2">
            <p className="text-amber-300 text-xs font-medium">
              ⚠️ If we discover an account belongs to someone under 13, it will
              be permanently removed.
            </p>
            <p className="text-amber-200/50 text-[11px] mt-1">
              जर आम्हाला आढळले की एखादे खाते १३ वर्षांपेक्षा कमी वयाच्या व्यक्तीचे आहे, ते
              कायमस्वरूपी हटवले जाईल.
            </p>
          </div>
        </Section>

        <div className="border-t border-white/8" />

        {/* Section 2: Platform Rules */}
        <Section title="2. Platform Rules" titleMr="२. प्लॅटफॉर्म नियम">
          <p>
            All users must follow these rules at all times. Violations may
            result in content removal, account suspension, or a permanent ban.
          </p>
          <p className="text-white/50 text-xs">
            सर्व वापरकर्त्यांनी हे नियम नेहमी पाळणे आवश्यक आहे. उल्लंघनामुळे सामग्री काढणे, खाते
            निलंबन किंवा कायमस्वरूपी बंदी होऊ शकते.
          </p>
          <ul className="space-y-3 mt-3">
            {PLATFORM_RULES.map((rule) => (
              <li
                key={rule.en}
                className={`flex gap-3 rounded-xl p-4 border ${rule.color}`}
              >
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "rgba(255,255,255,0.05)" }}
                >
                  {rule.icon}
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">
                    {rule.en}{" "}
                    <span className="text-white/40 font-normal">
                      / {rule.mr}
                    </span>
                  </p>
                  <p className="text-xs text-white/55 mt-1">{rule.desc}</p>
                  <p className="text-xs text-white/35 mt-0.5">{rule.descMr}</p>
                </div>
              </li>
            ))}
          </ul>
        </Section>

        <div className="border-t border-white/8" />

        {/* Section 3: Content Moderation */}
        <Section title="3. Content Moderation" titleMr="३. सामग्री नियंत्रण">
          <p>
            Our admin team (
            <strong className="text-white">Samadhan Mali</strong>) actively
            monitors content on the platform. Admin has full authority to:
          </p>
          <p className="text-white/50 text-xs">
            आमची admin टीम (
            <strong className="text-white/70">समाधान माळी</strong>) प्लॅटफॉर्मवरील
            सामग्री सक्रियपणे तपासते. Admin ला खालील अधिकार आहेत:
          </p>
          <ul className="space-y-2 mt-2">
            {[
              {
                en: "Remove any video that violates these rules",
                mr: "नियमांचे उल्लंघन करणारा कोणताही व्हिडिओ हटवणे",
              },
              {
                en: "Suspend or permanently block violating accounts",
                mr: "उल्लंघन करणारी खाती निलंबित किंवा कायमस्वरूपी ब्लॉक करणे",
              },
              {
                en: "Review and act on user reports within 48 hours",
                mr: "४८ तासांमध्ये वापरकर्त्यांच्या तक्रारींवर कारवाई करणे",
              },
              {
                en: "Delete comments that are offensive or harmful",
                mr: "आक्षेपार्ह किंवा हानिकारक टिप्पण्या हटवणे",
              },
            ].map((item) => (
              <li
                key={item.en}
                className="flex gap-3 rounded-xl p-3 bg-white/5 border border-white/8"
              >
                <span
                  className="mt-0.5 w-2 h-2 rounded-full shrink-0"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.65 0.22 50), oklch(0.55 0.28 20))",
                  }}
                />
                <div>
                  <p className="font-medium text-white text-xs">{item.en}</p>
                  <p className="text-[11px] text-white/40 mt-0.5">{item.mr}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="rounded-xl p-3 border border-white/10 bg-white/5 mt-2">
            <p className="text-white/60 text-xs">
              Content moderation decisions are final. Users who believe their
              content was removed unfairly may appeal by contacting support.
            </p>
            <p className="text-white/35 text-[11px] mt-1">
              सामग्री नियंत्रण निर्णय अंतिम असतात. ज्या वापरकर्त्यांना वाटते की त्यांची
              सामग्री अयोग्यरित्या काढली गेली, ते सपोर्टशी संपर्क करून अपील करू शकतात.
            </p>
          </div>
        </Section>

        <div className="border-t border-white/8" />

        {/* Section 4: Reporting */}
        <Section title="4. How to Report" titleMr="४. तक्रार कशी करावी">
          <p>
            If you see content that violates our rules, please report it
            immediately using the{" "}
            <strong className="text-white">"..." menu</strong> on any video and
            selecting <strong className="text-white">"Report"</strong>.
          </p>
          <p className="text-white/50 text-xs">
            जर तुम्हाला नियमांचे उल्लंघन करणारी सामग्री दिसली, तर कृपया कोणत्याही
            व्हिडिओवरील <strong className="text-white/70">"..."</strong> मेनू वापरून{" "}
            <strong className="text-white/70">"Report"</strong> निवडून त्वरित
            तक्रार करा.
          </p>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {[
              {
                label: "Copyright Violation",
                mr: "कॉपीराइट उल्लंघन",
                color: "text-orange-400",
              },
              { label: "Abuse", mr: "गैरवर्तन", color: "text-red-400" },
              { label: "Spam", mr: "स्पॅम", color: "text-amber-400" },
              {
                label: "Inappropriate Content",
                mr: "अयोग्य सामग्री",
                color: "text-pink-400",
              },
            ].map((r) => (
              <div
                key={r.label}
                className="rounded-xl p-2.5 bg-white/5 border border-white/8"
              >
                <p className={`text-xs font-semibold ${r.color}`}>{r.label}</p>
                <p className="text-[10px] text-white/40 mt-0.5">{r.mr}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-white/50 mt-2">
            You can also email us directly at{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-amber-400 hover:text-amber-300 transition-colors"
            >
              {CONTACT_EMAIL}
            </a>
          </p>
        </Section>

        <div className="border-t border-white/8" />

        {/* Contact */}
        <div
          className="rounded-2xl p-5 border border-amber-500/20 space-y-3"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.65 0.22 50 / 0.10), oklch(0.55 0.28 20 / 0.06))",
          }}
          data-ocid="age_policy.contact_card"
        >
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-amber-400" />
            <p className="text-sm font-semibold text-white">
              Contact Us / संपर्क करा
            </p>
          </div>
          <p className="text-xs text-white/60 leading-relaxed">
            For questions about our age policy or platform rules, please contact
            us.
          </p>
          <p className="text-xs text-white/40">
            वय धोरण किंवा प्लॅटफॉर्म नियमांबद्दल प्रश्न असल्यास, आमच्याशी संपर्क करा.
          </p>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            data-ocid="age_policy.contact_email_link"
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-80"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.65 0.22 50), oklch(0.55 0.28 20))",
            }}
          >
            <Mail className="w-4 h-4" />
            {CONTACT_EMAIL}
          </a>
        </div>

        {/* Back to app link */}
        <div className="text-center pb-4">
          <Link
            to="/"
            data-ocid="age_policy.home_link"
            className="text-xs text-white/40 hover:text-white/60 transition-colors underline underline-offset-2"
          >
            ← Back to फक्त अहिराणी
          </Link>
          <div className="mt-3 flex items-center justify-center gap-3 text-[11px] text-white/30">
            <Link
              to="/privacy"
              className="hover:text-white/50 transition-colors"
            >
              Privacy Policy
            </Link>
            <span>·</span>
            <Link to="/terms" className="hover:text-white/50 transition-colors">
              Terms
            </Link>
            <span>·</span>
            <Link
              to="/contact"
              className="hover:text-white/50 transition-colors"
            >
              Contact
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
