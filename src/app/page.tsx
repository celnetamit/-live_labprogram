"use client";

import { useState } from "react";
import { MotionConfig, motion } from "framer-motion";
import {
  ArrowRight,
  Lock,
  Check,
  Plus,
  Minus,
} from "lucide-react";
import Navbar from "@/components/navbar";
import HeroAtmosphere from "@/components/hero-atmosphere";
import EvidencePanels from "@/components/evidence-panels";
import ThresholdExample from "@/components/threshold-example";
import AbsorptionArray from "@/components/absorption-array";
import GyroidSpecimen from "@/components/gyroid-specimen";
import LabMarquee from "@/components/lab-marquee";
import SupportLauncher from "@/components/support-launcher";
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


const audiences = [
  { title: "Learners", desc: "Build confidence through practice, revise decisions, and keep a record of observations and conclusions." },
  { title: "Educators", desc: "Use structured activities for preparation, discussion, assessment, or guided independent work." },
  { title: "Lab authors", desc: "Present objectives, methods, evidence, limitations, and assessments in a consistent, reviewable format." },
];

const learnerActions = [
  { n: "01", title: "Choose what to examine", desc: "Start with a dataset, specimen, circuit, or case that fits the question you are asking." },
  { n: "02", title: "Set up the experiment", desc: "Change one or more conditions and decide what you expect to happen before you run it." },
  { n: "03", title: "Read what happened", desc: "Work with the plots, tables, signals, or model outputs produced by your choices." },
  { n: "04", title: "Write down what it means", desc: "State what the evidence supports, where it is uncertain, and what you would test next." },
];

