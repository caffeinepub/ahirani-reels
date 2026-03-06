import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Info, Mail } from "lucide-react";

const CONTACT_EMAIL = "support@faktahirani.app";

const features = [
  {
    icon: "🎬",
    title: "Short Video Reels",
    titleMr: "शॉर्ट व्हिडिओ रील्स",
    desc: "Vertical reels feed like TikTok — swipe, watch, and enjoy Ahirani content.",
    descMr: "TikTok सारखा व्हर्टिकल रील्स फीड — स्वाइप करा, पाहा आणि आनंद घ्या.",
  },
  {
    icon: "📡",
    title: "Live Streaming",
    titleMr: "लाइव्ह स्ट्रीमिंग",
    desc: "Go live and connect with your fans in real time.",
    descMr: "लाइव्ह जा आणि तुमच्या चाहत्यांशी थेट जोडला जा.",
  },
  {
    icon: "💰",
    title: "Artist Earnings",
    titleMr: "कलाकार कमाई",
    desc: "Earn from ad revenue with a 60% artist share on every impression.",
    descMr: "प्रत्येक इम्प्रेशनवर 60% कलाकार हिस्सा मिळवा.",
  },
  {
    icon: "🔗",
    title: "Referral Income",
    titleMr: "रेफरल उत्पन्न",
    desc: "Invite friends and earn ₹10 for every successful referral.",
    descMr: "मित्रांना आमंत्रित करा आणि प्रत्येक यशस्वी रेफरलसाठी ₹10 मिळवा.",
  },
  {
    icon: "🎁",
    title: "Gifts & Coins",
    titleMr: "भेटवस्तू व नाणी",
    desc: "Send virtual gifts to your favourite creators during live or video.",
    descMr: "लाइव्ह किंवा व्हिडिओ दरम्यान आवडत्या कलाकारांना व्हर्चुअल भेटवस्तू पाठवा.",
  },
  {
    icon: "🎥",
    title: "Future OTT",
    titleMr: "भविष्यातील OTT",
    desc: "Movies, web series & premium content coming soon.",
    descMr: "चित्रपट, वेब सीरिज आणि प्रीमियम कंटेंट लवकरच येत आहे.",
  },
];

const rules = [
  { icon: "🔞", en: "Age 13+ only", mr: "वय 13+ फक्त" },
  { icon: "🚫", en: "No nudity or violence", mr: "अश्लीलता किंवा हिंसा नाही" },
  { icon: "⚖️", en: "No illegal content", mr: "बेकायदेशीर कंटेंट नाही" },
  { icon: "🛡️", en: "Admin moderation active", mr: "व्यवस्थापक मॉडरेशन सक्रिय" },
];

