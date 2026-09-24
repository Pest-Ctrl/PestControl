"use client";

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Sidebar from "@/components/dashboard/Sidebar";
import Scrollable from "@/components/Scrollable";

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
    } else if (status === "authenticated" && session?.user?.role !== "Project Manager") {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "Project Manager") {
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
      const res = await fetch(`/api/users/${userId}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      
      if (res.ok) {
        setMessage({ text: "Role updated successfully!", type: "success" });
        setUsers(users.map(u => u.UserID === userId ? { ...u, Role: newRole } : u));
      } else {
        const data = await res.json();
        setMessage({ text: data.error || "Failed to update role", type: "error" });
      }
    } catch (err) {
      setMessage({ text: "An error occurred", type: "error" });
    } finally {
      setUpdatingId(null);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
      const data = await res.json();
      
      if (res.ok) {
        setMessage({ text: 'User created successfully', type: 'success' });
        setUsers([data, ...users]);
        setIsAddUserModalOpen(false);
        setNewUser({ username: '', email: '', password: '', role: 'Developer' });
      } else {
        setMessage({ text: data.error || 'Failed to create user', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'An error occurred', type: 'error' });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex h-screen bg-[#050505]">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-[#1ef2c1] border-t-transparent rounded-full animate-spin"></div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#050505]">
      <Sidebar />
      
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Header */}
        <header className="flex-none h-16 border-b border-zinc-900 flex items-center justify-between px-8 bg-[#0a0a0a]/50 backdrop-blur-xl">
          <h1 className="text-zinc-100 font-medium tracking-wide">User Management (Super Admin)</h1>
        </header>

        {/* Message Toast */}
        {message && (
          <div className={`absolute top-20 right-8 px-4 py-2 rounded shadow-lg text-sm font-medium animate-fade-in-down z-50 ${
            message.type === 'success' ? 'bg-[#1ef2c1]/20 text-[#1ef2c1] border border-[#1ef2c1]/50' : 'bg-red-500/20 text-red-400 border border-red-500/50'
          }`}>
            {message.text}
          </div>
        )}

        {/* Main Content */}
        <Scrollable className="flex-1 p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            
            <div className="bg-[#0a0a0a] border border-zinc-900 rounded-xl overflow-hidden">
              <div className="px-6 py-5 border-b border-zinc-900 flex items-center justify-between">
                <div>
                  <h2 className="text-zinc-100 font-medium">All Users</h2>
                  <p className="text-zinc-500 text-sm mt-1">Manage global platform roles for all registered users.</p>
                </div>
                <button
                  onClick={() => setIsAddUserModalOpen(true)}
                  className="bg-[#1ef2c1] text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#1ef2c1]/90 transition-colors flex items-center gap-2"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                  Add User
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-900 bg-[#050505]">
                      <th className="px-6 py-4 text-xs font-medium text-zinc-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-4 text-xs font-medium text-zinc-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-4 text-xs font-medium text-zinc-500 uppercase tracking-wider">Joined</th>
                      <th className="px-6 py-4 text-xs font-medium text-zinc-500 uppercase tracking-wider">Global Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900/50">
                    {users.map((user) => (
                      <tr key={user.UserID} className="hover:bg-zinc-900/20 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 text-xs font-bold">
                              {user.Username?.[0]?.toUpperCase() || "U"}
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
                            value={user.Role}
                            disabled={updatingId === user.UserID || session?.user?.id === user.UserID}
                            onChange={(e) => handleRoleChange(user.UserID, e.target.value)}
                            className={`bg-[#050505] border py-1.5 px-3 text-xs rounded-lg focus:outline-none transition-colors ${
                              updatingId === user.UserID ? 'border-zinc-800 text-zinc-600' : 'border-zinc-800 text-zinc-300 focus:border-[#1ef2c1]/50 cursor-pointer hover:border-zinc-700'
                            }`}
                          >
                            <option value="Developer">Developer</option>
                            <option value="QA Engineer">QA Engineer</option>
                            <option value="Repository Importer">Repository Importer</option>
                            <option value="Project Manager">Project Manager (Super Admin)</option>
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
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Role</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                    className="w-full bg-[#050505] border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-[#1ef2c1]/50 focus:ring-1 focus:ring-[#1ef2c1]/50"
                  >
                    <option value="Developer">Developer</option>
                    <option value="QA Engineer">QA Engineer</option>
                    <option value="Repository Importer">Repository Importer</option>
                    <option value="Project Manager">Project Manager (Super Admin)</option>
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
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-[#1ef2c1] text-black hover:bg-[#1ef2c1]/90 disabled:opacity-50 transition-colors"
                  >
                    {isSubmitting ? 'Creating...' : 'Create User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
