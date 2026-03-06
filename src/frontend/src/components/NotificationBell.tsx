import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Bell,
  Heart,
  IndianRupee,
  MessageCircle,
  UserPlus,
  Wallet,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { Notification } from "../context/AppContext";
import {
  useApp,
  useNotifications,
  useUnreadCount,
} from "../context/AppContext";
import { formatTime } from "../utils/trending";

function NotifIcon({ type }: { type: Notification["type"] }) {
  switch (type) {
    case "like":
      return <Heart className="w-4 h-4 text-reels-pink fill-reels-pink/50" />;
    case "comment":
      return <MessageCircle className="w-4 h-4 text-blue-400" />;
    case "follow":
      return <UserPlus className="w-4 h-4 text-emerald-400" />;
    case "referral_reward":
      return <IndianRupee className="w-4 h-4 text-amber-400" />;
    case "withdrawal_approved":
      return <Wallet className="w-4 h-4 text-green-400" />;
    case "withdrawal_requested":
      return <Wallet className="w-4 h-4 text-amber-400" />;
    case "withdrawal_paid":
      return <IndianRupee className="w-4 h-4 text-blue-400" />;
    default:
      return <Bell className="w-4 h-4 text-white/50" />;
  }
}

function NotifIconBg({ type }: { type: Notification["type"] }) {
  switch (type) {
    case "like":
      return "bg-reels-pink/15";
    case "comment":
      return "bg-blue-500/15";
    case "follow":
      return "bg-emerald-500/15";
    case "referral_reward":
      return "bg-amber-500/15";
    case "withdrawal_approved":
      return "bg-green-500/15";
    case "withdrawal_requested":
      return "bg-amber-500/15";
    case "withdrawal_paid":
      return "bg-blue-500/15";
    default:
      return "bg-white/10";
  }
}

export function NotificationBell() {
  const { state, dispatch } = useApp();
  const userId = state.currentUser?.id ?? "";
  const notifications = useNotifications(userId);
  const unreadCount = useUnreadCount(userId);
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
    // Mark all as read when sheet opens
    if (unreadCount > 0) {
      dispatch({ type: "MARK_NOTIFICATIONS_READ" });
    }
  };

  const handleClose = () => setOpen(false);

  const sorted = [...notifications].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <>
      <button
        type="button"
        data-ocid="notifications.bell_button"
        onClick={handleOpen}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
        className="relative w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90"
        style={{ background: "rgba(255,255,255,0.1)" }}
      >
        <Bell className="w-4 h-4 text-white/80" />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              key="badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 min-w-[16px] h-4 rounded-full bg-reels-pink flex items-center justify-center text-[9px] font-bold text-white px-1"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <Sheet open={open} onOpenChange={handleClose}>
        <SheetContent
          data-ocid="notifications.sheet"
          side="bottom"
          className="border-t border-white/10 rounded-t-2xl p-0 flex flex-col"
          style={{
            maxHeight: "85dvh",
            background: "oklch(0.08 0.01 240)",
          }}
        >
          <SheetHeader className="px-4 pt-4 pb-3 border-b border-white/8 flex-shrink-0 flex-row items-center justify-between">
            <SheetTitle className="text-white font-bold text-base">
              Notifications
            </SheetTitle>
            {notifications.length > 0 && (
              <button
                type="button"
                data-ocid="notifications.mark_read_button"
                onClick={() => dispatch({ type: "MARK_NOTIFICATIONS_READ" })}
                className="text-white/40 hover:text-white/70 text-xs transition-colors"
              >
                Mark all read
              </button>
            )}
          </SheetHeader>

          <div
            className="flex-1 overflow-y-auto"
            style={{ paddingBottom: "env(safe-area-inset-bottom, 16px)" }}
          >
            {sorted.length === 0 ? (
              <div
                data-ocid="notifications.empty_state"
                className="flex flex-col items-center justify-center gap-3 py-16 text-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <Bell className="w-6 h-6 text-white/20" />
                </div>
                <p className="text-white/40 text-sm">No notifications yet</p>
                <p className="text-white/25 text-xs">
                  Activity on your videos will appear here
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {sorted.map((notif, i) => (
                  <motion.div
                    key={notif.id}
                    data-ocid={`notifications.item.${i + 1}`}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className={`flex items-start gap-3 px-4 py-3.5 transition-colors ${
                      !notif.isRead
                        ? "border-l-2 border-reels-pink bg-reels-pink/5"
                        : ""
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${NotifIconBg({ type: notif.type })}`}
                    >
                      <NotifIcon type={notif.type} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm leading-snug ${!notif.isRead ? "text-white font-medium" : "text-white/70"}`}
                      >
                        {notif.message}
                      </p>
                      <p className="text-white/30 text-xs mt-0.5">
                        {formatTime(notif.createdAt)} ago
                      </p>
                    </div>
                    {!notif.isRead && (
                      <div className="w-2 h-2 rounded-full bg-reels-pink shrink-0 mt-2" />
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
