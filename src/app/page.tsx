"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Globe,
  Lock,
  Shield,
  CreditCard,
  Rocket,
  Sparkles,
  Check,
  Star,
  Plus,
  Minus,
  FlaskConical,
  LayoutDashboard,
  Zap,
  ShieldCheck,
} from "lucide-react";
import Navbar from "@/components/navbar";
import Link from "next/link";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

const stats = [
  { value: "4", label: "Premium Labs" },
  { value: "40k", label: "Active Learners" },
  { value: "99.98%", label: "Uptime SLA" },
  { value: "4", label: "Domains" },
];

const domains = [
  "cognicore.celnet.in",
  "denovo.celnet.in",
  "ai6g.celnet.in",
  "fraudshield.celnet.in",
];

const features = [
  {
    icon: CreditCard,
    title: "Sell access, your way",
    desc: "Per-lab checkout with Razorpay or admin-granted access. Users unlock exactly what they buy.",
    span: "lg:col-span-2",
    accent: "from-brand-1/20",
  },
  {
    icon: Shield,
    title: "Role-based control",
    desc: "Super Admin, managers, and users — granular permissions per lab, per person.",
    span: "",
    accent: "from-brand-2/20",
  },
  {
    icon: Globe,
    title: "Multi-domain SSO",
    desc: "One login across every subdomain in your ecosystem.",
    span: "",
    accent: "from-brand-3/20",
  },
  {
    icon: LayoutDashboard,
    title: "Master control center",
    desc: "Manage labs, users, orders and revenue from a single, real-time dashboard.",
    span: "lg:col-span-2",
    accent: "from-emerald-500/20",
  },
];

const steps = [
  { icon: FlaskConical, title: "Browse the catalog", desc: "Explore 4 labs across AI, robotics, biotech, semiconductors and more — filter by subject and level." },
  { icon: CreditCard, title: "Unlock access", desc: "Buy a lab in seconds, or get access granted by an admin. Overview is always free to explore." },
  { icon: Rocket, title: "Launch instantly", desc: "Open the live lab environment with one click, plus step-by-step instructions and starter code." },
];

const pricing = [
  { tier: "Beginner", price: "₹499", blurb: "Entry-level workshops", perks: ["Full lab resources", "Live launch link", "Starter code", "Lifetime access"], highlight: false },
  { tier: "Intermediate", price: "₹999", blurb: "Applied, hands-on labs", perks: ["Everything in Beginner", "Advanced workflows", "Priority support", "Certificate-ready"], highlight: true },
  { tier: "Advanced", price: "₹1,499", blurb: "Simulation & research", perks: ["Everything in Intermediate", "Research-grade tooling", "Collaborative labs", "Team access"], highlight: false },
];

const testimonials = [
  { quote: "We consolidated a dozen scattered lab deployments into one portal. Onboarding time dropped from days to minutes.", name: "Program Director", role: "Applied AI Institute" },
  { quote: "Per-lab access plus admin control is exactly the model we needed. Revenue is transparent and access is effortless.", name: "Operations Lead", role: "Nano Research Network" },
  { quote: "The catalog looks premium and the launch flow just works. Our learners love it.", name: "Faculty Head", role: "Robotics Academy" },
];

const faqs = [
  { q: "Can users browse labs without an account?", a: "Yes. Every lab's overview — subject, difficulty, skills and points — is public. Opening a lab's full resources and launch link requires sign-in and access." },
  { q: "How does lab access work?", a: "Access is per-lab. Users purchase a lab through self-serve checkout, or an admin grants it. Admins have access to everything by default." },
  { q: "Do you support real payments?", a: "Yes — Razorpay is built in. Without keys the platform runs a local mock checkout, so you can test the full flow before going live." },
  { q: "Can I manage everything from one place?", a: "The admin control center manages labs (pricing, availability, sync), users (roles, status, per-lab grants) and orders with live revenue — all in one dashboard." },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="glass rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="font-semibold">{q}</span>
        {open ? <Minus className="w-5 h-5 text-primary shrink-0" /> : <Plus className="w-5 h-5 text-muted-foreground shrink-0" />}
      </button>
      {open && <p className="px-5 pb-5 -mt-1 text-muted-foreground leading-relaxed">{a}</p>}
    </div>
  );
}

