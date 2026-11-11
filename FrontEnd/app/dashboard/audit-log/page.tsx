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
      <div className="flex flex-col md:flex-row min-h-screen md:h-screen bg-[#050505]">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center p-8">
          <div className="w-6 h-6 border-2 border-[#1ef2c1] border-t-transparent rounded-full animate-spin"></div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen md:h-screen bg-[#050505]">
      <Sidebar />
      
      <main className="flex-1 flex flex-col min-w-0 md:overflow-hidden relative">
        <header className="flex-none min-h-14 sm:h-16 border-b border-zinc-900 flex items-center justify-between px-4 sm:px-8 bg-[#0a0a0a]/50 backdrop-blur-xl">
          <h1 className="text-zinc-100 font-medium tracking-wide text-base sm:text-lg">System Audit Log</h1>
        </header>

        <Scrollable className="flex-1 p-4 sm:p-8 min-w-0">
          <div className="max-w-4xl mx-auto space-y-6">
            
            <div className="bg-[#0a0a0a] border border-zinc-900 rounded-xl overflow-hidden shadow-2xl">
              <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-zinc-900 flex items-center justify-between">
                <div>
                  <h2 className="text-zinc-100 font-medium text-base sm:text-lg">Activity Timeline</h2>
                  <p className="text-zinc-500 text-xs sm:text-sm mt-1">Track all critical actions, security events, and modifications across spaces.</p>
                </div>
              </div>

              <div className="p-4 sm:p-6 relative">
                {/* Vertical Timeline Line */}
                <div className="absolute left-8 sm:left-11 top-8 sm:top-10 bottom-8 sm:bottom-10 w-[1px] bg-gradient-to-b from-zinc-800 via-zinc-800 to-transparent"></div>

                <div className="space-y-6 sm:space-y-8 relative">
                  {logs.length === 0 ? (
                    <div className="text-zinc-500 text-sm italic pl-12 py-4">No audit logs found.</div>
                  ) : logs.map((log) => (
                    <div key={log.AuditID} className="flex gap-3.5 sm:gap-6 group">
                      
                      {/* Abstract Geometric Icon (No emojis) */}
                      <div className="relative z-10 shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#050505] border border-zinc-800 flex items-center justify-center group-hover:border-[#1ef2c1]/50 group-hover:bg-[#1ef2c1]/10 transition-colors shadow-lg">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400 group-hover:text-[#1ef2c1]">
                          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                        </svg>
                      </div>

                      {/* Content Card */}
                      <div className="flex-1 min-w-0 bg-[#050505] border border-zinc-900 p-3.5 sm:p-5 rounded-xl group-hover:border-zinc-700 transition-all shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                          <h3 className="text-zinc-200 font-medium text-sm sm:text-base group-hover:text-[#1ef2c1] transition-colors break-words">{log.AuditTitle}</h3>
                          <span className="text-[11px] sm:text-xs font-medium text-zinc-500 bg-zinc-900/50 px-2.5 py-1 rounded-md border border-zinc-800 self-start shrink-0">
                            {new Date(log.AuditTime).toLocaleString()}
                          </span>
                        </div>
                        
                        <p className="text-zinc-400 text-xs sm:text-sm mb-4 leading-relaxed break-words">
                          {log.AuditDesc}
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs">
                          <div className="flex items-center gap-1.5 bg-zinc-900/40 px-2 py-1 rounded text-zinc-500">
                            <span className="text-zinc-300 font-medium">@{log.User?.Username || 'system'}</span>
                          </div>
                          <div className="flex items-center gap-1.5 bg-zinc-900/40 px-2 py-1 rounded text-zinc-500 max-w-full">
                            <span className="shrink-0">Space:</span> <span className="text-zinc-300 font-medium truncate max-w-[140px] sm:max-w-none">{log.SpaceID}</span>
                          </div>
                          <div className="flex items-center gap-1.5 bg-zinc-900/40 px-2 py-1 rounded text-zinc-600 sm:ml-auto text-[10px]">
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
