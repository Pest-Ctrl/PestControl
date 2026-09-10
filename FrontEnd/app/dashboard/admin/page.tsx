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
      </main>
    </div>
  );
}
