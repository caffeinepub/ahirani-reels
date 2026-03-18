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
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminPage from "./pages/AdminPage";
import AgePolicyPage from "./pages/AgePolicyPage";
import AuthPage from "./pages/AuthPage";
import CameraRecordPage from "./pages/CameraRecordPage";
import ContactPage from "./pages/ContactPage";
import EditPhotoPage from "./pages/EditPhotoPage";
import EditVideoPage from "./pages/EditVideoPage";
import ExplorePage from "./pages/ExplorePage";
import FeedPage from "./pages/FeedPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import MusicLibraryPage from "./pages/MusicLibraryPage";
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
    pathname.startsWith("/admin-login") ||
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

  // Full-screen camera routes — no BottomNav, no scroll wrapper
  if (
    pathname.startsWith("/camera") ||
    pathname.startsWith("/edit-video") ||
    pathname.startsWith("/edit-photo")
  ) {
    return (
      <div className="phone-frame overflow-hidden">
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

const adminLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin-login",
  component: AdminLoginPage,
  validateSearch: (search: Record<string, unknown>): { access?: string } => ({
    access: typeof search.access === "string" ? search.access : undefined,
  }),
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

const cameraRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/camera",
  component: CameraRecordPage,
  validateSearch: (
    search: Record<string, unknown>,
  ): { from?: string; mode?: string } => ({
    from: typeof search.from === "string" ? search.from : undefined,
    mode: typeof search.mode === "string" ? search.mode : undefined,
  }),
});

const editVideoRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/edit-video",
  component: EditVideoPage,
});

const editPhotoRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/edit-photo",
  component: EditPhotoPage,
});

const musicLibraryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/music-library",
  component: MusicLibraryPage,
});

const exploreRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/explore",
  component: ExplorePage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  uploadRoute,
  walletRoute,
  profileRoute,
  searchRoute,
  leaderboardRoute,
  adminRoute,
  adminLoginRoute,
  privacyRoute,
  termsRoute,
  contactRoute,
  agePolicyRoute,
  aboutRoute,
  cameraRoute,
  editVideoRoute,
  editPhotoRoute,
  musicLibraryRoute,
  exploreRoute,
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
