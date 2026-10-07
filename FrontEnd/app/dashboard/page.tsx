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
    <div className="flex min-h-screen bg-[#050505] text-white font-sans">
      <Sidebar />

      {/* Main */}
      <Scrollable className="flex-1 flex flex-col h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-[#050505]/90 backdrop-blur border-b border-zinc-900 px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-white tracking-wide">
              {role === 'Admin' && 'Overview'}
              {role === 'Developer' && 'My Workspace'}
              {role === 'QAEngineer' && 'Quality Assurance'}
              {role === 'RepoImporter' && 'Defect Reporting'}
            </h1>
            <p className="text-xs text-zinc-400">Sprint 4 · Aug 18 – Aug 31, 2026</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/space" className="bg-[#1ef2c1] text-black text-xs font-bold px-4 py-1.5 hover:bg-[#16b892] transition-colors tracking-wider uppercase">
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
