import { useLang } from "../context/LanguageContext";
import type { Lang } from "../i18n/translations";

const LANGS: { code: Lang; label: string; flag: string }[] = [
  { code: "en", label: "EN", flag: "🇬🇧" },
  { code: "mr", label: "मराठी", flag: "🇮🇳" },
  { code: "hi", label: "हिंदी", flag: "🇮🇳" },
];

export default function LanguageSwitcher({
  className = "",
}: { className?: string }) {
  const { lang, setLang } = useLang();
  return (
    <div
      className={`flex items-center gap-1 ${className}`}
      data-ocid="lang.switcher"
    >
      {LANGS.map((l) => (
        <button
          key={l.code}
          type="button"
          data-ocid={`lang.${l.code}_button`}
          onClick={() => setLang(l.code)}
          className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
            lang === l.code
              ? "bg-orange-500 text-white shadow"
              : "bg-white/10 text-white/60 hover:bg-white/20"
          }`}
        >
          {l.flag} {l.label}
        </button>
      ))}
    </div>
  );
}
