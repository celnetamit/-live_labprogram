"use client";

import { motion } from "framer-motion";
import { Check, ExternalLink, TriangleAlert } from "lucide-react";

/*
  The evidence section.

  Four claims, each paired with the artefact that backs it, alternating
  sides down the page. The pattern is deliberate: a claim on its own is
  marketing, and the thing that makes it not marketing is sitting next to
  it — a real step, a real solver run, a real troubleshooting entry, a real
  reading list.

  Everything quoted here is verbatim from `src/content/labs/*.ts` or from a
  run of a lab's own engine. The counts under each claim are produced by:

    steps     grep -rhoE "^\s*expect:"  src/content/labs/*.ts | wc -l   -> 104
    fixes     grep -rhoE "^\s*problem:" src/content/labs/*.ts | wc -l   ->  71
    sources   grep -rho  "href:"        src/content/labs/*.ts | wc -l   ->  46

  Re-run them when guides change rather than nudging the numbers.
*/

const reveal = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0 },
};

function Panel({
  tint,
  eyebrow,
  title,
  claim,
  source,
  flip,
  children,
}: {
  tint: string;
  eyebrow: string;
  title: string;
  claim: string;
  source: React.ReactNode;
  flip?: boolean;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      variants={reveal}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, ease: [0.2, 0, 0, 1] }}
      className={`${tint} tint-surface overflow-hidden rounded-3xl`}
    >
      <div
        className={`grid items-center gap-8 p-7 sm:p-10 lg:grid-cols-2 lg:gap-14 lg:p-12 ${
          flip ? "lg:[&>*:first-child]:order-2" : ""
        }`}
      >
        <div>
          <p className="tint-eyebrow text-xs font-semibold uppercase tracking-[0.12em]">{eyebrow}</p>
          <h3 className="mt-3 text-2xl sm:text-3xl font-bold leading-[1.15] tracking-[-0.02em] text-balance">
            {title}
          </h3>
          <p className="mt-4 text-[15px] leading-relaxed text-foreground/75">{claim}</p>
          <p className="mt-5 border-t border-foreground/10 pt-4 text-sm text-foreground/60">{source}</p>
        </div>
        <div className="min-w-0">{children}</div>
      </div>
    </motion.section>
  );
}

/** The frame every artefact sits in, so they read as one family. */
function Artefact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <figure className="m-0 overflow-hidden rounded-2xl border border-foreground/10 bg-card elev-2">
      <figcaption className="border-b border-foreground/10 bg-foreground/[0.03] px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
        {label}
      </figcaption>
      <div className="p-5">{children}</div>
    </figure>
  );
}

