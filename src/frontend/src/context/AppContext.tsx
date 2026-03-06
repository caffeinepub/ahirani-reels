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
  userName: string; // full name entered by user at withdrawal time
  amount: number; // in ₹
  status: "pending" | "approved" | "rejected" | "paid";
  createdAt: number;
  resolvedAt: number; // 0 if not resolved; set on approve/reject
  processedAt: number; // 0 if not processed; set on approve, updated on paid
  paymentMethod?: "upi" | "paytm" | "bank";
  paytmNumber?: string;
  bankAccountNumber?: string;
  bankIfsc?: string;
  bankAccountHolder?: string;
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
  loginStreak: number; // consecutive login days
  lastLoginDate: number; // unix ms of last daily bonus claim
  lastSpinDate: number; // unix ms of last lucky spin (0 = never)
  isVerifiedCreator: boolean; // admin-granted verified badge
  points: number; // cumulative points earned
  watchedVideosToday: number; // count of videos watched today (resets daily)
  lastWatchRewardDate: string; // date string for daily watch reset
  // Multi-provider auth fields
  email?: string;
  password?: string; // plain text simulation (not for production)
  authProvider?: "phone" | "email" | "username" | "google" | "facebook";
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
  isApproved?: boolean;
  thumbnail?: string;
  videoType: VideoType;
  viewsCount: number;
  adImpressions: number;
  shareCount: number; // incremented on each share action
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
  commissionEarned: number; // ₹ value
  createdAt: number;
  subscriptionReferralEarned: boolean; // true after ₹60 bonus is paid
}

// Tracks per-referred-user progress toward viewer referral reward conditions
export interface ViewerReferralProgress {
  referrerId: string; // who referred this user
  otpVerified: boolean; // signed up + OTP verified
  videosWatched: number; // how many unique videos watched (max counts toward 3)
  rewardPaid: boolean; // ₹10 has been credited to referrer
}

export interface Transaction {
  id: string;
  userId: string;
  txType:
    | "ad_earnings"
    | "referral_credit"
    | "withdrawal_requested"
    | "withdrawal_approved"
    | "withdrawal_rejected"
    | "withdrawal_paid"
    | "subscription_payment"
    | "daily_bonus"
    | "spin_reward"
    | "watch_reward";
  amount: number;
  description: string;
  createdAt: number;
}

export interface LocalAd {
  id: string;
  businessName: string;
  imageUrl: string;
  linkUrl: string;
  tagline: string;
  durationDays: number; // how many days paid for
  startDate: number; // unix ms
  isActive: boolean;
}

// ─── OTT-ready content type extension ────────────────────────────────────────

export type OTTContentType =
  | "reel"
  | "long"
  | "premium"
  | "series"
  | "movie"
  | "live";

// Augment Video with OTT-ready optional fields
declare module "./AppContext" {
  interface Video {
    contentType?: OTTContentType;
    seriesId?: string;
    episodeNumber?: number;
    isPaid?: boolean;
    streamingUrl?: string;
  }
}

export interface Notification {
  id: string;
  userId: string; // recipient
  type:
    | "follow"
    | "like"
    | "comment"
    | "referral_reward"
    | "withdrawal_approved"
    | "withdrawal_requested"
    | "withdrawal_paid"
    | "daily_bonus"
    | "spin_reward";
  message: string;
  createdAt: number;
  isRead: boolean;
}

export interface VideoReport {
  id: string;
  videoId: string;
  reporterId: string;
  reason: string;
  createdAt: number;
}

