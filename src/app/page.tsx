"use client";

import { useState } from "react";
import { MotionConfig, motion } from "framer-motion";
import {
  ArrowRight,
  Lock,
  Check,
  Plus,
  Minus,
  FlaskConical,
  ListChecks,
  ExternalLink,
} from "lucide-react";
import Navbar from "@/components/navbar";
import AbsorptionFigure from "@/components/absorption-figure";
import EvidencePanels from "@/components/evidence-panels";
import Link from "next/link";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

/*
  There is deliberately no stats band here any more.

  It read 13 Premium Labs / 40k Active Learners / 99.98% Uptime SLA / 13
  Domains. Nothing in this repository counts learners and nothing measures
  uptime, so two of those four were invented, and a visitor has no way to
  tell which two. The page now carries one set of figures, `aboutFigures`
  below, every one of which is counted out of the guide files by a command
  written next to it.
*/

/**
 * The lab subdomains shown in the network strip. Each carries the lab's name
 * and its authored tagline so hovering the host reveals what actually lives
 * there — a bare hostname tells a visitor nothing. Blurbs are copied verbatim
 * from `src/content/labs/<slug>.ts` (`summary.tagline`); if a tagline is
 * rewritten there, update it here too rather than paraphrasing.
 */
type LabDomain = { host: string; name: string; blurb: string };

const domains: LabDomain[] = [
  {
    host: "cognicore.live-labs.org",
    name: "Cognicore AI",
    blurb:
      "Summarise a contract, compare two drafts, and search a whole pile of documents by meaning rather than keyword.",
  },
  {
    host: "denovo.live-labs.org",
    name: "Denovo GenAI Lab",
    blurb:
      "Design a molecule that has never existed — and find out exactly where the AI stops being trustworthy.",
  },
  {
    host: "ai6g.live-labs.org",
    name: "AI for 6G",
    blurb:
      "The three ideas behind 6G — smart surfaces, sending meaning instead of bits — each with a simulator you can push until it fails.",
  },
  {
    host: "fraudshield.live-labs.org",
    name: "FraudShield AI Lab",
    blurb:
      "Score live transactions for fraud, tune the threshold, then attack your own detector to see how it breaks.",
  },
  {
    host: "logic.live-labs.org",
    name: "LogicLab AI",
    blurb:
      "Describe a chip in plain English, get working Verilog back, and learn to read what it produced.",
  },
  {
    host: "micro.live-labs.org",
    name: "MicrobeAI BioLab",
    blurb:
      "Read the DNA of a whole microbial community, then run the digester those microbes live in and watch what makes it fail.",
  },
  {
    host: "battery.live-labs.org",
    name: "Battery Circularity AI",
    blurb:
      "Decide what happens to a retired EV battery: a second life powering something else, or the shredder.",
  },
  {
    host: "virtual.live-labs.org",
    name: "XRD Virtual Laboratory",
    blurb:
      "Run a real X-ray diffraction experiment: mount a powder, scan it, and measure how big its crystals are.",
  },
  {
    host: "smartfactory.live-labs.org",
    name: "SmartFactory AI",
    blurb:
      "Find the bottleneck on a production line, predict a breakdown before it happens, and work out what the fix is worth.",
  },
  {
    host: "aiprogram.live-labs.org",
    name: "AI Program Navigator",
    blurb:
      "Not sure where to start? Describe your background and get a route through the catalogue built for you.",
  },
  {
    host: "drug.live-labs.org",
    name: "RepurposeAI: Drug Discovery Lab",
    blurb:
      "Map drugs, genes and diseases as one graph, then predict the connections nobody has recorded yet.",
  },
  {
    host: "metamaterial.live-labs.org",
    name: "Pioneering Acoustic Metamaterials",
    blurb:
      "Design a lattice that blocks sound by its shape rather than its thickness — and check a printer could actually make it.",
  },
  {
    host: "omicslab.live-labs.org",
    name: "OmicsLab Pro",
    blurb:
      "Analyse real single-cell and spatial transcriptomics data the way a lab does: a versioned pipeline, your own interpretation, and a report that shows its working.",
  },
];


