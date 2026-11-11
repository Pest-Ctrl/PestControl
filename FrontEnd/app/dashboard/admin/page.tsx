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
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  // Add User State
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', email: '', password: '', role: 'Developer' });
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  if (status === "loading" || loading) {
    return (
      <div className="flex h-screen bg-[#050505] text-white">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#1ef2c1]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#050505] text-white overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full bg-[#050505] relative overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b border-zinc-900 px-8 flex items-center justify-between shrink-0 bg-[#050505]/80 backdrop-blur z-10">
          <div>
            <h1 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
              <span className="text-[#1ef2c1]">⚙</span> Admin & User Management
            </h1>
            <p className="text-xs text-zinc-500">Universal schema access control and roles</p>
          </div>
          <button
            onClick={() => setIsAddUserModalOpen(true)}
            className="flex items-center gap-2 bg-[#1ef2c1] hover:bg-[#1ef2c1]/80 text-black px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all shadow-[0_0_15px_rgba(30,242,193,0.2)]"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Add New User
          </button>
        </header>

        <Scrollable className="flex-1 p-8">
          <div className="max-w-5xl mx-auto space-y-6">

            {message && (
              <div className={`p-4 rounded-lg text-sm border flex items-center gap-3 ${
                message.type === 'success' 
                  ? 'bg-[#1ef2c1]/10 border-[#1ef2c1]/20 text-[#1ef2c1]' 
                  : 'bg-red-500/10 border-red-500/20 text-red-400'
              }`}>
                <span>{message.type === 'success' ? '✓' : '⚠'}</span>
                {message.text}
              </div>
            )}

            {/* Table Area */}
            <div className="bg-[#0a0a0a] border border-zinc-800/80 rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-zinc-900 bg-zinc-900/20 flex justify-between items-center">
                <span className="text-xs font-medium text-zinc-400">Total Registered: {users.length}</span>
                <span className="text-xs text-zinc-600">Schema: Universal Roles</span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-800 text-[10px] uppercase tracking-wider text-zinc-500 font-semibold bg-zinc-900/40">
                      <th className="px-6 py-3">User</th>
                      <th className="px-6 py-3">Email</th>
                      <th className="px-6 py-3">Created</th>
                      <th className="px-6 py-3">Universal Role</th>
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
                          <select
                            value={toSchemaRole(user.Role)}
                            disabled={updatingId === user.UserID || session?.user?.id === user.UserID}
                            onChange={(e) => handleRoleChange(user.UserID, e.target.value)}
                            className={`bg-[#050505] border py-1.5 px-3 text-xs rounded-lg focus:outline-none transition-colors ${
                              updatingId === user.UserID ? 'border-zinc-800 text-zinc-600' : 'border-zinc-800 text-zinc-300 focus:border-[#1ef2c1]/50 cursor-pointer hover:border-zinc-700'
                            }`}
                          >
                            <option value="Developer">Developer</option>
                            <option value="QAEngineer">QA Engineer</option>
                            <option value="RepoImporter">Repository Importer</option>
                            <option value="Admin">Admin (Project Manager)</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-zinc-500 text-sm">
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
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-[#0a0a0a] border border-zinc-800 rounded-xl w-full max-w-md p-6 shadow-2xl animate-fade-in-up">
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
      </div>
    </div>
  );
}
