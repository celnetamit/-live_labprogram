import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { Settings, Shield, Globe, Mail, Key, BellRing, Save } from "lucide-react";

export default async function AdminSettings() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    redirect("/login");
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
        <p className="text-muted-foreground mt-1">Configure global platform behavior, integrations, and security policies.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-8">
        {/* Settings Navigation Sidebar */}
        <div className="space-y-1">
          <button className="w-full flex items-center gap-3 px-3 py-2 bg-primary/10 text-primary font-medium rounded-lg transition-colors text-left">
            <Globe className="w-4 h-4" /> General
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg transition-colors text-left">
            <Shield className="w-4 h-4" /> Security & Auth
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg transition-colors text-left">
            <Mail className="w-4 h-4" /> Email & SMTP
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg transition-colors text-left">
            <Key className="w-4 h-4" /> API Keys
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg transition-colors text-left">
            <BellRing className="w-4 h-4" /> Webhooks
          </button>
        </div>

        {/* Settings Content Area */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border bg-muted/20">
              <h2 className="text-xl font-semibold">General Configuration</h2>
              <p className="text-sm text-muted-foreground mt-1">Basic platform identity and display settings.</p>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="space-y-2 max-w-lg">
                <label className="text-sm font-medium">Platform Name</label>
                <input 
                  type="text" 
                  defaultValue="Panoptical Labs Ecosystem" 
                  className="w-full px-4 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring" 
                />
                <p className="text-xs text-muted-foreground">The name displayed in the browser tab and email templates.</p>
              </div>
              
              <div className="space-y-2 max-w-lg">
                <label className="text-sm font-medium">Support Email Address</label>
                <input 
                  type="email" 
                  defaultValue="support@panoptical.ai" 
                  className="w-full px-4 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring" 
                />
              </div>

              <div className="space-y-3 pt-4 border-t border-border">
                <h3 className="text-sm font-semibold">Platform Access</h3>
                
                <label className="flex items-start gap-3 p-3 border border-border rounded-lg bg-muted/10 cursor-pointer hover:bg-muted/30 transition-colors">
                  <div className="pt-0.5">
                    <input type="checkbox" defaultChecked className="w-4 h-4 accent-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Allow public registration</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Anyone can create an account via the /register route.</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 border border-border rounded-lg bg-muted/10 cursor-pointer hover:bg-muted/30 transition-colors">
                  <div className="pt-0.5">
                    <input type="checkbox" defaultChecked className="w-4 h-4 accent-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Require admin approval for all labs</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Even public labs will require an access request flow.</p>
                  </div>
                </label>
              </div>
            </div>
            
            <div className="p-4 border-t border-border bg-muted/30 flex justify-end">
              <button className="px-4 py-2 bg-primary text-primary-foreground font-medium rounded-lg text-sm hover:bg-primary/90 transition-colors flex items-center">
                <Save className="w-4 h-4 mr-2" /> Save Configuration
              </button>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border bg-muted/20">
              <h2 className="text-xl font-semibold">Maintenance Mode</h2>
              <p className="text-sm text-muted-foreground mt-1">Temporarily disable access for non-admin users.</p>
            </div>
            <div className="p-6 flex items-center justify-between">
              <div>
                <p className="font-medium">Enable Maintenance Mode</p>
                <p className="text-sm text-muted-foreground max-w-md mt-1">
                  Active sessions will be terminated. Only SUPER_ADMIN accounts will be able to log in and access the dashboard.
                </p>
              </div>
              <button className="px-4 py-2 border border-input bg-background hover:bg-muted font-medium rounded-lg text-sm transition-colors">
                Enable Mode
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
