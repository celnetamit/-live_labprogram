import Link from "next/link";
import { User, BookOpen, FlaskConical, Award, Settings, LogOut, ChevronRight } from "lucide-react";
import { SignOutButton } from "@/components/SignOutButton";

export default function DashboardLayout({
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
          <span className="font-bold text-lg tracking-tight">Student Hub</span>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-3">
          <div className="space-y-1">
            <Link href="/dashboard" className="flex items-center px-3 py-2 text-sm font-medium rounded-md bg-secondary text-secondary-foreground">
              <User className="mr-3 h-4 w-4" /> My Profile
            </Link>
            <Link href="/dashboard/programs" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-muted hover:text-foreground">
              <BookOpen className="mr-3 h-4 w-4" /> My Programs
            </Link>
            <Link href="/dashboard/labs" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-muted hover:text-foreground">
              <FlaskConical className="mr-3 h-4 w-4" /> My Labs
            </Link>
            <Link href="/dashboard/certificates" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-muted hover:text-foreground">
              <Award className="mr-3 h-4 w-4" /> Certificates
            </Link>
            <Link href="/dashboard/settings" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-muted hover:text-foreground">
              <Settings className="mr-3 h-4 w-4" /> Account Settings
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
            <span>Dashboard</span>
            <ChevronRight className="h-4 w-4 mx-2" />
            <span className="text-foreground font-medium">My Labs</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold border border-primary/30">
              AC
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
