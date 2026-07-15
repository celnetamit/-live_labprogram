"use client";

import { motion } from "framer-motion";
import { Users, FlaskConical, ShieldAlert, Activity, ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function AdminDashboard() {
  const stats = [
    { title: "Total Users", value: "24,593", change: "+12.5%", trend: "up", icon: <Users /> },
    { title: "Active Labs", value: "142", change: "+3", trend: "up", icon: <FlaskConical /> },
    { title: "Access Requests", value: "12", change: "-5", trend: "down", icon: <ShieldAlert /> },
    { title: "Active Sessions", value: "1,204", change: "+18%", trend: "up", icon: <Activity /> },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Master Control Center</h1>
        <p className="text-muted-foreground mt-1">Overview of your Panoptical Labs Ecosystem.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">{stat.title}</h3>
              <div className="text-primary p-2 bg-primary/10 rounded-lg">
                {stat.icon}
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{stat.value}</span>
              <span className={`text-xs font-medium flex items-center ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                {stat.trend === 'up' ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                {stat.change}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Access Requests */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-border flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold">Recent Access Requests</h2>
              <p className="text-sm text-muted-foreground">Pending lab authorization requests.</p>
            </div>
            <button className="text-sm text-primary font-medium hover:underline">View All</button>
          </div>
          <div className="p-0 overflow-x-auto flex-1">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground bg-muted/50 uppercase">
                <tr>
                  <th className="px-6 py-4 font-medium">User</th>
                  <th className="px-6 py-4 font-medium">Requested Lab</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  { name: "Alice Chen", role: "Researcher", lab: "AI Research Lab", date: "2 hours ago", status: "Pending" },
                  { name: "Robert Fox", role: "Student", lab: "Cyber Security Lab", date: "5 hours ago", status: "Pending" },
                  { name: "Sarah Connor", role: "Faculty", lab: "Nano Simulation Lab", date: "1 day ago", status: "Pending" },
                  { name: "John Doe", role: "Data Scientist", lab: "Biotech Research", date: "1 day ago", status: "Pending" },
                ].map((req, i) => (
                  <tr key={i} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">{req.name}</div>
                      <div className="text-xs text-muted-foreground">{req.role}</div>
                    </td>
                    <td className="px-6 py-4 font-medium">{req.lab}</td>
                    <td className="px-6 py-4 text-muted-foreground">{req.date}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20">
                        {req.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="px-3 py-1 bg-primary text-primary-foreground rounded text-xs font-medium hover:bg-primary/90">Approve</button>
                        <button className="px-3 py-1 bg-secondary text-secondary-foreground rounded text-xs font-medium hover:bg-secondary/80">Reject</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Health */}
        <div className="bg-card border border-border rounded-xl shadow-sm flex flex-col">
          <div className="p-6 border-b border-border">
            <h2 className="text-lg font-bold">System Health</h2>
            <p className="text-sm text-muted-foreground">Ecosystem status and metrics.</p>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <div className="flex justify-between mb-2 text-sm">
                <span className="font-medium">SSO Authentication</span>
                <span className="text-green-500 font-medium">99.9% Uptime</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '99%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-2 text-sm">
                <span className="font-medium">Database Load</span>
                <span className="text-amber-500 font-medium">78%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-amber-500 h-2 rounded-full" style={{ width: '78%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2 text-sm">
                <span className="font-medium">Lab Endpoints (Active)</span>
                <span className="text-foreground font-medium">138 / 142</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: '95%' }}></div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                  <Activity className="text-green-500 w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium">All Systems Operational</p>
                  <p className="text-xs text-muted-foreground">Last updated: Just now</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