export interface AppState {
  currentUser: User | null;
  users: User[];
  videos: Video[];
  comments: Comment[];
  seenVideoIds: string[];
  likedVideoIds: string[];
  followingIds: string[];
  referrals: Referral[];
  rpmConfig: AdRpmConfig;
  withdrawalRequests: WithdrawalRequest[];
  transactions: Transaction[];
  localAds: LocalAd[];
  notifications: Notification[];
  reports: VideoReport[];
  // keyed by referredUserId
  viewerReferralProgress: Record<string, ViewerReferralProgress>;
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
  | { type: "APPROVE_VIDEO"; videoId: string }
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
    }
  | { type: "ADD_TRANSACTION"; transaction: Transaction }
  | { type: "SUBSCRIBE_ARTIST"; userId: string }
  | { type: "ADD_LOCAL_AD"; ad: LocalAd }
  | { type: "DELETE_LOCAL_AD"; adId: string }
  | { type: "TOGGLE_LOCAL_AD"; adId: string }
  | { type: "TRACK_AD_IMPRESSION"; videoId: string }
  | { type: "REFERRAL_SUBSCRIPTION_BONUS"; referredUserId: string }
  | { type: "INIT_VIEWER_REFERRAL"; referredUserId: string; referrerId: string }
  | { type: "VIEWER_OTP_VERIFIED"; referredUserId: string }
  | { type: "VIEWER_VIDEO_WATCHED"; watcherUserId: string }
  | { type: "FOLLOW"; targetUserId: string }
  | { type: "UNFOLLOW"; targetUserId: string }
  | { type: "ADD_NOTIFICATION"; notification: Notification }
  | { type: "MARK_NOTIFICATIONS_READ" }
  | { type: "FLAG_VIDEO"; report: VideoReport }
  | { type: "DISMISS_REPORT"; reportId: string }
  | { type: "CLAIM_DAILY_BONUS"; userId: string }
  | { type: "SPIN_WHEEL"; userId: string; reward: number }
  | { type: "SHARE_VIDEO_BOOST"; videoId: string; userId: string }
  | { type: "GRANT_VERIFIED_BADGE"; userId: string }
  | { type: "REVOKE_VERIFIED_BADGE"; userId: string }
  | { type: "EARN_WATCH_POINTS"; userId: string };

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
    adImpressions: 1800,
    shareCount: 312,
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
    adImpressions: 4200,
    shareCount: 891,
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
    adImpressions: 3100,
    shareCount: 445,
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
    adImpressions: 6500,
    shareCount: 1203,
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
    adImpressions: 1200,
    shareCount: 178,
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
    adImpressions: 8900,
    shareCount: 2341,
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
    adImpressions: 4100,
    shareCount: 734,
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
    adImpressions: 3200,
    shareCount: 567,
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
    loginStreak: 3,
    lastLoginDate: Date.now() - 86400000, // yesterday
    lastSpinDate: 0,
    isVerifiedCreator: true,
    points: 0,
    watchedVideosToday: 0,
    lastWatchRewardDate: "",
    authProvider: "phone" as const,
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
    loginStreak: 3,
    lastLoginDate: Date.now() - 86400000,
    lastSpinDate: 0,
    isVerifiedCreator: false,
    points: 0,
    watchedVideosToday: 0,
    lastWatchRewardDate: "",
    authProvider: "phone" as const,
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
    loginStreak: 3,
    lastLoginDate: Date.now() - 86400000,
    lastSpinDate: 0,
    isVerifiedCreator: false,
    points: 12,
    watchedVideosToday: 0,
    lastWatchRewardDate: "",
    authProvider: "phone" as const,
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
    loginStreak: 3,
    lastLoginDate: Date.now() - 86400000,
    lastSpinDate: 0,
    isVerifiedCreator: false,
    points: 0,
    watchedVideosToday: 0,
    lastWatchRewardDate: "",
    authProvider: "phone" as const,
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
    commissionEarned: 60, // ₹10 signup + ₹60 subscription bonus (already paid)
    createdAt: Date.now() - 86400000 * 5,
    subscriptionReferralEarned: true,
  },
  {
    referrerId: "u1",
    referredUserId: "u3",
    referredUsername: "neha_vlogs",
    commissionEarned: 10, // ₹10 signup bonus only (no subscription yet)
    createdAt: Date.now() - 86400000 * 2,
    subscriptionReferralEarned: false,
  },
];

const MOCK_WITHDRAWALS: WithdrawalRequest[] = [
  {
    id: "w1",
    userId: "u4",
    upiId: "arjun@upi",
    userName: "Arjun Fitness",
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
    userName: "Rahul Comedy",
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
    userName: "Neha Vlogs",
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
    userName: "Priya Dance",
    amount: 400,
    status: "approved",
    createdAt: Date.now() - 86400000 * 3,
    resolvedAt: Date.now() - 86400000 * 2,
    processedAt: Date.now() - 86400000 * 2,
  },
];

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "tx001",
    userId: "u1",
    txType: "ad_earnings",
    amount: 5.04,
    description:
      "View earnings: My latest dance routine to this trending Bollywood beat! 🔥",
    createdAt: Date.now() - 3600000 * 3,
  },
  {
    id: "tx002",
    userId: "u1",
    txType: "referral_credit",
    amount: 10,
    description: "Referral reward for @rahul_comedy",
    createdAt: Date.now() - 86400000 * 5,
  },
  {
    id: "tx003",
    userId: "u1",
    txType: "referral_credit",
    amount: 10,
    description: "Referral reward for @neha_vlogs",
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    id: "tx004",
    userId: "u2",
    txType: "ad_earnings",
    amount: 21.84,
    description:
      "View earnings: When the chai runs out on a Monday morning 😭☕",
    createdAt: Date.now() - 3600000 * 6,
  },
  {
    id: "tx005",
    userId: "u2",
    txType: "ad_earnings",
    amount: 38.88,
    description: "View earnings: Office life be like... 😅 Tag your colleague!",
    createdAt: Date.now() - 3600000 * 25,
  },
  {
    id: "tx006",
    userId: "u4",
    txType: "ad_earnings",
    amount: 30.72,
    description:
      "View earnings: 5 min morning workout routine anyone can do! No equipment needed 💪",
    createdAt: Date.now() - 3600000 * 13,
  },
  {
    id: "tx007",
    userId: "u4",
    txType: "withdrawal_paid",
    amount: 500,
    description: "Withdrawal paid: ₹500 to arjun@upi",
    createdAt: Date.now() - 86400000 * 8,
  },
];

// ─── Mock Local Ads ───────────────────────────────────────────────────────────

const MOCK_LOCAL_ADS: LocalAd[] = [
  {
    id: "ad1",
    businessName: "Nashik Fresh Fruits",
    imageUrl:
      "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=600&q=80",
    linkUrl: "https://example.com/nashik-fruits",
    tagline: "Farm-fresh fruits delivered to your door! 🍎",
    durationDays: 7,
    startDate: Date.now() - 86400000 * 2,
    isActive: true,
  },
  {
    id: "ad2",
    businessName: "AhirFit Gym",
    imageUrl:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80",
    linkUrl: "https://example.com/ahirfit",
    tagline: "Join Pune's #1 gym. First month FREE! 💪",
    durationDays: 14,
    startDate: Date.now() - 86400000 * 1,
    isActive: true,
  },
  {
    id: "ad3",
    businessName: "Silk Route Sarees",
    imageUrl:
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80",
    linkUrl: "https://example.com/silk-route",
    tagline: "Handwoven sarees from Nashik. Shop now 🌸",
    durationDays: 5,
    startDate: Date.now() - 86400000 * 5,
    isActive: false,
  },
];

