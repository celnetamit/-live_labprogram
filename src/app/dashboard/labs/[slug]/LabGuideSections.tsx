import {
  BookOpen,
  CheckCircle2,
  CircleHelp,
  ClipboardList,
  Lightbulb,
  Target,
  Users,
  Wrench,
} from "lucide-react";
import type { LabGuide } from "@/content/labs";
import { RichText } from "@/components/rich-text";

/** Shared section chrome: consistent heading, padding and scroll offset. */
function Panel({
  id,
  icon: Icon,
  title,
  children,
  aside,
}: {
  id: string;
  icon: typeof BookOpen;
  title: string;
  children: React.ReactNode;
  aside?: React.ReactNode;
}) {
  const headingId = `${id}-heading`;
  return (
    <section
      id={id}
      className="scroll-mt-24 glass rounded-2xl p-5 sm:p-6"
      aria-labelledby={headingId}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <h2 id={headingId} className="flex items-center gap-2 text-base font-semibold sm:text-lg">
          <Icon className="h-5 w-5 shrink-0 text-primary" /> {title}
        </h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

/**
 * The public half of a guide: what the lab is, why it matters, who it is for,
 * and what you will be able to do. Rendered for locked visitors too — a
 * prospective learner cannot judge a lab from its title alone.
 */
export function LabSummarySection({ guide }: { guide: LabGuide }) {
  const { summary } = guide;

  return (
    <Panel id="overview" icon={BookOpen} title="About this lab">
      <div className="space-y-6">
        <p className="text-[15px] leading-relaxed text-muted-foreground">
          <RichText>{summary.what}</RichText>
        </p>

        {/* Two readable columns on a wide screen; stacked below `md`, where
            side-by-side prose drops to about six words a line. */}
        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-xl border border-border bg-background/40 p-4">
            <h3 className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold">
              <Lightbulb className="h-4 w-4 shrink-0 text-[color:var(--color-warning)]" /> Why it
              matters
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              <RichText>{summary.why}</RichText>
            </p>
          </div>
          <div className="rounded-xl border border-border bg-background/40 p-4">
            <h3 className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold">
              <Users className="h-4 w-4 shrink-0 text-primary" /> Who it&apos;s for
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              <RichText>{summary.whoFor}</RichText>
            </p>
          </div>
        </div>

        <div>
          <h3 className="mb-2.5 flex items-center gap-1.5 text-sm font-semibold">
            <Target className="h-4 w-4 shrink-0 text-primary" /> What you&apos;ll be able to do
          </h3>
          <ul className="grid gap-2 sm:grid-cols-2">
            {summary.outcomes.map((outcome) => (
              <li
                key={outcome}
                className="flex gap-2.5 rounded-lg border border-border bg-background/40 p-3 text-sm text-muted-foreground"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--color-success)]" />
                <span className="leading-relaxed">
                  <RichText>{outcome}</RichText>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Panel>
  );
}

export function PrerequisitesSection({ guide }: { guide: LabGuide }) {
  if (guide.prerequisites.length === 0) return null;

  return (
    <Panel id="prepare" icon={ClipboardList} title="Before you start">
      <ul className="space-y-2">
        {guide.prerequisites.map((item) => (
          <li key={item} className="flex gap-2.5 text-sm text-muted-foreground">
            <span
              aria-hidden
              className="mt-[0.45rem] h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
            />
            <span className="leading-relaxed">
              <RichText>{item}</RichText>
            </span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

export function TroubleshootingSection({ guide }: { guide: LabGuide }) {
  if (guide.troubleshooting.length === 0) return null;

  return (
    <Panel
      id="troubleshooting"
      icon={Wrench}
      title="Troubleshooting"
      aside={
        <span className="text-xs text-muted-foreground">
          {guide.troubleshooting.length} common issues
        </span>
      }
    >
      {/*
        Collapsed by default. This is reference material you reach for when
        something has already gone wrong — expanded, it buries the sections
        after it under a wall of text nobody is reading yet.
      */}
      <div className="space-y-2">
        {guide.troubleshooting.map((item) => (
          <details
            key={item.problem}
            className="group rounded-xl border border-border bg-background/40 open:bg-background/60"
          >
            <summary className="flex cursor-pointer list-none items-start gap-2.5 p-3.5 text-sm font-medium marker:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0">
              <CircleHelp className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span className="flex-1 leading-snug">
                <RichText>{item.problem}</RichText>
              </span>
              <span
                aria-hidden
                className="mt-0.5 shrink-0 text-muted-foreground transition-transform group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p className="px-3.5 pb-3.5 pl-[2.6rem] text-sm leading-relaxed text-muted-foreground">
              <RichText>{item.fix}</RichText>
            </p>
          </details>
        ))}
      </div>
    </Panel>
  );
}