export default function EvidencePanels() {
  return (
    <div className="space-y-5 sm:space-y-6">
      {/* 1 — a real step, quoted ------------------------------------------ */}
      <Panel
        tint="tint-1"
        eyebrow="Checkable at every step"
        title="You find out at the step, not three steps later."
        claim="Every guided step states the result it should produce before it explains the reasoning. The moment your screen disagrees with the guide, you know where it started."
        source={<>104 of 104 guided steps carry an expected result, across all 13 guides.</>}
      >
        <Artefact label="Denovo GenAI Lab · one step of nine">
          <h4 className="font-semibold tracking-tight">Lab 3 — design to a specification</h4>
          <p className="mt-1 text-sm text-muted-foreground">
            Ask for a property profile rather than a structure, then check what you actually got.
          </p>
          <ol className="mt-4 space-y-2">
            {[
              "Open Lab 3: Design to a spec and click the Oral drug-like preset.",
              "Press Generate 12 candidates. It takes about a tenth of a second.",
              "Click a candidate. Its structure appears in 3D, with a tick or a cross against every constraint you set.",
            ].map((a, i) => (
              <li key={i} className="flex gap-3 text-sm leading-relaxed">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border text-[11px] font-semibold tabular-nums text-muted-foreground">
                  {i + 1}
                </span>
                <span className="text-foreground/85">{a}</span>
              </li>
            ))}
          </ol>
          <div className="mt-4 rounded-xl border border-[color:var(--color-success-ink)]/25 bg-[color:var(--color-success-ink)]/[0.07] p-3.5">
            <div className="mb-1.5 flex items-center gap-2">
              <Check className="h-3.5 w-3.5 shrink-0 text-[color:var(--color-success-ink)]" />
              <span className="text-[11px] font-semibold uppercase tracking-wide text-[color:var(--color-success-ink)]">
                You should see
              </span>
            </div>
            <p className="text-sm leading-relaxed text-foreground/85">
              In enforced mode every candidate scores 5/5 against your constraints. In encouraged
              mode some come back with a red cross beside a constraint they failed.
            </p>
          </div>
        </Artefact>
      </Panel>

      {/* 2 — a real solver run -------------------------------------------- */}
      <Panel
        tint="tint-2"
        flip
        eyebrow="Real engines, not a chat box"
        title="A model writes the explanation. It never writes the result."
        claim="Diffraction patterns, absorption spectra, digester yields and circuit waveforms are computed by each laboratory's own solver. Change an input and the physics answers; nothing is looked up from a table of pre-written outcomes."
        source={
          <>
            Figures below are one run of the Acoustic Metamaterials lab&apos;s JCA/transfer-matrix
            solver — the same curve shown at the top of this page.
          </>
        }
      >
        <Artefact label="Solver run · normal incidence">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            {[
              ["Lattice", "Gyroid, 3 mm cell"],
              ["Porosity", "60%"],
              ["Core / air gap", "80 mm / 20 mm"],
              ["Material", "PLA"],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">{k}</dt>
                <dd className="mt-0.5 font-medium">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="my-4 border-t border-dashed border-foreground/15" />
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            {[
              ["NRC", "0.55"],
              ["SAA", "0.50"],
              ["Peak absorption", "α 0.985 at 5.3 kHz"],
              ["Areal mass", "39.7 kg/m²"],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">{k}</dt>
                <dd className="mt-0.5 font-semibold tabular-nums text-primary-ink">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-xs text-muted-foreground">
            93 points, 50 Hz to 10 kHz. Inputs above, outputs below — both from the same run.
          </p>
        </Artefact>
      </Panel>

      {/* 3 — a real troubleshooting entry ---------------------------------- */}
      <Panel
        tint="tint-3"
        eyebrow="Written for when it goes wrong"
        title="The failures people actually hit, answered where they hit them."
        claim="Guides are written from watching people get stuck, so the entry you need is the one describing what you are looking at — including the cases where nothing is broken and the lab is behaving correctly."
        source={<>71 troubleshooting entries across the catalogue. This one is quoted as written.</>}
      >
        <Artefact label="Acoustic Metamaterials · troubleshooting">
          <div className="flex gap-3">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--color-warning-ink)]" />
            <p className="font-medium leading-relaxed">
              The bandgap reports as non-existent whatever I do.
            </p>
          </div>
          <p className="mt-3.5 border-l-2 border-foreground/15 pl-4 text-sm leading-relaxed text-muted-foreground">
            Your target frequency is probably far from what the geometry can address. Very low
            frequencies need large cells or resonant features; try raising the target frequency to
            confirm the design responds at all, then work back down.
          </p>
        </Artefact>
      </Panel>

      {/* 4 — the real reading lists ---------------------------------------- */}
      <Panel
        tint="tint-4"
        flip
        eyebrow="Sources you can follow"
        title="Every guide ends where the evidence came from."
        claim="Standards bodies, reference databases and the original papers — cited so you can check the science against its source rather than against us."
        source={<>46 references across 13 guides. Six of them, verbatim:</>}
      >
        <Artefact label="From the guides' reading lists">
          <ul className="space-y-2.5">
            {[
              ["IEEE 1364 — the Verilog standard", "standards.ieee.org", "LogicLab"],
              ["ITU-R — IMT-2030 (6G) framework recommendation", "itu.int", "AI for 6G"],
              ["IUCr — International Tables for Crystallography", "it.iucr.org", "XRD Virtual Lab"],
              ["DrugBank — drug and target reference database", "go.drugbank.com", "RepurposeAI"],
              ["Daylight — the SMILES specification", "daylight.com", "Denovo GenAI"],
              ["MGnify — EBI metagenomics datasets", "ebi.ac.uk", "MicrobeAI"],
            ].map(([label, host, lab]) => (
              <li key={label} className="flex items-start gap-2.5 text-sm">
                <ExternalLink className="mt-1 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <span className="min-w-0">
                  <span className="block leading-snug text-foreground/85">{label}</span>
                  <span className="text-xs text-muted-foreground">
                    {host} · cited in {lab}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </Artefact>
      </Panel>
    </div>
  );
}
