import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, FileText, Mail } from "lucide-react";

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

const ACCENT =
  "linear-gradient(135deg, oklch(0.65 0.26 260), oklch(0.65 0.26 220))";

function RuleItem({
  en,
  mr,
  desc,
  descMr,
  accent,
}: {
  en: string;
  mr: string;
  desc: string;
  descMr: string;
  accent?: string;
}) {
  return (
    <li className="flex gap-3 rounded-xl p-3 bg-white/5 border border-white/8">
      <span
        className="mt-1 w-2 h-2 rounded-full shrink-0"
        style={{ background: accent ?? ACCENT }}
      />
      <div>
        <p className="font-medium text-white text-sm">
          {en} <span className="text-white/40 font-normal">/ {mr}</span>
        </p>
        <p className="text-xs text-white/50 mt-0.5">{desc}</p>
        <p className="text-xs text-white/35 mt-0.5">{descMr}</p>
      </div>
    </li>
  );
}

export default function TermsPage() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-dvh flex flex-col"
      style={{
        background:
          "radial-gradient(ellipse at top, oklch(0.08 0.04 260) 0%, oklch(0 0 0) 60%)",
      }}
      data-ocid="terms.page"
    >
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-3 px-4 py-4 border-b border-white/10 backdrop-blur-md bg-black/40">
        <button
          type="button"
          data-ocid="terms.back_button"
          onClick={() => navigate({ to: "/" })}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/15 transition-colors"
          aria-label="Back"
        >
          <ArrowLeft className="w-4 h-4 text-white" />
        </button>
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-400" />
          <div>
            <h1 className="text-sm font-semibold text-white leading-tight">
              Terms &amp; Conditions
            </h1>
            <p className="text-[10px] text-white/40">नियम व अटी</p>
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
              "linear-gradient(135deg, oklch(0.65 0.26 260 / 0.12), oklch(0.65 0.26 220 / 0.08))",
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
            short video platform for Ahirani/Khandeshi artists and viewers. By
            using this app, you agree to the following Terms &amp; Conditions.
          </p>
          <p className="text-white/50">
            <strong className="text-white/70">फक्त अहिराणी</strong> वापरून तुम्ही
            खालील नियम व अटींशी सहमत होता. कृपया हे नियम काळजीपूर्वक वाचा.
          </p>
        </Section>

        <div className="border-t border-white/8" />

        {/* 2. Artist Content Rules */}
        <Section title="2. Rules for Artists" titleMr="२. कलाकारांसाठी नियम">
          <p>All artists must follow these content rules:</p>
          <p className="text-white/50 text-xs">
            सर्व कलाकारांनी खालील नियमांचे पालन करणे अनिवार्य आहे:
          </p>
          <ul className="space-y-2 mt-2">
            <RuleItem
              en="Upload Original Content Only"
              mr="फक्त मूळ कंटेंट अपलोड करा"
              desc="You must own or have the rights to every video you publish on the platform."
              descMr="प्लॅटफॉर्मवर प्रकाशित केलेल्या प्रत्येक व्हिडिओचे हक्क तुमच्याकडे असणे आवश्यक आहे."
              accent="linear-gradient(135deg, oklch(0.65 0.26 150), oklch(0.65 0.26 120))"
            />
            <RuleItem
              en="No Copyright Infringement"
              mr="कॉपीराइट उल्लंघन नाही"
              desc="Uploading music, videos, or content that belongs to others without permission is strictly prohibited."
              descMr="परवानगीशिवाय इतरांचे संगीत, व्हिडिओ किंवा कंटेंट अपलोड करणे कठोरपणे प्रतिबंधित आहे."
              accent="linear-gradient(135deg, oklch(0.65 0.26 30), oklch(0.65 0.26 15))"
            />
            <RuleItem
              en="Active Subscription Required"
              mr="सक्रिय सदस्यता आवश्यक"
              desc="Artists must have an active ₹600/year subscription to upload videos. Expired subscriptions block uploads."
              descMr="व्हिडिओ अपलोड करण्यासाठी कलाकाराची ₹600/वर्षाची सदस्यता सक्रिय असणे आवश्यक आहे."
              accent={ACCENT}
            />
            <RuleItem
              en="Respectful Content"
              mr="आदरपूर्ण कंटेंट"
              desc="Content that is hateful, abusive, obscene, or harmful to any individual or community is not allowed."
              descMr="द्वेषपूर्ण, अपमानास्पद, अश्लील किंवा हानिकारक कंटेंट परवानगी नाही."
              accent="linear-gradient(135deg, oklch(0.65 0.26 300), oklch(0.65 0.26 280))"
            />
          </ul>
        </Section>

        <div className="border-t border-white/8" />

        {/* 3. Prohibited Content */}
        <Section title="3. Prohibited Content" titleMr="३. प्रतिबंधित कंटेंट">
          <p>
            The following types of content are{" "}
            <strong className="text-white">strictly prohibited</strong> on the
            platform:
          </p>
          <p className="text-white/50 text-xs">
            खालील प्रकारचा कंटेंट प्लॅटफॉर्मवर कठोरपणे प्रतिबंधित आहे:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-white/60 text-xs mt-2 ml-1">
            {[
              {
                en: "Copyrighted music, films, or videos without permission",
                mr: "परवानगीशिवाय कॉपीराइट संगीत, चित्रपट किंवा व्हिडिओ",
              },
              {
                en: "Nudity, sexual or explicit content",
                mr: "नग्नता, लैंगिक किंवा अश्लील कंटेंट",
              },
              {
                en: "Hate speech, harassment, or bullying",
                mr: "द्वेषपूर्ण भाषण, छळवणूक किंवा धमकी",
              },
              {
                en: "Misinformation or fake news",
                mr: "चुकीची माहिती किंवा बनावट बातम्या",
              },
              {
                en: "Spam or repetitive promotional content",
                mr: "स्पॅम किंवा पुनरावृत्ती जाहिरात कंटेंट",
              },
              {
                en: "Content involving minors in inappropriate situations",
                mr: "अल्पवयीन मुलांचा अयोग्य प्रकारे समावेश असलेला कंटेंट",
              },
            ].map((item) => (
              <li key={item.en}>
                {item.en} <span className="text-white/35">/ {item.mr}</span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-white/40 mt-2">
            Violation of these rules may result in immediate account suspension
            or permanent ban.{" "}
            <span className="text-white/30">
              / या नियमांचे उल्लंघन केल्यास खाते तात्काळ निलंबित किंवा कायमचे बंद केले जाऊ
              शकते.
            </span>
          </p>
        </Section>

        <div className="border-t border-white/8" />

        {/* 4. Admin Rights */}
        <Section title="4. Admin Rights" titleMr="४. अॅडमिनचे अधिकार">
          <p>
            The platform admin (
            <strong className="text-white">समाधान माळी</strong>) has full
            authority to manage the platform and its content.
          </p>
          <p className="text-white/50 text-xs">
            प्लॅटफॉर्म अॅडमिन (समाधान माळी) यांना प्लॅटफॉर्म आणि कंटेंट व्यवस्थापित करण्याचे
            पूर्ण अधिकार आहेत.
          </p>
          <ul className="space-y-2 mt-2">
            {[
              {
                en: "Remove Any Video",
                mr: "कोणताही व्हिडिओ काढणे",
                desc: "Admin can delete any video without prior notice if it violates platform rules.",
                descMr:
                  "नियमांचे उल्लंघन झाल्यास अॅडमिन कोणताही व्हिडिओ पूर्वसूचनेशिवाय हटवू शकतो.",
              },
              {
                en: "Block or Unblock Users",
                mr: "वापरकर्ता ब्लॉक / अनब्लॉक करणे",
                desc: "Admin can block accounts that violate rules and unblock them after review.",
                descMr:
                  "नियम मोडणारी खाती ब्लॉक केली जातात आणि तपासणीनंतर अनब्लॉक केली जाऊ शकतात.",
              },
              {
                en: "Approve Artist Subscriptions",
                mr: "कलाकार सदस्यता मंजूर करणे",
                desc: "Admin can manually activate or deactivate artist subscriptions.",
                descMr:
                  "अॅडमिन कलाकाराची सदस्यता मॅन्युअली सक्रिय किंवा निष्क्रिय करू शकतो.",
              },
              {
                en: "Manage Ads",
                mr: "जाहिराती व्यवस्थापित करणे",
                desc: "Admin controls all local ad campaigns, pricing, and ad display settings.",
                descMr:
                  "अॅडमिन स्थानिक जाहिरात मोहिमा, किंमत आणि जाहिरात सेटिंग्स नियंत्रित करतो.",
              },
            ].map((item) => (
              <RuleItem
                key={item.en}
                en={item.en}
                mr={item.mr}
                desc={item.desc}
                descMr={item.descMr}
                accent="linear-gradient(135deg, oklch(0.65 0.26 30), oklch(0.65 0.26 50))"
              />
            ))}
          </ul>
        </Section>

        <div className="border-t border-white/8" />

        {/* 5. Withdrawal Policy */}
        <Section title="5. Withdrawal Policy" titleMr="५. पैसे काढण्याचे धोरण">
          <p>
            Artists and viewers can request withdrawal of their earned balance
            subject to the following conditions:
          </p>
          <p className="text-white/50 text-xs">
            कलाकार आणि प्रेक्षक खालील अटींच्या अधीन राहून त्यांची कमाई काढण्याची विनंती करू
            शकतात:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-white/60 text-xs mt-2 ml-1">
            {[
              {
                en: "Minimum withdrawal amount is ₹200",
                mr: "किमान पैसे काढण्याची रक्कम ₹200 आहे",
              },
              {
                en: "Withdrawal requests require admin approval before payment is released",
                mr: "पेमेंट जारी करण्यापूर्वी पैसे काढण्याच्या विनंतीसाठी अॅडमिनची मंजुरी आवश्यक आहे",
              },
              {
                en: "Admin can approve, reject, or mark a withdrawal as paid",
                mr: "अॅडमिन पैसे काढणे मंजूर, नाकारणे किंवा 'पेड' म्हणून चिन्हांकित करू शकतो",
              },
              {
                en: "Fraudulent withdrawal requests will be rejected and the account may be banned",
                mr: "बनावट पैसे काढण्याच्या विनंत्या नाकारल्या जातात आणि खाते बंद केले जाऊ शकते",
              },
              {
                en: "Valid UPI ID or bank details must be provided for withdrawal",
                mr: "पैसे काढण्यासाठी वैध UPI ID किंवा बँक तपशील देणे अनिवार्य आहे",
              },
            ].map((item) => (
              <li key={item.en}>
                {item.en} <span className="text-white/35">/ {item.mr}</span>
              </li>
            ))}
          </ul>
        </Section>

        <div className="border-t border-white/8" />

        {/* 6. Fraud & Fake Accounts */}
        <Section
          title="6. Fraud &amp; Fake Accounts"
          titleMr="६. फसवणूक आणि बनावट खाती"
        >
          <div
            className="rounded-xl p-4 border border-red-500/20"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.40 0.20 25 / 0.12), oklch(0.30 0.15 25 / 0.08))",
            }}
          >
            <p className="text-sm font-semibold text-red-300 mb-2">
              Zero Tolerance Policy / शून्य सहनशीलता धोरण
            </p>
            <p className="text-xs text-white/60 leading-relaxed">
              The following actions are considered fraud and will result in a
              permanent account ban:
            </p>
            <p className="text-xs text-white/40 mt-1">
              खालील कृती फसवणूक मानल्या जातात आणि खाते कायमचे बंद होईल:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-white/55 text-xs mt-3 ml-1">
              {[
                {
                  en: "Generating fake views or using bots to inflate video metrics",
                  mr: "बनावट व्ह्यूज तयार करणे किंवा बॉट्स वापरणे",
                },
                {
                  en: "Creating multiple accounts to abuse the referral system",
                  mr: "रेफरल सिस्टम गैरवापर करण्यासाठी अनेक खाती बनवणे",
                },
                {
                  en: "Self-referral or referring fake accounts",
                  mr: "स्वतःला रेफर करणे किंवा बनावट खाती रेफर करणे",
                },
                {
                  en: "Submitting fraudulent withdrawal requests",
                  mr: "बनावट पैसे काढण्याच्या विनंत्या सादर करणे",
                },
                {
                  en: "Manipulating the ad impression or earnings system",
                  mr: "जाहिरात इम्प्रेशन किंवा कमाई सिस्टम फेरफार करणे",
                },
              ].map((item) => (
                <li key={item.en}>
                  {item.en} <span className="text-white/30">/ {item.mr}</span>
                </li>
              ))}
            </ul>
          </div>
        </Section>

        <div className="border-t border-white/8" />

        {/* 7. Referral System Rules */}
        <Section title="7. Referral System Rules" titleMr="७. रेफरल सिस्टम नियम">
          <ul className="list-disc list-inside space-y-1.5 text-white/60 text-xs mt-1 ml-1">
            {[
              {
                en: "Every user receives a unique referral code automatically",
                mr: "प्रत्येक वापरकर्त्याला आपोआप एक अद्वितीय रेफरल कोड मिळतो",
              },
              {
                en: "Referral reward (₹10) is credited only when the referred user is genuinely new",
                mr: "रेफरल बक्षीस (₹10) फक्त तेव्हा मिळते जेव्हा रेफर केलेला वापरकर्ता खरोखर नवीन असतो",
              },
              {
                en: "Self-referral is strictly not allowed",
                mr: "स्वतःला रेफर करणे कठोरपणे प्रतिबंधित आहे",
              },
              {
                en: "Artists earn an additional ₹60 when their referred user buys the ₹600 subscription",
                mr: "रेफर केलेल्या वापरकर्त्याने ₹600 सदस्यता खरेदी केल्यास कलाकाराला अतिरिक्त ₹60 मिळतात",
              },
            ].map((item) => (
              <li key={item.en}>
                {item.en} <span className="text-white/35">/ {item.mr}</span>
              </li>
            ))}
          </ul>
        </Section>

        <div className="border-t border-white/8" />

        {/* 8. Changes to Terms */}
        <Section
          title="8. Changes to These Terms"
          titleMr="८. या नियमांमधील बदल"
        >
          <p>
            We reserve the right to update these Terms &amp; Conditions at any
            time. Continued use of the app after changes means you accept the
            updated terms.
          </p>
          <p className="text-white/50 text-xs">
            आम्ही कधीही हे नियम व अटी अपडेट करण्याचा अधिकार राखतो. बदलांनंतर ॲप वापरणे
            सुरू ठेवणे म्हणजे तुम्ही अपडेट केलेल्या नियमांशी सहमत आहात.
          </p>
        </Section>

        <div className="border-t border-white/8" />

        {/* Contact */}
        <div
          className="rounded-2xl p-5 border border-white/10 space-y-3"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.65 0.26 260 / 0.10), oklch(0.65 0.26 220 / 0.06))",
          }}
          data-ocid="terms.contact_card"
        >
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-blue-400" />
            <p className="text-sm font-semibold text-white">
              Contact Us / संपर्क करा
            </p>
          </div>
          <p className="text-xs text-white/60 leading-relaxed">
            If you have any questions about these Terms &amp; Conditions or need
            to report a violation, please contact us.
          </p>
          <p className="text-xs text-white/40">
            या नियम व अटींबद्दल काही प्रश्न असल्यास किंवा उल्लंघन नोंदवायचे असल्यास,
            आमच्याशी संपर्क साधा.
          </p>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            data-ocid="terms.contact_email_link"
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-80"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.55 0.26 260), oklch(0.55 0.26 220))",
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
