"use client";

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Sidebar from "@/components/dashboard/Sidebar";
import Scrollable from "@/components/Scrollable";
import { isAdmin, toSchemaRole } from "@/lib/roles";

interface User {
  UserID: string;
  Username: string;
  Email: string;
  Role: string;
  CreatedAt: string;
}

export default function UserManagementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [userToRemove, setUserToRemove] = useState<User | null>(null);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  // Add User State
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', email: '', password: '', role: 'Developer' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && !isAdmin(session?.user?.role)) {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  useEffect(() => {
    if (status === "authenticated" && isAdmin(session?.user?.role)) {
      fetchUsers();
    }
  }, [status, session]);

  const handleConfirmRemoveUser = async () => {
    if (!userToRemove || !isAdmin(session?.user?.role)) return;
    const target = userToRemove;
    setRemovingId(target.UserID);
    setMessage(null);
    try {
      const res = await fetch(`/api/users/${target.UserID}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Failed to remove user");
      }
      setUsers((prev) => prev.filter((u) => u.UserID !== target.UserID));
      setUserToRemove(null);
      setMessage({
        text: data.message || `Removed ${target.Username} and cleared GitHub OAuth credentials.`,
        type: "success",
      });
    } catch (err: any) {
      setUserToRemove(null);
      setMessage({ text: err.message || "Failed to remove user", type: "error" });
    } finally {
      setRemovingId(null);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdatingId(userId);
    setMessage(null);
    try {
      const schemaRole = toSchemaRole(newRole);
      const res = await fetch(`/api/users/${userId}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: schemaRole }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update role");
      }

      setUsers((prev) =>
        prev.map((u) => (u.UserID === userId ? { ...u, Role: schemaRole } : u))
      );
      setMessage({ text: "Role updated successfully!", type: "success" });
    } catch (err: any) {
      setMessage({ text: err.message, type: "error" });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newUser,
          role: toSchemaRole(newUser.role),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create user");
      }

      const createdUser = await res.json();
      setUsers([createdUser, ...users]);
      setIsAddUserModalOpen(false);
      setNewUser({ username: '', email: '', password: '', role: 'Developer' });
      setMessage({ text: "User created successfully!", type: "success" });
    } catch (err: any) {
      setMessage({ text: err.message, type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "loading" || (loading && isAdmin(session?.user?.role))) {
    return (
      <div className="flex flex-col md:flex-row min-h-screen md:h-screen bg-[#050505] text-white">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#1ef2c1]"></div>
        </div>
      </div>
    );
  }

  if (!isAdmin(session?.user?.role)) {
    return (
      <div className="flex flex-col md:flex-row min-h-screen md:h-screen bg-[#050505] text-white">
        <Sidebar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-3">
          <span className="text-xs px-3 py-1 rounded bg-red-500/10 border border-red-500/30 text-red-400 uppercase tracking-widest font-bold">
            403 · Forbidden
          </span>
          <h1 className="text-lg font-semibold text-zinc-100">Administrator Access Required</h1>
          <p className="text-xs text-zinc-400 max-w-sm">
            Role-Based Management System (RBMS) restricts user provisioning, role assignment, and account removal to Administrators.
          </p>
        </div>
      </div>
    );
  }

  const renderRoleSelect = (user: User, fullWidth = false) => (
    <select
      value={toSchemaRole(user.Role)}
      disabled={updatingId === user.UserID || session?.user?.id === user.UserID}
      onChange={(e) => handleRoleChange(user.UserID, e.target.value)}
      className={`${fullWidth ? 'w-full' : ''} bg-[#050505] border py-1.5 px-3 text-xs rounded-lg focus:outline-none transition-colors ${
        updatingId === user.UserID ? 'border-zinc-800 text-zinc-600' : 'border-zinc-800 text-zinc-300 focus:border-[#1ef2c1]/50 cursor-pointer hover:border-zinc-700'
      }`}
    >
      <option value="Developer">Developer</option>
      <option value="QAEngineer">QA Engineer</option>
      <option value="RepoImporter">Repository Importer</option>
      <option value="Admin">Admin (Project Manager)</option>
    </select>
  );

  const renderRemoveAction = (user: User) => {
    if (!isAdmin(session?.user?.role)) return null;
    if (session?.user?.id === user.UserID) {
      return (
        <span
          className="inline-flex items-center gap-1 text-[10px] text-zinc-500 bg-zinc-900/70 border border-zinc-800 px-2 py-1 rounded-md select-none whitespace-nowrap"
          title="Current Administrator session is protected from self-removal"
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          You
        </span>
      );
    }
    return (
      <button
        type="button"
        onClick={() => setUserToRemove(user)}
        disabled={removingId === user.UserID}
        aria-label={`Remove ${user.Username}`}
        title={`Remove ${user.Username} & clear GitHub OAuth credentials`}
        className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-950/30 border border-transparent hover:border-red-900/50 rounded-md transition-colors disabled:opacity-40 cursor-pointer"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          <path d="M10 11v6" />
          <path d="M14 11v6" />
          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
        </svg>
      </button>
    );
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen md:h-screen bg-[#050505] text-white md:overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 md:h-full bg-[#050505] relative md:overflow-hidden">
        {/* Top Header */}
        <header className="min-h-16 py-3 md:py-0 md:h-16 border-b border-zinc-900 px-4 sm:px-8 flex flex-wrap items-center justify-between gap-3 shrink-0 bg-[#050505]/80 backdrop-blur z-10">
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-semibold text-zinc-100 flex items-center gap-2">
              <span className="text-[#1ef2c1]">⚙</span> Admin & User Management
            </h1>
            <p className="text-xs text-zinc-500">Universal schema access control and roles</p>
          </div>
          <button
            onClick={() => setIsAddUserModalOpen(true)}
            className="flex items-center gap-2 bg-[#1ef2c1] hover:bg-[#1ef2c1]/80 text-black px-3.5 sm:px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all shadow-[0_0_15px_rgba(30,242,193,0.2)] whitespace-nowrap"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Add New User
          </button>
        </header>

        <Scrollable className="flex-1 p-4 sm:p-8 min-w-0">
          <div className="max-w-5xl mx-auto space-y-6">

            {/* RBMS (Role-Based Management System) Access Policy */}
            <div className="bg-[#0a0a0a] border border-zinc-800/80 rounded-xl p-4 sm:p-5 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold">
                    Role-Based Management System (RBMS)
                  </p>
                  <h2 className="text-sm font-medium text-zinc-200 mt-0.5">
                    Access Control & User Removal Policy
                  </h2>
                </div>
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-[#1ef2c1]/10 border border-[#1ef2c1]/30 text-[#1ef2c1] font-semibold uppercase tracking-wider">
                  Admin Only Enforced
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="bg-[#050505] border border-zinc-900 rounded-lg p-3">
                  <p className="text-[#1ef2c1] font-semibold text-[11px] uppercase tracking-wider mb-1">Admin Privileges</p>
                  <p className="text-zinc-400 leading-relaxed">
                    Provision accounts, assign schema roles, and remove users from PestControl.
                  </p>
                </div>
                <div className="bg-[#050505] border border-zinc-900 rounded-lg p-3">
                  <p className="text-zinc-200 font-semibold text-[11px] uppercase tracking-wider mb-1">GitHub OAuth Revocation</p>
                  <p className="text-zinc-400 leading-relaxed">
                    Removing a user clears their stored GitHub OAuth credentials (<code className="text-zinc-300">GHOAuth</code>) so they can re-authenticate fresh.
                  </p>
                </div>
                <div className="bg-[#050505] border border-zinc-900 rounded-lg p-3">
                  <p className="text-amber-400 font-semibold text-[11px] uppercase tracking-wider mb-1">Backend Boundary Guards</p>
                  <p className="text-zinc-400 leading-relaxed">
                    Self-removal, last-Admin deletion, and DELETE requests from non-Admin roles are rejected by the server (401/403/409).
                  </p>
                </div>
              </div>
            </div>

            {message && (
              <div className={`p-4 rounded-lg text-sm border flex items-center gap-3 ${
                message.type === 'success' 
                  ? 'bg-[#1ef2c1]/10 border-[#1ef2c1]/20 text-[#1ef2c1]' 
                  : 'bg-red-500/10 border-red-500/20 text-red-400'
              }`}>
                <span>{message.type === 'success' ? '✓' : '⚠'}</span>
                <span className="break-words">{message.text}</span>
              </div>
            )}

            {/* Table Area */}
            <div className="bg-[#0a0a0a] border border-zinc-800/80 rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-zinc-900 bg-zinc-900/20 flex flex-wrap justify-between items-center gap-2">
                <span className="text-xs font-medium text-zinc-400">Total Registered: {users.length}</span>
                <span className="text-xs text-zinc-600">RBMS · Administrator Controls</span>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden divide-y divide-zinc-900/60">
                {users.map((user) => (
                  <div key={user.UserID} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-xs text-zinc-400 shrink-0">
                          {user.Username.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-zinc-200 truncate">{user.Username}</p>
                          <p className="text-xs text-zinc-400 truncate">{user.Email}</p>
                          <p className="text-[11px] text-zinc-500 mt-0.5">
                            Joined {new Date(user.CreatedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="shrink-0">
                        {renderRemoveAction(user)}
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Universal Role</label>
                      {renderRoleSelect(user, true)}
                    </div>
                  </div>
                ))}
                {users.length === 0 && (
                  <div className="px-6 py-8 text-center text-zinc-500 text-sm">
                    No users found.
                  </div>
                )}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-800 text-[10px] uppercase tracking-wider text-zinc-500 font-semibold bg-zinc-900/40">
                      <th className="px-6 py-3">User</th>
                      <th className="px-6 py-3">Email</th>
                      <th className="px-6 py-3">Created</th>
                      <th className="px-6 py-3">Universal Role</th>
                      <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900/60">
                    {users.map((user) => (
                      <tr key={user.UserID} className="hover:bg-zinc-900/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-xs text-zinc-400">
                              {user.Username.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm font-medium text-zinc-200">{user.Username}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-400">
                          {user.Email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">
                          {new Date(user.CreatedAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {renderRoleSelect(user)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          {renderRemoveAction(user)}
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-zinc-500 text-sm">
                          No users found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </Scrollable>

        {/* Add User Modal */}
        {isAddUserModalOpen && (
          <div className="fixed inset-0 z-50 p-4 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-[#0a0a0a] border border-zinc-800 rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto p-5 sm:p-6 shadow-2xl animate-fade-in-up">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-zinc-100">Add New User</h3>
                <button onClick={() => setIsAddUserModalOpen(false)} className="text-zinc-500 hover:text-zinc-300">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
              
              <form onSubmit={handleAddUser} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Username</label>
                  <input
                    type="text"
                    required
                    value={newUser.username}
                    onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                    className="w-full bg-[#050505] border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-[#1ef2c1]/50 focus:ring-1 focus:ring-[#1ef2c1]/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    className="w-full bg-[#050505] border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-[#1ef2c1]/50 focus:ring-1 focus:ring-[#1ef2c1]/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    className="w-full bg-[#050505] border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-[#1ef2c1]/50 focus:ring-1 focus:ring-[#1ef2c1]/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Universal Role</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                    className="w-full bg-[#050505] border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-[#1ef2c1]/50 focus:ring-1 focus:ring-[#1ef2c1]/50"
                  >
                    <option value="Developer">Developer</option>
                    <option value="QAEngineer">QA Engineer</option>
                    <option value="RepoImporter">Repository Importer</option>
                    <option value="Admin">Admin (Project Manager)</option>
                  </select>
                </div>
                
                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddUserModalOpen(false)}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[#1ef2c1] hover:bg-[#1ef2c1]/80 text-black px-5 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? "Creating..." : "Save User"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Confirm User Removal Modal */}
        {userToRemove && (
          <div className="fixed inset-0 z-50 p-4 flex items-center justify-center bg-black/75 backdrop-blur-sm">
            <div className="bg-[#0a0a0a] border border-red-900/60 rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto p-5 sm:p-6 shadow-2xl space-y-4">
              <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
                <div className="flex items-center gap-2 text-red-400">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  <h3 className="text-base font-semibold">Remove User Account</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setUserToRemove(null)}
                  className="text-zinc-500 hover:text-zinc-300"
                  aria-label="Close removal dialog"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>

              <div className="bg-[#050505] border border-zinc-800/80 rounded-lg p-3.5 space-y-1">
                <p className="text-sm font-semibold text-zinc-100">{userToRemove.Username}</p>
                <p className="text-xs text-zinc-400 break-all">{userToRemove.Email}</p>
                <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
                  Role: {toSchemaRole(userToRemove.Role)}
                </span>
              </div>

              <p className="text-xs text-zinc-400 leading-relaxed">
                This will remove <span className="text-zinc-200 font-medium">{userToRemove.Username}</span> from PestControl and clear their stored GitHub OAuth credentials (<code className="text-zinc-300">GHOAuth</code>) from the database so they must re-authenticate cleanly if they sign in again.
              </p>

              <div className="pt-2 flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setUserToRemove(null)}
                  disabled={removingId === userToRemove.UserID}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-zinc-400 border border-zinc-800 hover:text-zinc-200 hover:bg-zinc-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  id="confirm-remove-user-btn"
                  onClick={handleConfirmRemoveUser}
                  disabled={removingId === userToRemove.UserID}
                  className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-50"
                >
                  {removingId === userToRemove.UserID ? "Removing..." : "Remove User"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
