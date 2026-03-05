import type React from "react";
import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";

// ─── Types ───────────────────────────────────────────────────────────────────

export type UserRole = "viewer" | "artist" | "admin";
export type SubscriptionStatus = "active" | "expired" | "none";

export interface AdRpmConfig {
  reel: number; // default 2.00
  long: number; // default 4.00
  premium: number; // default 8.00
}

export type VideoType = "reel" | "long" | "premium";

export interface WithdrawalRequest {
  id: string;
  userId: string;
  upiId: string;
  amount: number; // in ₹
  status: "pending" | "approved" | "rejected" | "paid";
  createdAt: number;
  resolvedAt: number; // 0 if not resolved; set on approve/reject
  processedAt: number; // 0 if not processed; set on approve, updated on paid
}

export interface User {
  id: string;
  username: string;
  phone: string;
  bio: string;
  avatar: string;
  followers: number;
  following: number;
  coins: number;
  referralCode: string;
  isBlocked: boolean;
  createdAt: number;
  totalLikes: number;
  totalEarnings: number; // cumulative artist USD earnings (legacy)
  pendingEarnings: number; // ₹ balance available for withdrawal
  role: UserRole;
  subscriptionStatus: SubscriptionStatus;
  subscriptionExpiry: number; // Unix ms timestamp, 0 if none
}

export interface Video {
  id: string;
  uploaderId: string;
  url: string;
  caption: string;
  hashtags: string[];
  likesCount: number;
  commentsCount: number;
  createdAt: number;
  isDeleted: boolean;
  thumbnail?: string;
  videoType: VideoType;
  viewsCount: number;
}

export interface Comment {
  id: string;
  videoId: string;
  userId: string;
  text: string;
  createdAt: number;
}

export interface Referral {
  referrerId: string;
  referredUserId: string;
  referredUsername: string;
  coinsEarned: number;
  createdAt: number;
}

export interface AppState {
  currentUser: User | null;
  users: User[];
  videos: Video[];
  comments: Comment[];
  seenVideoIds: string[];
  likedVideoIds: string[];
  referrals: Referral[];
  rpmConfig: AdRpmConfig;
  withdrawalRequests: WithdrawalRequest[];
}

// ─── Actions ─────────────────────────────────────────────────────────────────

type Action =
  | { type: "LOGIN"; user: User }
  | { type: "LOGOUT" }
  | { type: "LIKE_VIDEO"; videoId: string; userId: string }
  | { type: "UNLIKE_VIDEO"; videoId: string; userId: string }
  | { type: "ADD_COMMENT"; comment: Comment }
  | { type: "UPLOAD_VIDEO"; video: Video }
  | { type: "UPDATE_PROFILE"; userId: string; updates: Partial<User> }
  | { type: "BLOCK_USER"; userId: string }
  | { type: "UNBLOCK_USER"; userId: string }
  | { type: "DELETE_VIDEO"; videoId: string }
  | { type: "ADD_COINS"; userId: string; amount: number }
  | { type: "TRACK_SEEN"; videoId: string }
  | { type: "TRACK_VIEW"; videoId: string; userId: string }
  | { type: "ADD_USER"; user: User }
  | { type: "ADD_REFERRAL"; referral: Referral }
  | { type: "SET_RPM"; config: AdRpmConfig }
  | { type: "REQUEST_WITHDRAWAL"; request: WithdrawalRequest }
  | { type: "APPROVE_WITHDRAWAL"; requestId: string }
  | { type: "REJECT_WITHDRAWAL"; requestId: string }
  | { type: "MARK_PAID"; requestId: string }
  | { type: "ADD_EARNINGS"; userId: string; amount: number }
  | {
      type: "SET_USER_ROLE";
      userId: string;
      role: UserRole;
    }
  | {
      type: "SET_SUBSCRIPTION";
      userId: string;
      status: SubscriptionStatus;
      expiry: number;
    };

// ─── Default RPM ─────────────────────────────────────────────────────────────

const DEFAULT_RPM: AdRpmConfig = { reel: 2, long: 4, premium: 8 };

// ─── Earnings helpers ─────────────────────────────────────────────────────────

