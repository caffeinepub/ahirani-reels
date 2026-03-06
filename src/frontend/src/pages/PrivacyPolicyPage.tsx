import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Mail, Shield } from "lucide-react";

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

export default function PrivacyPolicyPage() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-dvh flex flex-col"
      style={{
        background:
          "radial-gradient(ellipse at top, oklch(0.10 0.04 15) 0%, oklch(0 0 0) 60%)",
      }}
      data-ocid="privacy.page"
    >
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-3 px-4 py-4 border-b border-white/10 backdrop-blur-md bg-black/40">
        <button
          type="button"
          data-ocid="privacy.back_button"
          onClick={() => navigate({ to: "/" })}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/15 transition-colors"
          aria-label="Back"
        >
          <ArrowLeft className="w-4 h-4 text-white" />
        </button>
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-reels-pink" />
          <div>
            <h1 className="text-sm font-semibold text-white leading-tight">
              Privacy Policy
            </h1>
            <p className="text-[10px] text-white/40">गोपनीयता धोरण</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-8 max-w-lg mx-auto w-full">
        {/* App identity */}
        <div
          className="rounded-2xl p-4 border border-white/10"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.65 0.28 15 / 0.12), oklch(0.65 0.28 350 / 0.08))",
          }}
        >
          <p className="text-base font-bold text-white">फक्त अहिराणी</p>
          <p className="text-xs text-white/50 mt-0.5">
            अहिराणी कलाकार आणि प्रेक्षकांसाठी खास रील प्लॅटफॉर्म
          </p>
          <p className="text-[11px] text-white/35 mt-2">
            Last updated / शेवटी अपडेट: March 2026
          </p>
        </div>

        {/* 1. Introduction */}
        <Section title="1. Introduction" titleMr="१. परिचय">
          <p>
            Welcome to <strong className="text-white">फक्त अहिराणी</strong> — a
            short video platform built for Ahirani/Khandeshi artists and
            viewers. This Privacy Policy explains how we collect, use, and
            protect your personal information.
          </p>
          <p className="text-white/50">
            <strong className="text-white/70">फक्त अहिराणी</strong> मध्ये आपले स्वागत
            आहे. हे धोरण आम्ही तुमची वैयक्तिक माहिती कशी गोळा करतो, कशी वापरतो आणि कशी
            सुरक्षित ठेवतो हे स्पष्ट करते.
          </p>
        </Section>

        {/* Divider */}
        <div className="border-t border-white/8" />

        {/* 2. Data we collect */}
        <Section
          title="2. Data We Collect"
          titleMr="२. आम्ही कोणती माहिती गोळा करतो"
        >
          <p>We collect the following information when you use the app:</p>
          <p className="text-white/50 text-xs">आम्ही खालील माहिती गोळा करतो:</p>
          <ul className="space-y-2 mt-2">
            {[
              {
                en: "Username",
                mr: "युजरनेम",
                desc: "Your chosen display name on the platform.",
                descMr: "प्लॅटफॉर्मवर तुमचे नाव.",
              },
              {
                en: "Phone Number",
                mr: "मोबाईल नंबर",
                desc: "Used for OTP-based account verification and login.",
                descMr: "OTP लॉगिन आणि खाते सत्यापनासाठी.",
              },
              {
                en: "Uploaded Videos",
                mr: "अपलोड केलेले व्हिडिओ",
                desc: "Videos you publish on the platform.",
                descMr: "तुम्ही प्लॅटफॉर्मवर प्रकाशित केलेले व्हिडिओ.",
              },
              {
                en: "Wallet Earnings",
                mr: "वॉलेट कमाई",
                desc: "Ad revenue, referral rewards, and withdrawal history.",
                descMr: "जाहिरात महसूल, रेफरल बक्षीस आणि पैसे काढण्याचा इतिहास.",
              },
              {
                en: "Referral Data",
                mr: "रेफरल डेटा",
                desc: "Your referral code and details of users you referred.",
                descMr: "तुमचा रेफरल कोड आणि तुम्ही रेफर केलेल्या वापरकर्त्यांचा तपशील.",
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
                      "linear-gradient(135deg, oklch(0.65 0.28 15), oklch(0.65 0.28 350))",
                  }}
                />
                <div>
                  <p className="font-medium text-white text-sm">
                    {item.en}{" "}
                    <span className="text-white/40 font-normal">
                      / {item.mr}
                    </span>
                  </p>
                  <p className="text-xs text-white/50 mt-0.5">{item.desc}</p>
                  <p className="text-xs text-white/35 mt-0.5">{item.descMr}</p>
                </div>
              </li>
            ))}
          </ul>
        </Section>

        <div className="border-t border-white/8" />

        {/* 3. How we use your data */}
        <Section
          title="3. How We Use Your Data"
          titleMr="३. आम्ही माहिती कशासाठी वापरतो"
        >
          <ul className="space-y-2">
            {[
              {
                en: "Account Login",
                mr: "खाते लॉगिन",
                desc: "To authenticate your identity and keep your account secure.",
                descMr: "तुमची ओळख सत्यापित करण्यासाठी आणि खाते सुरक्षित ठेवण्यासाठी.",
              },
              {
                en: "Video Publishing",
                mr: "व्हिडिओ प्रकाशन",
                desc: "To display your uploaded reels, long videos, and premium content to other users.",
                descMr: "तुमचे रील आणि इतर व्हिडिओ प्लॅटफॉर्मवर दाखवण्यासाठी.",
              },
              {
                en: "Earnings Tracking",
                mr: "कमाई मोजणी",
                desc: "To calculate and record ad revenue, referral bonuses, gifts, and wallet transactions.",
                descMr: "जाहिरात महसूल, रेफरल बक्षीस आणि वॉलेट व्यवहार नोंदवण्यासाठी.",
              },
              {
                en: "Ad Monetization",
                mr: "जाहिरात मॉनेटायझेशन",
                desc: "To display relevant ads and share revenue with creators.",
                descMr:
                  "संबंधित जाहिराती दाखवण्यासाठी आणि कलाकारांसोबत महसूल वाटण्यासाठी.",
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
                      "linear-gradient(135deg, oklch(0.55 0.22 240), oklch(0.55 0.22 200))",
                  }}
                />
                <div>
                  <p className="font-medium text-white text-sm">
                    {item.en}{" "}
                    <span className="text-white/40 font-normal">
                      / {item.mr}
                    </span>
                  </p>
                  <p className="text-xs text-white/50 mt-0.5">{item.desc}</p>
                  <p className="text-xs text-white/35 mt-0.5">{item.descMr}</p>
                </div>
              </li>
            ))}
          </ul>
        </Section>

        <div className="border-t border-white/8" />

        {/* 4. Advertising */}
        <Section title="4. Advertising Partners" titleMr="४. जाहिरात भागीदार">
          <p>
            <strong className="text-white">फक्त अहिराणी</strong> may display ads
            through the following third-party advertising networks:
          </p>
          <p className="text-white/50 text-xs">
            हे ॲप खालील जाहिरात नेटवर्कद्वारे जाहिराती दाखवू शकते:
          </p>
          <div className="mt-3 space-y-2">
            <div className="flex items-start gap-3 rounded-xl p-3 bg-white/5 border border-white/8">
              <span className="text-lg">🔵</span>
              <div>
                <p className="font-medium text-white text-sm">Google AdMob</p>
                <p className="text-xs text-white/50 mt-0.5">
                  Google's mobile advertising platform. Google may collect
                  certain device identifiers and usage data to serve relevant
                  ads.
                </p>
                <p className="text-xs text-white/35 mt-0.5">
                  Google AdMob जाहिरात प्लॅटफॉर्म. Google काही डिव्हाइस माहिती गोळा
                  करू शकतो.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl p-3 bg-white/5 border border-white/8">
              <span className="text-lg">🔷</span>
              <div>
                <p className="font-medium text-white text-sm">
                  Meta Audience Network
                </p>
                <p className="text-xs text-white/50 mt-0.5">
                  Meta's advertising network (Facebook / Instagram). Meta may
                  use data to deliver personalised ads.
                </p>
                <p className="text-xs text-white/35 mt-0.5">
                  Meta जाहिरात नेटवर्क. Meta वैयक्तिकृत जाहिरातींसाठी माहिती वापरू
                  शकतो.
                </p>
              </div>
            </div>
          </div>
          <p className="text-xs text-white/40 mt-2">
            These networks have their own privacy policies. We encourage you to
            review them.{" "}
            <span className="text-white/30">
              / या नेटवर्कची स्वतःची गोपनीयता धोरणे आहेत.
            </span>
          </p>
        </Section>

        <div className="border-t border-white/8" />

        {/* 5. Data Sharing */}
        <Section title="5. Data Sharing" titleMr="५. माहिती शेअर करणे">
          <p>
            We do <strong className="text-white">not</strong> sell your personal
            data to third parties. Your information is shared only with:
          </p>
          <p className="text-white/50 text-xs">
            आम्ही तुमचा वैयक्तिक डेटा तृतीय पक्षांना विकत नाही. माहिती फक्त खालीलसाठी शेअर
            केली जाते:
          </p>
          <ul className="list-disc list-inside space-y-1 text-white/60 text-xs mt-2 ml-1">
            <li>
              Advertising partners (Google AdMob, Meta Audience Network) for ad
              delivery / जाहिरात वितरणासाठी
            </li>
            <li>
              Payment processing to facilitate wallet withdrawals / पेमेंट
              प्रक्रियेसाठी
            </li>
            <li>
              Legal authorities when required by law / कायद्याने आवश्यक असल्यास
            </li>
          </ul>
        </Section>

        <div className="border-t border-white/8" />

        {/* 6. Data Security */}
        <Section title="6. Data Security" titleMr="६. डेटा सुरक्षा">
          <p>
            We take reasonable measures to protect your data. However, no method
            of transmission over the internet is 100% secure.
          </p>
          <p className="text-white/50 text-xs">
            आम्ही तुमचा डेटा सुरक्षित ठेवण्यासाठी योग्य उपाय घेतो. परंतु इंटरनेटवर कोणतीही
            पद्धत 100% सुरक्षित नाही.
          </p>
        </Section>

        <div className="border-t border-white/8" />

        {/* 7. Your Rights */}
        <Section title="7. Your Rights" titleMr="७. तुमचे अधिकार">
          <p>You have the right to:</p>
          <p className="text-white/50 text-xs">तुम्हाला हे अधिकार आहेत:</p>
          <ul className="list-disc list-inside space-y-1 text-white/60 text-xs mt-2 ml-1">
            <li>
              Access the data we hold about you / तुमच्याबद्दल आमच्याकडे असलेली माहिती
              पाहणे
            </li>
            <li>
              Request correction of inaccurate data / चुकीची माहिती दुरुस्त करण्याची
              विनंती करणे
            </li>
            <li>
              Request deletion of your account and data / खाते आणि डेटा हटवण्याची
              विनंती करणे
            </li>
          </ul>
          <p className="text-xs text-white/50 mt-2">
            To exercise these rights, contact us at the email below.
            <br />
            <span className="text-white/35">
              हे अधिकार वापरण्यासाठी, खाली दिलेल्या ईमेलवर संपर्क करा.
            </span>
          </p>
        </Section>

        <div className="border-t border-white/8" />

        {/* 8. Changes */}
        <Section title="8. Changes to This Policy" titleMr="८. या धोरणातील बदल">
          <p>
            We may update this Privacy Policy from time to time. We will notify
            you of significant changes through the app.
          </p>
          <p className="text-white/50 text-xs">
            आम्ही हे धोरण वेळोवेळी अपडेट करू शकतो. महत्त्वाच्या बदलांची सूचना ॲपमधून दिली
            जाईल.
          </p>
        </Section>

        <div className="border-t border-white/8" />

        {/* Contact */}
        <div
          className="rounded-2xl p-5 border border-white/10 space-y-3"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.65 0.28 15 / 0.10), oklch(0.65 0.28 350 / 0.06))",
          }}
          data-ocid="privacy.contact_card"
        >
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-reels-pink" />
            <p className="text-sm font-semibold text-white">
              Contact Us / संपर्क करा
            </p>
          </div>
          <p className="text-xs text-white/60 leading-relaxed">
            If you have any questions about this Privacy Policy or how we handle
            your data, please reach out to us.
          </p>
          <p className="text-xs text-white/40">
            या धोरणाबद्दल किंवा तुमच्या डेटाबद्दल काही प्रश्न असल्यास, आमच्याशी संपर्क साधा.
          </p>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            data-ocid="privacy.contact_email_link"
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-80"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.65 0.28 15), oklch(0.65 0.28 350))",
            }}
          >
            <Mail className="w-4 h-4" />
            {CONTACT_EMAIL}
          </a>
        </div>

        {/* Bottom spacing */}
        <div className="h-6" />
      </div>
    </div>
  );
}
