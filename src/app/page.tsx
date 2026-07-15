"use client";

import { motion } from "framer-motion";
import { ArrowRight, Globe, Lock, Shield, Layers, Users, Cpu, Database, Activity } from "lucide-react";
import Navbar from "@/components/navbar";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
                The Next Generation of <br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
                  Lab & Access Management
                </span>
              </h1>
              <p className="mt-4 text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-10">
                A single unified platform for discovering programs, courses, and securely accessing externally deployed labs across multiple domains.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                <Link href="/register" className="w-full sm:w-auto px-8 py-4 bg-primary text-primary-foreground rounded-lg font-medium text-lg hover:bg-primary/90 transition-all flex items-center justify-center">
                  Explore Ecosystem <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <Link href="/admin" className="w-full sm:w-auto px-8 py-4 bg-secondary text-secondary-foreground rounded-lg font-medium text-lg hover:bg-secondary/80 transition-all">
                  Admin Demo
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features / Value Props */}
        <section className="py-20 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold">Unified Enterprise Architecture</h2>
              <p className="mt-4 text-muted-foreground">Manage hundreds of independently deployed labs through one central hub.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Shield className="w-10 h-10 text-primary" />,
                  title: "Centralized SSO",
                  desc: "Register once. Login once. Access authorized resources across the entire ecosystem without needing separate credentials."
                },
                {
                  icon: <Lock className="w-10 h-10 text-primary" />,
                  title: "Role-Based Access Control",
                  desc: "Granular permissions allow administrators to grant or revoke lab access for individual users or entire groups."
                },
                {
                  icon: <Globe className="w-10 h-10 text-primary" />,
                  title: "Multi-Domain Support",
                  desc: "Connect seamlessly to labs deployed on ai.panoptical.org, cyber.panoptical.org, and hundreds of other subdomains."
                }
              ].map((feature, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="glassmorphism p-8 rounded-2xl hover:-translate-y-1 transition-transform duration-300"
                >
                  <div className="mb-4 bg-primary/10 w-16 h-16 rounded-xl flex items-center justify-center">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Labs */}
        <section id="labs" className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-3xl font-bold">Featured Innovation Labs</h2>
                <p className="mt-2 text-muted-foreground">Discover state-of-the-art research environments.</p>
              </div>
              <Link href="/labs" className="text-primary hover:underline font-medium flex items-center hidden sm:flex">
                View All Labs <ArrowRight className="ml-1 w-4 h-4" />
              </Link>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { name: "AI Research Lab", cat: "Artificial Intelligence", domain: "ai.panoptical.org", icon: <Cpu />, color: "from-blue-500/20 to-purple-500/20" },
                { name: "Nano Simulation Lab", cat: "Nanotechnology", domain: "nano.panoptical.org", icon: <Layers />, color: "from-emerald-500/20 to-teal-500/20" },
                { name: "Cyber Security Lab", cat: "Security", domain: "cyber.panoptical.org", icon: <Shield />, color: "from-red-500/20 to-orange-500/20" },
                { name: "Data Science Hub", cat: "Data Analytics", domain: "data.panoptical.org", icon: <Database />, color: "from-yellow-500/20 to-amber-500/20" },
                { name: "Biotech Research", cat: "Bio-Engineering", domain: "biotech.panoptical.org", icon: <Activity />, color: "from-green-500/20 to-emerald-500/20" },
                { name: "Robotics Testing", cat: "Robotics", domain: "robotics.panoptical.org", icon: <Users />, color: "from-indigo-500/20 to-blue-500/20" },
              ].map((lab, i) => (
                <div key={i} className="group relative rounded-xl border border-border bg-card overflow-hidden hover:border-primary/50 transition-colors">
                  <div className={`h-32 bg-gradient-to-br ${lab.color} flex items-center justify-center`}>
                    <div className="p-4 bg-background/50 backdrop-blur-md rounded-full shadow-sm text-foreground">
                      {lab.icon}
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">{lab.cat}</div>
                    <h3 className="text-xl font-bold mb-1 group-hover:text-primary transition-colors">{lab.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{lab.domain}</p>
                    <button className="w-full py-2 bg-secondary text-secondary-foreground rounded-md text-sm font-medium hover:bg-secondary/80 transition-colors">
                      Request Access
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-muted/20 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs">P</div>
              <span className="font-bold text-lg">Panoptical Labs</span>
            </div>
            <p className="text-muted-foreground text-sm max-w-xs">
              A unified ecosystem for accessing, managing, and discovering advanced research and educational programs.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-foreground">Programs</Link></li>
              <li><Link href="#" className="hover:text-foreground">Labs</Link></li>
              <li><Link href="#" className="hover:text-foreground">Courses</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-foreground">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-foreground">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
      </footer>
    </>
  );
}
