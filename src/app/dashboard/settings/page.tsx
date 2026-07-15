import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { User, Mail, Building, Briefcase, Shield, Key, Bell, CreditCard, LogOut } from "lucide-react";
import Link from "next/link";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! }
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="max-w-4xl mx-auto p-6 pt-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your profile, preferences, and platform security.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-8">
        {/* Sidebar Navigation */}
        <div className="space-y-1">
          <Link href="/dashboard/settings" className="flex items-center gap-3 px-3 py-2 bg-primary/10 text-primary font-medium rounded-lg transition-colors">
            <User className="w-4 h-4" /> Profile Details
          </Link>
          <Link href="#" className="flex items-center gap-3 px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg transition-colors">
            <Shield className="w-4 h-4" /> Security
          </Link>
          <Link href="#" className="flex items-center gap-3 px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg transition-colors">
            <Bell className="w-4 h-4" /> Notifications
          </Link>
          <Link href="#" className="flex items-center gap-3 px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg transition-colors">
            <CreditCard className="w-4 h-4" /> Billing & Subscriptions
          </Link>
          <div className="pt-4 mt-4 border-t border-border">
            <Link href="/api/auth/signout" className="flex items-center gap-3 px-3 py-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
              <LogOut className="w-4 h-4" /> Sign Out
            </Link>
          </div>
        </div>

        {/* Main Settings Content */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-semibold">Personal Information</h2>
              <p className="text-sm text-muted-foreground mt-1">Update your personal details and public profile.</p>
            </div>
            
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input type="text" defaultValue={user.name || ""} className="w-full pl-9 pr-4 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input type="email" defaultValue={user.email || ""} disabled className="w-full pl-9 pr-4 py-2 bg-muted border border-input rounded-md text-sm opacity-70 cursor-not-allowed" />
                  </div>
                  <p className="text-xs text-muted-foreground">Email addresses cannot be changed directly.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Organization / University</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input type="text" defaultValue={user.organization || ""} placeholder="e.g. MIT, Stanford, Acme Corp" className="w-full pl-9 pr-4 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Role / Designation</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input type="text" defaultValue={user.designation || ""} placeholder="e.g. Researcher, Student" className="w-full pl-9 pr-4 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-muted/30 border-t border-border flex justify-end">
              <button className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors">
                Save Changes
              </button>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-red-500">Danger Zone</h2>
                <p className="text-sm text-muted-foreground mt-1">Irreversible actions concerning your account.</p>
              </div>
            </div>
            <div className="p-6 flex items-center justify-between">
              <div>
                <h3 className="font-medium">Delete Account</h3>
                <p className="text-sm text-muted-foreground max-w-md mt-1">
                  Once you delete your account, there is no going back. All your access requests and historical lab instances will be destroyed.
                </p>
              </div>
              <button className="px-4 py-2 bg-destructive/10 text-destructive border border-destructive/20 text-sm font-medium rounded-lg hover:bg-destructive hover:text-destructive-foreground transition-colors">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
