import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Copy, Share2 } from "lucide-react";
import { motion } from "motion/react";
import { SiInstagram, SiTelegram, SiWhatsapp } from "react-icons/si";
import { toast } from "sonner";

interface ShareSheetProps {
  videoId: string;
  open: boolean;
  onClose: () => void;
  onShare?: () => void;
}

export function ShareSheet({
  videoId,
  open,
  onClose,
  onShare,
}: ShareSheetProps) {
  const url = `https://faktahirani.app/v/${videoId}`;

  const handleWhatsApp = () => {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(`फक्त अहिराणीवर हे रील पहा! ${url}`)}`,
      "_blank",
    );
  };

  const handleInstagram = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied! Paste on Instagram");
    } catch {
      toast.error("Couldn't copy link");
    }
  };

  const handleTelegram = () => {
    window.open(
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent("फक्त अहिराणीवर हे रील पहा!")}`,
      "_blank",
    );
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied!");
    } catch {
      toast.error("Couldn't copy link");
    }
  };

  const SHARE_OPTIONS = [
    {
      icon: <SiWhatsapp className="w-6 h-6 text-green-400" />,
      label: "WhatsApp",
      ocid: "share.whatsapp_button",
      onClick: handleWhatsApp,
      borderColor: "border-green-500/20",
      bg: "linear-gradient(135deg, oklch(0.16 0.06 160), oklch(0.12 0.04 155))",
      textColor: "text-green-300",
    },
    {
      icon: <SiInstagram className="w-6 h-6 text-pink-400" />,
      label: "Instagram",
      ocid: "share.instagram_button",
      onClick: handleInstagram,
      borderColor: "border-pink-500/20",
      bg: "linear-gradient(135deg, oklch(0.16 0.05 330), oklch(0.12 0.04 300))",
      textColor: "text-pink-300",
    },
    {
      icon: <SiTelegram className="w-6 h-6 text-blue-400" />,
      label: "Telegram",
      ocid: "share.telegram_button",
      onClick: handleTelegram,
      borderColor: "border-blue-500/20",
      bg: "linear-gradient(135deg, oklch(0.16 0.04 240), oklch(0.12 0.03 235))",
      textColor: "text-blue-300",
    },
    {
      icon: <Copy className="w-6 h-6 text-white/60" />,
      label: "Copy Link",
      ocid: "share.copy_button",
      onClick: handleCopyLink,
      borderColor: "border-white/15",
      bg: "linear-gradient(135deg, oklch(0.18 0.01 0), oklch(0.13 0.01 0))",
      textColor: "text-white/60",
    },
  ];

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        data-ocid="share.sheet"
        side="bottom"
        className="border-t border-white/10 rounded-t-2xl p-0"
        style={{ background: "oklch(0.1 0 0)" }}
      >
        <SheetHeader className="px-5 pt-5 pb-4 border-b border-white/8">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-white/50" />
            <SheetTitle className="text-white font-semibold text-base">
              Share Reel
            </SheetTitle>
          </div>
          <p className="text-white/40 text-xs font-mono truncate mt-1">{url}</p>
        </SheetHeader>

        <div className="p-5">
          <div className="grid grid-cols-2 gap-3">
            {SHARE_OPTIONS.map((opt, i) => (
              <motion.button
                key={opt.ocid}
                type="button"
                data-ocid={opt.ocid}
                onClick={() => {
                  opt.onClick();
                  onShare?.();
                  onClose();
                }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`flex flex-col items-center gap-2 rounded-2xl py-4 px-3 transition-all hover:scale-105 active:scale-95 border ${opt.borderColor}`}
                style={{ background: opt.bg }}
              >
                {opt.icon}
                <span className={`text-xs font-semibold ${opt.textColor}`}>
                  {opt.label}
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