const steps = [
  { icon: FlaskConical, title: "Read the whole guide first", desc: "Objective, every step, the result each one should produce, the known failure modes and the sources — all of it public, before you sign in or pay for anything." },
  { icon: Lock, title: "Open the lab", desc: "Sign in and open the environment in a new tab. Access is per lab, either granted by an administrator or bought on its own." },
  { icon: ListChecks, title: "Work it and check yourself", desc: "Follow the steps beside the running lab, compare what you see against what the guide says you should see, and use the troubleshooting entries when the two disagree." },
];

/**
 * The About section.
 *
 * Every figure and example here was counted out of `src/content/labs/*.ts`
 * rather than estimated, and each is re-derivable in one command:
 *
 *   steps          grep -rhoE "^\s*goal:"    src/content/labs/*.ts | wc -l   -> 104
 *   expected       grep -rhoE "^\s*expect:"  src/content/labs/*.ts | wc -l   -> 104
 *   troubleshoot   grep -rhoE "^\s*problem:" src/content/labs/*.ts | wc -l   ->  71
 *   sources        grep -rho  "href:"         src/content/labs/*.ts | wc -l   ->  46
 *
 * Re-run them when guides are added, or the numbers rot the way the "12 labs"
 * elsewhere on this page has. Note there is deliberately no lab COUNT here:
 * this file says 12 in some places and 13 in others, and the catalogue is
 * whatever the database has enabled, which this client component cannot see.
 */
const aboutFigures = [
  { v: "7", l: "subject areas" },
  { v: "104", l: "guided steps" },
  { v: "71", l: "troubleshooting fixes" },
  { v: "46", l: "cited sources" },
];


/*
  The testimonial section is gone and its data with it.

  It carried three five-star quotes from a "Program Director, Applied AI
  Institute", an "Operations Lead, Nano Research Network" and a "Faculty
  Head, Robotics Academy". None of those reviews were collected from anyone.
  The slot now states how access works, which is the thing a visitor
  evaluating this platform actually needs and which we can say truthfully.
*/
const accessTerms = [
  {
    title: "Free to read, in full",
    desc: "Every lab page lists its objective, all of its steps, the result each step should produce, its troubleshooting entries and its sources. No account, no email, no trial clock.",
  },
  {
    title: "One lab at a time",
    desc: "Access is granted per lab, by an administrator or by buying that lab. Nothing auto-renews, and buying one lab does not quietly enrol you in the rest.",
  },
  {
    title: "Levels are earned, not sold twice",
    desc: "Basic and Moderate open as you complete the work inside a lab. Where a lab has an Advanced tier it is stated on the lab page, with what it adds.",
  },
  {
    title: "What a completion is",
    desc: "Finishing a lab records your own completion against your account. It is a record of work done on this platform — we do not describe it as an accredited qualification, because it is not one.",
  },
];

