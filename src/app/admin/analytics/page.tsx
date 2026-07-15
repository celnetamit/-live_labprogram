import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Users, FlaskConical, ShieldAlert, Activity, ArrowUpRight, TrendingUp } from "lucide-react";

export default async function AnalyticsDashboard() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    redirect("/login");
  }

  // Fetch real metrics from the database
  const totalUsers = await prisma.user.count();
  const totalLabs = await prisma.lab.count();
  const pendingRequests = await prisma.accessRequest.count({ where: { status: "PENDING" } });
  const totalAccessesGranted = await prisma.labAccess.count();

  const recentUsers = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { name: true, email: true, createdAt: true, role: true }
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Platform Analytics</h1>
        <p className="text-muted-foreground mt-1">Real-time metrics and system health overview across the ecosystem.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <span className="flex items-center text-xs font-medium text-green-500 bg-green-500/10 px-2 py-1 rounded-full">
              +12% <ArrowUpRight className="w-3 h-3 ml-1" />
            </span>
          </div>
          <h3 className="text-muted-foreground text-sm font-medium mb-1">Total Users</h3>
          <div className="text-3xl font-bold">{totalUsers.toLocaleString()}</div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <FlaskConical className="w-5 h-5" />
            </div>
            <span className="flex items-center text-xs font-medium text-green-500 bg-green-500/10 px-2 py-1 rounded-full">
              +2 <ArrowUpRight className="w-3 h-3 ml-1" />
            </span>
          </div>
          <h3 className="text-muted-foreground text-sm font-medium mb-1">Active Labs</h3>
          <div className="text-3xl font-bold">{totalLabs.toLocaleString()}</div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-muted-foreground text-sm font-medium mb-1">Pending Requests</h3>
          <div className="text-3xl font-bold">{pendingRequests.toLocaleString()}</div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <span className="flex items-center text-xs font-medium text-green-500 bg-green-500/10 px-2 py-1 rounded-full">
              +28% <ArrowUpRight className="w-3 h-3 ml-1" />
            </span>
          </div>
          <h3 className="text-muted-foreground text-sm font-medium mb-1">Access Provisions</h3>
          <div className="text-3xl font-bold">{totalAccessesGranted.toLocaleString()}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Engagement Graph Placeholder */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-lg font-bold">Ecosystem Engagement</h2>
              <p className="text-sm text-muted-foreground mt-1">Platform usage over the last 30 days.</p>
            </div>
            <button className="flex items-center text-sm font-medium text-primary hover:underline">
              <TrendingUp className="w-4 h-4 mr-2" /> View Full Report
            </button>
          </div>
          
          <div className="h-64 flex items-end gap-2 pb-4">
            {/* Fake bar chart */}
            {[40, 25, 45, 60, 35, 75, 55, 90, 85, 65, 70, 95].map((height, i) => (
              <div key={i} className="flex-1 bg-primary/20 rounded-t flex flex-col justify-end group hover:bg-primary/40 transition-colors cursor-pointer relative">
                <div 
                  className="bg-primary rounded-t w-full opacity-80 group-hover:opacity-100 transition-opacity" 
                  style={{ height: `${height}%` }}
                ></div>
                <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-xs font-bold px-2 py-1 rounded shadow-lg pointer-events-none transition-opacity">
                  {height * 14}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground font-medium pt-2 border-t border-border mt-2">
            <span>Oct 1</span>
            <span>Oct 15</span>
            <span>Oct 30</span>
          </div>
        </div>

        {/* Recent Signups */}
        <div className="bg-card border border-border rounded-xl shadow-sm p-6 flex flex-col">
          <div className="mb-6">
            <h2 className="text-lg font-bold">Recent Signups</h2>
            <p className="text-sm text-muted-foreground mt-1">New users joining the platform.</p>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            {recentUsers.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-8">No recent signups</div>
            ) : (
              recentUsers.map((user, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-bold text-sm shrink-0 border border-border">
                    {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-bold truncate">{user.name || "Anonymous User"}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <div className="ml-auto text-xs font-medium px-2 py-1 bg-muted rounded-full whitespace-nowrap">
                    {user.role}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
