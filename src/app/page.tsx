"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Lock,
  Check,
  Plus,
  Minus,
  FlaskConical,
  ListChecks,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import Navbar from "@/components/navbar";
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

const features = [
  {
    icon: ListChecks,
    title: "Every step says what you should see",
    desc: "All 104 guided steps across the catalogue state their expected result before they explain the reasoning. When your screen disagrees with the guide, you find out at that step instead of three steps later.",
    span: "lg:col-span-2",
    accent: "from-brand-1/20",
  },
  {
    icon: FlaskConical,
    title: "The numbers come from solvers",
    desc: "Diffraction patterns, absorption spectra, digester yields and circuit waveforms are computed by each lab's own engine. Where a language model writes, it writes prose.",
    span: "",
    accent: "from-brand-2/20",
  },
  {
    icon: ExternalLink,
    title: "Sources you can follow",
    desc: "46 references across the guides, cited to the paper, standard or database they came from.",
    span: "",
    accent: "from-brand-3/20",
  },
  {
    icon: Lock,
    title: "Access stated up front",
    desc: "Every lab's objective, full step list, expected results and reading list are readable without an account. Signing in is what opens the lab environment itself, and each lab is granted or bought on its own — there is no bundle to decode.",
    span: "lg:col-span-2",
    accent: "from-emerald-500/20",
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

const about = [
  {
    icon: ListChecks,
    title: "Checkable at every step",
    desc: "All 104 steps in the catalogue state the result you should see before they explain why it happens — so the moment your screen disagrees, you know. 71 troubleshooting entries cover the places people actually get stuck.",
  },
  {
    icon: ShieldCheck,
    title: "Built to be doubted",
    desc: "FraudShield has you attack the detector you just tuned. The XRD lab keeps the specimen's real identity hidden until you commit to an answer, then scores you. Denovo will hand you a confident structure for a molecule that cannot exist.",
  },
  {
    icon: FlaskConical,
    title: "Real engines, not a chat box",
    desc: "Set an acoustic target in the metamaterials lab and its own physics engine returns an absorption spectrum, a bandgap analysis and a verdict on whether the lattice could actually be printed. Where a language model does speak, it is relayed through the hub, so no lab ever ships an API key to your browser.",
  },
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


/*
  The hero panel.

  This was a drawn browser frame on live-labs.org/admin showing "12 Labs,
  40k Users, 99.9% Uptime" above a mocked lab table. Two of those three
  figures were invented, the hostname was not ours, and the whole thing was
  an illustration of a screen rather than a screen.

  What replaces it is one real step, quoted from
  `src/content/labs/denovo-genai-lab.ts` — the "Lab 3 — design to a
  specification" entry, three of its actions and its `expect` line, as
  written. It does the same job honestly: it shows what working here is
  actually like, and it shows the mechanism the rest of the page claims for
  itself — a step that states what you should see, so you can tell when you
  are off track.

  Quoted rather than imported: pulling the guide modules into this client
  component would ship the whole catalogue's prose in the entry bundle. If
  that step is reworded, reword it here; the source is named above.
*/
function HeroStepPanel() {
  const actions = [
    "Open Lab 3: Design to a spec and click the Oral drug-like preset.",
    "Press Generate 12 candidates. It takes about a tenth of a second.",
    "Click a candidate. Its structure appears in 3D, with a tick or a cross against every constraint you set.",
  ];
  return (
    <figure className="relative m-0">
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="flex items-center gap-2 px-5 py-3 border-b border-border bg-muted/30">
          <FlaskConical className="w-4 h-4 text-primary-ink shrink-0" />
          <span className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">
            Denovo GenAI Lab · one step of nine
          </span>
        </div>

        <div className="p-5 sm:p-6">
          <h3 className="text-lg font-semibold tracking-tight">Lab 3 — design to a specification</h3>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Ask for a property profile rather than a structure, then check what you actually got.
          </p>

          <ol className="mt-5 space-y-2.5">
            {actions.map((a, i) => (
              <li key={i} className="flex gap-3 text-sm leading-relaxed">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border text-[11px] font-semibold tabular-nums text-muted-foreground">
                  {i + 1}
                </span>
                <span className="text-foreground/90">{a}</span>
              </li>
            ))}
            <li className="pl-8 text-sm text-muted-foreground">+ three more</li>
          </ol>

          {/* The part that makes a guide checkable rather than readable. */}
          <div className="mt-5 rounded-xl border border-[color:var(--color-success-ink)]/25 bg-[color:var(--color-success-ink)]/[0.06] p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <Check className="w-3.5 h-3.5 text-[color:var(--color-success-ink)] shrink-0" />
              <span className="text-[11px] font-semibold uppercase tracking-wide text-[color:var(--color-success-ink)]">
                You should see
              </span>
            </div>
            <p className="text-sm leading-relaxed text-foreground/90">
              In enforced mode every candidate scores 5/5 against your constraints. In
              encouraged mode some come back with a red cross beside a constraint they failed.
            </p>
          </div>
        </div>
      </div>
      <figcaption className="mt-3 text-xs text-muted-foreground">
        A step from the Denovo GenAI Lab guide, quoted as written. All 104 steps in the
        catalogue carry a line like that green one.
      </figcaption>
    </figure>
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
        className="inline-block py-2 text-xs sm:py-0 sm:text-sm font-mono text-muted-foreground/80 hover:text-foreground focus-visible:text-foreground underline-offset-4 decoration-dotted decoration-muted-foreground/40 hover:underline focus-visible:underline transition-colors rounded outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
      >
        {host}
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
      <Navbar />
      <main id="main" className="flex-grow">
        {/* ===== Hero ===== */}
        <section className="relative pt-32 pb-20 md:pt-40 overflow-hidden">
          {/* Was two animated 40rem colour blobs over a grid. On a light
              surface that is the whole page turning blue behind the words. */}
          <div className="absolute inset-0 bg-grid opacity-60" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
            <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ duration: 0.6 }}>
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-sm text-muted-foreground mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--color-success-ink)]" />
                13 laboratories · 7 subject areas
              </span>
              {/* The old H1 sold the admin console: "Launch premium labs.
                  Control every access." Whoever is deciding whether to spend
                  an afternoon here is not buying an access-control system. */}
              <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-bold tracking-tight leading-[1.08] mb-6">
                Instruments you drive,<br />
                <span className="text-gradient">not courses you watch.</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl mb-8">
                Browser laboratories in biology, materials, physics, electronics and security.
                Each one computes its results in its own engine, states what you should see at
                every step, and cites where the science came from.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <Link href="/labs" className="px-7 py-3.5 btn-brand rounded-xl font-semibold inline-flex items-center justify-center gap-2">
                  Browse the laboratories <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="#about" className="px-7 py-3.5 rounded-xl border border-border bg-card font-semibold hover:bg-accent transition-colors text-center">
                  How a lab works
                </Link>
              </div>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5"><Check className="w-4 h-4 text-[color:var(--color-success-ink)]" /> Full guides readable without an account</span>
                <span className="inline-flex items-center gap-1.5"><Check className="w-4 h-4 text-[color:var(--color-success-ink)]" /> Access granted per lab, nothing recurring</span>
              </div>
            </motion.div>

            <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ duration: 0.6, delay: 0.15 }}>
              <HeroStepPanel />
            </motion.div>
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
              Powering labs across the network
            </p>
            {/* Tighter on a phone, so short hostnames share a line instead of
                stacking twelve deep. */}
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-0 sm:gap-x-8 sm:gap-y-3">
              {domains.map((d) => (
                <DomainLink key={d.host} {...d} />
              ))}
            </div>
          </div>
        </section>

        {/* ===== Features bento ===== */}
        <section id="features" className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <span className="text-sm font-semibold text-primary-ink uppercase tracking-wider">What you are getting</span>
              <h2 className="text-3xl md:text-4xl font-bold mt-2">Built to be checked, not just followed</h2>
              <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
                Four things that hold for every laboratory in the catalogue, and that you can
                confirm from its guide before you open it.
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
              <span className="text-sm font-semibold text-primary-ink uppercase tracking-wider">How it works</span>
              <h2 className="text-3xl md:text-4xl font-bold mt-2">Read it, open it, check yourself against it</h2>
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

        {/* ===== About ===== */}
        {/*
          Plain background on purpose. "How it works" and Testimonials are both
          `bg-muted/20 border-y`, so before this they butted together with a
          doubled hairline; a plain band between them restores the page's
          tinted → plain → tinted alternation.

          `scroll-mt-24` because the navbar is fixed and 64px tall — without it
          the heading lands underneath the header when someone follows /#about.
        */}
        <section id="about" className="scroll-mt-24 py-16 md:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <span className="text-sm font-semibold text-primary-ink uppercase tracking-wider">What that means in practice</span>
              <h2 className="text-3xl md:text-4xl font-bold mt-2">What each laboratory refuses to do for you</h2>
              <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
                A diffractometer you mount a real powder in. A fraud detector you tune and then
                attack. A physics solver that tells you whether the lattice could actually be
                printed. Each comes with a guide that says what should happen at every step.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {about.map((a, i) => (
                <motion.div
                  key={a.title}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="glass rounded-2xl p-6"
                >
                  <a.icon className="w-8 h-8 text-primary mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{a.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{a.desc}</p>
                </motion.div>
              ))}
            </div>

            {/* Counted out of the guide modules, not estimated — see `aboutFigures`. */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="glass mt-6 grid grid-cols-2 gap-y-6 rounded-2xl px-6 py-7 sm:grid-cols-4"
            >
              {aboutFigures.map((f) => (
                <div key={f.l} className="text-center">
                  <div className="text-2xl md:text-3xl font-extrabold tabular-nums">{f.v}</div>
                  <div className="mt-0.5 text-xs md:text-sm text-muted-foreground">{f.l}</div>
                </div>
              ))}
            </motion.div>
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
            <div className="text-center mb-12">
              <span className="text-sm font-semibold text-primary-ink uppercase tracking-wider">FAQ</span>
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
                A unified ecosystem for accessing, managing and discovering advanced research and educational labs.
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
            <span className="inline-flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" /> Secured with enterprise SSO</span>
          </div>
        </div>
      </footer>
    </>
  );
}