export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-dvh flex flex-col"
      style={{
        background:
          "radial-gradient(ellipse at top, oklch(0.10 0.04 170) 0%, oklch(0 0 0) 60%)",
      }}
      data-ocid="about.page"
    >
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-3 px-4 py-4 border-b border-white/10 backdrop-blur-md bg-black/40">
        <button
          type="button"
          data-ocid="about.back_button"
          onClick={() => navigate({ to: "/" })}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/15 transition-colors"
          aria-label="Back"
        >
          <ArrowLeft className="w-4 h-4 text-white" />
        </button>
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-emerald-400" />
          <div>
            <h1 className="text-sm font-semibold text-white leading-tight">
              About
            </h1>
            <p className="text-[10px] text-white/40">आमच्याबद्दल</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-8 max-w-lg mx-auto w-full">
        {/* Hero / Brand */}
        <div
          className="rounded-2xl p-5 border border-white/10 text-center space-y-3"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.10 0.06 170 / 0.60), oklch(0.08 0.04 160 / 0.40))",
          }}
        >
          <div
            className="text-2xl font-bold"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.80 0.18 170), oklch(0.75 0.20 155))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            फक्त अहिराणी
          </div>
          <p className="text-sm text-white/70 leading-relaxed">
            अहिराणी कलाकार आणि प्रेक्षकांसाठी खास रील प्लॅटफॉर्म
          </p>
          <p className="text-xs text-white/40">
            A short video platform exclusively for Ahirani artists and viewers
          </p>
          <div
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-semibold text-emerald-300 border border-emerald-400/20"
            style={{
              background: "oklch(0.12 0.06 170 / 0.50)",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
            Est. 2024
          </div>
        </div>

        {/* Our Mission */}
        <section className="space-y-3">
          <div>
            <h2 className="text-base font-semibold text-white">Our Mission</h2>
            <p className="text-xs text-white/40 mt-0.5">आमचे ध्येय</p>
          </div>
          <div className="rounded-2xl p-4 border border-white/8 bg-white/4 space-y-3 text-sm leading-relaxed">
            <p className="text-white/70">
              <strong className="text-white">फक्त अहिराणी</strong> is a dedicated
              platform for Ahirani (Khandeshi) language artists and viewers. We
              celebrate regional culture, talent, and language through short
              video reels, live streaming, and premium content.
            </p>
            <p className="text-white/45 text-xs leading-relaxed">
              <strong className="text-white/60">फक्त अहिराणी</strong> हे अहिराणी
              (खान्देशी) भाषेतील कलाकार आणि प्रेक्षकांसाठी एक समर्पित व्यासपीठ आहे. आम्ही
              शॉर्ट व्हिडिओ रील्स, लाइव्ह स्ट्रीमिंग आणि प्रीमियम कंटेंटद्वारे प्रादेशिक संस्कृती,
              प्रतिभा आणि भाषेचा उत्सव साजरा करतो.
            </p>
          </div>
        </section>

        <div className="border-t border-white/8" />

        {/* Features */}
        <section className="space-y-4">
          <div>
            <h2 className="text-base font-semibold text-white">Features</h2>
            <p className="text-xs text-white/40 mt-0.5">वैशिष्ट्ये</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {features.map((f, i) => (
              <div
                key={f.title}
                data-ocid={`about.feature.item.${i + 1}`}
                className="rounded-2xl p-4 border border-white/8 space-y-2"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.10 0.03 170 / 0.50), oklch(0.07 0.02 160 / 0.30))",
                }}
              >
                <span className="text-2xl">{f.icon}</span>
                <div>
                  <p className="text-xs font-semibold text-white leading-tight">
                    {f.title}
                  </p>
                  <p className="text-[10px] text-white/40 mt-0.5">
                    {f.titleMr}
                  </p>
                </div>
                <p className="text-[10px] text-white/55 leading-relaxed">
                  {f.desc}
                </p>
                <p className="text-[10px] text-white/35 leading-relaxed">
                  {f.descMr}
                </p>
              </div>
            ))}
          </div>
        </section>

        <div className="border-t border-white/8" />

        {/* Support Local Talent CTA */}
        <div
          className="rounded-2xl p-5 border border-orange-400/20 space-y-3"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.45 0.18 50 / 0.20), oklch(0.40 0.20 35 / 0.12))",
          }}
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">🌟</span>
            <div>
              <p className="text-sm font-semibold text-white">
                Support Local Talent
              </p>
              <p className="text-[10px] text-orange-300/60">
                स्थानिक प्रतिभेला पाठिंबा द्या
              </p>
            </div>
          </div>
          <p className="text-sm text-white/70 leading-relaxed">
            Support local Ahirani talent. Upload your content, build your
            audience, and earn while doing what you love.
          </p>
          <p className="text-xs text-white/45 leading-relaxed">
            स्थानिक अहिराणी प्रतिभेला पाठिंबा द्या. तुमचे कंटेंट अपलोड करा, प्रेक्षक तयार
            करा, आणि आवडते काम करताना कमाई करा.
          </p>
        </div>

        <div className="border-t border-white/8" />

        {/* About the Founder */}
        <section className="space-y-4" data-ocid="about.founder.section">
          <div>
            <h2 className="text-base font-semibold text-white">
              About the Founder
            </h2>
            <p className="text-xs text-white/40 mt-0.5">संस्थापकाबद्दल</p>
          </div>
          <div
            className="rounded-2xl border border-white/10 overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.10 0.05 260 / 0.50), oklch(0.08 0.04 240 / 0.30))",
            }}
          >
            {/* Founder header */}
            <div
              className="px-5 py-4 flex items-center gap-4 border-b border-white/8"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.14 0.07 260 / 0.60), oklch(0.10 0.05 250 / 0.40))",
              }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 border border-white/10"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.45 0.18 260 / 0.40), oklch(0.40 0.20 245 / 0.30))",
                }}
              >
                👤
              </div>
              <div>
                <p className="text-base font-bold text-white">समाधान माळी</p>
                <p className="text-xs text-white/50 mt-0.5">Samadhan Mali</p>
                <div
                  className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 mt-1.5 text-[10px] font-semibold border border-blue-400/20"
                  style={{ background: "oklch(0.12 0.06 260 / 0.60)" }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block" />
                  <span className="text-blue-300">Founder & CEO</span>
                </div>
              </div>
            </div>

            {/* Founder content */}
            <div className="px-5 py-4 space-y-3 text-sm leading-relaxed">
              <p className="text-white/75">
                "फक्त अहिराणी" हा OTT प्लॅटफॉर्म खान्देशी अहिराणी भाषा, संस्कृती आणि
                स्थानिक कलाकारांना एक डिजिटल मंच देण्यासाठी सुरू करण्यात आला आहे.
              </p>
              <p className="text-white/65">
                या प्लॅटफॉर्मचे संस्थापक समाधान माळी आहेत. त्यांचे उद्दिष्ट खान्देशी भागातील
                गायक, कॉमेडियन, अभिनेता आणि व्हिडिओ क्रिएटर यांना त्यांची कला जगापर्यंत
                पोहोचवण्यासाठी एक संधी देणे आहे.
              </p>
              <p className="text-white/55">
                या प्लॅटफॉर्मवर अहिराणी गाणी, कॉमेडी व्हिडिओ, वेब सिरीज, चित्रपट आणि
                मनोरंजनाचे विविध प्रकारचे व्हिडिओ उपलब्ध असतील.
              </p>
              {/* Vision highlight */}
              <div
                className="rounded-xl px-4 py-3 border border-white/8 mt-2"
                style={{
                  background: "oklch(0.10 0.04 260 / 0.40)",
                }}
              >
                <div className="flex items-start gap-2">
                  <span className="text-lg mt-0.5">🎯</span>
                  <p className="text-xs text-white/70 leading-relaxed">
                    <span className="text-white font-semibold">
                      "फक्त अहिराणी" चे मुख्य ध्येय
                    </span>{" "}
                    म्हणजे स्थानिक टॅलेंटला सपोर्ट करणे आणि खान्देशी संस्कृती डिजिटल जगात पुढे
                    नेणे.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="border-t border-white/8" />

        {/* Platform Rules */}
        <section className="space-y-3">
          <div>
            <h2 className="text-base font-semibold text-white">
              Platform Rules
            </h2>
            <p className="text-xs text-white/40 mt-0.5">प्लॅटफॉर्म नियम</p>
          </div>
          <div className="space-y-2">
            {rules.map((r) => (
              <div
                key={r.en}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 bg-white/5 border border-white/8"
              >
                <span className="text-base">{r.icon}</span>
                <div>
                  <p className="text-xs font-medium text-white">{r.en}</p>
                  <p className="text-[10px] text-white/40">{r.mr}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="border-t border-white/8" />

        {/* Contact */}
        <div
          className="rounded-2xl p-5 border border-white/10 space-y-3"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.10 0.06 170 / 0.20), oklch(0.08 0.04 160 / 0.10))",
          }}
        >
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-emerald-400" />
            <p className="text-sm font-semibold text-white">
              Contact / संपर्क करा
            </p>
          </div>
          <p className="text-xs text-white/60 leading-relaxed">
            Have questions or need help? Reach out to us anytime.
          </p>
          <p className="text-xs text-white/40">
            प्रश्न आहेत किंवा मदत हवी आहे? आमच्याशी कधीही संपर्क साधा.
          </p>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            data-ocid="about.contact_email_button"
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-80"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.50 0.18 170), oklch(0.45 0.20 155))",
            }}
          >
            <Mail className="w-4 h-4" />
            {CONTACT_EMAIL}
          </a>
        </div>

        {/* Footer links */}
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] text-white/30">
          <Link
            to="/privacy"
            data-ocid="about.privacy_link"
            className="hover:text-white/50 transition-colors underline underline-offset-2"
          >
            Privacy Policy
          </Link>
          <span>·</span>
          <Link
            to="/terms"
            data-ocid="about.terms_link"
            className="hover:text-white/50 transition-colors underline underline-offset-2"
          >
            Terms &amp; Conditions
          </Link>
          <span>·</span>
          <Link
            to="/contact"
            data-ocid="about.contact_link"
            className="hover:text-white/50 transition-colors underline underline-offset-2"
          >
            Contact
          </Link>
        </div>

        {/* Bottom spacing */}
        <div className="h-6" />
      </div>
    </div>
  );
}
