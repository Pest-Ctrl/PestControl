import Scrollable from "@/components/Scrollable";
import Sidebar from "@/components/dashboard/Sidebar";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import ProjectManagerDashboard from "@/components/dashboard/roles/ProjectManagerDashboard";
import DeveloperDashboard from "@/components/dashboard/roles/DeveloperDashboard";
import QADashboard from "@/components/dashboard/roles/QADashboard";
import ImporterDashboard from "@/components/dashboard/roles/ImporterDashboard";
import { toSchemaRole } from "@/lib/roles";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const role = toSchemaRole(session.user.role);
  const userName = session.user.name || "User";

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#050505] text-white font-sans">
      <Sidebar />

      {/* Main */}
      <Scrollable className="flex-1 flex flex-col min-w-0 md:h-screen">
        {/* Top bar */}
        <header className="md:sticky md:top-0 z-20 bg-[#050505]/90 backdrop-blur border-b border-zinc-900 px-4 sm:px-8 py-3.5 sm:py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-white tracking-wide truncate">
              {role === 'Admin' && 'Overview'}
              {role === 'Developer' && 'My Workspace'}
              {role === 'QAEngineer' && 'Quality Assurance'}
              {role === 'RepoImporter' && 'Defect Reporting'}
            </h1>
            <p className="text-xs text-zinc-400">Sprint 4 · Aug 18 – Aug 31, 2026</p>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <Link href="/space" className="bg-[#1ef2c1] text-black text-xs font-bold px-3.5 sm:px-4 py-1.5 hover:bg-[#16b892] transition-colors tracking-wider uppercase whitespace-nowrap">
              + New Issue
            </Link>
          </div>
        </header>

        {role === 'Admin' && <ProjectManagerDashboard />}
        {role === 'Developer' && <DeveloperDashboard userName={userName} />}
        {role === 'QAEngineer' && <QADashboard userName={userName} />}
        {role === 'RepoImporter' && <ImporterDashboard userName={userName} />}
      </Scrollable>
    </div>
  );
}
