import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { AlertOctagon, Ban, EyeOff, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useApp } from "../context/AppContext";
import { generateId } from "../utils/trending";

// ─── Report Reasons ───────────────────────────────────────────────────────────

const REPORT_REASONS = [
  {
    id: "Copyright violation",
    icon: ShieldAlert,
    iconColor: "text-orange-400",
    bgColor: "bg-orange-400/10",
    borderColor: "border-orange-400/40",
    selectedBg: "bg-orange-400/20",
    selectedBorder: "border-orange-400/70",
    title: "Copyright violation",
    description: "Contains copyrighted music, video, or content",
  },
  {
    id: "Abuse",
    icon: AlertOctagon,
    iconColor: "text-red-400",
    bgColor: "bg-red-400/10",
    borderColor: "border-red-400/40",
    selectedBg: "bg-red-400/20",
    selectedBorder: "border-red-400/70",
    title: "Abuse",
    description: "Harassment, bullying, or threats",
  },
  {
    id: "Spam",
    icon: Ban,
    iconColor: "text-amber-400",
    bgColor: "bg-amber-400/10",
    borderColor: "border-amber-400/40",
    selectedBg: "bg-amber-400/20",
    selectedBorder: "border-amber-400/70",
    title: "Spam",
    description: "Repetitive, misleading, or promotional spam",
  },
  {
    id: "Inappropriate content",
    icon: EyeOff,
    iconColor: "text-pink-400",
    bgColor: "bg-pink-400/10",
    borderColor: "border-pink-400/40",
    selectedBg: "bg-pink-400/20",
    selectedBorder: "border-pink-400/70",
    title: "Inappropriate content",
    description: "Adult, violent, or disturbing content",
  },
] as const;

// ─── ReportSheet Component ────────────────────────────────────────────────────

interface ReportSheetProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  videoId: string;
}

export function ReportSheet({ open, onOpenChange, videoId }: ReportSheetProps) {
  const { state, dispatch } = useApp();
  const [selectedReason, setSelectedReason] = useState<string | null>(null);

  const handleClose = () => {
    onOpenChange(false);
    setSelectedReason(null);
  };

  const handleSubmit = () => {
    if (!selectedReason || !state.currentUser) return;

    dispatch({
      type: "FLAG_VIDEO",
      report: {
        id: generateId(),
        videoId,
        reporterId: state.currentUser.id,
        reason: selectedReason,
        createdAt: Date.now(),
      },
    });

    toast.success("Video reported — our team will review it", {
      duration: 3000,
    });

    handleClose();
  };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent
        data-ocid="report.sheet"
        side="bottom"
        className="rounded-t-2xl border-t border-white/10"
        style={{
          background: "oklch(0.1 0.01 240)",
          maxHeight: "85dvh",
          overflowY: "auto",
        }}
      >
        <SheetHeader className="mb-5 text-left">
          <SheetTitle className="text-white text-lg font-bold tracking-tight">
            Report Video
          </SheetTitle>
          <p className="text-white/50 text-sm">
            Why are you reporting this video?
          </p>
        </SheetHeader>

        {/* Reason list */}
        <div className="space-y-2.5 mb-6">
          {REPORT_REASONS.map((reason, i) => {
            const Icon = reason.icon;
            const isSelected = selectedReason === reason.id;
            const ocidIndex = i + 1;

            return (
              <button
                key={reason.id}
                type="button"
                data-ocid={`report.reason.item.${ocidIndex}`}
                onClick={() => setSelectedReason(reason.id)}
                className={`w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-150 text-left focus:outline-none active:scale-[0.99] ${
                  isSelected
                    ? `${reason.selectedBg} ${reason.selectedBorder}`
                    : `${reason.bgColor} ${reason.borderColor} hover:border-white/20`
                }`}
              >
                {/* Icon */}
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    isSelected ? reason.selectedBg : reason.bgColor
                  }`}
                >
                  <Icon className={`w-5 h-5 ${reason.iconColor}`} />
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold leading-tight">
                    {reason.title}
                  </p>
                  <p className="text-white/50 text-xs mt-0.5 leading-snug">
                    {reason.description}
                  </p>
                </div>

                {/* Radio indicator */}
                <div
                  className={`w-4 h-4 rounded-full border-2 shrink-0 transition-all ${
                    isSelected
                      ? `${reason.iconColor.replace("text-", "bg-")} border-transparent`
                      : "border-white/30"
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Submit button */}
        <Button
          data-ocid="report.submit_button"
          onClick={handleSubmit}
          disabled={!selectedReason}
          className="w-full h-12 text-sm font-semibold rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: selectedReason
              ? "oklch(0.55 0.25 15)"
              : "oklch(0.2 0.01 240)",
            color: "white",
            border: "none",
          }}
        >
          Submit Report
        </Button>

        {/* Cancel */}
        <button
          type="button"
          data-ocid="report.cancel_button"
          onClick={handleClose}
          className="w-full mt-3 py-2.5 text-white/40 text-sm font-medium hover:text-white/60 transition-colors focus:outline-none"
        >
          Cancel
        </button>
      </SheetContent>
    </Sheet>
  );
}