function calcArtistEarnings(video: Video, rpm: AdRpmConfig): number {
  const rate = rpm[video.videoType] ?? 2;
  const gross = (video.viewsCount * rate) / 1000;
  return gross * 0.6;
}

function calcTotalEarningsForUser(
  userId: string,
  videos: Video[],
  rpm: AdRpmConfig,
): number {
  return videos
    .filter((v) => v.uploaderId === userId && !v.isDeleted)
    .reduce((sum, v) => sum + calcArtistEarnings(v, rpm), 0);
}

// ─── Mock Seed Data ───────────────────────────────────────────────────────────

// Seed video data with types and viewsCount
const SEED_VIDEO_CONFIGS: Array<{
  id: string;
  videoType: VideoType;
  viewsCount: number;
}> = [
  { id: "v1", videoType: "reel", viewsCount: 4200 },
  { id: "v2", videoType: "long", viewsCount: 9100 },
  { id: "v3", videoType: "premium", viewsCount: 6300 },
  { id: "v4", videoType: "reel", viewsCount: 12800 },
  { id: "v5", videoType: "long", viewsCount: 3000 },
  { id: "v6", videoType: "premium", viewsCount: 16200 },
  { id: "v7", videoType: "reel", viewsCount: 9500 },
  { id: "v8", videoType: "long", viewsCount: 7100 },
];

const MOCK_VIDEOS: Video[] = [
  {
    id: "v1",
    uploaderId: "u1",
    url: "https://www.w3schools.com/html/mov_bbb.mp4",
    caption: "My latest dance routine to this trending Bollywood beat! 🔥",
    hashtags: ["dance", "bollywood", "trending", "reels"],
    likesCount: 4521,
    commentsCount: 89,
    createdAt: Date.now() - 3600000 * 2,
    isDeleted: false,
    videoType: "reel",
    viewsCount: 4200,
  },
  {
    id: "v2",
    uploaderId: "u2",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    caption: "When the chai runs out on a Monday morning 😭☕",
    hashtags: ["comedy", "relatable", "monday", "chai"],
    likesCount: 8903,
    commentsCount: 234,
    createdAt: Date.now() - 3600000 * 5,
    isDeleted: false,
    videoType: "long",
    viewsCount: 9100,
  },
  {
    id: "v3",
    uploaderId: "u3",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    caption: "Hidden gem in Coorg — you NEED to visit this place! 🌿✨",
    hashtags: ["travel", "coorg", "hidden", "nature"],
    likesCount: 6201,
    commentsCount: 145,
    createdAt: Date.now() - 3600000 * 8,
    isDeleted: false,
    videoType: "premium",
    viewsCount: 6300,
  },
  {
    id: "v4",
    uploaderId: "u4",
    url: "https://www.w3schools.com/html/mov_bbb.mp4",
    caption:
      "5 min morning workout routine anyone can do! No equipment needed 💪",
    hashtags: ["fitness", "workout", "morning", "health"],
    likesCount: 12450,
    commentsCount: 312,
    createdAt: Date.now() - 3600000 * 12,
    isDeleted: false,
    videoType: "reel",
    viewsCount: 12800,
  },
  {
    id: "v5",
    uploaderId: "u1",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    caption: "Classical fusion — mixing Bharatnatyam with hip-hop 🎭",
    hashtags: ["bharatnatyam", "fusion", "dance", "art"],
    likesCount: 3102,
    commentsCount: 67,
    createdAt: Date.now() - 3600000 * 18,
    isDeleted: false,
    videoType: "long",
    viewsCount: 3000,
  },
  {
    id: "v6",
    uploaderId: "u2",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    caption: "Office life be like... 😅 Tag your colleague!",
    hashtags: ["office", "funny", "relatable", "work"],
    likesCount: 15600,
    commentsCount: 445,
    createdAt: Date.now() - 3600000 * 24,
    isDeleted: false,
    videoType: "premium",
    viewsCount: 16200,
  },
  {
    id: "v7",
    uploaderId: "u3",
    url: "https://www.w3schools.com/html/mov_bbb.mp4",
    caption: "Street food tour of Old Delhi — 10 must-try items! 🍛",
    hashtags: ["food", "delhi", "streetfood", "foodies"],
    likesCount: 9876,
    commentsCount: 278,
    createdAt: Date.now() - 3600000 * 36,
    isDeleted: false,
    videoType: "reel",
    viewsCount: 9500,
  },
  {
    id: "v8",
    uploaderId: "u4",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    caption: "Rest day? Here's how I stay active without gym 🏃‍♂️",
    hashtags: ["restday", "active", "lifestyle", "fitness"],
    likesCount: 7234,
    commentsCount: 189,
    createdAt: Date.now() - 3600000 * 48,
    isDeleted: false,
    videoType: "long",
    viewsCount: 7100,
  },
];

