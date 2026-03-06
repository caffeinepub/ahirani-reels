import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  useRouterState,
} from "@tanstack/react-router";
import BottomNav from "./components/BottomNav";
import { AppProvider, useApp } from "./context/AppContext";
import { LanguageProvider } from "./context/LanguageContext";
import AboutPage from "./pages/AboutPage";
import AdminPage from "./pages/AdminPage";
import AgePolicyPage from "./pages/AgePolicyPage";
import AuthPage from "./pages/AuthPage";
import ContactPage from "./pages/ContactPage";
import FeedPage from "./pages/FeedPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import LivePage from "./pages/LivePage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import ProfilePage from "./pages/ProfilePage";
import SearchPage from "./pages/SearchPage";
import TermsPage from "./pages/TermsPage";
import UploadPage from "./pages/UploadPage";
import WalletPage from "./pages/WalletPage";

// ─── Root layout ──────────────────────────────────────────────────────────────

function RootComponent() {
  const { state } = useApp();
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;

  // Admin + Privacy + Terms + Contact + Age Policy + About routes - no auth guard
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/privacy") ||
    pathname.startsWith("/terms") ||
    pathname.startsWith("/contact") ||
    pathname.startsWith("/age-policy") ||
    pathname.startsWith("/about")
  ) {
    return (
      <div className="phone-frame overflow-y-auto">
        <Outlet />
      </div>
    );
  }

  // Auth guard
  if (!state.currentUser) {
    return (
      <div className="phone-frame overflow-y-auto">
        <AuthPage />
      </div>
    );
  }

  return (
    <div className="phone-frame">
      <div className="h-full overflow-hidden">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
}

// ─── Route definitions ────────────────────────────────────────────────────────

const rootRoute = createRootRoute({
  component: RootComponent,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: FeedPage,
});

const uploadRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/upload",
  component: UploadPage,
});

const walletRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/wallet",
  component: WalletPage,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile",
  component: ProfilePage,
});

const searchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/search",
  component: SearchPage,
});

const leaderboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/leaderboard",
  component: LeaderboardPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminPage,
});

const liveRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/live",
  component: LivePage,
});

const privacyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/privacy",
  component: PrivacyPolicyPage,
});

const termsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/terms",
  component: TermsPage,
});

const contactRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/contact",
  component: ContactPage,
});

const agePolicyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/age-policy",
  component: AgePolicyPage,
});

const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/about",
  component: AboutPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  uploadRoute,
  walletRoute,
  profileRoute,
  searchRoute,
  leaderboardRoute,
  adminRoute,
  liveRoute,
  privacyRoute,
  termsRoute,
  contactRoute,
  agePolicyRoute,
  aboutRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// ─── Desktop frame wrapper ────────────────────────────────────────────────────

function DesktopWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-dvh w-full flex items-center justify-center"
      style={{
        background:
          "radial-gradient(ellipse at center, oklch(0.06 0.01 260) 0%, oklch(0 0 0) 80%)",
      }}
    >
      {/* Subtle grid background */}
      <div
        className="fixed inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(oklch(0.2 0 0) 1px, transparent 1px),
            linear-gradient(90deg, oklch(0.2 0 0) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Phone frame */}
      <div
        className="relative z-10 shadow-2xl"
        style={{
          width: "min(430px, 100vw)",
          height: "100dvh",
          boxShadow:
            "0 0 0 1px oklch(0.2 0 0), 0 40px 80px -20px rgba(0,0,0,0.8)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <LanguageProvider>
      <AppProvider>
        <DesktopWrapper>
          <RouterProvider router={router} />
        </DesktopWrapper>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "oklch(0.15 0 0)",
              border: "1px solid oklch(0.25 0 0)",
              color: "white",
            },
          }}
        />
      </AppProvider>
    </LanguageProvider>
  );
}
