import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import {
  Camera,
  Edit2,
  Grid2X2,
  Heart,
  Settings,
  Users,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useApp } from "../context/AppContext";
import { formatCount } from "../utils/trending";

// ─── Edit Profile Sheet ───────────────────────────────────────────────────────

function EditProfileSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { state, dispatch } = useApp();
  const user = state.currentUser;
  const [username, setUsername] = useState(user?.username ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [avatar, setAvatar] = useState(user?.avatar ?? "");
  const fileRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  const handleAvatarChange = (file: File) => {
    const url = URL.createObjectURL(file);
    setAvatar(url);
  };

  const handleSave = async () => {
    if (!username.trim()) {
      toast.error("Username is required");
      return;
    }
    if (username !== user.username) {
      const taken = state.users.some(
        (u) =>
          u.id !== user.id &&
          u.username.toLowerCase() === username.toLowerCase(),
      );
      if (taken) {
        toast.error("Username already taken");
        return;
      }
    }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    dispatch({
      type: "UPDATE_PROFILE",
      userId: user.id,
      updates: { username: username.trim(), bio: bio.trim(), avatar },
    });
    setSaving(false);
    toast.success("Profile updated!");
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        side="bottom"
        data-ocid="profile.edit.sheet"
        className="bg-card border-t border-white/10 rounded-t-2xl"
        style={{ maxHeight: "80dvh" }}
      >
        <SheetHeader className="pb-4 border-b border-white/10">
          <SheetTitle className="text-white text-center">
            Edit Profile
          </SheetTitle>
        </SheetHeader>

        <div
          className="overflow-y-auto py-5 space-y-5"
          style={{ maxHeight: "calc(80dvh - 140px)" }}
        >
          {/* Avatar picker */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <Avatar className="w-20 h-20">
                <AvatarImage src={avatar} />
                <AvatarFallback className="bg-white/10 text-white text-2xl font-bold">
                  {username[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-8 h-8 bg-reels-pink rounded-full flex items-center justify-center border-2 border-background"
              >
                <Camera className="w-4 h-4 text-white" />
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleAvatarChange(f);
                }}
              />
            </div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="text-reels-pink text-sm font-medium"
            >
              Change photo
            </button>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="edit-username"
              className="text-white/60 text-sm font-medium"
            >
              Username
            </label>
            <Input
              id="edit-username"
              value={username}
              onChange={(e) =>
                setUsername(
                  e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""),
                )
              }
              className="bg-white/10 border-white/20 text-white"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="edit-bio"
              className="text-white/60 text-sm font-medium"
            >
              Bio
            </label>
            <Textarea
              id="edit-bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell the world about yourself..."
              rows={3}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/30 resize-none"
            />
          </div>
        </div>

        <SheetFooter className="pt-3 border-t border-white/10">
          <Button
            data-ocid="profile.edit.save_button"
            onClick={handleSave}
            disabled={saving}
            className="w-full h-11 font-semibold"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.65 0.28 15), oklch(0.65 0.28 350))",
            }}
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </span>
            ) : (
              "Save Changes"
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

// ─── Profile Page ─────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { state, dispatch } = useApp();
  const user = state.currentUser;
  const [editOpen, setEditOpen] = useState(false);

  if (!user) return null;

  const myVideos = state.videos.filter(
    (v) => v.uploaderId === user.id && !v.isDeleted,
  );

  const currentUserData = state.users.find((u) => u.id === user.id) ?? user;

  const handleLogout = () => {
    dispatch({ type: "LOGOUT" });
    toast.success("Logged out");
  };

  return (
    <div className="h-full overflow-y-auto bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-white/10 px-4 py-4 flex items-center justify-between">
        <h1 className="font-display text-xl font-bold text-white">Profile</h1>
        <button
          type="button"
          onClick={handleLogout}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          <Settings className="w-4 h-4 text-white/70" />
        </button>
      </div>

      <div className="pb-24">
        {/* Profile hero */}
        <div className="px-4 pt-6 pb-4 space-y-4">
          <div className="flex items-start gap-4">
            <div className="relative">
              <Avatar className="w-20 h-20 border-2 border-reels-pink">
                <AvatarImage src={currentUserData.avatar} />
                <AvatarFallback className="bg-white/10 text-white text-2xl font-bold">
                  {currentUserData.username[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-white font-bold text-xl truncate">
                @{currentUserData.username}
              </h2>
              {currentUserData.bio ? (
                <p className="text-white/60 text-sm mt-1 leading-relaxed">
                  {currentUserData.bio}
                </p>
              ) : (
                <p className="text-white/30 text-sm mt-1 italic">No bio yet</p>
              )}
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2">
            {[
              {
                label: "Followers",
                value: formatCount(currentUserData.followers),
              },
              {
                label: "Following",
                value: formatCount(currentUserData.following),
              },
              {
                label: "Likes",
                value: formatCount(currentUserData.totalLikes),
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white/5 rounded-xl py-3 text-center"
              >
                <p className="text-white font-bold text-lg">{stat.value}</p>
                <p className="text-white/50 text-xs">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <Button
              data-ocid="profile.edit_button"
              onClick={() => setEditOpen(true)}
              variant="secondary"
              className="flex-1 h-10 bg-white/10 hover:bg-white/20 text-white border-white/20 font-medium"
            >
              <Edit2 className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
            <div className="flex items-center gap-1 bg-white/5 rounded-lg px-3 h-10">
              <span className="text-gold text-sm font-bold">
                {currentUserData.coins}
              </span>
              <span className="text-gold text-sm">🪙</span>
            </div>
          </div>
        </div>

        {/* Videos grid */}
        <div className="px-1">
          <div className="flex items-center gap-2 px-3 py-3 border-b border-white/10">
            <Grid2X2 className="w-4 h-4 text-white/60" />
            <span className="text-white/80 text-sm font-medium">
              Reels ({myVideos.length})
            </span>
          </div>

          {myVideos.length === 0 ? (
            <div className="py-16 flex flex-col items-center gap-3">
              <span className="text-5xl">🎬</span>
              <p className="text-white/50 text-sm font-medium">No reels yet</p>
              <p className="text-white/30 text-xs">Start creating!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-0.5 px-0.5">
              {myVideos.map((video, i) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="relative aspect-[9/16] bg-card overflow-hidden cursor-pointer group"
                >
                  <video
                    src={video.url}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                  <div className="absolute bottom-2 left-2 flex items-center gap-1">
                    <Heart className="w-3 h-3 text-white fill-white" />
                    <span className="text-white text-xs font-semibold">
                      {formatCount(video.likesCount)}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Sheet */}
      <EditProfileSheet open={editOpen} onClose={() => setEditOpen(false)} />
    </div>
  );
}