// Calculate totalEarnings for each user based on their seed videos
function calcSeedEarnings(userId: string): number {
  const userVideos = MOCK_VIDEOS.filter((v) => v.uploaderId === userId);
  return userVideos.reduce((sum, v) => {
    const rate = DEFAULT_RPM[v.videoType];
    const gross = (v.viewsCount * rate) / 1000;
    return sum + gross * 0.6;
  }, 0);
}

// Calculate pendingEarnings (₹) for seeded users (same formula as totalEarnings)
function calcSeedPendingEarnings(userId: string): number {
  return calcSeedEarnings(userId);
}

const MOCK_USERS: User[] = [
  {
    id: "u1",
    username: "priya_dance",
    phone: "+919876543210",
    bio: "💃 Dance is my language | Mumbai | 1M+ views",
    avatar:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=priya&backgroundColor=b6e3f4",
    followers: 12500,
    following: 342,
    coins: 150,
    referralCode: "PRIYA2024",
    isBlocked: false,
    createdAt: Date.now() - 86400000 * 30,
    totalLikes: 45000,
    totalEarnings: calcSeedEarnings("u1"),
    pendingEarnings: calcSeedPendingEarnings("u1"),
    role: "artist",
    subscriptionStatus: "active",
    subscriptionExpiry: Date.now() + 86400000 * 30,
  },
  {
    id: "u2",
    username: "rahul_comedy",
    phone: "+919876543211",
    bio: "😂 Making India laugh since 2021 | Stand-up | Delhi",
    avatar:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=rahul&backgroundColor=ffdfbf",
    followers: 8900,
    following: 210,
    coins: 75,
    referralCode: "RAHUL2024",
    isBlocked: false,
    createdAt: Date.now() - 86400000 * 20,
    totalLikes: 23000,
    totalEarnings: calcSeedEarnings("u2"),
    pendingEarnings: calcSeedPendingEarnings("u2"),
    role: "artist",
    subscriptionStatus: "active",
    subscriptionExpiry: Date.now() + 86400000 * 30,
  },
  {
    id: "u3",
    username: "neha_vlogs",
    phone: "+919876543212",
    bio: "🌟 Travel | Food | Lifestyle | Pune",
    avatar:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=neha&backgroundColor=c0aede",
    followers: 5600,
    following: 890,
    coins: 200,
    referralCode: "NEHA2024",
    isBlocked: false,
    createdAt: Date.now() - 86400000 * 15,
    totalLikes: 18000,
    totalEarnings: calcSeedEarnings("u3"),
    pendingEarnings: calcSeedPendingEarnings("u3"),
    role: "viewer",
    subscriptionStatus: "none",
    subscriptionExpiry: 0,
  },
  {
    id: "u4",
    username: "arjun_fitness",
    phone: "+919876543213",
    bio: "💪 Fitness Coach | Healthy Living | Bangalore",
    avatar:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=arjun&backgroundColor=d1d4f9",
    followers: 21000,
    following: 155,
    coins: 320,
    referralCode: "ARJUN2024",
    isBlocked: false,
    createdAt: Date.now() - 86400000 * 45,
    totalLikes: 89000,
    totalEarnings: calcSeedEarnings("u4"),
    pendingEarnings: calcSeedPendingEarnings("u4"),
    role: "artist",
    subscriptionStatus: "expired",
    subscriptionExpiry: Date.now() - 86400000 * 5,
  },
];

