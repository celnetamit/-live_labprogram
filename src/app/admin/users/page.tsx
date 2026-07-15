import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Search, Filter, Shield, MoreHorizontal, User, Mail, ShieldAlert, CheckCircle2 } from "lucide-react";

export default async function UsersManagement() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    redirect("/login");
  }

  // Fetch all users
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      labAccess: true // to count how many labs they have access to
    }
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users & Roles</h1>
          <p className="text-muted-foreground mt-1">Manage platform members, permissions, and role assignments.</p>
        </div>
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-sm">
          Invite User
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-border flex flex-col sm:flex-row justify-between gap-4 bg-muted/20">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text"
              placeholder="Search users by name or email..."
              className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="flex gap-2">
            <button className="flex items-center px-3 py-2 bg-background border border-input rounded-md text-sm font-medium hover:bg-muted transition-colors">
              <Filter className="w-4 h-4 mr-2" /> Filter
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground bg-muted/50 uppercase border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">User Details</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Organization</th>
                <th className="px-6 py-4 font-medium">Lab Access</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-muted/10 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-bold text-secondary-foreground shrink-0 border border-border shadow-sm">
                        {u.name ? u.name.charAt(0).toUpperCase() : "U"}
                      </div>
                      <div>
                        <p className="font-bold text-foreground">{u.name || "Anonymous User"}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3" /> {u.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border ${
                      u.role === 'SUPER_ADMIN' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' : 
                      'bg-muted text-muted-foreground border-border'
                    }`}>
                      {u.role === 'SUPER_ADMIN' && <Shield className="w-3 h-3 mr-1.5" />}
                      {u.role === 'USER' && <User className="w-3 h-3 mr-1.5" />}
                      {u.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium">{u.organization || "—"}</div>
                    <div className="text-xs text-muted-foreground">{u.designation || "—"}</div>
                  </td>
                  <td className="px-6 py-4 font-medium">
                    {u.labAccess.length} Active
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                      u.status === 'ACTIVE' ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {u.status === 'ACTIVE' ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <ShieldAlert className="w-3 h-3 mr-1" />}
                      {u.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors" title="Manage User">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    No users found in the system.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-border flex items-center justify-between text-sm text-muted-foreground bg-muted/20">
          <div>Showing all {users.length} registered users</div>
          <div className="flex gap-1">
            <button className="px-3 py-1 border border-input rounded-md bg-muted disabled:opacity-50" disabled>Previous</button>
            <button className="px-3 py-1 border border-input rounded-md bg-primary/10 text-primary border-primary/20">1</button>
            <button className="px-3 py-1 border border-input rounded-md bg-muted disabled:opacity-50" disabled>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
