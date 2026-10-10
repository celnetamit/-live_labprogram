"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  BookOpen,
  Check,
  FlaskConical,
  GraduationCap,
  Minus,
  Plus,
  ScrollText,
  Layers,
  TrendingUp,
  Award,
} from "lucide-react";
import EditorialHeader from "@/components/editorial-header";
import HeroCarousel, { type HeroSlide } from "@/components/hero-carousel";
import EditorialFooter from "@/components/editorial-footer";
import { LAB_PREVIEWS } from "@/content/labs/previews";
import { COVER_PHOTO } from "@/content/labs/photos";

/*
  The home page, rebuilt to the reference design.

  The visual system lives in `globals.css` under "EDITORIAL" and every value
  in it was measured off the reference rather than approximated. This file is
  only the content poured into it, and the content is the content that was
  here before: not one claim, figure, heading or paragraph has been rewritten
  in the move. Where a number appears it is still counted out of
  `src/content/labs/*.ts` by the command written beside it.

  What did change, on request: the page is editorial rather than interactive.
  The hero's WebGL laboratory, the thirteen canvas lab previews and the
  threshold simulator have been taken off this page. The components are still
  in the repository — `lab-scene.tsx`, `interactive-lab-gallery.tsx`,
  `lab-3d-preview.tsx`, `threshold-example.tsx` — so the decision is one
  import away from being reversed, but nothing on this page draws to a canvas
  any more and the page holds no WebGL context.
*/

/* --- the laboratories ---------------------------------------------------
   Name and blurb come from `previews.ts`, which copies each lab's own
   `summary.tagline` verbatim. Only the subject and the poster frame are
   added here, and the poster is a frame from that lab actually running. */
const SUBJECT: Record<string, string> = {
  metamaterials: "Materials",
  "micro-ai": "Biology",
  "drugdiscovery-ai": "Biology",
  "virtual-ai": "Physics",
  omicslab: "Biology",
  logiclab: "Electronics",
  fraudshield: "Security",
  "smartfactory-ai": "Engineering",
  "denovo-genai-lab": "Computer science",
  "battery-ai": "Engineering",
  "ai-6g": "Electronics",
  "cognicore-ai": "Computer science",
  "ai-program-navigator": "Computer science",
};

/*
  The photograph wins over the interface capture.

  `/demos/<slug>.jpg` is a screenshot of the lab's own screen, which is what
  this page used to show. A wall of browser windows says very little about
  what is being studied, so a lab that has a cover photograph — eleven of the
  thirteen do, in `COVER_PHOTO` — leads with the instrument or the specimen,
  exactly as the catalogue cards already did. The remaining two keep their
  poster, which is better than a stand-in photograph of somebody else's lab.
*/
const LABS = LAB_PREVIEWS.map((lab) => ({
  slug: lab.slug,
  name: lab.name,
  blurb: lab.blurb,
  subject: SUBJECT[lab.slug] ?? "Science",
  image: COVER_PHOTO[lab.slug]?.src ?? `/demos/${lab.slug}.jpg`,
  /** True where the image is a real photograph rather than a screen capture. */
  isPhoto: Boolean(COVER_PHOTO[lab.slug]),
}));

/*
  The hero's slides.

  The first carries the page's own headline. The three after it each lead
  with a real laboratory, named and described in that lab's own words — the
  tagline is `previews.ts`, copied verbatim from the guide — and link to its
  guide. Nothing here promotes something that does not exist.
*/
const HERO_LABS = ["virtual-ai", "micro-ai", "metamaterials", "drugdiscovery-ai"];

const quickLinks = [
  { href: "/labs", label: "Explore the labs", icon: FlaskConical, lead: true },
  { href: "#how-it-works", label: "How each lab works", icon: ScrollText, lead: false },
  { href: "#evidence", label: "What you are getting", icon: Check, lead: false },
  { href: "#access", label: "Access and pricing", icon: BookOpen, lead: false },
  { href: "#audience", label: "For educators", icon: GraduationCap, lead: false },
];