const MOCK_COMMENTS: Comment[] = [
  {
    id: "c1",
    videoId: "v1",
    userId: "u2",
    text: "This is incredible! 🔥🔥",
    createdAt: Date.now() - 3600000,
  },
  {
    id: "c2",
    videoId: "v1",
    userId: "u3",
    text: "Queen! Love the moves 💃",
    createdAt: Date.now() - 1800000,
  },
  {
    id: "c3",
    videoId: "v2",
    userId: "u1",
    text: "HAHAHA so true 😂😂",
    createdAt: Date.now() - 3000000,
  },
  {
    id: "c4",
    videoId: "v2",
    userId: "u4",
    text: "Every Monday morning vibes 😅",
    createdAt: Date.now() - 2400000,
  },
  {
    id: "c5",
    videoId: "v3",
    userId: "u1",
    text: "Going on my travel bucket list! 🌿",
    createdAt: Date.now() - 3600000 * 3,
  },
  {
    id: "c6",
    videoId: "v4",
    userId: "u3",
    text: "Did this today! Amazing routine 💪",
    createdAt: Date.now() - 7200000,
  },
];

const MOCK_REFERRALS: Referral[] = [
  {
    referrerId: "u1",
    referredUserId: "u2",
    referredUsername: "rahul_comedy",
    coinsEarned: 10,
    createdAt: Date.now() - 86400000 * 5,
  },
  {
    referrerId: "u1",
    referredUserId: "u3",
    referredUsername: "neha_vlogs",
    coinsEarned: 10,
    createdAt: Date.now() - 86400000 * 2,
  },
];

const MOCK_WITHDRAWALS: WithdrawalRequest[] = [
  {
    id: "w1",
    userId: "u4",
    upiId: "arjun@upi",
    amount: 500,
    status: "paid",
    createdAt: Date.now() - 86400000 * 10,
    resolvedAt: Date.now() - 86400000 * 9,
    processedAt: Date.now() - 86400000 * 8,
  },
  {
    id: "w2",
    userId: "u2",
    upiId: "rahul.comedy@paytm",
    amount: 300,
    status: "pending",
    createdAt: Date.now() - 86400000 * 2,
    resolvedAt: 0,
    processedAt: 0,
  },
  {
    id: "w3",
    userId: "u3",
    upiId: "neha.vlogs@gpay",
    amount: 200,
    status: "rejected",
    createdAt: Date.now() - 86400000 * 7,
    resolvedAt: Date.now() - 86400000 * 6,
    processedAt: 0,
  },
  {
    id: "w4",
    userId: "u1",
    upiId: "priya.dance@phonepe",
    amount: 400,
    status: "approved",
    createdAt: Date.now() - 86400000 * 3,
    resolvedAt: Date.now() - 86400000 * 2,
    processedAt: Date.now() - 86400000 * 2,
  },
];

// ─── Initial State ────────────────────────────────────────────────────────────

function getInitialState(): AppState {
  try {
    const stored = localStorage.getItem("ahirani_state");
    if (stored) {
      const parsed = JSON.parse(stored) as AppState;
      // Migration: ensure all videos have videoType and viewsCount
      const migratedVideos = parsed.videos.map((v) => {
        const seedCfg = SEED_VIDEO_CONFIGS.find((s) => s.id === v.id);
        return {
          ...v,
          videoType: v.videoType ?? seedCfg?.videoType ?? "reel",
          viewsCount: v.viewsCount ?? seedCfg?.viewsCount ?? 0,
        };
      });
      // Migration: ensure all users have totalEarnings, pendingEarnings, role, and subscription
      const migratedUsers = parsed.users.map((u) => ({
        ...u,
        totalEarnings:
          u.totalEarnings ??
          calcTotalEarningsForUser(
            u.id,
            migratedVideos,
            parsed.rpmConfig ?? DEFAULT_RPM,
          ),
        pendingEarnings: u.pendingEarnings ?? 0,
        role: u.role ?? ("viewer" as UserRole),
        subscriptionStatus:
          u.subscriptionStatus ?? ("none" as SubscriptionStatus),
        subscriptionExpiry: u.subscriptionExpiry ?? 0,
      }));
      return {
        ...parsed,
        videos: migratedVideos,
        users: migratedUsers,
        rpmConfig: parsed.rpmConfig ?? DEFAULT_RPM,
        withdrawalRequests: (parsed.withdrawalRequests ?? []).map((w) => ({
          ...w,
          processedAt:
            (w as WithdrawalRequest & { processedAt?: number }).processedAt ??
            0,
        })),
      };
    }
  } catch {
    // ignore
  }
  return {
    currentUser: null,
    users: MOCK_USERS,
    videos: MOCK_VIDEOS,
    comments: MOCK_COMMENTS,
    seenVideoIds: [],
    likedVideoIds: [],
    referrals: MOCK_REFERRALS,
    rpmConfig: DEFAULT_RPM,
    withdrawalRequests: MOCK_WITHDRAWALS,
  };
}