const faqs = [
  { q: "What do I actually need to run these?", a: "A desktop browser. Nothing is installed and no data is downloaded. A few labs want WebGL for their 3D views, and one offers an optional microphone step; each lab page says so on its own page before you start." },
  { q: "Do I need an account to see what a lab contains?", a: "No. The objective, every guided step, the expected result for each one, the troubleshooting list and the sources are all public. Signing in is what opens the lab environment itself." },
  { q: "Is any of this generated by a language model?", a: "The scientific results are not. Each lab computes them in its own engine — the diffraction simulator, the acoustic solver, the digester model, the Verilog simulator. Where a model does write, it writes explanation, and it is called through the hub so no lab ships an API key to your browser." },
  { q: "What happens when a lab's answer and mine disagree?", a: "That is the designed case. Steps state the expected result so the disagreement surfaces where it happened, and the guides carry 71 troubleshooting entries written from the places people actually get stuck." },
  { q: "Where are the labs hosted, and can I use them outside India?", a: "Each lab runs on its own subdomain of live-labs.org and is reachable anywhere. The interface is English; pricing is shown in the currency your account is billed in." },
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


/**
 * One entry in the network strip: a real link to the lab, with a card that
 * appears on hover naming the lab and what it does.
 *
 * The card is CSS-only (`group-hover` / `group-focus-within`) rather than
 * React state — it has no behaviour beyond appearing, and keeping it out of
 * state means no re-render per pointer move and nothing to hydrate. It is
 * `pointer-events-none` so it can never sit between the cursor and the link,
 * and `aria-hidden` because it only repeats what the link's own label says;
 * keyboard users get the same card via `focus-within`.
 *
 * Below `sm` it is not rendered at all: there is no hover on touch, and a
 * centred card on the first or last chip of the row would push the page
 * sideways.
 */
function DomainLink({ host, name, blurb }: LabDomain) {
  return (
    <div className="relative group">
      <a
        href={`https://${host}/`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${name} — ${host} (opens in a new tab)`}
        className="group/host inline-flex flex-col gap-0.5 rounded px-1 py-1.5 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary/50"
      >
        <span className="text-sm font-medium text-foreground/85 transition-colors group-hover/host:text-primary-ink">{name}</span>
        <span className="text-[11px] text-muted-foreground/70">{host}</span>
      </a>

      <div
        role="presentation"
        aria-hidden="true"
        className="pointer-events-none absolute bottom-full left-1/2 z-40 mb-3 hidden w-64 md:w-72 -translate-x-1/2 translate-y-1 rounded-xl glass p-3.5 text-left opacity-0 shadow-2xl shadow-black/25 transition-all duration-150 ease-out sm:block group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100"
      >
        <div className="flex items-start gap-2.5">
          <span className="w-8 h-8 shrink-0 rounded-lg btn-brand flex items-center justify-center text-primary-foreground">
            <FlaskConical className="w-4 h-4" />
          </span>
          <div className="min-w-0">
            <div className="text-sm font-semibold leading-snug text-foreground">{name}</div>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{blurb}</p>
          </div>
        </div>
        <div className="mt-3 pt-2.5 border-t border-border/60 flex items-center gap-1.5 text-[11px] font-mono text-primary">
          <ExternalLink className="w-3 h-3 shrink-0" />
          <span className="truncate">https://{host}/</span>
        </div>
        {/* Arrow pointing back down at the hostname. */}
        <span className="absolute left-1/2 top-full -mt-[5px] -translate-x-1/2 rotate-45 w-2.5 h-2.5 rounded-[2px] bg-card border-r border-b border-border/70" />
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <>
      {/* `reducedMotion="user"` makes framer-motion drop transforms and
          fades for anyone whose OS asks for reduced motion — it does not do
          this on its own. Every reveal on this page is decorative, so none
          of them should run for someone who has turned motion off. */}
      <MotionConfig reducedMotion="user">
      <Navbar />
      <main id="main" className="flex-grow">
        {/* ===== Hero ===== */}
        <section className="band-ink relative pt-28 pb-16 md:pt-32 md:pb-24 overflow-hidden">
          {/* Was two animated 40rem colour blobs over a grid. On a light
              surface that is the whole page turning blue behind the words. */}
          <div className="absolute inset-0 bg-grid opacity-60" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* The headline gets the full measure of the page rather than half
                of it: at the size it wants to be, a two-column hero broke
                "Instruments you / drive," across a line. */}
            <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ duration: 0.6 }}>
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-white/5 px-3.5 py-1.5 text-sm text-muted-foreground mb-7">
                <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--color-success-ink)]" />
                13 laboratories · 7 subject areas
              </span>
              <h1 className="text-[2.6rem] sm:text-6xl lg:text-7xl xl:text-[5.25rem] font-bold tracking-[-0.04em] leading-[0.95] mb-8 max-w-[18ch]">
                Instruments you drive,{" "}
                <span className="text-gradient">not courses you watch.</span>
              </h1>
            </motion.div>

            <div className="grid lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] gap-10 lg:gap-16 items-center">
              <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ duration: 0.6, delay: 0.08 }}>
                <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-[46ch]">
                  Browser laboratories in biology, materials, physics, electronics and security.
                  Each one computes its results in its own engine, states what you should see at
                  every step, and cites where the science came from.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 mb-7">
                  <Link href="/labs" className="px-7 py-3.5 btn-brand rounded-xl font-semibold inline-flex items-center justify-center gap-2">
                    Browse the laboratories <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link href="#evidence" className="px-7 py-3.5 rounded-xl border border-border bg-white/5 font-semibold hover:bg-white/10 transition-colors text-center">
                    How a lab works
                  </Link>
                </div>
                {/* `flex`, not `inline-flex`: as inline items these two ran
                    together on one line at tablet width, with `space-y`
                    silently doing nothing. */}
                <ul className="space-y-2.5 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2.5"><Check className="w-4 h-4 mt-0.5 shrink-0 text-[color:var(--color-success-ink)]" /><span>Full guides readable without an account</span></li>
                  <li className="flex items-start gap-2.5"><Check className="w-4 h-4 mt-0.5 shrink-0 text-[color:var(--color-success-ink)]" /><span>Access granted per lab, nothing recurring</span></li>
                </ul>
              </motion.div>

              {/* A real result, computed by one of the labs, rather than a
                  picture of a dashboard. */}
              <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ duration: 0.6, delay: 0.16 }}>
                <AbsorptionFigure />
              </motion.div>
            </div>
          </div>
          </section>

        {/* ===== Logo / domain cloud ===== */}
        {/* `overflow-x-clip` (not `hidden`) because a hover card centred on the
            first or last chip of a wrapped row can reach past the viewport edge
            on a narrow window. Clipping only the inline axis kills the stray
            horizontal scrollbar while still letting the card overflow upwards
            out of the strip, which `overflow-hidden` would cut off. */}
        <section className="border-y border-border bg-muted/20 overflow-x-clip">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <p className="text-center text-xs uppercase tracking-widest text-muted-foreground mb-5">
              Each laboratory runs on its own subdomain
            </p>
            {/* Tighter on a phone, so short hostnames share a line instead of
                stacking twelve deep. */}
            <div className="flex flex-wrap items-start justify-center gap-x-8 gap-y-3 sm:gap-x-11">
              {domains.map((d) => (
                <DomainLink key={d.host} {...d} />
              ))}
            </div>
          </div>
        </section>

        {/* ===== Evidence ===== */}
        {/* Four claims, each sitting next to the artefact that backs it —
            the device the whole page turns on. Replaces a feature grid and
            a separate "about" row-stack that made the same points twice
            without showing either of them. */}
        <section id="evidence" className="scroll-mt-24 py-16 md:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-10 md:mb-14">
              <span className="text-xs font-semibold text-primary-ink uppercase tracking-[0.12em]">What you are getting</span>
              <h2 className="text-3xl md:text-[2.75rem] font-bold tracking-[-0.03em] leading-[1.08] mt-3 text-balance">
                Built to be checked, not just followed
              </h2>
              <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
                Four things that hold for every laboratory here. Each one is shown next to the
                thing that proves it, quoted from the guides themselves.
              </p>
            </div>
            <EvidencePanels />
          </div>
        </section>

        {/* ===== How it works ===== */}
        <section className="py-16 md:py-24 bg-muted/20 border-y border-border">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-12">
              <span className="text-xs font-semibold text-primary-ink uppercase tracking-[0.12em]">How it works</span>
              <h2 className="text-3xl md:text-[2.5rem] font-bold tracking-[-0.025em] leading-[1.1] mt-3">Read it, open it, check yourself against it</h2>
            </div>
            {/* Numbered rows on a rule rather than three cards: the three
                beats are sequential, and cards gave them no order. */}
            <ol className="border-t border-border">
              {steps.map((s, i) => (
                <motion.li
                  key={s.title}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  className="grid sm:grid-cols-[3.5rem_minmax(0,16rem)_minmax(0,1fr)] gap-x-6 gap-y-2 border-b border-border py-7"
                >
                  <span className="text-2xl font-semibold tabular-nums text-muted-foreground/70">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-lg font-semibold tracking-tight self-start">{s.title}</h3>
                  <p className="text-muted-foreground leading-relaxed sm:pt-0.5">{s.desc}</p>
                </motion.li>
              ))}
            </ol>
          </div>
        </section>

        {/* ===== The counted figures ===== */}
        {/* The About section that was here made the same three arguments the
            evidence panels now make, with no artefact beside them. Its one
            irreplaceable part was this band — every figure counted out of the
            guide modules, see `aboutFigures`. */}
        <section id="about" className="scroll-mt-24 pb-16 md:pb-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <dl className="grid grid-cols-2 md:grid-cols-4 gap-px overflow-hidden rounded-2xl border border-border bg-border elev-1">
              {aboutFigures.map((f) => (
                <div key={f.l} className="bg-card px-6 py-7 text-center">
                  <dt className="sr-only">{f.l}</dt>
                  <dd>
                    <span className="block text-3xl md:text-4xl font-bold tracking-[-0.03em] tabular-nums">{f.v}</span>
                    <span className="mt-1 block text-sm text-muted-foreground">{f.l}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ===== Access terms ===== */}
        <section id="access" className="scroll-mt-24 py-16 md:py-24 bg-muted/20 border-y border-border">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-12">
              <span className="text-sm font-semibold text-primary-ink uppercase tracking-wider">Access</span>
              <h2 className="text-3xl md:text-4xl font-bold mt-2">What you get, and what it costs you</h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Written out here rather than left to the checkout page, because deciding
                whether to trust a platform should not require reaching for a card first.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-x-10 gap-y-8">
              {accessTerms.map((t, i) => (
                <motion.div key={t.title} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} transition={{ delay: i * 0.06 }}>
                  <h3 className="font-semibold mb-2">{t.title}</h3>
                  <p className="text-muted-foreground leading-relaxed text-[15px]">{t.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== FAQ ===== */}
        <section className="py-16 md:py-24">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-10">
              <span className="text-xs font-semibold text-primary-ink uppercase tracking-[0.12em]">FAQ</span>
              <h2 className="text-3xl md:text-[2.5rem] font-bold tracking-[-0.025em] leading-[1.1] mt-3">Questions, answered</h2>
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
              <div className="relative">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Start with the guide, not the sales page
                </h2>
                {/* "Join thousands of researchers and students" was here. We
                    do not publish a user count, so we cannot invoke one. */}
                <p className="text-muted-foreground max-w-xl mx-auto mb-8">
                  Open any laboratory and read it end to end — every step, every expected
                  result, every source — before you decide whether it is worth your afternoon.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-3">
                  <Link href="/labs" className="px-8 py-3.5 btn-brand rounded-xl font-semibold inline-flex items-center justify-center gap-2">
                    Browse the laboratories <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link href="/register" className="px-8 py-3.5 rounded-xl border border-border bg-card font-semibold hover:bg-accent transition-colors">
                    Create an account
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
                <div className="w-8 h-8 rounded-lg btn-brand flex items-center justify-center text-primary-foreground font-bold text-sm">L</div>
                <span className="font-bold text-lg">Live Labs</span>
              </div>
              <p className="text-muted-foreground text-sm max-w-xs">
                Browser laboratories in biology, materials, physics, electronics and security —
                each one computing its own results, and saying what you should see at every step.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/labs" className="hover:text-foreground transition-colors">Labs</Link></li>
                <li><Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link></li>
                <li><Link href="/#features" className="hover:text-foreground transition-colors">Features</Link></li>
                <li><Link href="/#about" className="hover:text-foreground transition-colors">About</Link></li>
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
                {/* These were href="#". A dead legal link is one of the things a
                    payment gateway reviewer records as a missing policy. */}
                <li><Link href="/privacy-policy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms-of-service" className="hover:text-foreground transition-colors">Terms &amp; Conditions</Link></li>
                <li><Link href="/return-refund-cancellation" className="hover:text-foreground transition-colors">Refunds &amp; Cancellation</Link></li>
                <li><Link href="/disclaimer" className="hover:text-foreground transition-colors">Disclaimer</Link></li>
                <li><Link href="/contact-us" className="hover:text-foreground transition-colors">Contact Us</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-border/60 flex flex-col sm:flex-row justify-between gap-3 text-sm text-muted-foreground">
            <span>© {new Date().getFullYear()} Live Labs. All rights reserved.</span>
            <span className="inline-flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" /> Google sign-in supported</span>
          </div>
        </div>
      </footer>
    </MotionConfig>
    </>
  );
}