const steps = [
  { title: "Ask and predict", desc: "Read the question, inspect the material you have been given, and note what you think will happen." },
  { title: "Run and compare", desc: "Choose the conditions, complete the steps, and repeat the experiment when a comparison will help." },
  { title: "Explain the result", desc: "Connect the output to what you did, note any uncertainty, and say what the evidence does and does not show." },
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
    <div className="viv-card">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="font-semibold">{q}</span>
        <span className={`viv-check shrink-0 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden>
          {open ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
        </span>
      </button>
      {open && <p className="px-5 pb-5 -mt-1 text-muted-foreground leading-relaxed">{a}</p>}
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
        {/*
          Two columns, with the artefact on the first screen.

          The 3D block is the lab's own geometry, ray-marched live rather than
          looped as a GIF: it turns at the display's refresh rate instead of a
          fixed frame count, it can be dragged, and it costs no download at
          all — the field is three sine terms, so nothing is fetched.
        */}
        <section className="band-ink relative flex min-h-svh flex-col justify-center overflow-hidden pt-24 pb-14 md:pt-28 md:pb-16 [@media(max-height:700px)]:pt-[4.5rem] [@media(max-height:700px)]:pb-5">
          <HeroAtmosphere />

          <div className="relative max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-14">
              <div className="min-w-0">
                <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ duration: 0.5 }}>
                  <p className="viv-eyebrow mb-6 [@media(max-height:700px)]:mb-3">
                    Practical, browser-based science
                  </p>
                </motion.div>

                <motion.h1
                  variants={fadeUp}
                  initial="hidden"
                  animate="show"
                  transition={{ duration: 0.55, delay: 0.05 }}
                  className="text-[clamp(2.1rem,4.6vw,3.9rem)] [@media(max-height:700px)]:text-[clamp(1.8rem,4vw,2.6rem)] font-bold tracking-[-0.035em] leading-[1.04] max-w-[16ch] text-balance"
                >
                  Run Real Experiments, Analyze Data,{" "}
                  <span className="text-gradient">Discover Science</span>
                </motion.h1>

                <motion.p
                  variants={fadeUp}
                  initial="hidden"
                  animate="show"
                  transition={{ duration: 0.55, delay: 0.12 }}
                  className="mt-6 [@media(max-height:700px)]:mt-4 max-w-[52ch] text-lg leading-relaxed text-muted-foreground"
                >
                  Choose the conditions, run the experiment, read the evidence, and explain what
                  the result means. Each lab gives you a clear method to follow and room to try
                  again.
                </motion.p>

                <motion.div
                  variants={fadeUp}
                  initial="hidden"
                  animate="show"
                  transition={{ duration: 0.55, delay: 0.18 }}
                  className="mt-7 [@media(max-height:700px)]:mt-4 flex flex-row flex-wrap gap-3"
                >
                  <Link href="/labs" className="viv-btn group px-6 py-3.5 rounded-xl font-semibold inline-flex items-center justify-center gap-2">
                    Explore the labs <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <Link href="#how-it-works" className="viv-btn-ghost px-6 py-3.5 rounded-xl font-semibold text-center">
                    See how it works
                  </Link>
                </motion.div>

                <ul className="mt-8 [@media(max-height:700px)]:mt-4 flex flex-wrap gap-2.5 text-sm text-muted-foreground">
                  {["No installation needed", "Browser-based", "Guided workflows"].map((h) => (
                    <li
                      key={h}
                      className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-[color:color-mix(in_oklch,var(--foreground)_5%,transparent)] px-3 py-1.5"
                    >
                      <Check className="w-3.5 h-3.5 shrink-0 text-[color:var(--color-success-ink)]" />
                      {h}
                    </li>
                  ))}
                </ul>
              </div>

              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="show"
                transition={{ duration: 0.6, delay: 0.22 }}
                className="order-first min-w-0 lg:order-none"
              >
                <GyroidSpecimen className="mx-auto max-w-[400px] lg:max-w-none" />
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  Acoustic Metamaterials · gyroid lattice at 60% porosity · drag to turn it
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ===== The part behind the curve ===== */}
        {/* Still on the dark band, so the hero hands straight to the
            specimen rather than breaking to white in between. The block is
            ray-marched from the same field and the same isovalue the lab's
            acoustic run is solved for. */}
        <section className="band-ink band-fit relative isolate flex min-h-svh flex-col justify-start overflow-hidden border-t border-white/5">
          {/* Two wide, very soft washes in the two channel colours, so the
              band is lit by the same palette the specimen is coloured with
              instead of being flat black. `isolate` keeps them under the
              content; they are purely atmospheric and carry no meaning, so
              they are hidden from assistive tech. */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute -left-24 top-0 h-[36rem] w-[36rem] rounded-full bg-[radial-gradient(circle,oklch(0.62_0.17_255/0.20),transparent_68%)] blur-3xl" />
            <div className="absolute -right-16 bottom-[-10rem] h-[32rem] w-[32rem] rounded-full bg-[radial-gradient(circle,oklch(0.60_0.20_305/0.16),transparent_68%)] blur-3xl" />
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="band-fit-grid grid items-start lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
              <motion.div
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="min-w-0"
              >
                {/* The subject leads, then the claim, then the argument. It was
                    the other way up: the subject set as a 12px eyebrow over a
                    44px headline, so the one word telling you which science
                    this is was the smallest thing in the section. */}
                <h2 className="band-fit-title font-bold leading-[1.05] tracking-[-0.035em] text-balance">
                  Acoustic Metamaterials
                </h2>
                <p className="band-fit-sub font-semibold tracking-[-0.01em] text-[color:var(--primary-ink)]">
                  The shape that absorbs the sound
                </p>
                {/* Justified, with automatic hyphenation. Justifying without it
                    opens rivers of white space in a narrow measure. */}
                <p className="band-fit-prose max-w-[56ch] hyphens-auto text-justify text-muted-foreground">
                  Not a render of a lattice. Your graphics card is solving the lab&rsquo;s own
                  level-set field, <span className="font-mono text-[0.95em] text-foreground">sin x·cos y + sin y·cos z + sin z·cos x</span>,
                  and filling the solid where that field falls within 0.615975 of zero.
                </p>
                <p className="band-fit-prose max-w-[56ch] hyphens-auto text-justify text-muted-foreground">
                  That number is not a dial someone turned until it looked right. It is the
                  tabulated isovalue for 60% porosity, and it puts 39.95% of the box in solid —
                  the same design the lab&rsquo;s acoustic solver is run on. Change it and both the
                  block and the spectrum move together, which is the whole point: in this
                  laboratory the geometry is what produces the acoustics, not a caption attached
                  to it.
                </p>
              </motion.div>

              <motion.div
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, delay: 0.18 }}
                className="min-w-0"
              >
                <div className="band-fit-chart"><AbsorptionArray /></div>
              </motion.div>
            </div>
          </div>

          {/* ===== The thirteen, running past ===== */}
          {/* On the same band as the specimen, not in a section of its own.
              Separately it sat behind its own border and its own vertical
              padding, which stacked with this section's to leave an empty
              strap of page between the spectrum and the first tile. Here the
              acoustic figure hands straight to the thirteen laboratories.

              Container is `max-w-7xl` to match the grid above, so the row
              starts on the same left edge as the heading does.

              The strip has no visible name now, so the region `aria-label`
              in `lab-marquee.tsx` is the only thing naming it for a screen
              reader. Keep it. */}
          <div id="labs-strip" className="band-fit-strip relative scroll-mt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6 }}
            >
              <LabMarquee />
            </motion.div>

            <Link
              href="/labs"
              /* `bg-card` was for the light section this used to sit in; on the
                 dark band it lands within 1.1:1 of the page behind it and the
                 button loses its shape. This is the band's own secondary-button
                 treatment, the same one the hero uses. */
              className="band-fit-cta inline-flex items-center gap-2 rounded-xl border border-border bg-white/5 px-5 text-sm font-semibold transition-colors hover:bg-white/10"
            >
              Browse the catalogue <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* ===== What learners do ===== */}
        {/* The brief supplies no eyebrow for this section, so it has none
            rather than an invented one. */}
        <section id="what-learners-do" className="viv-surface scroll-mt-24 py-16 md:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              variants={fadeUp} initial="hidden" whileInView="show"
              viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.6 }}
              className="mb-10 max-w-2xl md:mb-14"
            >
              <h2 className="text-3xl font-bold leading-[1.08] tracking-[-0.03em] text-balance md:text-[2.75rem]">
                What learners actually do
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                In every lab, learners make the same kinds of decisions they would meet in a
                taught practical: what to test, which settings to use, what to record, and how
                to explain the result.
              </p>
            </motion.div>
            <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {learnerActions.map((a, i) => (
                <motion.li
                  key={a.n}
                  variants={fadeUp} initial="hidden" whileInView="show"
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.5, delay: i * 0.06 }}
                  className="viv-card px-6 py-7"
                >
                  <span className="viv-num block text-3xl font-bold tracking-[-0.03em]">
                    {a.n}
                  </span>
                  <h3 className="mt-3 text-base font-semibold tracking-tight">{a.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{a.desc}</p>
                </motion.li>
              ))}
            </ol>
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
              <span className="viv-eyebrow">What you are getting</span>
              <h2 className="text-3xl md:text-[2.75rem] font-bold tracking-[-0.03em] leading-[1.08] mt-4 text-balance">
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
        <section id="how-it-works" className="scroll-mt-24 py-16 md:py-24 bg-muted/20 border-y border-border">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-12">
              <span className="viv-eyebrow">How each lab works</span>
              <h2 className="text-3xl md:text-[2.5rem] font-bold tracking-[-0.025em] leading-[1.1] mt-4">Start with a question. Finish with an explanation.</h2>
              <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                The work is divided into three clear stages. You can see what you did, what
                happened, and how the evidence supports your conclusion.
              </p>
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
                  className="group grid sm:grid-cols-[3.5rem_minmax(0,16rem)_minmax(0,1fr)] gap-x-6 gap-y-2 border-b border-border py-7 transition-colors hover:bg-[color:color-mix(in_oklch,var(--viv-a)_6%,transparent)]"
                >
                  <span className="viv-num text-3xl font-bold tracking-[-0.03em]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-lg font-semibold tracking-tight self-start">{s.title}</h3>
                  <p className="text-muted-foreground leading-relaxed sm:pt-0.5">{s.desc}</p>
                </motion.li>
              ))}
            </ol>
          </div>
        </section>

        {/* ===== Learning approach ===== */}
        <section id="learning-approach" className="scroll-mt-24 py-16 md:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14">
              <motion.div
                variants={fadeUp} initial="hidden" whileInView="show"
                viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.6 }}
                className="min-w-0"
              >
                <span className="viv-eyebrow">
                  The method stays visible
                </span>
                <h2 className="mt-4 text-3xl font-bold leading-[1.08] tracking-[-0.03em] text-balance md:text-[2.5rem]">
                  You should be able to explain where a result came from.
                </h2>
                <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                  That is why each lab shows the starting data, the settings you chose, and the
                  output from every important step. Explanations come after the evidence, not in
                  place of it.
                </p>
                <ul className="mt-7 space-y-3">
                  {[
                    "Teaching datasets with a clear source",
                    "Experiments that can be repeated and compared",
                    "Assumptions and limitations shown alongside the result",
                  ].map((k) => (
                    <li key={k} className="flex items-start gap-3 text-muted-foreground">
                      <span className="viv-check mt-0.5" aria-hidden>
                        <Check className="h-3.5 w-3.5" />
                      </span>
                      <span>{k}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              <motion.div
                variants={fadeUp} initial="hidden" whileInView="show"
                viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.6, delay: 0.1 }}
                className="min-w-0"
              >
                <ThresholdExample />
              </motion.div>
            </div>
          </div>
        </section>

        {/* ===== Highlight statement ===== */}
        <section className="viv-surface relative overflow-hidden border-y border-border py-16 md:py-24">
          {/* Two blooms, placed so the line sits in the light between them. */}
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
            <div className="viv-bloom viv-bloom-a -left-20 top-[-6rem] h-[22rem] w-[22rem]" />
            <div className="viv-bloom viv-bloom-b -right-16 bottom-[-8rem] h-[20rem] w-[20rem]" />
          </div>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="viv-rule mx-auto mb-8 w-28" />
            <motion.p
              variants={fadeUp} initial="hidden" whileInView="show"
              viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.6 }}
              className="text-center text-2xl font-semibold leading-[1.3] tracking-[-0.02em] text-balance md:text-[2.25rem]"
            >
              A result makes more sense when you have{" "}
              <span className="viv-text">worked through the method yourself</span>.
            </motion.p>
            <div className="viv-rule mx-auto mt-8 w-28" />
          </div>
        </section>

        {/* ===== The counted figures ===== */}
        {/* The About section that was here made the same three arguments the
            evidence panels now make, with no artefact beside them. Its one
            irreplaceable part was this band — every figure counted out of the
            guide modules, see `aboutFigures`. */}
        <section id="about" className="scroll-mt-24 pb-16 md:pb-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <dl className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {aboutFigures.map((f) => (
                <div key={f.l} className="viv-card px-6 py-7 text-center">
                  <dt className="sr-only">{f.l}</dt>
                  <dd>
                    <span className="viv-num block text-4xl md:text-5xl font-bold tracking-[-0.03em]">{f.v}</span>
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
              <span className="viv-eyebrow">Access</span>
              <h2 className="text-3xl md:text-[2.5rem] font-bold tracking-[-0.025em] leading-[1.1] mt-4">What you get, and what it costs you</h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Written out here rather than left to the checkout page, because deciding
                whether to trust a platform should not require reaching for a card first.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {accessTerms.map((t, i) => (
                <motion.div key={t.title} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} transition={{ delay: i * 0.06 }} className="viv-card px-6 py-6">
                  <h3 className="font-semibold mb-2">{t.title}</h3>
                  <p className="text-muted-foreground leading-relaxed text-[15px]">{t.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== FAQ ===== */}
        <section className="viv-surface py-16 md:py-24">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-10">
              <span className="viv-eyebrow">FAQ</span>
              <h2 className="text-3xl md:text-[2.5rem] font-bold tracking-[-0.025em] leading-[1.1] mt-4">Questions, answered</h2>
            </div>
            <div className="space-y-3">
              {faqs.map((f) => (
                <FaqItem key={f.q} q={f.q} a={f.a} />
              ))}
            </div>
          </div>
        </section>

        {/* ===== Audience ===== */}
        <section id="audience" className="viv-surface scroll-mt-24 py-16 md:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              variants={fadeUp} initial="hidden" whileInView="show"
              viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.6 }}
              className="mb-10 max-w-2xl md:mb-14"
            >
              <span className="viv-eyebrow">
                For learning, teaching, and review
              </span>
              <h2 className="mt-4 text-3xl font-bold leading-[1.08] tracking-[-0.03em] text-balance md:text-[2.75rem]">
                A familiar structure for everyone involved
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                Learners know what to do next. Educators can see how the work developed. Lab
                authors have a consistent way to present methods and evidence.
              </p>
            </motion.div>
            <div className="grid gap-4 md:grid-cols-3">
              {audiences.map((a, i) => (
                <motion.div
                  key={a.title}
                  variants={fadeUp} initial="hidden" whileInView="show"
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.5, delay: i * 0.07 }}
                  className="viv-card px-6 py-7"
                >
                  <h3 className="text-lg font-semibold tracking-tight">{a.title}</h3>
                  <p className="mt-2 leading-relaxed text-muted-foreground">{a.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== Final CTA ===== */}
        <section className="pb-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="viv-panel p-10 md:p-16 text-center">
              <div className="relative">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Start with a subject that interests you.
                </h2>
                {/* "Join thousands of researchers and students" was here. We
                    do not publish a user count, so we cannot invoke one. */}
                <p className="text-muted-foreground max-w-xl mx-auto mb-8">
                  Read the lab overview, check what you need, and begin when you are ready.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-3">
                  <Link href="/labs" className="viv-btn group px-8 py-3.5 rounded-xl font-semibold inline-flex items-center justify-center gap-2">
                    Explore all labs <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SupportLauncher />

      {/* ===== Footer ===== */}
      <footer className="border-t border-border bg-muted/20 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="viv-btn w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm">L</div>
                <span className="font-bold text-lg">Live Labs</span>
              </div>
              <p className="text-muted-foreground text-sm max-w-xs">
                Science is easier to understand when you can try it yourself.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/labs" className="hover:text-foreground transition-colors">Explore labs</Link></li>
                <li><Link href="/#learning-approach" className="hover:text-foreground transition-colors">Learning approach</Link></li>
                {/* "For educators" has no page of its own yet, so it points at
                    the audience section that addresses them. */}
                <li><Link href="/#audience" className="hover:text-foreground transition-colors">For educators</Link></li>
                <li><Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link></li>
                <li><Link href="/#main" className="hover:text-foreground transition-colors">Back to top</Link></li>
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
