"use client";

import { useEffect, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import Sidebar from "@/components/dashboard/Sidebar";
import Scrollable from "@/components/Scrollable";
import { toDisplayRole } from "@/lib/roles";

interface UserProfile {
  userId: string;
  username: string;
  email: string;
  role: string;
  hasPassword: boolean;
  hasGitHub: boolean;
  createdAt: string | null;
}

interface Space {
  SpaceId?: string;
  SpaceID?: string;
  spaceId?: string;
  SpaceName?: string;
  spaceName?: string;
  OwnerId?: string;
  ownerId?: string;
  [key: string]: any;
}

interface Repo {
  RepoID?: string;
  RepoId?: string;
  repoId?: string;
  GHOwner?: string;
  ghOwner?: string;
  GHName?: string;
  ghName?: string;
  SpaceID?: string;
  spaceId?: string;
  DefaultBranch?: string;
  defaultBranch?: string;
  [key: string]: any;
}

type TabType = "profile" | "github" | "workspace" | "danger";

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<TabType>("profile");

  // User Profile State
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editUsername, setEditUsername] = useState("");
  const [usernameSaving, setUsernameSaving] = useState(false);

  // Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);

  // GitHub State
  const [disconnectingGh, setDisconnectingGh] = useState(false);

  // Workspaces State
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [selectedSpaceId, setSelectedSpaceId] = useState<string>("");
  const [editSpaceName, setEditSpaceName] = useState("");
  const [spaceSaving, setSpaceSaving] = useState(false);
  const [spaceCopied, setSpaceCopied] = useState(false);

  // Repositories State
  const [repos, setRepos] = useState<Repo[]>([]);
  const [defaultRepoId, setDefaultRepoId] = useState<string>("");

  // Workflow Defaults
  const [defaultPriority, setDefaultPriority] = useState<string>("Medium");
  const [defaultStatus, setDefaultStatus] = useState<string>("Open");
  const [autoCloseGit, setAutoCloseGit] = useState<boolean>(true);
  const [defaultsSaving, setDefaultsSaving] = useState(false);

  // Danger Zone States
  const [targetRepoForCache, setTargetRepoForCache] = useState<string>("");
  const [cacheClearing, setCacheClearing] = useState(false);
  const [syncingCommits, setSyncingCommits] = useState(false);
  const [deleteSpaceConfirm, setDeleteSpaceConfirm] = useState("");
  const [spaceDeleting, setSpaceDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Feedback Notification Banner
  const [banner, setBanner] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showBanner = (type: "success" | "error", message: string) => {
    setBanner({ type, message });
    setTimeout(() => {
      setBanner((prev) => (prev?.message === message ? null : prev));
    }, 6000);
  };

  // Load Initial Data
  const loadProfile = async () => {
    try {
      const res = await fetch("/api/users/profile");
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setEditUsername(data.username || "");
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
    }
  };

  const loadSpaces = async () => {
    try {
      const res = await fetch("/api/spaces");
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : [];
        setSpaces(list);
        if (list.length > 0 && !selectedSpaceId) {
          const firstId = list[0].SpaceID || list[0].SpaceId || list[0].spaceId;
          setSelectedSpaceId(firstId);
          setEditSpaceName(list[0].SpaceName || list[0].spaceName || "");
        }
      }
    } catch (err) {
      console.error("Failed to load spaces:", err);
    }
  };

  const loadRepos = async () => {
    try {
      const res = await fetch("/api/repos");
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : [];
        setRepos(list);
        if (list.length > 0) {
          const firstId = list[0].RepoID || list[0].RepoId || list[0].repoId;
          if (!targetRepoForCache) setTargetRepoForCache(firstId);
          if (!defaultRepoId) setDefaultRepoId(firstId);
        }
      }
    } catch (err) {
      console.error("Failed to load repos:", err);
    }
  };

  useEffect(() => {
    loadProfile();
    loadSpaces();
    loadRepos();

    // Load persisted local preferences
    const savedPriority = localStorage.getItem("pstctrl_default_priority");
    if (savedPriority) setDefaultPriority(savedPriority);
    const savedStatus = localStorage.getItem("pstctrl_default_status");
    if (savedStatus) setDefaultStatus(savedStatus);
    const savedAutoClose = localStorage.getItem("pstctrl_autoclose_git");
    if (savedAutoClose !== null) setAutoCloseGit(savedAutoClose === "true");
    const savedRepo = localStorage.getItem("pstctrl_default_repo");
    if (savedRepo) setDefaultRepoId(savedRepo);
  }, []);

  // Update space name when space selection changes
  useEffect(() => {
    if (selectedSpaceId) {
      const current = spaces.find(
        (s) => (s.SpaceID || s.SpaceId || s.spaceId) === selectedSpaceId
      );
      if (current) {
        setEditSpaceName(current.SpaceName || current.spaceName || "");
      }
    }
  }, [selectedSpaceId, spaces]);

  // Handle Username Update
  const handleUpdateUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUsername.trim()) {
      showBanner("error", "Username cannot be empty");
      return;
    }
    setUsernameSaving(true);
    try {
      const res = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_username", username: editUsername }),
      });
      const data = await res.json();
      if (res.ok) {
        showBanner("success", "Username updated successfully");
        loadProfile();
      } else {
        showBanner("error", data.error || "Failed to update username");
      }
    } catch (err: any) {
      showBanner("error", err.message || "Failed to update username");
    } finally {
      setUsernameSaving(false);
    }
  };

  // Handle Password Update
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showBanner("error", "New passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      showBanner("error", "New password must be at least 6 characters long");
      return;
    }
    setPasswordSaving(true);
    try {
      const res = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "change_password",
          currentPassword,
          newPassword,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showBanner("success", "Password updated successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        loadProfile();
      } else {
        showBanner("error", data.error || "Failed to change password");
      }
    } catch (err: any) {
      showBanner("error", err.message || "Failed to change password");
    } finally {
      setPasswordSaving(false);
    }
  };

  // Handle GitHub Relink
  const handleRelinkGithub = () => {
    signIn("github", { callbackUrl: "/dashboard/settings" });
  };

  // Handle GitHub Disconnect
  const handleDisconnectGithub = async () => {
    if (!confirm("Are you sure you want to disconnect your GitHub account? Repository syncing and commit loading will be disabled until you reconnect.")) {
      return;
    }
    setDisconnectingGh(true);
    try {
      const res = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "disconnect_github" }),
      });
      const data = await res.json();
      if (res.ok) {
        showBanner("success", "GitHub account disconnected");
        loadProfile();
      } else {
        showBanner("error", data.error || "Failed to disconnect GitHub");
      }
    } catch (err: any) {
      showBanner("error", err.message || "Failed to disconnect GitHub");
    } finally {
      setDisconnectingGh(false);
    }
  };

  // Handle Space Rename
  const handleUpdateSpaceName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSpaceId || !editSpaceName.trim()) {
      showBanner("error", "Workspace name cannot be empty");
      return;
    }
    setSpaceSaving(true);
    try {
      const res = await fetch(`/api/spaces/${selectedSpaceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editSpaceName.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        showBanner("success", "Workspace name updated successfully");
        loadSpaces();
      } else {
        showBanner("error", data.error || "Failed to update workspace name");
      }
    } catch (err: any) {
      showBanner("error", err.message || "Failed to update workspace name");
    } finally {
      setSpaceSaving(false);
    }
  };

  // Handle Copy Space ID
  const handleCopySpaceId = () => {
    if (!selectedSpaceId) return;
    navigator.clipboard.writeText(selectedSpaceId);
    setSpaceCopied(true);
    setTimeout(() => setSpaceCopied(false), 2000);
  };

  // Handle Save Workflow Defaults
  const handleSaveDefaults = (e: React.FormEvent) => {
    e.preventDefault();
    setDefaultsSaving(true);
    try {
      localStorage.setItem("pstctrl_default_priority", defaultPriority);
      localStorage.setItem("pstctrl_default_status", defaultStatus);
      localStorage.setItem("pstctrl_autoclose_git", autoCloseGit.toString());
      if (defaultRepoId) {
        localStorage.setItem("pstctrl_default_repo", defaultRepoId);
      }
      showBanner("success", "Workflow preferences saved successfully");
    } catch (err: any) {
      showBanner("error", "Failed to save workflow preferences locally");
    } finally {
      setDefaultsSaving(false);
    }
  };

  // Danger: Clear Repo Cache and Commit History
  const handleClearRepoCache = async () => {
    if (!targetRepoForCache) {
      showBanner("error", "Please select a repository to clear cache for");
      return;
    }
    const targetRepo = repos.find(
      (r) => (r.RepoID || r.RepoId || r.repoId) === targetRepoForCache
    );
    const repoLabel = targetRepo ? `${targetRepo.GHOwner || targetRepo.ghOwner}/${targetRepo.GHName || targetRepo.ghName}` : "the selected repo";
    
    if (!confirm(`Warning: This will clear all cached commit history for ${repoLabel} from the database. Issues will remain. Continue?`)) {
      return;
    }

    setCacheClearing(true);
    try {
      const res = await fetch("/api/repos/cache", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoId: targetRepoForCache }),
      });
      const data = await res.json();
      if (res.ok) {
        showBanner("success", data.message || "Repository commit cache cleared successfully");
      } else {
        showBanner("error", data.error || "Failed to clear repository commit cache");
      }
    } catch (err: any) {
      showBanner("error", err.message || "Failed to clear repository commit cache");
    } finally {
      setCacheClearing(false);
    }
  };

  // Danger: Resync New Commits Found
  const handleResyncCommits = async () => {
    if (!targetRepoForCache) {
      showBanner("error", "Please select a repository to sync commits for");
      return;
    }
    setSyncingCommits(true);
    try {
      const res = await fetch("/api/repos/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoId: targetRepoForCache }),
      });
      const data = await res.json();
      if (res.ok) {
        showBanner("success", data.message || `Sync completed: ${data.newCommitsCount || 0} new commit(s) indexed.`);
      } else {
        showBanner("error", data.error || "Failed to sync commits from GitHub");
      }
    } catch (err: any) {
      showBanner("error", err.message || "Failed to sync commits from GitHub");
    } finally {
      setSyncingCommits(false);
    }
  };

  // Danger: Delete Space
  const handleDeleteSpace = async () => {
    if (!selectedSpaceId) {
      showBanner("error", "No workspace selected");
      return;
    }
    const currentSpace = spaces.find(
      (s) => (s.SpaceID || s.SpaceId || s.spaceId) === selectedSpaceId
    );
    const expectedName = currentSpace?.SpaceName || currentSpace?.spaceName || "";

    if (deleteSpaceConfirm.trim().toLowerCase() !== expectedName.trim().toLowerCase()) {
      showBanner("error", `Name does not match "${expectedName}"`);
      return;
    }

    setSpaceDeleting(true);
    try {
      const res = await fetch(`/api/spaces/${selectedSpaceId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        showBanner("success", "Workspace deleted successfully");
        setShowDeleteModal(false);
        setDeleteSpaceConfirm("");
        // Reload spaces
        const spacesRes = await fetch("/api/spaces");
        if (spacesRes.ok) {
          const list = await spacesRes.json();
          setSpaces(list);
          if (list.length > 0) {
            const nextId = list[0].SpaceID || list[0].SpaceId || list[0].spaceId;
            setSelectedSpaceId(nextId);
            setEditSpaceName(list[0].SpaceName || list[0].spaceName || "");
          } else {
            setSelectedSpaceId("");
            setEditSpaceName("");
          }
        }
      } else {
        showBanner("error", data.error || "Failed to delete workspace");
      }
    } catch (err: any) {
      showBanner("error", err.message || "Failed to delete workspace");
    } finally {
      setSpaceDeleting(false);
    }
  };

  const activeSpace = spaces.find(
    (s) => (s.SpaceID || s.SpaceId || s.spaceId) === selectedSpaceId
  );

  return (
    <div className="flex min-h-screen bg-[#050505] text-zinc-100 font-sans">
      <Sidebar />

      <Scrollable className="flex-1 flex flex-col h-screen">
        {/* Top Header */}
        <header className="sticky top-0 z-20 bg-[#050505]/95 backdrop-blur border-b border-zinc-900 px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-white tracking-wide">
              Settings
            </h1>
            <p className="text-xs text-zinc-500">Configure profile, integrations, workspace defaults, and maintenance</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs px-2.5 py-1 bg-zinc-900 border border-zinc-800 text-zinc-400">
              Role: <span className="text-[#1ef2c1]">{profile ? toDisplayRole(profile.role) : "Loading..."}</span>
            </span>
          </div>
        </header>

        {/* Feedback Banner */}
        {banner && (
          <div
            className={`mx-8 mt-4 px-4 py-3 text-xs flex items-center justify-between border ${
              banner.type === "success"
                ? "bg-emerald-950/20 border-emerald-800/40 text-emerald-300"
                : "bg-rose-950/20 border-rose-800/40 text-rose-300"
            }`}
          >
            <div className="flex items-center gap-2">
              <span>{banner.type === "success" ? "✓" : "!"}</span>
              <span>{banner.message}</span>
            </div>
            <button
              onClick={() => setBanner(null)}
              className="text-zinc-500 hover:text-zinc-300 text-sm px-1"
            >
              ×
            </button>
          </div>
        )}

        {/* Content Layout */}
        <div className="flex-1 px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Navigation Tabs Column */}
            <div className="lg:col-span-1 space-y-1">
              <div className="text-[10px] tracking-[0.2em] uppercase text-zinc-600 px-3 pb-2 font-medium">
                Navigation
              </div>

              <button
                onClick={() => setActiveTab("profile")}
                className={`w-full text-left px-3 py-2.5 text-xs font-medium border-l-2 transition-all ${
                  activeTab === "profile"
                    ? "bg-[#1ef2c1]/10 text-[#1ef2c1] border-[#1ef2c1]"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-900/60 border-transparent"
                }`}
              >
                Profile & Account
              </button>

              <button
                onClick={() => setActiveTab("github")}
                className={`w-full text-left px-3 py-2.5 text-xs font-medium border-l-2 transition-all ${
                  activeTab === "github"
                    ? "bg-[#1ef2c1]/10 text-[#1ef2c1] border-[#1ef2c1]"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-900/60 border-transparent"
                }`}
              >
                GitHub & Integrations
              </button>

              <button
                onClick={() => setActiveTab("workspace")}
                className={`w-full text-left px-3 py-2.5 text-xs font-medium border-l-2 transition-all ${
                  activeTab === "workspace"
                    ? "bg-[#1ef2c1]/10 text-[#1ef2c1] border-[#1ef2c1]"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-900/60 border-transparent"
                }`}
              >
                Workspace & Workflow
              </button>

              <div className="pt-4">
                <div className="text-[10px] tracking-[0.2em] uppercase text-zinc-600 px-3 pb-2 font-medium">
                  System
                </div>
                <button
                  onClick={() => setActiveTab("danger")}
                  className={`w-full text-left px-3 py-2.5 text-xs font-medium border-l-2 transition-all ${
                    activeTab === "danger"
                      ? "bg-rose-950/20 text-rose-400 border-rose-500"
                      : "text-zinc-400 hover:text-rose-300 hover:bg-zinc-900/60 border-transparent"
                  }`}
                >
                  Danger Zone & Maintenance
                </button>
              </div>
            </div>

            {/* Active Tab Panel Column */}
            <div className="lg:col-span-3 space-y-6">
              {/* TAB 1: PROFILE & ACCOUNT */}
              {activeTab === "profile" && (
                <div className="space-y-6">
                  {/* Account Information Card */}
                  <div className="bg-[#0a0a0a] border border-zinc-900 p-6 space-y-6">
                    <div className="border-b border-zinc-900 pb-4">
                      <h2 className="text-sm font-semibold text-white tracking-wide">Account Details</h2>
                      <p className="text-xs text-zinc-500 mt-1">Manage personal identity details and system credentials</p>
                    </div>

                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-zinc-900 border border-zinc-800 flex items-center justify-center text-lg font-bold text-[#1ef2c1]">
                        {profile?.username?.charAt(0)?.toUpperCase() || session?.user?.name?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm font-semibold text-white flex items-center gap-2">
                          {profile?.username || session?.user?.name || "User"}
                          <span className="text-[10px] px-2 py-0.5 bg-[#1ef2c1]/10 text-[#1ef2c1] border border-[#1ef2c1]/30 font-medium">
                            {profile ? toDisplayRole(profile.role) : "Developer"}
                          </span>
                        </div>
                        <div className="text-xs text-zinc-500">
                          {profile?.email || session?.user?.email || "No email available"}
                        </div>
                      </div>
                    </div>

                    <form onSubmit={handleUpdateUsername} className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div>
                        <label className="block text-[11px] text-zinc-400 uppercase tracking-wider mb-2 font-medium">
                          Display Name
                        </label>
                        <input
                          type="text"
                          value={editUsername}
                          onChange={(e) => setEditUsername(e.target.value)}
                          className="w-full bg-[#050505] border border-zinc-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-[#1ef2c1]"
                          placeholder="Your display name"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-zinc-400 uppercase tracking-wider mb-2 font-medium">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={profile?.email || session?.user?.email || ""}
                          disabled
                          className="w-full bg-[#050505] border border-zinc-850 px-3 py-2 text-xs text-zinc-500 cursor-not-allowed"
                        />
                      </div>
                      <div className="sm:col-span-2 flex justify-end">
                        <button
                          type="submit"
                          disabled={usernameSaving}
                          className="bg-[#1ef2c1] text-black font-semibold text-xs px-5 py-2 hover:bg-[#16b892] disabled:opacity-50 transition-colors uppercase tracking-wider"
                        >
                          {usernameSaving ? "Saving..." : "Save Profile Details"}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Password & Credentials */}
                  <div className="bg-[#0a0a0a] border border-zinc-900 p-6 space-y-6">
                    <div className="border-b border-zinc-900 pb-4">
                      <h2 className="text-sm font-semibold text-white tracking-wide">Security & Password</h2>
                      <p className="text-xs text-zinc-500 mt-1">
                        {profile?.hasPassword
                          ? "Update your login password for PestControl"
                          : "Set a password to enable direct email and password login in addition to OAuth"}
                      </p>
                    </div>

                    <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
                      {profile?.hasPassword && (
                        <div>
                          <label className="block text-[11px] text-zinc-400 uppercase tracking-wider mb-1.5 font-medium">
                            Current Password
                          </label>
                          <input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full bg-[#050505] border border-zinc-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-[#1ef2c1]"
                            placeholder="Enter current password"
                            required
                          />
                        </div>
                      )}

                      <div>
                        <label className="block text-[11px] text-zinc-400 uppercase tracking-wider mb-1.5 font-medium">
                          New Password
                        </label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full bg-[#050505] border border-zinc-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-[#1ef2c1]"
                          placeholder="Min 6 characters"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-zinc-400 uppercase tracking-wider mb-1.5 font-medium">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full bg-[#050505] border border-zinc-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-[#1ef2c1]"
                          placeholder="Repeat new password"
                          required
                        />
                      </div>

                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={passwordSaving}
                          className="bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-xs px-5 py-2 disabled:opacity-50 transition-colors uppercase tracking-wider border border-zinc-700"
                        >
                          {passwordSaving ? "Updating..." : profile?.hasPassword ? "Update Password" : "Set Password"}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Active Session */}
                  <div className="bg-[#0a0a0a] border border-zinc-900 p-6 space-y-4">
                    <div className="border-b border-zinc-900 pb-4">
                      <h2 className="text-sm font-semibold text-white tracking-wide">Active Session</h2>
                      <p className="text-xs text-zinc-500 mt-1">Details regarding current authentication and active tokens</p>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 border-b border-zinc-900/60">
                      <div>
                        <div className="text-xs font-medium text-zinc-200">Session Status</div>
                        <div className="text-[11px] text-zinc-500">
                          Authenticated as {profile?.email || session?.user?.email}
                        </div>
                      </div>
                      <div>
                        <span className="text-xs text-zinc-400">Active</span>
                      </div>
                    </div>

                    <div className="pt-2 flex justify-start">
                      <button
                        onClick={() => signOut({ callbackUrl: "/login" })}
                        className="border border-zinc-800 hover:border-rose-900 hover:bg-rose-950/20 text-zinc-400 hover:text-rose-300 text-xs px-4 py-2 transition-colors uppercase tracking-wider"
                      >
                        Sign Out of PestControl
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: GITHUB & INTEGRATIONS */}
              {activeTab === "github" && (
                <div className="space-y-6">
                  {/* Connected Account Badge Card */}
                  <div className="bg-[#0a0a0a] border border-zinc-900 p-6 space-y-6">
                    <div className="border-b border-zinc-900 pb-4 flex items-center justify-between">
                      <div>
                        <h2 className="text-sm font-semibold text-white tracking-wide">GitHub Integration</h2>
                        <p className="text-xs text-zinc-500 mt-1">Manage GitHub OAuth connection for repository imports and commit tracking</p>
                      </div>
                      <span className="text-xs text-[#1ef2c1] px-2.5 py-1 bg-[#1ef2c1]/10 border border-[#1ef2c1]/20">
                        OAuth 2.0
                      </span>
                    </div>

                    {/* Status Badge */}
                    <div className="p-4 bg-[#050505] border border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-zinc-900 border border-zinc-800 flex items-center justify-center text-base text-white">
                          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                          </svg>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-white">GitHub Account</span>
                            <span className={`text-xs ${profile?.hasGitHub ? "text-emerald-400" : "text-zinc-500"}`}>
                              ({profile?.hasGitHub ? "Connected" : "Not Linked"})
                            </span>
                          </div>
                          <div className="text-[11px] text-zinc-500 mt-0.5">
                            {profile?.hasGitHub
                              ? `Token synchronized with backend database · Access granted to repositories`
                              : `No OAuth token linked. Relink below to enable automatic commit syncing.`}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Controls: Relink & Disconnect */}
                    <div className="pt-2 flex flex-wrap items-center gap-3">
                      <button
                        onClick={handleRelinkGithub}
                        className="bg-[#1ef2c1] text-black font-semibold text-xs px-4 py-2 hover:bg-[#16b892] transition-colors uppercase tracking-wider flex items-center gap-2"
                      >
                        Relink / Refresh GitHub Token
                      </button>

                      {profile?.hasGitHub && (
                        <button
                          onClick={handleDisconnectGithub}
                          disabled={disconnectingGh}
                          className="border border-rose-900/50 hover:bg-rose-950/20 text-rose-400 hover:text-rose-300 text-xs px-4 py-2 transition-colors uppercase tracking-wider disabled:opacity-50"
                        >
                          {disconnectingGh ? "Disconnecting..." : "Disconnect GitHub"}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Token Details & Scopes */}
                  <div className="bg-[#0a0a0a] border border-zinc-900 p-6 space-y-4">
                    <div className="border-b border-zinc-900 pb-3">
                      <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                        Granted Scopes & Token Health
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3 bg-[#050505] border border-zinc-900">
                        <div className="text-[10px] uppercase text-zinc-500 font-medium">Scope: repo</div>
                        <div className="text-xs font-medium text-zinc-200 mt-1">Full Repository Access</div>
                        <div className="text-[10px] text-zinc-500 mt-0.5">Read commit history and tree structures</div>
                      </div>

                      <div className="p-3 bg-[#050505] border border-zinc-900">
                        <div className="text-[10px] uppercase text-zinc-500 font-medium">Scope: read:user</div>
                        <div className="text-xs font-medium text-zinc-200 mt-1">User Profile Access</div>
                        <div className="text-[10px] text-zinc-500 mt-0.5">Match commit authors to PestControl users</div>
                      </div>

                      <div className="p-3 bg-[#050505] border border-zinc-900">
                        <div className="text-[10px] uppercase text-zinc-500 font-medium">Database Storage</div>
                        <div className="text-xs font-medium text-zinc-200 mt-1">GHOAuth Field</div>
                        <div className="text-[10px] text-zinc-500 mt-0.5">Persisted in PostgreSQL database</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: WORKSPACE & WORKFLOW */}
              {activeTab === "workspace" && (
                <div className="space-y-6">
                  {/* Space Details Card */}
                  <div className="bg-[#0a0a0a] border border-zinc-900 p-6 space-y-6">
                    <div className="border-b border-zinc-900 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h2 className="text-sm font-semibold text-white tracking-wide">Workspace Preferences</h2>
                        <p className="text-xs text-zinc-500 mt-1">Configure active space identity and repository associations</p>
                      </div>

                      {/* Space Selector */}
                      {spaces.length > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-zinc-500 uppercase font-medium">Space:</span>
                          <select
                            value={selectedSpaceId}
                            onChange={(e) => setSelectedSpaceId(e.target.value)}
                            className="bg-[#050505] border border-zinc-800 text-xs text-zinc-200 px-3 py-1.5 focus:outline-none focus:border-[#1ef2c1]"
                          >
                            {spaces.map((s) => {
                              const sid = s.SpaceID || s.SpaceId || s.spaceId || "";
                              const sname = s.SpaceName || s.spaceName || "Unnamed";
                              return (
                                <option key={sid} value={sid}>
                                  {sname}
                                </option>
                              );
                            })}
                          </select>
                        </div>
                      )}
                    </div>

                    {/* Active Space Info */}
                    {activeSpace ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[11px] text-zinc-400 uppercase tracking-wider mb-1.5 font-medium">
                              Workspace ID
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={selectedSpaceId}
                                disabled
                                className="w-full bg-[#050505] border border-zinc-850 px-3 py-2 text-xs text-zinc-400 cursor-not-allowed"
                              />
                              <button
                                type="button"
                                onClick={handleCopySpaceId}
                                className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 text-xs px-3 py-2 uppercase tracking-wider"
                              >
                                {spaceCopied ? "Copied" : "Copy"}
                              </button>
                            </div>
                          </div>

                          <form onSubmit={handleUpdateSpaceName}>
                            <label className="block text-[11px] text-zinc-400 uppercase tracking-wider mb-1.5 font-medium">
                              Workspace Name
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={editSpaceName}
                                onChange={(e) => setEditSpaceName(e.target.value)}
                                className="w-full bg-[#050505] border border-zinc-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-[#1ef2c1]"
                                placeholder="Workspace name"
                                required
                              />
                              <button
                                type="submit"
                                disabled={spaceSaving}
                                className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white text-xs px-3 py-2 uppercase tracking-wider disabled:opacity-50"
                              >
                                {spaceSaving ? "Saving..." : "Rename"}
                              </button>
                            </div>
                          </form>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-zinc-500 py-4">
                        No workspace found. You can create one from the Projects page.
                      </div>
                    )}
                  </div>

                  {/* Workflow Defaults Form */}
                  <form onSubmit={handleSaveDefaults} className="bg-[#0a0a0a] border border-zinc-900 p-6 space-y-6">
                    <div className="border-b border-zinc-900 pb-4">
                      <h2 className="text-sm font-semibold text-white tracking-wide">Workflow & Issue Defaults</h2>
                      <p className="text-xs text-zinc-500 mt-1">Pre-selected values when reporting new issues and commit tracking rules</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {/* Default Repository */}
                      <div>
                        <label className="block text-[11px] text-zinc-400 uppercase tracking-wider mb-2 font-medium">
                          Default Repository for Issues
                        </label>
                        <select
                          value={defaultRepoId}
                          onChange={(e) => setDefaultRepoId(e.target.value)}
                          className="w-full bg-[#050505] border border-zinc-800 text-xs text-white px-3 py-2 focus:outline-none focus:border-[#1ef2c1]"
                        >
                          <option value="">None (Prompt each time)</option>
                          {repos.map((r) => {
                            const rid = r.RepoID || r.RepoId || r.repoId || "";
                            const rlabel = `${r.GHOwner || r.ghOwner || ""}/${r.GHName || r.ghName || ""}`;
                            return (
                              <option key={rid} value={rid}>
                                {rlabel}
                              </option>
                            );
                          })}
                        </select>
                        <p className="text-[11px] text-zinc-500 mt-1">
                          Auto-selected in the New Issue creation modal.
                        </p>
                      </div>

                      {/* Default Priority */}
                      <div>
                        <label className="block text-[11px] text-zinc-400 uppercase tracking-wider mb-2 font-medium">
                          Default Priority
                        </label>
                        <select
                          value={defaultPriority}
                          onChange={(e) => setDefaultPriority(e.target.value)}
                          className="w-full bg-[#050505] border border-zinc-800 text-xs text-white px-3 py-2 focus:outline-none focus:border-[#1ef2c1]"
                        >
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                          <option value="Critical">Critical</option>
                        </select>
                        <p className="text-[11px] text-zinc-500 mt-1">
                          Initial priority assigned to incoming issues.
                        </p>
                      </div>

                      {/* Default Status */}
                      <div>
                        <label className="block text-[11px] text-zinc-400 uppercase tracking-wider mb-2 font-medium">
                          Default Status
                        </label>
                        <select
                          value={defaultStatus}
                          onChange={(e) => setDefaultStatus(e.target.value)}
                          className="w-full bg-[#050505] border border-zinc-800 text-xs text-white px-3 py-2 focus:outline-none focus:border-[#1ef2c1]"
                        >
                          <option value="Open">Open</option>
                          <option value="InProgress">In Progress</option>
                          <option value="UnderReview">Under Review</option>
                        </select>
                        <p className="text-[11px] text-zinc-500 mt-1">
                          Initial lifecycle status of newly reported defects.
                        </p>
                      </div>

                      {/* Git Auto-Close Syntax Toggle */}
                      <div>
                        <label className="block text-[11px] text-zinc-400 uppercase tracking-wider mb-2 font-medium">
                          Git Commit Auto-Close
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer pt-1">
                          <input
                            type="checkbox"
                            checked={autoCloseGit}
                            onChange={(e) => setAutoCloseGit(e.target.checked)}
                            className="w-4 h-4 rounded-none accent-[#1ef2c1] bg-[#050505] border-zinc-800"
                          />
                          <span className="text-xs text-zinc-200">
                            Auto-close issues matching <code className="text-[#1ef2c1]">fixes #ID</code> or <code className="text-[#1ef2c1]">closes #ID</code>
                          </span>
                        </label>
                        <p className="text-[11px] text-zinc-500 mt-1">
                          When checked, linked commits referencing an issue will resolve it automatically.
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="submit"
                        disabled={defaultsSaving}
                        className="bg-[#1ef2c1] text-black font-semibold text-xs px-5 py-2 hover:bg-[#16b892] disabled:opacity-50 transition-colors uppercase tracking-wider"
                      >
                        {defaultsSaving ? "Saving..." : "Save Preferences"}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB 4: DANGER ZONE & MAINTENANCE */}
              {activeTab === "danger" && (
                <div className="space-y-6">
                  {/* Danger Zone Notice */}
                  <div className="border border-rose-900/40 bg-rose-950/10 p-4 text-xs text-rose-300 flex items-start gap-3">
                    <div>
                      <div className="font-semibold text-rose-200 uppercase tracking-wide">Danger Zone Actions</div>
                      <div className="text-rose-300/80 mt-0.5">
                        Actions in this section perform destructive database purges or fetch operations. Please proceed with caution.
                      </div>
                    </div>
                  </div>

                  {/* 1. Repository Commit Operations: Clear Cache & Resync */}
                  <div className="bg-[#0a0a0a] border border-zinc-900 p-6 space-y-6">
                    <div className="border-b border-zinc-900 pb-4">
                      <h2 className="text-sm font-semibold text-white tracking-wide">Repository Maintenance</h2>
                      <p className="text-xs text-zinc-500 mt-1">
                        Clear local database cache or query GitHub for new commits
                      </p>
                    </div>

                    {/* Repo Selector */}
                    <div>
                      <label className="block text-[11px] text-zinc-400 uppercase tracking-wider mb-2 font-medium">
                        Target Repository
                      </label>
                      <select
                        value={targetRepoForCache}
                        onChange={(e) => setTargetRepoForCache(e.target.value)}
                        className="w-full max-w-md bg-[#050505] border border-zinc-800 text-xs text-white px-3 py-2 focus:outline-none focus:border-[#1ef2c1]"
                      >
                        {repos.map((r) => {
                          const rid = r.RepoID || r.RepoId || r.repoId || "";
                          const rlabel = `${r.GHOwner || r.ghOwner || ""}/${r.GHName || r.ghName || ""}`;
                          return (
                            <option key={rid} value={rid}>
                              {rlabel}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                      {/* Clear Cache Card */}
                      <div className="border border-zinc-850 bg-[#050505] p-4 flex flex-col justify-between space-y-4">
                        <div>
                          <div className="text-xs font-semibold text-zinc-200">Clear Repo Cache & Commit History</div>
                          <div className="text-[11px] text-zinc-500 mt-1 leading-relaxed">
                            Purges cached commits from the database for the selected repository. Issue tickets and repo configuration will remain untouched.
                          </div>
                        </div>
                        <div>
                          <button
                            type="button"
                            onClick={handleClearRepoCache}
                            disabled={cacheClearing || !targetRepoForCache}
                            className="w-full border border-rose-900/60 hover:bg-rose-950/30 text-rose-400 hover:text-rose-200 text-xs px-4 py-2 uppercase tracking-wider disabled:opacity-50 transition-colors"
                          >
                            {cacheClearing ? "Purging Commits..." : "Clear Commit Cache"}
                          </button>
                        </div>
                      </div>

                      {/* Resync Commits Card */}
                      <div className="border border-zinc-850 bg-[#050505] p-4 flex flex-col justify-between space-y-4">
                        <div>
                          <div className="text-xs font-semibold text-zinc-200">Resync New Commits Found</div>
                          <div className="text-[11px] text-zinc-500 mt-1 leading-relaxed">
                            Fetches the latest commits from GitHub via API, detects commits missing from PestControl, and syncs them into the database.
                          </div>
                        </div>
                        <div>
                          <button
                            type="button"
                            onClick={handleResyncCommits}
                            disabled={syncingCommits || !targetRepoForCache}
                            className="w-full bg-[#1ef2c1] text-black hover:bg-[#16b892] text-xs px-4 py-2 font-semibold uppercase tracking-wider disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                          >
                            {syncingCommits ? "Syncing From GitHub..." : "Sync New Commits"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 2. Delete Space Card */}
                  <div className="bg-[#0a0a0a] border border-rose-950/50 p-6 space-y-4">
                    <div className="border-b border-rose-950/40 pb-4">
                      <h2 className="text-sm font-semibold text-rose-300 tracking-wide">Delete Workspace</h2>
                      <p className="text-xs text-zinc-500 mt-1">
                        Permanently deletes the selected workspace, including all associated repositories, commit caches, audit logs, and issues.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
                      <div>
                        <div className="text-xs font-medium text-white">
                          Current Selection: <span className="text-[#1ef2c1] font-semibold">{activeSpace?.SpaceName || activeSpace?.spaceName || "None"}</span>
                        </div>
                        <div className="text-[11px] text-zinc-500 mt-0.5">
                          ID: {selectedSpaceId || "None"}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowDeleteModal(true)}
                        disabled={!selectedSpaceId}
                        className="bg-rose-950/40 border border-rose-800 text-rose-300 hover:bg-rose-900/50 hover:text-white text-xs px-4 py-2 uppercase tracking-wider transition-colors disabled:opacity-50"
                      >
                        Delete Workspace
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Delete Space Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#0a0a0a] border border-rose-900/60 w-full max-w-md p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                <div className="text-rose-400 font-semibold text-sm">
                  Confirm Workspace Deletion
                </div>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="text-zinc-500 hover:text-zinc-300 text-base"
                >
                  ×
                </button>
              </div>

              <p className="text-xs text-zinc-400 leading-relaxed">
                This action is <span className="text-rose-400 font-semibold">irreversible</span>. It will permanently destroy the workspace{" "}
                <span className="text-white font-bold">{activeSpace?.SpaceName || activeSpace?.spaceName}</span> and all related repositories, issues, and audit records.
              </p>

              <div>
                <label className="block text-[11px] text-zinc-400 uppercase tracking-wider mb-2 font-medium">
                  Type <span className="text-white font-bold">{activeSpace?.SpaceName || activeSpace?.spaceName}</span> to confirm:
                </label>
                <input
                  type="text"
                  value={deleteSpaceConfirm}
                  onChange={(e) => setDeleteSpaceConfirm(e.target.value)}
                  placeholder={activeSpace?.SpaceName || activeSpace?.spaceName || "Workspace name"}
                  className="w-full bg-[#050505] border border-zinc-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteSpaceConfirm("");
                  }}
                  className="border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 text-xs px-4 py-2 uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteSpace}
                  disabled={
                    spaceDeleting ||
                    deleteSpaceConfirm.trim().toLowerCase() !==
                      (activeSpace?.SpaceName || activeSpace?.spaceName || "").trim().toLowerCase()
                  }
                  className="bg-rose-600 hover:bg-rose-500 text-white text-xs px-4 py-2 font-semibold uppercase tracking-wider disabled:opacity-50"
                >
                  {spaceDeleting ? "Deleting..." : "Permanently Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </Scrollable>
    </div>
  );
}