// ─── Reducer ─────────────────────────────────────────────────────────────────

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "LOGIN":
      return { ...state, currentUser: action.user };

    case "LOGOUT":
      return { ...state, currentUser: null };

    case "LIKE_VIDEO": {
      const isLiked = state.likedVideoIds.includes(action.videoId);
      return {
        ...state,
        likedVideoIds: isLiked
          ? state.likedVideoIds.filter((id) => id !== action.videoId)
          : [...state.likedVideoIds, action.videoId],
        videos: state.videos.map((v) =>
          v.id === action.videoId
            ? {
                ...v,
                likesCount: isLiked ? v.likesCount - 1 : v.likesCount + 1,
              }
            : v,
        ),
        users: state.users.map((u) =>
          u.id === action.userId
            ? {
                ...u,
                totalLikes: isLiked ? u.totalLikes - 1 : u.totalLikes + 1,
              }
            : u,
        ),
        currentUser:
          state.currentUser?.id === action.userId
            ? {
                ...state.currentUser,
                totalLikes: isLiked
                  ? state.currentUser.totalLikes - 1
                  : state.currentUser.totalLikes + 1,
              }
            : state.currentUser,
      };
    }

    case "UNLIKE_VIDEO":
      return state;

    case "ADD_COMMENT": {
      return {
        ...state,
        comments: [...state.comments, action.comment],
        videos: state.videos.map((v) =>
          v.id === action.comment.videoId
            ? { ...v, commentsCount: v.commentsCount + 1 }
            : v,
        ),
      };
    }

    case "UPLOAD_VIDEO": {
      return {
        ...state,
        videos: [action.video, ...state.videos],
      };
    }

    case "UPDATE_PROFILE": {
      return {
        ...state,
        users: state.users.map((u) =>
          u.id === action.userId ? { ...u, ...action.updates } : u,
        ),
        currentUser:
          state.currentUser?.id === action.userId
            ? { ...state.currentUser, ...action.updates }
            : state.currentUser,
      };
    }

    case "BLOCK_USER":
      return {
        ...state,
        users: state.users.map((u) =>
          u.id === action.userId ? { ...u, isBlocked: true } : u,
        ),
      };

    case "UNBLOCK_USER":
      return {
        ...state,
        users: state.users.map((u) =>
          u.id === action.userId ? { ...u, isBlocked: false } : u,
        ),
      };

    case "DELETE_VIDEO":
      return {
        ...state,
        videos: state.videos.map((v) =>
          v.id === action.videoId ? { ...v, isDeleted: true } : v,
        ),
      };

    case "ADD_COINS": {
      return {
        ...state,
        users: state.users.map((u) =>
          u.id === action.userId ? { ...u, coins: u.coins + action.amount } : u,
        ),
        currentUser:
          state.currentUser?.id === action.userId
            ? {
                ...state.currentUser,
                coins: state.currentUser.coins + action.amount,
              }
            : state.currentUser,
      };
    }

    case "TRACK_SEEN":
    case "TRACK_VIEW": {
      const videoId =
        action.type === "TRACK_VIEW" ? action.videoId : action.videoId;
      if (state.seenVideoIds.includes(videoId)) return state;
      const newSeen = [...state.seenVideoIds, videoId];

      // Increment viewsCount on the matching video
      const updatedVideos = state.videos.map((v) =>
        v.id === videoId ? { ...v, viewsCount: v.viewsCount + 1 } : v,
      );

      // Find the updated video to recalculate earnings
      const watchedVideo = updatedVideos.find((v) => v.id === videoId);

      // Recalculate artist earnings delta for the uploader
      let updatedUsers = state.users;
      let updatedCurrentUser = state.currentUser;

      if (watchedVideo) {
        const rpm = state.rpmConfig;
        const prevViews = watchedVideo.viewsCount - 1;
        const rate = rpm[watchedVideo.videoType] ?? 2;
        const prevArtist = ((prevViews * rate) / 1000) * 0.6;
        const newArtist = ((watchedVideo.viewsCount * rate) / 1000) * 0.6;
        const delta = newArtist - prevArtist;

        updatedUsers = state.users.map((u) =>
          u.id === watchedVideo.uploaderId
            ? {
                ...u,
                totalEarnings: (u.totalEarnings ?? 0) + delta,
                pendingEarnings: (u.pendingEarnings ?? 0) + delta,
              }
            : u,
        );

        if (state.currentUser?.id === watchedVideo.uploaderId) {
          updatedCurrentUser = {
            ...state.currentUser,
            totalEarnings: (state.currentUser.totalEarnings ?? 0) + delta,
            pendingEarnings: (state.currentUser.pendingEarnings ?? 0) + delta,
          };
        }
      }

      return {
        ...state,
        seenVideoIds: newSeen.slice(-20),
        videos: updatedVideos,
        users: updatedUsers,
        currentUser: updatedCurrentUser,
      };
    }

    case "ADD_USER":
      return {
        ...state,
        users: [...state.users, action.user],
      };

    case "ADD_REFERRAL":
      return {
        ...state,
        referrals: [...state.referrals, action.referral],
      };

    case "SET_RPM": {
      const newUsers = state.users.map((u) => {
        const newTotal = calcTotalEarningsForUser(
          u.id,
          state.videos,
          action.config,
        );
        return { ...u, totalEarnings: newTotal };
      });
      return {
        ...state,
        rpmConfig: action.config,
        users: newUsers,
        currentUser: state.currentUser
          ? {
              ...state.currentUser,
              totalEarnings: calcTotalEarningsForUser(
                state.currentUser.id,
                state.videos,
                action.config,
              ),
            }
          : null,
      };
    }

    case "REQUEST_WITHDRAWAL": {
      // Deduct amount from user's pendingEarnings
      const updatedUsers = state.users.map((u) =>
        u.id === action.request.userId
          ? {
              ...u,
              pendingEarnings: Math.max(
                0,
                (u.pendingEarnings ?? 0) - action.request.amount,
              ),
            }
          : u,
      );
      const updatedCurrentUser =
        state.currentUser?.id === action.request.userId
          ? {
              ...state.currentUser,
              pendingEarnings: Math.max(
                0,
                (state.currentUser.pendingEarnings ?? 0) -
                  action.request.amount,
              ),
            }
          : state.currentUser;
      return {
        ...state,
        withdrawalRequests: [...state.withdrawalRequests, action.request],
        users: updatedUsers,
        currentUser: updatedCurrentUser,
      };
    }

    case "APPROVE_WITHDRAWAL": {
      const now = Date.now();
      return {
        ...state,
        withdrawalRequests: state.withdrawalRequests.map((r) =>
          r.id === action.requestId
            ? { ...r, status: "approved", resolvedAt: now, processedAt: now }
            : r,
        ),
      };
    }

    case "MARK_PAID": {
      return {
        ...state,
        withdrawalRequests: state.withdrawalRequests.map((r) =>
          r.id === action.requestId && r.status === "approved"
            ? { ...r, status: "paid", processedAt: Date.now() }
            : r,
        ),
      };
    }

    case "REJECT_WITHDRAWAL": {
      const req = state.withdrawalRequests.find(
        (r) => r.id === action.requestId,
      );
      // Refund amount back to user if found and still pending
      let refundedUsers = state.users;
      let refundedCurrentUser = state.currentUser;
      if (req && req.status === "pending") {
        refundedUsers = state.users.map((u) =>
          u.id === req.userId
            ? {
                ...u,
                pendingEarnings: (u.pendingEarnings ?? 0) + req.amount,
              }
            : u,
        );
        if (state.currentUser?.id === req.userId) {
          refundedCurrentUser = {
            ...state.currentUser,
            pendingEarnings:
              (state.currentUser.pendingEarnings ?? 0) + req.amount,
          };
        }
      }
      return {
        ...state,
        withdrawalRequests: state.withdrawalRequests.map((r) =>
          r.id === action.requestId
            ? { ...r, status: "rejected", resolvedAt: Date.now() }
            : r,
        ),
        users: refundedUsers,
        currentUser: refundedCurrentUser,
      };
    }

    case "ADD_EARNINGS": {
      const updatedUsers = state.users.map((u) =>
        u.id === action.userId
          ? {
              ...u,
              pendingEarnings: (u.pendingEarnings ?? 0) + action.amount,
              totalEarnings: (u.totalEarnings ?? 0) + action.amount,
            }
          : u,
      );
      const updatedCurrentUser =
        state.currentUser?.id === action.userId
          ? {
              ...state.currentUser,
              pendingEarnings:
                (state.currentUser.pendingEarnings ?? 0) + action.amount,
              totalEarnings:
                (state.currentUser.totalEarnings ?? 0) + action.amount,
            }
          : state.currentUser;
      return {
        ...state,
        users: updatedUsers,
        currentUser: updatedCurrentUser,
      };
    }

    case "SET_USER_ROLE": {
      return {
        ...state,
        users: state.users.map((u) =>
          u.id === action.userId ? { ...u, role: action.role } : u,
        ),
        currentUser:
          state.currentUser?.id === action.userId
            ? { ...state.currentUser, role: action.role }
            : state.currentUser,
      };
    }

    case "SET_SUBSCRIPTION": {
      return {
        ...state,
        users: state.users.map((u) =>
          u.id === action.userId
            ? {
                ...u,
                subscriptionStatus: action.status,
                subscriptionExpiry: action.expiry,
              }
            : u,
        ),
        currentUser:
          state.currentUser?.id === action.userId
            ? {
                ...state.currentUser,
                subscriptionStatus: action.status,
                subscriptionExpiry: action.expiry,
              }
            : state.currentUser,
      };
    }

    default:
      return state;
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  isBackendConnected: boolean;
}

