import { Link, useRouterState } from "@tanstack/react-router";
import { Home, PlusSquare, Search, Trophy, User, Wallet } from "lucide-react";
import { motion } from "motion/react";
import { useApp, useBackendConnected } from "../context/AppContext";
import { useLang } from "../context/LanguageContext";
import { NotificationBell } from "./NotificationBell";

// ─── Live icon component ──────────────────────────────────────────────────────

function LiveIcon({ isActive }: { isActive: boolean }) {
  return (
    <div className="relative flex items-center justify-center w-6 h-6">
      <span className={`relative flex h-3 w-3 ${isActive ? "" : ""}`}>
        <span
          className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
            isActive ? "bg-white" : "bg-red-500"
          }`}
        />
        <span
          className={`relative inline-flex rounded-full h-3 w-3 ${
            isActive ? "bg-white" : "bg-red-500"
          }`}
        />
      </span>
    </div>
  );
}

const ALL_NAV_ITEMS = [
  {
    to: "/",
    icon: Home,
    label: "Home",
    tKey: "nav.home",
    ocid: "nav.home_link",
  },
  {
    to: "/search",
    icon: Search,
    label: "Search",
    tKey: "nav.search",
    ocid: "nav.search_link",
  },
  {
    to: "/upload",
    icon: PlusSquare,
    label: "Upload",
    tKey: "nav.upload",
    ocid: "nav.upload_link",
    artistOnly: true,
  },
  {
    to: "/live",
    icon: null,
    label: "Live",
    tKey: "nav.live",
    ocid: "nav.live_link",
    artistOnly: true,
    isLive: true,
  },
  {
    to: "/leaderboard",
    icon: Trophy,
    label: "Ranks",
    tKey: "nav.ranks",
    ocid: "nav.leaderboard_link",
  },
  {
    to: "/wallet",
    icon: Wallet,
    label: "Wallet",
    tKey: "nav.wallet",
    ocid: "nav.wallet_link",
  },
  {
    to: "/profile",
    icon: User,
    label: "Profile",
    tKey: "nav.profile",
    ocid: "nav.profile_link",
  },
] as const;

export default function BottomNav() {
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;
  const isConnected = useBackendConnected();
  const { state } = useApp();
  const { t } = useLang();
  const currentUser = state.currentUser;

  const NAV_ITEMS = ALL_NAV_ITEMS.filter((item) => {
    if ("artistOnly" in item && item.artistOnly) {
      // Only show Live tab for artists with active subscription
      if ("isLive" in item && item.isLive) {
        return (
          currentUser?.role === "artist" &&
          currentUser?.subscriptionStatus === "active"
        );
      }
      return currentUser?.role !== "viewer";
    }
    return true;
  });

  return (
    <nav
      className="absolute bottom-0 left-0 right-0 z-30 border-t border-white/10"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(20px)" }}
    >
      {/* Notification bell + ICP badge row */}
      <div className="absolute -top-10 right-3 flex items-center gap-2">
        {/* ICP backend connectivity badge */}
        {isConnected && (
          <motion.div
            data-ocid="nav.icp_connected.toggle"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-1 bg-black/70 border border-white/10 rounded-full px-2 py-0.5 pointer-events-none"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>
            <span className="text-[9px] text-emerald-400 font-medium tracking-wide uppercase">
              ICP
            </span>
          </motion.div>
        )}

        {/* Notification bell */}
        {currentUser && <NotificationBell />}
      </div>

      <div className="flex">
        {NAV_ITEMS.map((navItem) => {
          const { to, tKey, ocid } = navItem;
          const Icon = "icon" in navItem ? navItem.icon : null;
          const isLiveTab = "isLive" in navItem && navItem.isLive;
          const isActive = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              data-ocid={ocid}
              className="flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 relative"
            >
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-reels-pink"
                />
              )}
              {isLiveTab ? (
                <LiveIcon isActive={isActive} />
              ) : to === "/upload" ? (
                <div
                  className={`w-11 h-8 rounded-lg flex items-center justify-center transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-reels-pink to-orange-500"
                      : "bg-white/15 border border-white/20"
                  }`}
                >
                  {Icon && <Icon className="w-5 h-5 text-white" />}
                </div>
              ) : (
                Icon && (
                  <Icon
                    className={`w-6 h-6 transition-colors ${
                      isActive ? "text-white" : "text-white/50"
                    }`}
                  />
                )
              )}
              <span
                className={`text-[10px] font-medium transition-colors ${
                  isActive
                    ? isLiveTab
                      ? "text-white"
                      : "text-white"
                    : isLiveTab
                      ? "text-red-400"
                      : "text-white/40"
                }`}
              >
                {t(tKey)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
