"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Globe,
  Lock,
  Shield,
  Layers,
  Users,
  Cpu,
  Database,
  Activity,
  Sparkles,
} from "lucide-react";
import Navbar from "@/components/navbar";
import Link from "next/link";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

const features = [
  {
    icon: Shield,
    title: "Centralized SSO",
    desc: "Register once. Login once. Access authorized resources across the entire ecosystem without juggling separate credentials.",
  },
  {
    icon: Lock,
    title: "Role-Based Access Control",
    desc: "Granular permissions let administrators grant or revoke lab access for individual users or entire groups in seconds.",
  },
  {
    icon: Globe,
    title: "Multi-Domain Support",
    desc: "Connect seamlessly to labs deployed on ai.panoptical.org, cyber.panoptical.org, and hundreds of other subdomains.",
  },
];

const stats = [
  { value: "120+", label: "Deployed Labs" },
  { value: "40k", label: "Active Learners" },
  { value: "99.98%", label: "Uptime SLA" },
  { value: "24", label: "Domains" },
];

const labs = [
  { name: "AI Research Lab", cat: "Artificial Intelligence", domain: "ai.panoptical.org", icon: Cpu, color: "from-violet-500/25 to-indigo-500/10" },
  { name: "Nano Simulation Lab", cat: "Nanotechnology", domain: "nano.panoptical.org", icon: Layers, color: "from-emerald-500/25 to-teal-500/10" },
  { name: "Cyber Security Lab", cat: "Security", domain: "cyber.panoptical.org", icon: Shield, color: "from-rose-500/25 to-orange-500/10" },
  { name: "Data Science Hub", cat: "Data Analytics", domain: "data.panoptical.org", icon: Database, color: "from-amber-500/25 to-yellow-500/10" },
  { name: "Biotech Research", cat: "Bio-Engineering", domain: "biotech.panoptical.org", icon: Activity, color: "from-green-500/25 to-emerald-500/10" },
  { name: "Robotics Testing", cat: "Robotics", domain: "robotics.panoptical.org", icon: Users, color: "from-blue-500/25 to-cyan-500/10" },
];

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-grow">
        {/* Hero */}
        <section className="relative pt-36 pb-24 md:pt-52 md:pb-36 overflow-hidden">
          <div className="absolute inset-0 bg-grid" />
          <div className="aurora-blob animate-aurora bg-brand-1 w-[42rem] h-[42rem] -top-40 -left-40" />
          <div className="aurora-blob animate-aurora bg-brand-3 w-[36rem] h-[36rem] top-10 -right-32" style={{ animationDelay: "-6s" }} />
          <div className="aurora-blob animate-aurora bg-brand-2 w-[30rem] h-[30rem] top-40 left-1/3 opacity-30" style={{ animationDelay: "-3s" }} />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ duration: 0.6 }}>
              <span className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-sm text-muted-foreground mb-8">
                <Sparkles className="w-4 h-4 text-primary" />
                Enterprise Lab &amp; Access Management
              </span>
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight mb-6 leading-[1.05]">
                The Next Generation of <br className="hidden md:block" />
                <span className="text-gradient">Lab &amp; Access Management</span>
              </h1>
              <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
                A single unified platform for discovering programs, courses, and securely
                accessing externally deployed labs across multiple domains.
              </p>

              <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                <Link
                  href="/labs"
                  className="w-full sm:w-auto px-7 py-3.5 btn-brand rounded-xl font-semibold text-base inline-flex items-center justify-center gap-2"
                >
                  Explore Labs <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/login"
                  className="w-full sm:w-auto px-7 py-3.5 glass rounded-xl font-semibold text-base hover:bg-accent transition-colors"
                >
                  Sign In
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Stats band */}
        <section id="stats" className="relative -mt-8 pb-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="glass brand-ring rounded-2xl grid grid-cols-2 md:grid-cols-4 divide-y divide-x divide-border/60 overflow-hidden">
              {stats.map((s, i) => (
                <motion.div
                  key={s.label}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.5 }}
                  className="p-6 md:p-8 text-center"
                >
                  <div className="text-3xl md:text-4xl font-extrabold text-gradient">{s.value}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold">Unified Enterprise Architecture</h2>
              <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
                Manage hundreds of independently deployed labs through one central hub.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {features.map((f, i) => (
                <motion.div
                  key={f.title}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="group glass rounded-2xl p-8 hover:-translate-y-1.5 transition-all duration-300 hover:glow-primary"
                >
                  <div className="mb-5 btn-brand w-14 h-14 rounded-2xl flex items-center justify-center text-primary-foreground group-hover:scale-105 transition-transform">
                    <f.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Labs */}
        <section id="labs" className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap justify-between items-end gap-4 mb-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold">Featured Innovation Labs</h2>
                <p className="mt-2 text-muted-foreground">Discover state-of-the-art research environments.</p>
              </div>
              <Link href="/labs" className="text-primary hover:underline font-medium inline-flex items-center gap-1">
                View All Labs <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {labs.map((lab, i) => (
                <motion.div
                  key={lab.name}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  transition={{ delay: (i % 3) * 0.08, duration: 0.5 }}
                  className="group relative rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
                >
                  <div className={`h-32 bg-gradient-to-br ${lab.color} flex items-center justify-center relative`}>
                    <div className="absolute inset-0 bg-grid opacity-40" />
                    <div className="relative p-4 glass rounded-2xl text-foreground group-hover:scale-110 transition-transform">
                      <lab.icon className="w-7 h-7" />
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">{lab.cat}</div>
                    <h3 className="text-xl font-bold mb-1 group-hover:text-primary transition-colors">{lab.name}</h3>
                    <p className="text-sm text-muted-foreground mb-5 font-mono">{lab.domain}</p>
                    <Link
                      href="/labs"
                      className="w-full inline-flex items-center justify-center py-2.5 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      View Labs
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden glass brand-ring rounded-3xl p-10 md:p-16 text-center">
              <div className="aurora-blob animate-aurora bg-brand-1 w-96 h-96 -top-24 -left-10 opacity-40" />
              <div className="aurora-blob animate-aurora bg-brand-3 w-96 h-96 -bottom-24 -right-10 opacity-40" style={{ animationDelay: "-5s" }} />
              <div className="relative">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to unify your ecosystem?</h2>
                <p className="text-muted-foreground max-w-xl mx-auto mb-8">
                  Join thousands of researchers and students accessing the world&apos;s most advanced labs from a single portal.
                </p>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 px-8 py-3.5 btn-brand rounded-xl font-semibold text-base"
                >
                  Create your account <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-muted/20 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg btn-brand flex items-center justify-center text-primary-foreground font-bold text-sm">P</div>
              <span className="font-bold text-lg">Panoptical Labs</span>
            </div>
            <p className="text-muted-foreground text-sm max-w-xs">
              A unified ecosystem for accessing, managing, and discovering advanced research and educational programs.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#features" className="hover:text-foreground transition-colors">Programs</Link></li>
              <li><Link href="#labs" className="hover:text-foreground transition-colors">Labs</Link></li>
              <li><Link href="/register" className="hover:text-foreground transition-colors">Courses</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 pt-6 border-t border-border/60 text-sm text-muted-foreground">
          © {new Date().getFullYear()} Panoptical Labs. All rights reserved.
        </div>
      </footer>
    </>
  );
}
