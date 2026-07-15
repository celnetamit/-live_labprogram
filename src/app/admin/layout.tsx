import Link from "next/link";
import { LayoutDashboard, Users, FlaskConical, ShieldAlert, Settings, Bell, LogOut, ChevronRight } from "lucide-react";
import { SignOutButton } from "@/components/SignOutButton";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card flex flex-col fixed inset-y-0 z-50">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <div className="w-6 h-6 rounded bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs mr-2">P</div>
          <span className="font-bold text-lg tracking-tight">Admin Center</span>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-3">
          <div className="space-y-1 mb-8">
            <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Overview</p>
            <Link href="/admin" className="flex items-center px-3 py-2 text-sm font-medium rounded-md bg-secondary text-secondary-foreground">
              <LayoutDashboard className="mr-3 h-4 w-4" /> Dashboard
            </Link>
            <Link href="/admin/analytics" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-muted hover:text-foreground">
              <span className="mr-3 h-4 w-4 flex items-center justify-center">📈</span> Analytics
            </Link>
          </div>

          <div className="space-y-1 mb-8">
            <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Ecosystem</p>
            <Link href="/admin/labs" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-muted hover:text-foreground">
              <FlaskConical className="mr-3 h-4 w-4" /> Lab Management
            </Link>
            <Link href="/admin/users" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-muted hover:text-foreground">
              <Users className="mr-3 h-4 w-4" /> Users & Roles
            </Link>
            <Link href="/admin/access" className="flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-muted hover:text-foreground">
              <div className="flex items-center"><ShieldAlert className="mr-3 h-4 w-4" /> Access Requests</div>
              <span className="bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">12</span>
            </Link>
          </div>

          <div className="space-y-1">
            <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">System</p>
            <Link href="/admin/settings" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-muted hover:text-foreground">
              <Settings className="mr-3 h-4 w-4" /> Settings
            </Link>
          </div>
        </div>

        <div className="p-4 border-t border-border">
          <SignOutButton />
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 pl-64 flex flex-col min-h-screen">
        <header className="h-16 border-b border-border bg-background/80 backdrop-blur-sm flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="flex items-center text-sm text-muted-foreground">
            <span>Admin</span>
            <ChevronRight className="h-4 w-4 mx-2" />
            <span className="text-foreground font-medium">Dashboard</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary ring-2 ring-background"></span>
            </button>
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-sm font-bold border border-border">
              JD
            </div>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