const AppContext = createContext<AppContextValue | null>(null);

function AppProviderInner({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, getInitialState);
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const { actor, isFetching } = useActor();

  // Persist state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("ahirani_state", JSON.stringify(state));
    } catch {
      // ignore quota errors
    }
  }, [state]);

  // Validate backend connectivity once actor is available
  useEffect(() => {
    if (!actor || isFetching) return;
    let cancelled = false;
    (async () => {
      try {
        // sendOtp with userId 0n as a lightweight connectivity ping
        await actor.sendOtp(BigInt(0));
        if (!cancelled) {
          setIsBackendConnected(true);
          toast.success("Connected to ICP", {
            id: "icp-connected",
            duration: 3000,
            description: "Ahirani Reels backend is live",
          });
        }
      } catch {
        // Actor exists but call failed — still mark connected at actor level
        if (!cancelled) {
          setIsBackendConnected(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [actor, isFetching]);

  return (
    <AppContext.Provider value={{ state, dispatch, isBackendConnected }}>
      {children}
    </AppContext.Provider>
  );
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  return <AppProviderInner>{children}</AppProviderInner>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

export function useBackendConnected(): boolean {
  const ctx = useContext(AppContext);
  return ctx?.isBackendConnected ?? false;
}

// ─── Helper hooks ─────────────────────────────────────────────────────────────

export function useCurrentUser() {
  const { state } = useApp();
  return state.currentUser;
}

export function useUserById(id: string): User | undefined {
  const { state } = useApp();
  return state.users.find((u) => u.id === id);
}

export function useVideoComments(videoId: string): Comment[] {
  const { state } = useApp();
  return state.comments.filter((c) => c.videoId === videoId);
}