/* Live product-preview mockup shown in the hero */
function ProductPreview() {
  return (
    <div className="relative">
      {/* Browser frame */}
      <div className="rounded-2xl border border-border bg-card shadow-2xl shadow-primary/10 overflow-hidden">
        <div className="h-9 flex items-center gap-2 px-4 border-b border-border bg-muted/40">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-400/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/70" />
          <div className="ml-3 flex-1 h-5 rounded-md bg-background/60 border border-border max-w-[240px] flex items-center px-2">
            <span className="text-[10px] text-muted-foreground">panoptical.org/admin</span>
          </div>
        </div>
        <div className="grid grid-cols-[110px_1fr] bg-mesh">
          {/* mini sidebar */}
          <div className="border-r border-border p-3 space-y-2 hidden sm:block">
            <div className="h-6 rounded-md bg-gradient-to-r from-primary/25 to-transparent" />
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-4 rounded bg-muted/60" style={{ width: `${80 - i * 10}%` }} />
            ))}
          </div>
          {/* content */}
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-3 gap-2">
              {[
                { v: "4", l: "Labs", t: "from-brand-1/30" },
                { v: "₹499", l: "Revenue", t: "from-emerald-500/30" },
                { v: "40k", l: "Users", t: "from-brand-3/30" },
              ].map((c) => (
                <div key={c.l} className={`hairline-top rounded-lg border border-border bg-gradient-to-br ${c.t} to-card p-2`}>
                  <div className="text-sm font-extrabold">{c.v}</div>
                  <div className="text-[9px] text-muted-foreground">{c.l}</div>
                </div>
              ))}
            </div>
            {[
              { n: "Cognicore AI", s: "Computer Science", p: "₹999" },
              { n: "AI For 6G Experimental Learning", s: "Electronics", p: "₹999" },
              { n: "FraudShield AI Lab", s: "Security", p: "₹1,499" },
            ].map((r) => (
              <div key={r.n} className="flex items-center gap-2 rounded-lg border border-border bg-card p-2">
                <div className="w-7 h-7 rounded-md avatar-grad flex items-center justify-center shrink-0">
                  <FlaskConical className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-semibold truncate">{r.n}</div>
                  <div className="text-[9px] text-muted-foreground">{r.s}</div>
                </div>
                <span className="text-[10px] font-bold">{r.p}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating accent chips */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="hidden sm:flex absolute -left-6 top-16 items-center gap-2 glass rounded-xl px-3 py-2 shadow-lg"
      >
        <ShieldCheck className="w-4 h-4 text-emerald-400" />
        <span className="text-xs font-medium">Access granted</span>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="hidden sm:flex absolute -right-5 bottom-14 items-center gap-2 glass rounded-xl px-3 py-2 shadow-lg"
      >
        <Zap className="w-4 h-4 text-primary" />
        <span className="text-xs font-medium">Lab launched</span>
      </motion.div>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-grow">
        {/* ===== Hero ===== */}
        <section className="relative pt-32 pb-20 md:pt-40 overflow-hidden">
          <div className="absolute inset-0 bg-grid" />
          <div className="aurora-blob animate-aurora bg-brand-1 w-[44rem] h-[44rem] -top-52 -left-40" />
          <div className="aurora-blob animate-aurora bg-brand-3 w-[36rem] h-[36rem] -top-24 -right-40" style={{ animationDelay: "-6s" }} />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
            <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ duration: 0.6 }}>
              <span className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-sm text-muted-foreground mb-6">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_0_3px_rgba(52,211,153,0.2)]" />
                Enterprise Lab &amp; Access Management
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05] mb-6">
                Launch premium labs.<br />
                <span className="text-gradient-animated">Control every access.</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl mb-8">
                One portal for <strong className="text-foreground font-semibold">4 workshop labs</strong> across AI,
                robotics, biotech and more. Sell per-lab access, manage users and go live in minutes.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <Link href="/labs" className="px-7 py-3.5 btn-brand rounded-xl font-semibold inline-flex items-center justify-center gap-2">
                  Explore Labs <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="/register" className="px-7 py-3.5 glass rounded-xl font-semibold hover:bg-accent transition-colors text-center">
                  Get started free
                </Link>
              </div>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-400" /> No credit card to browse</span>
                <span className="inline-flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-400" /> Live in minutes</span>
              </div>
            </motion.div>

            <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ duration: 0.6, delay: 0.15 }}>
              <ProductPreview />
            </motion.div>
          </div>
        </section>

        {/* ===== Logo / domain cloud ===== */}
        <section className="border-y border-border bg-muted/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <p className="text-center text-xs uppercase tracking-widest text-muted-foreground mb-5">
              Powering labs across the network
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
              {domains.map((d) => (
                <span key={d} className="text-sm font-mono text-muted-foreground/80 hover:text-foreground transition-colors">
                  {d}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ===== Stats ===== */}
        <section id="stats" className="py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="glass brand-ring rounded-2xl grid grid-cols-2 md:grid-cols-4 divide-y divide-x divide-border/60 overflow-hidden">
              {stats.map((s, i) => (
                <motion.div key={s.label} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="p-6 md:p-8 text-center">
                  <div className="text-3xl md:text-4xl font-extrabold text-gradient">{s.value}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== Features bento ===== */}
        <section id="features" className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <span className="text-sm font-semibold text-primary uppercase tracking-wider">Platform</span>
              <h2 className="text-3xl md:text-4xl font-bold mt-2">Everything to run a lab business</h2>
              <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
                From discovery to checkout to launch — a single, cohesive system your team and learners will love.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {features.map((f, i) => (
                <motion.div
                  key={f.title}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  transition={{ delay: (i % 3) * 0.08 }}
                  className={`card-glow hairline-top rounded-2xl border border-border bg-gradient-to-br ${f.accent} to-card p-6 ${f.span}`}
                >
                  <div className="w-12 h-12 rounded-xl btn-brand flex items-center justify-center text-primary-foreground mb-4">
                    <f.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold mb-1.5">{f.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== How it works ===== */}
        <section className="py-16 md:py-24 bg-muted/20 border-y border-border">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <span className="text-sm font-semibold text-primary uppercase tracking-wider">How it works</span>
              <h2 className="text-3xl md:text-4xl font-bold mt-2">From browse to launch in three steps</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {steps.map((s, i) => (
                <motion.div key={s.title} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="relative glass rounded-2xl p-6">
                  <div className="absolute -top-3 -left-3 w-9 h-9 rounded-xl btn-brand flex items-center justify-center font-bold text-primary-foreground">
                    {i + 1}
                  </div>
                  <s.icon className="w-8 h-8 text-primary mb-4 mt-2" />
                  <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{s.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== Pricing ===== */}
        <section id="pricing" className="py-16 md:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <span className="text-sm font-semibold text-primary uppercase tracking-wider">Pricing</span>
              <h2 className="text-3xl md:text-4xl font-bold mt-2">Simple, per-lab pricing</h2>
              <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
                Pay once per lab for lifetime access. No subscriptions, no surprises — admins can grant access anytime.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 items-start">
              {pricing.map((p) => (
                <motion.div
                  key={p.tier}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  className={`relative rounded-2xl border p-6 ${
                    p.highlight
                      ? "border-primary/40 bg-gradient-to-b from-primary/10 to-card shadow-xl shadow-primary/10 md:-translate-y-3"
                      : "border-border bg-card"
                  }`}
                >
                  {p.highlight && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 pill text-primary bg-primary/10 border border-primary/20 px-3">
                      Most popular
                    </span>
                  )}
                  <h3 className="font-semibold text-lg">{p.tier}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{p.blurb}</p>
                  <div className="flex items-end gap-1 mb-6">
                    <span className="text-4xl font-extrabold text-gradient">{p.price}</span>
                    <span className="text-sm text-muted-foreground mb-1">/ lab</span>
                  </div>
                  <ul className="space-y-2.5 mb-6">
                    {p.perks.map((perk) => (
                      <li key={perk} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" /> {perk}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/labs"
                    className={`w-full inline-flex items-center justify-center py-2.5 rounded-xl font-semibold transition-colors ${
                      p.highlight ? "btn-brand" : "border border-border hover:bg-accent"
                    }`}
                  >
                    Browse {p.tier} labs
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== Testimonials ===== */}
        <section className="py-16 md:py-24 bg-muted/20 border-y border-border">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <span className="text-sm font-semibold text-primary uppercase tracking-wider">Loved by teams</span>
              <h2 className="text-3xl md:text-4xl font-bold mt-2">Built for institutions & learners</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((t, i) => (
                <motion.div key={i} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="card-glow hairline-top rounded-2xl border border-border bg-card p-6 flex flex-col">
                  <div className="flex gap-0.5 mb-4 text-amber-400">
                    {Array.from({ length: 5 }).map((_, s) => <Star key={s} className="w-4 h-4 fill-current" />)}
                  </div>
                  <p className="text-foreground/90 leading-relaxed flex-1">“{t.quote}”</p>
                  <div className="mt-5 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full avatar-grad flex items-center justify-center font-bold text-sm">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{t.name}</div>
                      <div className="text-xs text-muted-foreground">{t.role}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== FAQ ===== */}
        <section className="py-16 md:py-24">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="text-sm font-semibold text-primary uppercase tracking-wider">FAQ</span>
              <h2 className="text-3xl md:text-4xl font-bold mt-2">Questions, answered</h2>
            </div>
            <div className="space-y-3">
              {faqs.map((f) => (
                <FaqItem key={f.q} q={f.q} a={f.a} />
              ))}
            </div>
          </div>
        </section>

        {/* ===== Final CTA ===== */}
        <section className="pb-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-3xl bg-mesh border border-border p-10 md:p-16 text-center">
              <div className="aurora-blob animate-aurora bg-brand-1 w-96 h-96 -top-24 -left-10 opacity-40" />
              <div className="aurora-blob animate-aurora bg-brand-3 w-96 h-96 -bottom-24 -right-10 opacity-40" style={{ animationDelay: "-5s" }} />
              <div className="relative">
                <Sparkles className="w-8 h-8 text-primary mx-auto mb-4" />
                <h2 className="text-3xl md:text-5xl font-extrabold mb-4">
                  Ready to launch your <span className="text-gradient-animated">lab ecosystem?</span>
                </h2>
                <p className="text-muted-foreground max-w-xl mx-auto mb-8">
                  Join thousands of researchers and students accessing the world&apos;s most advanced labs from a single portal.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-3">
                  <Link href="/register" className="px-8 py-3.5 btn-brand rounded-xl font-semibold inline-flex items-center justify-center gap-2">
                    Create your account <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link href="/labs" className="px-8 py-3.5 glass rounded-xl font-semibold hover:bg-accent transition-colors">
                    Explore the catalog
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ===== Footer ===== */}
      <footer className="border-t border-border bg-muted/20 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg btn-brand flex items-center justify-center text-primary-foreground font-bold text-sm">P</div>
                <span className="font-bold text-lg">Panoptical Labs</span>
              </div>
              <p className="text-muted-foreground text-sm max-w-xs">
                A unified ecosystem for accessing, managing and discovering advanced research and educational labs.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/labs" className="hover:text-foreground transition-colors">Labs</Link></li>
                <li><Link href="/#features" className="hover:text-foreground transition-colors">Features</Link></li>
                <li><Link href="/#pricing" className="hover:text-foreground transition-colors">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm">Account</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/login" className="hover:text-foreground transition-colors">Sign in</Link></li>
                <li><Link href="/register" className="hover:text-foreground transition-colors">Register</Link></li>
                <li><Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground transition-colors">Privacy</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-border/60 flex flex-col sm:flex-row justify-between gap-3 text-sm text-muted-foreground">
            <span>© {new Date().getFullYear()} Panoptical Labs. All rights reserved.</span>
            <span className="inline-flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" /> Secured with enterprise SSO</span>
          </div>
        </div>
      </footer>
    </>
  );
}
