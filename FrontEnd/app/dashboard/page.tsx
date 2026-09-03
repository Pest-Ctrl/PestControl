import Scrollable from "@/components/Scrollable";
import Sidebar from "@/components/dashboard/Sidebar";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import ProjectManagerDashboard from "@/components/dashboard/roles/ProjectManagerDashboard";
import DeveloperDashboard from "@/components/dashboard/roles/DeveloperDashboard";
import QADashboard from "@/components/dashboard/roles/QADashboard";
import ImporterDashboard from "@/components/dashboard/roles/ImporterDashboard";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const role = session.user.role;
  const userName = session.user.name || "User";

  return (
    <div className="flex min-h-screen bg-[#050505] text-white font-sans">
      <Sidebar />

      {/* Main */}
      <Scrollable className="flex-1 flex flex-col h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-[#050505]/90 backdrop-blur border-b border-zinc-900 px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-white tracking-wide">
              {role === 'Project Manager' && 'Overview'}
              {role === 'Developer' && 'My Workspace'}
              {role === 'QA Engineer' && 'Quality Assurance'}
              {role === 'Repository Importer' && 'Defect Reporting'}
            </h1>
            <p className="text-xs text-zinc-400">Sprint 4 · Aug 18 – Aug 31, 2026</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/space" className="bg-[#1ef2c1] text-black text-xs font-bold px-4 py-1.5 hover:bg-[#16b892] transition-colors tracking-wider uppercase">
              + New Issue
            </Link>
          </div>
        </header>

        {role === 'Project Manager' && <ProjectManagerDashboard />}
        {role === 'Developer' && <DeveloperDashboard userName={userName} />}
        {role === 'QA Engineer' && <QADashboard userName={userName} />}
        {role === 'Repository Importer' && <ImporterDashboard userName={userName} />}
        
        {/* Fallback for unknown roles */}
        {!['Project Manager', 'Developer', 'QA Engineer', 'Repository Importer'].includes(role) && (
          <div className="p-8 text-center text-zinc-500">
            Unknown role: {role}. Please contact administrator.
          </div>
        )}
      </Scrollable>
    </div>
  );
}