const learnerActions = [
  { n: "01", title: "Choose what to examine", desc: "Start with a dataset, specimen, circuit, or case that fits the question you are asking." },
  { n: "02", title: "Set up the experiment", desc: "Change one or more conditions and decide what you expect to happen before you run it." },
  { n: "03", title: "Read what happened", desc: "Work with the plots, tables, signals, or model outputs produced by your choices." },
  { n: "04", title: "Write down what it means", desc: "State what the evidence supports, where it is uncertain, and what you would test next." },
];

/*
  The four claims, carried over from the evidence section unchanged, each
  with the count that backs it. The counts are re-derivable:

    expected results  grep -rhoE "^\s*expect:"  src/content/labs/*.ts | wc -l  -> 104
    troubleshooting   grep -rhoE "^\s*problem:" src/content/labs/*.ts | wc -l  ->  71
    sources           grep -rho  "href:"        src/content/labs/*.ts | wc -l  ->  46
*/
const evidence = [
  {
    eyebrow: "Checkable at every step",
    title: "You find out at the step, not three steps later.",
    claim: "Every guided step states the result it should produce before it explains the reasoning. The moment your screen disagrees with the guide, you know where it started.",
    source: "104 of 104 guided steps carry an expected result, across all 13 guides.",
  },
  {
    eyebrow: "Real engines, not a chat box",
    title: "A model writes the explanation. It never writes the result.",
    claim: "Diffraction patterns, absorption spectra, digester yields and circuit waveforms are computed by each laboratory's own solver. Change an input and the physics answers; nothing is looked up from a table of pre-written outcomes.",
    source: "Every result on this platform comes from the lab's own engine.",
  },
  {
    eyebrow: "Written for when it goes wrong",
    title: "The failures people actually hit, answered where they hit them.",
    claim: "Guides are written from watching people get stuck, so the entry you need is the one describing what you are looking at — including the cases where nothing is broken and the lab is behaving correctly.",
    source: "71 troubleshooting entries across the catalogue.",
  },
  {
    eyebrow: "Sources you can follow",
    title: "Every guide ends where the evidence came from.",
    claim: "Standards bodies, reference databases and the original papers — cited so you can check the science against its source rather than against us.",
    source: "46 references across 13 guides.",
  },
];

const steps = [
  {
    title: "Ask and predict",
    desc: "Read the question, inspect the material you have been given, and note what you think will happen.",
    /* Three different laboratories per stage. Repeating one image three times
       reads as a rendering fault, not as a collage. */
    stack: ["virtual-ai", "metamaterials", "micro-ai"],
  },
  {
    title: "Run and compare",
    desc: "Choose the conditions, complete the steps, and repeat the experiment when a comparison will help.",
    stack: ["metamaterials", "battery-ai", "ai-6g"],
  },
  {
    title: "Explain the result",
    desc: "Connect the output to what you did, note any uncertainty, and say what the evidence does and does not show.",
    stack: ["omicslab", "drugdiscovery-ai", "logiclab"],
  },
];

/*
  Every figure here was counted out of the guide files rather than estimated:

    subject areas  the seven subjects in SUBJECT above
    steps          grep -rhoE "^\s*goal:"    src/content/labs/*.ts | wc -l   -> 104
    troubleshoot   grep -rhoE "^\s*problem:" src/content/labs/*.ts | wc -l   ->  71
    sources        grep -rho  "href:"        src/content/labs/*.ts | wc -l   ->  46

  Re-run them when guides are added. There is deliberately no lab COUNT: the
  catalogue is whatever the database has enabled, which this page cannot see.
*/
const aboutFigures = [
  { v: "7", l: "subject areas" },
  { v: "104", l: "guided steps" },
  { v: "71", l: "troubleshooting fixes" },
  { v: "46", l: "cited sources" },
];

const accessTerms = [
  {
    icon: BookOpen,
    title: "Free to read, in full",
    desc: "Every lab page lists its objective, all of its steps, the result each step should produce, its troubleshooting entries and its sources. No account, no email, no trial clock.",
  },
  {
    icon: Layers,
    title: "One lab at a time",
    desc: "Access is granted per lab, by an administrator or by buying that lab. Nothing auto-renews, and buying one lab does not quietly enrol you in the rest.",
  },
  {
    icon: TrendingUp,
    title: "Levels are earned, not sold twice",
    desc: "Basic and Moderate open as you complete the work inside a lab. Where a lab has an Advanced tier it is stated on the lab page, with what it adds.",
  },
  {
    icon: Award,
    title: "What a completion is",
    desc: "Finishing a lab records your own completion against your account. It is a record of work done on this platform — we do not describe it as an accredited qualification, because it is not one.",
  },
];

