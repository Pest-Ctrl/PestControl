"use client";

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Sidebar from "@/components/dashboard/Sidebar";
import Scrollable from "@/components/Scrollable";

interface AuditLog {
  AuditID: string;
  AuditTitle: string;
  AuditDesc: string;
  AuditTime: string;
  SpaceID: string;
  User?: {
    Username: string;
  };
}

export default function AuditLogPage() {
  const { status } = useSession();
  const router = useRouter();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch('/api/audit')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setLogs(data);
          }
          setLoading(false);
        })
        .catch(err => {
          console.error("Error fetching audit logs", err);
          setLoading(false);
        });
    }
  }, [status]);

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
        <header className="flex-none h-16 border-b border-zinc-900 flex items-center justify-between px-8 bg-[#0a0a0a]/50 backdrop-blur-xl">
          <h1 className="text-zinc-100 font-medium tracking-wide">System Audit Log</h1>
        </header>

        <Scrollable className="flex-1 p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            
            <div className="bg-[#0a0a0a] border border-zinc-900 rounded-xl overflow-hidden shadow-2xl">
              <div className="px-6 py-5 border-b border-zinc-900 flex items-center justify-between">
                <div>
                  <h2 className="text-zinc-100 font-medium text-lg">Activity Timeline</h2>
                  <p className="text-zinc-500 text-sm mt-1">Track all critical actions, security events, and modifications across spaces.</p>
                </div>
              </div>

              <div className="p-6 relative">
                {/* Vertical Timeline Line */}
                <div className="absolute left-10 top-10 bottom-10 w-[1px] bg-gradient-to-b from-zinc-800 via-zinc-800 to-transparent"></div>

                <div className="space-y-8 relative">
                  {logs.length === 0 ? (
                    <div className="text-zinc-500 text-sm italic pl-12 py-4">No audit logs found.</div>
                  ) : logs.map((log) => (
                    <div key={log.AuditID} className="flex gap-6 group">
                      
                      {/* Abstract Geometric Icon (No emojis) */}
                      <div className="relative z-10 shrink-0 w-10 h-10 rounded-full bg-[#050505] border border-zinc-800 flex items-center justify-center group-hover:border-[#1ef2c1]/50 group-hover:bg-[#1ef2c1]/10 transition-colors shadow-lg">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400 group-hover:text-[#1ef2c1]">
                          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                        </svg>
                      </div>

                      {/* Content Card */}
                      <div className="flex-1 bg-[#050505] border border-zinc-900 p-5 rounded-xl group-hover:border-zinc-700 transition-all shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-zinc-200 font-medium text-base group-hover:text-[#1ef2c1] transition-colors">{log.AuditTitle}</h3>
                          <span className="text-xs font-medium text-zinc-500 bg-zinc-900/50 px-2.5 py-1 rounded-md border border-zinc-800">
                            {new Date(log.AuditTime).toLocaleString()}
                          </span>
                        </div>
                        
                        <p className="text-zinc-400 text-sm mb-4 leading-relaxed">
                          {log.AuditDesc}
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs">
                          <div className="flex items-center gap-1.5 bg-zinc-900/40 px-2 py-1 rounded text-zinc-500">
                            <span className="text-zinc-300 font-medium">@{log.User?.Username || 'system'}</span>
                          </div>
                          <div className="flex items-center gap-1.5 bg-zinc-900/40 px-2 py-1 rounded text-zinc-500">
                            Space: <span className="text-zinc-300 font-medium">{log.SpaceID}</span>
                          </div>
                          <div className="flex items-center gap-1.5 bg-zinc-900/40 px-2 py-1 rounded text-zinc-600 ml-auto font-mono text-[10px]">
                            ID: {log.AuditID.split('-')[0]}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </Scrollable>
      </main>
    </div>
  );
}