// ─── Seed viewer referral progress ───────────────────────────────────────────
// u3 (neha_vlogs, viewer) was referred by u1 (priya_dance). She's verified OTP
// and watched 2 videos so far -- reward not yet paid (needs 1 more watch).
const MOCK_VIEWER_REFERRAL_PROGRESS: Record<string, ViewerReferralProgress> = {
  u3: {
    referrerId: "u1",
    otpVerified: true,
    videosWatched: 2,
    rewardPaid: false,
  },
};

// ─── Seed Notifications ───────────────────────────────────────────────────────

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    userId: "u1",
    type: "like",
    message: '@rahul_comedy liked your video "My latest dance routine..."',
    createdAt: Date.now() - 3600000,
    isRead: false,
  },
  {
    id: "n2",
    userId: "u1",
    type: "comment",
    message: "@neha_vlogs commented on your video",
    createdAt: Date.now() - 7200000,
    isRead: false,
  },
  {
    id: "n3",
    userId: "u1",
    type: "follow",
    message: "@rahul_comedy started following you",
    createdAt: Date.now() - 86400000,
    isRead: false,
  },
  {
    id: "n4",
    userId: "u1",
    type: "referral_reward",
    message: "You earned ₹10 referral reward from @neha_vlogs",
    createdAt: Date.now() - 86400000 * 2,
    isRead: true,
  },
  {
    id: "n5",
    userId: "u1",
    type: "withdrawal_approved",
    message: "Your withdrawal of ₹400 was approved",
    createdAt: Date.now() - 86400000 * 3,
    isRead: true,
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
          adImpressions: v.adImpressions ?? 0,
          shareCount: v.shareCount ?? 0,
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
        loginStreak: u.loginStreak ?? 0,
        lastLoginDate: u.lastLoginDate ?? 0,
        lastSpinDate: u.lastSpinDate ?? 0,
        isVerifiedCreator: u.isVerifiedCreator ?? false,
        points: u.points ?? 0,
        watchedVideosToday: u.watchedVideosToday ?? 0,
        lastWatchRewardDate: u.lastWatchRewardDate ?? "",
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
          userName:
            (w as WithdrawalRequest & { userName?: string }).userName ?? "",
        })),
        transactions: parsed.transactions ?? [],
        localAds: parsed.localAds ?? MOCK_LOCAL_ADS,
        viewerReferralProgress:
          parsed.viewerReferralProgress ?? MOCK_VIEWER_REFERRAL_PROGRESS,
        followingIds: parsed.followingIds ?? [],
        notifications: parsed.notifications ?? MOCK_NOTIFICATIONS,
        reports: parsed.reports ?? [],
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
    followingIds: [],
    referrals: MOCK_REFERRALS,
    rpmConfig: DEFAULT_RPM,
    withdrawalRequests: MOCK_WITHDRAWALS,
    transactions: MOCK_TRANSACTIONS,
    localAds: MOCK_LOCAL_ADS,
    notifications: MOCK_NOTIFICATIONS,
    reports: [],
    viewerReferralProgress: MOCK_VIEWER_REFERRAL_PROGRESS,
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
      const likedVideo = state.videos.find((v) => v.id === action.videoId);
      const liker = state.users.find((u) => u.id === action.userId);

      // Add like notification to video uploader (only on like, not unlike)
      let likeNotifications = state.notifications;
      if (
        !isLiked &&
        likedVideo &&
        liker &&
        likedVideo.uploaderId !== action.userId
      ) {
        const likeNotif: Notification = {
          id: `notif_like_${Date.now()}`,
          userId: likedVideo.uploaderId,
          type: "like",
          message: `@${liker.username} liked your video "${likedVideo.caption.slice(0, 40)}..."`,
          createdAt: Date.now(),
          isRead: false,
        };
        likeNotifications = [likeNotif, ...state.notifications];
      }

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
        notifications: likeNotifications,
      };
    }

    case "UNLIKE_VIDEO":
      return state;

    case "ADD_COMMENT": {
      const commentVideo = state.videos.find(
        (v) => v.id === action.comment.videoId,
      );
      const commenter = state.users.find((u) => u.id === action.comment.userId);
      let commentNotifications = state.notifications;
      if (
        commentVideo &&
        commenter &&
        commentVideo.uploaderId !== action.comment.userId
      ) {
        const commentNotif: Notification = {
          id: `notif_comment_${Date.now()}`,
          userId: commentVideo.uploaderId,
          type: "comment",
          message: `@${commenter.username} commented on your video`,
          createdAt: Date.now(),
          isRead: false,
        };
        commentNotifications = [commentNotif, ...state.notifications];
      }
      return {
        ...state,
        comments: [...state.comments, action.comment],
        videos: state.videos.map((v) =>
          v.id === action.comment.videoId
            ? { ...v, commentsCount: v.commentsCount + 1 }
            : v,
        ),
        notifications: commentNotifications,
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

    case "APPROVE_VIDEO":
      return {
        ...state,
        videos: state.videos.map((v) =>
          v.id === action.videoId ? { ...v, isApproved: true } : v,
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
      let newTransactions = state.transactions;

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

        if (delta > 0) {
          const tx: Transaction = {
            id: `tx${Date.now()}${Math.random().toString(36).slice(2, 6)}`,
            userId: watchedVideo.uploaderId,
            txType: "ad_earnings",
            amount: delta,
            description: `View earnings: ${watchedVideo.caption}`,
            createdAt: Date.now(),
          };
          newTransactions = [tx, ...state.transactions];
        }
      }

      // Track video watch count for current user (for viewer watch reward)
      const watchingUserId =
        action.type === "TRACK_VIEW" ? action.userId : state.currentUser?.id;

      if (watchingUserId) {
        const todayStr = new Date().toDateString();
        updatedUsers = updatedUsers.map((u) => {
          if (u.id !== watchingUserId) return u;
          // Reset if it's a new day
          const isNewDay = (u.lastWatchRewardDate ?? "") !== todayStr;
          const currentWatched = isNewDay ? 0 : (u.watchedVideosToday ?? 0);
          const newWatchedCount = currentWatched + 1;

          // If reached 10 videos, inline the watch reward logic
          if (newWatchedCount >= 10) {
            const earnNow = Date.now();
            const watchTx: Transaction = {
              id: `tx${earnNow}watch`,
              userId: u.id,
              txType: "watch_reward",
              amount: 2,
              description: "Watch reward: 10 videos watched today",
              createdAt: earnNow,
            };
            newTransactions = [watchTx, ...newTransactions];
            return {
              ...u,
              points: (u.points ?? 0) + 2,
              pendingEarnings: (u.pendingEarnings ?? 0) + 2,
              watchedVideosToday: 0,
              lastWatchRewardDate: todayStr,
            };
          }

          return {
            ...u,
            watchedVideosToday: newWatchedCount,
            lastWatchRewardDate: isNewDay ? todayStr : u.lastWatchRewardDate,
          };
        });

        // Update currentUser if it's the watcher
        if (state.currentUser?.id === watchingUserId) {
          const updatedWatcher = updatedUsers.find(
            (u) => u.id === watchingUserId,
          );
          if (updatedWatcher) {
            updatedCurrentUser = updatedWatcher;
          }
        }
      }

      return {
        ...state,
        seenVideoIds: newSeen.slice(-20),
        videos: updatedVideos,
        users: updatedUsers,
        currentUser: updatedCurrentUser,
        transactions: newTransactions,
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
      const requestingUser = state.users.find(
        (u) => u.id === action.request.userId,
      );
      const withdrawalRequestedNotif: Notification = {
        id: `notif_wdreq_${Date.now()}`,
        userId: "__admin__",
        type: "withdrawal_requested",
        message: `@${requestingUser?.username ?? "user"} requested withdrawal of ₹${action.request.amount.toFixed(0)}`,
        createdAt: Date.now(),
        isRead: false,
      };
      return {
        ...state,
        withdrawalRequests: [...state.withdrawalRequests, action.request],
        users: updatedUsers,
        currentUser: updatedCurrentUser,
        notifications: [withdrawalRequestedNotif, ...state.notifications],
      };
    }

    case "APPROVE_WITHDRAWAL": {
      const now = Date.now();
      const approvedReq = state.withdrawalRequests.find(
        (r) => r.id === action.requestId,
      );
      const approveTx: Transaction | null = approvedReq
        ? {
            id: `tx${now}appr`,
            userId: approvedReq.userId,
            txType: "withdrawal_approved",
            amount: approvedReq.amount,
            description: `Withdrawal approved: ₹${approvedReq.amount.toFixed(2)}`,
            createdAt: now,
          }
        : null;
      const approveNotif: Notification | null = approvedReq
        ? {
            id: `notif_wdappr_${now}`,
            userId: approvedReq.userId,
            type: "withdrawal_approved",
            message: `Your withdrawal of ₹${approvedReq.amount.toFixed(0)} was approved`,
            createdAt: now,
            isRead: false,
          }
        : null;
      return {
        ...state,
        withdrawalRequests: state.withdrawalRequests.map((r) =>
          r.id === action.requestId
            ? { ...r, status: "approved", resolvedAt: now, processedAt: now }
            : r,
        ),
        transactions: approveTx
          ? [approveTx, ...state.transactions]
          : state.transactions,
        notifications: approveNotif
          ? [approveNotif, ...state.notifications]
          : state.notifications,
      };
    }

    case "MARK_PAID": {
      const paidReq = state.withdrawalRequests.find(
        (r) => r.id === action.requestId && r.status === "approved",
      );
      const paidNow = Date.now();
      const paidTx: Transaction | null = paidReq
        ? {
            id: `tx${paidNow}paid`,
            userId: paidReq.userId,
            txType: "withdrawal_paid",
            amount: paidReq.amount,
            description: `Withdrawal paid: ₹${paidReq.amount.toFixed(2)} to ${paidReq.upiId}`,
            createdAt: paidNow,
          }
        : null;
      const paidNotif: Notification | null = paidReq
        ? {
            id: `notif_wdpaid_${paidNow}`,
            userId: paidReq.userId,
            type: "withdrawal_paid",
            message: `Your withdrawal of ₹${paidReq.amount.toFixed(0)} has been paid to your UPI ID`,
            createdAt: paidNow,
            isRead: false,
          }
        : null;
      return {
        ...state,
        withdrawalRequests: state.withdrawalRequests.map((r) =>
          r.id === action.requestId && r.status === "approved"
            ? { ...r, status: "paid", processedAt: paidNow }
            : r,
        ),
        transactions: paidTx
          ? [paidTx, ...state.transactions]
          : state.transactions,
        notifications: paidNotif
          ? [paidNotif, ...state.notifications]
          : state.notifications,
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
      const rejectNow = Date.now();
      const rejectTx: Transaction | null = req
        ? {
            id: `tx${rejectNow}rej`,
            userId: req.userId,
            txType: "withdrawal_rejected",
            amount: req.amount,
            description: `Withdrawal rejected: ₹${req.amount.toFixed(2)} refunded`,
            createdAt: rejectNow,
          }
        : null;
      return {
        ...state,
        withdrawalRequests: state.withdrawalRequests.map((r) =>
          r.id === action.requestId
            ? { ...r, status: "rejected", resolvedAt: rejectNow }
            : r,
        ),
        users: refundedUsers,
        currentUser: refundedCurrentUser,
        transactions: rejectTx
          ? [rejectTx, ...state.transactions]
          : state.transactions,
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

    case "ADD_TRANSACTION":
      return {
        ...state,
        transactions: [action.transaction, ...state.transactions],
      };

    case "ADD_LOCAL_AD":
      return { ...state, localAds: [action.ad, ...state.localAds] };

    case "DELETE_LOCAL_AD":
      return {
        ...state,
        localAds: state.localAds.filter((a) => a.id !== action.adId),
      };

    case "TOGGLE_LOCAL_AD":
      return {
        ...state,
        localAds: state.localAds.map((a) =>
          a.id === action.adId ? { ...a, isActive: !a.isActive } : a,
        ),
      };

    case "SUBSCRIBE_ARTIST": {
      const now = Date.now();
      const expiry = now + 86400000 * 365;
      const subTx: Transaction = {
        id: `tx${now}sub`,
        userId: action.userId,
        txType: "subscription_payment",
        amount: 600,
        description: "Annual subscription ₹600/year",
        createdAt: now,
      };

      // Inline REFERRAL_SUBSCRIPTION_BONUS logic: find the referral for this user
      const referralRecord = state.referrals.find(
        (r) =>
          r.referredUserId === action.userId && !r.subscriptionReferralEarned,
      );

      const REFERRAL_SUB_COMMISSION = 60;
      let newUsers = state.users.map((u) =>
        u.id === action.userId
          ? {
              ...u,
              subscriptionStatus: "active" as SubscriptionStatus,
              subscriptionExpiry: expiry,
            }
          : u,
      );
      let newCurrentUser =
        state.currentUser?.id === action.userId
          ? {
              ...state.currentUser,
              subscriptionStatus: "active" as SubscriptionStatus,
              subscriptionExpiry: expiry,
            }
          : state.currentUser;
      let newTransactions: Transaction[] = [subTx, ...state.transactions];
      let newReferrals = state.referrals;

      if (referralRecord) {
        // Credit ₹60 to the referrer
        newUsers = newUsers.map((u) =>
          u.id === referralRecord.referrerId
            ? {
                ...u,
                pendingEarnings:
                  (u.pendingEarnings ?? 0) + REFERRAL_SUB_COMMISSION,
                totalEarnings: (u.totalEarnings ?? 0) + REFERRAL_SUB_COMMISSION,
              }
            : u,
        );
        if (state.currentUser?.id === referralRecord.referrerId) {
          newCurrentUser = {
            ...state.currentUser,
            pendingEarnings:
              (state.currentUser.pendingEarnings ?? 0) +
              REFERRAL_SUB_COMMISSION,
            totalEarnings:
              (state.currentUser.totalEarnings ?? 0) + REFERRAL_SUB_COMMISSION,
          };
        }
        const refBonusTx: Transaction = {
          id: `tx${now}refbonus`,
          userId: referralRecord.referrerId,
          txType: "referral_credit",
          amount: REFERRAL_SUB_COMMISSION,
          description: `Subscription commission from @${referralRecord.referredUsername}`,
          createdAt: now,
        };
        newTransactions = [refBonusTx, ...newTransactions];
        // Mark the referral as subscription-earned
        newReferrals = state.referrals.map((r) =>
          r.referredUserId === action.userId && !r.subscriptionReferralEarned
            ? {
                ...r,
                subscriptionReferralEarned: true,
                commissionEarned: r.commissionEarned + REFERRAL_SUB_COMMISSION,
              }
            : r,
        );
      }

      // Add referral reward notification to the referrer
      let newNotifications = state.notifications;
      if (referralRecord) {
        const subscribedUser = state.users.find((u) => u.id === action.userId);
        const refSubNotif: Notification = {
          id: `notif_refsub_${Date.now()}`,
          userId: referralRecord.referrerId,
          type: "referral_reward",
          message: `You earned ₹60 subscription commission from @${subscribedUser?.username ?? "a friend"}`,
          createdAt: Date.now(),
          isRead: false,
        };
        newNotifications = [refSubNotif, ...state.notifications];
      }

      return {
        ...state,
        users: newUsers,
        currentUser: newCurrentUser,
        transactions: newTransactions,
        referrals: newReferrals,
        notifications: newNotifications,
      };
    }

    case "REFERRAL_SUBSCRIPTION_BONUS": {
      const referralRecord = state.referrals.find(
        (r) =>
          r.referredUserId === action.referredUserId &&
          !r.subscriptionReferralEarned,
      );
      if (!referralRecord) return state;

      const COMMISSION = 60;
      const now = Date.now();

      const updatedUsers = state.users.map((u) =>
        u.id === referralRecord.referrerId
          ? {
              ...u,
              pendingEarnings: (u.pendingEarnings ?? 0) + COMMISSION,
              totalEarnings: (u.totalEarnings ?? 0) + COMMISSION,
            }
          : u,
      );
      const updatedCurrentUser =
        state.currentUser?.id === referralRecord.referrerId
          ? {
              ...state.currentUser,
              pendingEarnings:
                (state.currentUser.pendingEarnings ?? 0) + COMMISSION,
              totalEarnings:
                (state.currentUser.totalEarnings ?? 0) + COMMISSION,
            }
          : state.currentUser;

      const refTx: Transaction = {
        id: `tx${now}refbonus`,
        userId: referralRecord.referrerId,
        txType: "referral_credit",
        amount: COMMISSION,
        description: `Subscription commission from @${referralRecord.referredUsername}`,
        createdAt: now,
      };

      const updatedReferrals = state.referrals.map((r) =>
        r.referredUserId === action.referredUserId &&
        !r.subscriptionReferralEarned
          ? {
              ...r,
              subscriptionReferralEarned: true,
              commissionEarned: r.commissionEarned + COMMISSION,
            }
          : r,
      );

      return {
        ...state,
        users: updatedUsers,
        currentUser: updatedCurrentUser,
        transactions: [refTx, ...state.transactions],
        referrals: updatedReferrals,
      };
    }

    case "TRACK_AD_IMPRESSION": {
      return {
        ...state,
        videos: state.videos.map((v) =>
          v.id === action.videoId
            ? { ...v, adImpressions: (v.adImpressions ?? 0) + 1 }
            : v,
        ),
      };
    }

    // ── Viewer Referral System ───────────────────────────────────────────────

    case "INIT_VIEWER_REFERRAL": {
      // Only initialise if there's a valid referral and no existing progress
      if (
        action.referredUserId === action.referrerId ||
        state.viewerReferralProgress[action.referredUserId]
      )
        return state;
      return {
        ...state,
        viewerReferralProgress: {
          ...state.viewerReferralProgress,
          [action.referredUserId]: {
            referrerId: action.referrerId,
            otpVerified: false,
            videosWatched: 0,
            rewardPaid: false,
          },
        },
      };
    }

    case "VIEWER_OTP_VERIFIED": {
      const existing = state.viewerReferralProgress[action.referredUserId];
      if (!existing || existing.otpVerified) return state;
      return {
        ...state,
        viewerReferralProgress: {
          ...state.viewerReferralProgress,
          [action.referredUserId]: { ...existing, otpVerified: true },
        },
      };
    }

    case "VIEWER_VIDEO_WATCHED": {
      const progress = state.viewerReferralProgress[action.watcherUserId];
      // No pending referral tracking for this user, or already rewarded
      if (!progress || progress.rewardPaid) return state;

      const newWatched = Math.min(progress.videosWatched + 1, 99);
      const conditionsMet = progress.otpVerified && newWatched >= 3;

      if (!conditionsMet) {
        // Just increment the counter
        return {
          ...state,
          viewerReferralProgress: {
            ...state.viewerReferralProgress,
            [action.watcherUserId]: {
              ...progress,
              videosWatched: newWatched,
            },
          },
        };
      }

      // All 3 conditions met: credit ₹5 to referrer
      const VIEWER_REFERRAL_REWARD = 5;
      const now = Date.now();

      const referredUser = state.users.find(
        (u) => u.id === action.watcherUserId,
      );
      const referredUsername = referredUser?.username ?? "user";

      const updatedUsers = state.users.map((u) =>
        u.id === progress.referrerId
          ? {
              ...u,
              pendingEarnings:
                (u.pendingEarnings ?? 0) + VIEWER_REFERRAL_REWARD,
              totalEarnings: (u.totalEarnings ?? 0) + VIEWER_REFERRAL_REWARD,
            }
          : u,
      );
      const updatedCurrentUser =
        state.currentUser?.id === progress.referrerId
          ? {
              ...state.currentUser,
              pendingEarnings:
                (state.currentUser.pendingEarnings ?? 0) +
                VIEWER_REFERRAL_REWARD,
              totalEarnings:
                (state.currentUser.totalEarnings ?? 0) + VIEWER_REFERRAL_REWARD,
            }
          : state.currentUser;

      const rewardTx: Transaction = {
        id: `tx${now}vref`,
        userId: progress.referrerId,
        txType: "referral_credit",
        amount: VIEWER_REFERRAL_REWARD,
        description: `Viewer referral reward: @${referredUsername} watched 3 videos`,
        createdAt: now,
      };

      // Update the referral record commission
      const updatedReferrals = state.referrals.map((r) =>
        r.referredUserId === action.watcherUserId &&
        !r.subscriptionReferralEarned
          ? {
              ...r,
              commissionEarned: r.commissionEarned + VIEWER_REFERRAL_REWARD,
            }
          : r,
      );

      const viewerRewardNotif: Notification = {
        id: `notif_vref_${now}`,
        userId: progress.referrerId,
        type: "referral_reward",
        message: `You earned ₹5 referral reward from @${referredUsername}`,
        createdAt: now,
        isRead: false,
      };

      return {
        ...state,
        users: updatedUsers,
        currentUser: updatedCurrentUser,
        transactions: [rewardTx, ...state.transactions],
        referrals: updatedReferrals,
        notifications: [viewerRewardNotif, ...state.notifications],
        viewerReferralProgress: {
          ...state.viewerReferralProgress,
          [action.watcherUserId]: {
            ...progress,
            videosWatched: newWatched,
            rewardPaid: true,
          },
        },
      };
    }

    // ── Follow / Unfollow ────────────────────────────────────────────────────

    case "FOLLOW": {
      if (
        !state.currentUser ||
        action.targetUserId === state.currentUser.id ||
        state.followingIds.includes(action.targetUserId)
      )
        return state;

      const follower = state.currentUser;
      const followNotif: Notification = {
        id: `notif_follow_${Date.now()}`,
        userId: action.targetUserId,
        type: "follow",
        message: `@${follower.username} started following you`,
        createdAt: Date.now(),
        isRead: false,
      };

      return {
        ...state,
        followingIds: [...state.followingIds, action.targetUserId],
        users: state.users.map((u) =>
          u.id === action.targetUserId
            ? { ...u, followers: u.followers + 1 }
            : u.id === state.currentUser?.id
              ? { ...u, following: u.following + 1 }
              : u,
        ),
        currentUser: state.currentUser
          ? { ...state.currentUser, following: state.currentUser.following + 1 }
          : null,
        notifications: [followNotif, ...state.notifications],
      };
    }

    case "UNFOLLOW": {
      if (
        !state.currentUser ||
        !state.followingIds.includes(action.targetUserId)
      )
        return state;

      return {
        ...state,
        followingIds: state.followingIds.filter(
          (id) => id !== action.targetUserId,
        ),
        users: state.users.map((u) =>
          u.id === action.targetUserId
            ? { ...u, followers: Math.max(0, u.followers - 1) }
            : u.id === state.currentUser?.id
              ? { ...u, following: Math.max(0, u.following - 1) }
              : u,
        ),
        currentUser: state.currentUser
          ? {
              ...state.currentUser,
              following: Math.max(0, state.currentUser.following - 1),
            }
          : null,
      };
    }

    case "ADD_NOTIFICATION":
      return {
        ...state,
        notifications: [action.notification, ...state.notifications],
      };

    case "MARK_NOTIFICATIONS_READ":
      return {
        ...state,
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      };

    case "FLAG_VIDEO":
      return {
        ...state,
        reports: [action.report, ...state.reports],
      };

    case "DISMISS_REPORT":
      return {
        ...state,
        reports: state.reports.filter((r) => r.id !== action.reportId),
      };

    // ── Daily Bonus ──────────────────────────────────────────────────────────

    case "CLAIM_DAILY_BONUS": {
      const claimUser = state.users.find((u) => u.id === action.userId);
      if (!claimUser) return state;

      const todayStr = new Date().toDateString();
      const lastStr = new Date(claimUser.lastLoginDate ?? 0).toDateString();
      if (todayStr === lastStr) return state; // already claimed today

      const yesterdayDate = new Date();
      yesterdayDate.setDate(yesterdayDate.getDate() - 1);
      const yesterdayStr = yesterdayDate.toDateString();
      const wasYesterday = lastStr === yesterdayStr;

      const newStreak =
        claimUser.lastLoginDate === 0
          ? 1
          : wasYesterday
            ? (claimUser.loginStreak ?? 0) + 1
            : 1;

      const rewardSchedule: Record<number, number> = {
        1: 1,
        2: 2,
        3: 3,
        4: 4,
        5: 5,
        6: 6,
      };
      const reward =
        newStreak >= 7 ? 10 : (rewardSchedule[newStreak] ?? newStreak);
      const claimNow = Date.now();

      const bonusTx: Transaction = {
        id: `tx${claimNow}bonus`,
        userId: action.userId,
        txType: "daily_bonus",
        amount: reward,
        description: `Day ${newStreak} daily login bonus`,
        createdAt: claimNow,
      };

      const bonusNotif: Notification = {
        id: `notif_bonus_${claimNow}`,
        userId: action.userId,
        type: "daily_bonus",
        message: `🎁 Day ${newStreak} bonus! +₹${reward} added to your wallet`,
        createdAt: claimNow,
        isRead: false,
      };

      const updatedUsers = state.users.map((u) =>
        u.id === action.userId
          ? {
              ...u,
              loginStreak: newStreak,
              lastLoginDate: claimNow,
              coins: u.coins + reward,
              pendingEarnings: (u.pendingEarnings ?? 0) + reward,
              points: (u.points ?? 0) + 1,
            }
          : u,
      );
      const updatedCurrentUser =
        state.currentUser?.id === action.userId
          ? {
              ...state.currentUser,
              loginStreak: newStreak,
              lastLoginDate: claimNow,
              coins: state.currentUser.coins + reward,
              pendingEarnings:
                (state.currentUser.pendingEarnings ?? 0) + reward,
              points: (state.currentUser.points ?? 0) + 1,
            }
          : state.currentUser;

      return {
        ...state,
        users: updatedUsers,
        currentUser: updatedCurrentUser,
        transactions: [bonusTx, ...state.transactions],
        notifications: [bonusNotif, ...state.notifications],
      };
    }

    // ── Earn Watch Points ─────────────────────────────────────────────────────

    case "EARN_WATCH_POINTS": {
      const earnNow = Date.now();
      const updatedUsers = state.users.map((u) =>
        u.id === action.userId
          ? {
              ...u,
              points: (u.points ?? 0) + 2,
              pendingEarnings: (u.pendingEarnings ?? 0) + 2,
              watchedVideosToday: 0,
              lastWatchRewardDate: new Date().toDateString(),
            }
          : u,
      );
      const updatedCurrentUser =
        state.currentUser?.id === action.userId
          ? {
              ...state.currentUser,
              points: (state.currentUser.points ?? 0) + 2,
              pendingEarnings: (state.currentUser.pendingEarnings ?? 0) + 2,
              watchedVideosToday: 0,
              lastWatchRewardDate: new Date().toDateString(),
            }
          : state.currentUser;
      const watchTx: Transaction = {
        id: `tx${earnNow}watch`,
        userId: action.userId,
        txType: "watch_reward",
        amount: 2,
        description: "Watch reward: 10 videos watched today",
        createdAt: earnNow,
      };
      return {
        ...state,
        users: updatedUsers,
        currentUser: updatedCurrentUser,
        transactions: [watchTx, ...state.transactions],
      };
    }

    // ── Spin Wheel ───────────────────────────────────────────────────────────

    case "SPIN_WHEEL": {
      const spinNow = Date.now();
      const spinUser = state.users.find((u) => u.id === action.userId);
      if (!spinUser) return state;

      const updatedUsers = state.users.map((u) =>
        u.id === action.userId
          ? {
              ...u,
              lastSpinDate: spinNow,
              coins: u.coins + action.reward,
              pendingEarnings: (u.pendingEarnings ?? 0) + action.reward,
            }
          : u,
      );
      const updatedCurrentUser =
        state.currentUser?.id === action.userId
          ? {
              ...state.currentUser,
              lastSpinDate: spinNow,
              coins: state.currentUser.coins + action.reward,
              pendingEarnings:
                (state.currentUser.pendingEarnings ?? 0) + action.reward,
            }
          : state.currentUser;

      const spinTransactions: Transaction[] =
        action.reward > 0
          ? [
              {
                id: `tx${spinNow}spin`,
                userId: action.userId,
                txType: "spin_reward",
                amount: action.reward,
                description: `Lucky Spin reward: +₹${action.reward}`,
                createdAt: spinNow,
              },
              ...state.transactions,
            ]
          : state.transactions;

      const spinNotif: Notification = {
        id: `notif_spin_${spinNow}`,
        userId: action.userId,
        type: "spin_reward",
        message:
          action.reward > 0
            ? `🎰 Lucky Spin! You won ₹${action.reward}!`
            : "🎰 Lucky Spin — Better luck tomorrow!",
        createdAt: spinNow,
        isRead: false,
      };

      return {
        ...state,
        users: updatedUsers,
        currentUser: updatedCurrentUser,
        transactions: spinTransactions,
        notifications: [spinNotif, ...state.notifications],
      };
    }

    // ── Share Video Boost ─────────────────────────────────────────────────────

    case "SHARE_VIDEO_BOOST": {
      return {
        ...state,
        videos: state.videos.map((v) =>
          v.id === action.videoId
            ? { ...v, shareCount: (v.shareCount ?? 0) + 1 }
            : v,
        ),
      };
    }

    // ── Verified Badge ────────────────────────────────────────────────────────

    case "GRANT_VERIFIED_BADGE": {
      return {
        ...state,
        users: state.users.map((u) =>
          u.id === action.userId ? { ...u, isVerifiedCreator: true } : u,
        ),
        currentUser:
          state.currentUser?.id === action.userId
            ? { ...state.currentUser, isVerifiedCreator: true }
            : state.currentUser,
      };
    }

    case "REVOKE_VERIFIED_BADGE": {
      return {
        ...state,
        users: state.users.map((u) =>
          u.id === action.userId ? { ...u, isVerifiedCreator: false } : u,
        ),
        currentUser:
          state.currentUser?.id === action.userId
            ? { ...state.currentUser, isVerifiedCreator: false }
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

  // Subscription expiry reminder (fires once per session, intentionally runs only on mount)
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally fires once on mount
  useEffect(() => {
    const warned = sessionStorage.getItem("ahirani_sub_warned");
    if (warned) return;
    const u = state.currentUser;
    if (!u || u.role !== "artist" || u.subscriptionStatus !== "active") return;
    if (u.subscriptionExpiry <= 0) return;
    const daysLeft = Math.ceil((u.subscriptionExpiry - Date.now()) / 86400000);
    if (daysLeft > 0 && daysLeft <= 7) {
      sessionStorage.setItem("ahirani_sub_warned", "1");
      toast.warning(
        `Subscription expires in ${daysLeft} day${daysLeft === 1 ? "" : "s"}`,
        {
          description: "Renew to keep uploading videos.",
          duration: 6000,
        },
      );
    }
  }, []);

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
            description: "फक्त अहिराणी backend is live",
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

export function useNotifications(userId: string): Notification[] {
  const { state } = useApp();
  return state.notifications.filter((n) => n.userId === userId);
}

export function useUnreadCount(userId: string): number {
  const { state } = useApp();
  return state.notifications.filter((n) => n.userId === userId && !n.isRead)
    .length;
}

export function useIsFollowing(targetUserId: string): boolean {
  const { state } = useApp();
  return state.followingIds.includes(targetUserId);
}