const audiences = [
  { title: "Learners", desc: "Build confidence through practice, revise decisions, and keep a record of observations and conclusions." },
  { title: "Educators", desc: "Use structured activities for preparation, discussion, assessment, or guided independent work." },
  { title: "Lab authors", desc: "Present objectives, methods, evidence, limitations, and assessments in a consistent, reviewable format." },
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
    <div className="els-faq-item">
      <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <span>{q}</span>
        <span className="els-circle" aria-hidden="true">
          {open ? <Minus /> : <Plus />}
        </span>
      </button>
      {open && <p className="els-body">{a}</p>}
    </div>
  );
}

export default function Home() {
  const byName = (slug: string) => LABS.find((l) => l.slug === slug)!;

  const heroSlides: HeroSlide[] = [
    {
      id: "live-labs",
      eyebrow: "Practical, browser-based science",
      title: ["Run Real Experiments, Analyze Data, ", "Discover Science"],
      /* No description line, and no trust row under the buttons: both were
         removed on request. The headline carries the slide on its own. */
      cta: { label: "Explore the labs", href: "/labs" },
      image: byName("omicslab").image,
    },
    ...HERO_LABS.map((slug) => {
      const lab = byName(slug);
      return {
        id: slug,
        eyebrow: lab.subject,
        /* The lab's own name, split so the trailing phrase can be italic the
           way the reference sets one word of every headline. */
        title: [`${lab.name.split(" ").slice(0, -1).join(" ")} `, lab.name.split(" ").slice(-1)[0]] as [string, string],
        sub: lab.blurb,
        cta: { label: "Read the guide", href: `/labs/${lab.slug}` },
        image: lab.image,
      };
    }),
  ];

  return (
    <>
      <EditorialHeader />

      <main id="main" className="els flex-grow">
        {/* ===== Hero ===== */}
        <HeroCarousel
          slides={heroSlides}
          footer={
            /* The dark strip of section links, on the hero's bottom edge. */
            <nav className="els-quicklinks" aria-label="Jump to a section">
              {quickLinks.map(({ href, label, icon: Icon, lead }) => (
                <Link key={href} href={href} data-lead={lead ? "true" : undefined}>
                  <Icon aria-hidden="true" />
                  {label}
                </Link>
              ))}
            </nav>
          }
        />

        {/* ===== What learners do ===== */}
        <section id="features" className="els-band els-band-lead els-band-cream" style={{ scrollMarginTop: "6rem" }}>
          <div className="els-shell">
            <div className="els-band-head">
              <h2 className="els-h2">Experience science through interaction</h2>
              <p className="els-lead">
                In every lab, learners make the same kinds of decisions they would meet in a
                taught practical: what to test, which settings to use, what to record, and how
                to explain the result.
              </p>
            </div>
            <ol className="els-grid els-grid-4">
              {learnerActions.map((a) => (
                <li key={a.n} className="els-card">
                  <span className="els-num">{a.n}</span>
                  <h3 className="els-card-title">{a.title}</h3>
                  <p className="els-body" style={{ color: "var(--els-dim)" }}>{a.desc}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ===== The claim, and the counted work behind it ===== */}
        <section id="about" className="els-band" style={{ scrollMarginTop: "6rem" }}>
          <div className="els-shell">
            <article className="els-feature">
              <div className="els-feature-photo" aria-hidden="true">
                <Image src={byName("micro-ai").image} alt="" width={900} height={700} sizes="46vw" />
              </div>
              <div className="els-feature-inner">
                <div>
                  <h2 className="els-h2">
                    A result makes more sense when you have <em>worked through the method yourself</em>
                  </h2>
                  <p className="els-lead" style={{ marginTop: "1.25rem", maxWidth: "50ch", color: "rgb(255 255 255 / 0.86)" }}>
                    Which is why the method is written down. Every figure beside this is counted
                    out of the guide files themselves, not estimated.
                  </p>
                  <Link href="/labs" className="els-pill els-pill-glass" style={{ marginTop: "2rem" }}>
                    Find a lab to start with <ArrowRight aria-hidden="true" />
                  </Link>
                </div>
                <dl className="els-feature-figures">
                  {aboutFigures.map((f) => (
                    <div key={f.l}>
                      <dt className="sr-only">{f.l}</dt>
                      <dd>
                        <span>{f.v}</span>
                        <span className="els-body" style={{ color: "rgb(255 255 255 / 0.84)" }}>{f.l}</span>
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </article>
          </div>
        </section>

        {/* ===== Evidence ===== */}
        <section id="evidence" className="els-band els-band-cream" style={{ scrollMarginTop: "6rem" }}>
          <div className="els-shell">
            <div className="els-band-head">
              <p className="els-meta" style={{ color: "var(--els-dim)" }}>What you are getting</p>
              <h2 className="els-h2" style={{ marginTop: "0.75rem" }}>Built to be checked, not just followed</h2>
              <p className="els-lead">
                Four things that hold for every laboratory here. Each one is stated with the
                count that backs it, taken from the guides themselves.
              </p>
            </div>
            <div className="els-grid els-grid-2">
              {evidence.map((e) => (
                <article key={e.title} className="els-card">
                  <p className="els-meta" style={{ color: "var(--els-orange)" }}>{e.eyebrow}</p>
                  <h3 className="els-card-title">{e.title}</h3>
                  <p className="els-body" style={{ color: "var(--els-dim)" }}>{e.claim}</p>
                  <p className="els-body" style={{ paddingTop: "1rem", borderTop: "1px solid var(--els-line-soft)", color: "var(--els-dim)" }}>
                    {e.source}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ===== How it works ===== */}
        <section id="how-it-works" className="els-band" style={{ scrollMarginTop: "6rem" }}>
          <div className="els-shell">
            <div className="els-band-head">
              <p className="els-meta" style={{ color: "var(--els-dim)" }}>How each lab works</p>
              <h2 className="els-h2" style={{ marginTop: "0.75rem" }}>Start with a question. Finish with an explanation.</h2>
              <p className="els-lead">
                The work is divided into three clear stages. You can see what you did, what
                happened, and how the evidence supports your conclusion.
              </p>
            </div>
            <div className="els-grid els-grid-3">
              {steps.map((s, i) => (
                <article key={s.title} className="els-card">
                  <span className="els-num">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="els-card-title">{s.title}</h3>
                  <p className="els-body" style={{ color: "var(--els-dim)" }}>{s.desc}</p>
                  <div className="els-stepped" aria-hidden="true" style={{ marginTop: "1.5rem" }}>
                    {s.stack.map((slug) => (
                      <Image key={slug} src={byName(slug).image} alt="" width={420} height={320} sizes="(max-width: 64rem) 50vw, 25vw" />
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ===== Learning approach ===== */}
        <section id="learning-approach" className="els-band els-band-cream" style={{ scrollMarginTop: "6rem" }}>
          <div className="els-shell">
            <div className="els-grid els-grid-2" style={{ alignItems: "center", gap: "clamp(2rem,5vw,4rem)" }}>
              <div>
                <p className="els-meta" style={{ color: "var(--els-dim)" }}>The method stays visible</p>
                <h2 className="els-h2" style={{ marginTop: "0.75rem" }}>
                  You should be able to explain where a result came from.
                </h2>
                <p className="els-lead" style={{ marginTop: "1rem", maxWidth: "56ch", color: "var(--els-dim)" }}>
                  That is why each lab shows the starting data, the settings you chose, and the
                  output from every important step. Explanations come after the evidence, not in
                  place of it.
                </p>
                <ul className="els-body" style={{ marginTop: "2rem", display: "grid", gap: "1rem", maxWidth: "56ch" }}>
                  {[
                    "Teaching datasets with a clear source",
                    "Experiments that can be repeated and compared",
                    "Assumptions and limitations shown alongside the result",
                  ].map((k) => (
                    <li key={k} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                      <span className="els-circle" aria-hidden="true"><Check /></span>
                      <span style={{ paddingTop: "0.3rem" }}>{k}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="els-stepped">
                <Image src={byName("virtual-ai").image} alt="" width={720} height={560} sizes="(max-width: 48rem) 100vw, 46vw" />
                <Image src={byName("logiclab").image} alt="" width={720} height={560} sizes="(max-width: 48rem) 100vw, 46vw" />
                <Image src={byName("fraudshield").image} alt="" width={720} height={560} sizes="(max-width: 48rem) 100vw, 46vw" />
              </div>
            </div>
          </div>
        </section>

        {/* ===== Access ===== */}
        <section id="access" className="els-band" style={{ scrollMarginTop: "6rem" }}>
          <div className="els-shell">
            <div className="els-band-head">
              <p className="els-meta" style={{ color: "var(--els-dim)" }}>Access</p>
              <h2 className="els-h2" style={{ marginTop: "0.75rem" }}>What you get, and what it costs you</h2>
              <p className="els-lead">
                Written out here rather than left to the checkout page, because deciding
                whether to trust a platform should not require reaching for a card first.
              </p>
            </div>
            <div className="els-grid els-grid-4">
              {accessTerms.map(({ icon: Icon, ...t }) => (
                <article key={t.title} className="els-card">
                  <span className="els-circle" aria-hidden="true"><Icon /></span>
                  <h3 className="els-card-title">{t.title}</h3>
                  <p className="els-body" style={{ color: "var(--els-dim)" }}>{t.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ===== Audience ===== */}
        <section id="audience" className="els-band els-band-ink" style={{ scrollMarginTop: "6rem" }}>
          <div className="els-shell">
            <div className="els-grid els-grid-2" style={{ alignItems: "center", gap: "clamp(2rem,5vw,4rem)" }}>
              <div>
                <p className="els-meta" style={{ color: "var(--els-orange)" }}>For learning, teaching, and review</p>
                <h2 className="els-h2" style={{ marginTop: "0.75rem", color: "#fff" }}>
                  A familiar structure for everyone involved
                </h2>
                <p className="els-lead" style={{ marginTop: "1rem", maxWidth: "52ch" }}>
                  Learners know what to do next. Educators can see how the work developed. Lab
                  authors have a consistent way to present methods and evidence.
                </p>
                <Link href="/labs" className="els-pill els-pill-glass" style={{ marginTop: "2rem" }}>
                  Browse the catalogue <ArrowRight aria-hidden="true" />
                </Link>
              </div>
              <div style={{ display: "grid", gap: "1rem" }}>
                {audiences.map((a) => (
                  <article key={a.title} className="els-card" style={{ padding: "1.5rem" }}>
                    <h3 className="els-card-title" style={{ color: "#fff" }}>{a.title}</h3>
                    <p className="els-body">{a.desc}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ===== FAQ ===== */}
        <section className="els-band">
          <div className="els-shell">
            <div className="els-grid els-grid-2" style={{ alignItems: "start", gap: "clamp(2rem,5vw,4rem)" }}>
              <div>
                <p className="els-meta" style={{ color: "var(--els-dim)" }}>FAQ</p>
                <h2 className="els-h2" style={{ marginTop: "0.75rem" }}>Questions, answered</h2>
                <p className="els-lead" style={{ marginTop: "1rem", color: "var(--els-dim)" }}>
                  The five we are asked most often, answered without marketing.
                </p>
              </div>
              <div className="els-faq">
                {faqs.map((f) => (
                  <FaqItem key={f.q} q={f.q} a={f.a} />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ===== Closing pair ===== */}
        <section className="els-band" style={{ paddingTop: 0 }}>
          <div className="els-shell">
            <div className="els-closing">
              <Link href="/labs" className="els-closing-card">
                <Image src={byName("metamaterials").image} alt="" width={900} height={600} sizes="(max-width: 48rem) 100vw, 46vw" />
                <h3>Start with a subject that interests you.</h3>
                <span className="els-pill els-pill-glass" style={{ alignSelf: "flex-start" }}>
                  Explore all labs <ArrowRight aria-hidden="true" />
                </span>
              </Link>
              <Link href="/#how-it-works" className="els-closing-card">
                <Image src={byName("omicslab").image} alt="" width={900} height={600} sizes="(max-width: 48rem) 100vw, 46vw" />
                <h3>Read the lab overview, check what you need, and begin when you are ready.</h3>
                <span className="els-pill els-pill-glass" style={{ alignSelf: "flex-start" }}>
                  See how it works <ArrowRight aria-hidden="true" />
                </span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <EditorialFooter />
    </>
  );
}
