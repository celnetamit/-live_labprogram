import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { showcaseFontClass } from "@/lib/showcase";

/**
 * The frame every learner page shares — Dashboard, My Labs, Progress and
 * Account Settings — so the section reads as one product rather than four
 * pages built at different times.
 *
 * It bleeds to the edges of the shell's padded <main> (p-4 / p-6 / p-8) so
 * the backdrop (`.labs-backdrop` in globals.css) spans the whole content
 * area, and it loads the display face the page titles and panel headings
 * use. No hooks and no server-only imports, so client pages can use it too.
 */
export function LearnerPage({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`relative isolate -m-4 overflow-x-clip p-4 sm:-m-6 sm:p-6 lg:-m-8 lg:p-8 ${showcaseFontClass} ${className}`}
    >
      <div aria-hidden className="labs-backdrop">
        <span className="labs-backdrop-grain" />
      </div>
      {children}
    </div>
  );
}

/**
 * Page header on the backdrop: a small factual chip, the title in the display
 * face, a line of context, and an optional action on the right.
 */
export function PageHeader({
  eyebrow,
  eyebrowTone = "live",
  title,
  subtitle,
  aside,
  compact = false,
}: {
  /** A counted fact ("12 live labs · 7 subjects"), never a slogan. */
  eyebrow?: ReactNode;
  eyebrowTone?: "live" | "idle" | "warn";
  title: ReactNode;
  subtitle?: ReactNode;
  aside?: ReactNode;
  /** A smaller title, for one that carries a name ("Good afternoon, …"). */
  compact?: boolean;
}) {
  return (
    <header className="mb-7 flex flex-col justify-between gap-4 pt-2 sm:flex-row sm:items-end sm:pt-4">
      <div className="min-w-0">
        {eyebrow && (
          <p className="labs-eyebrow">
            <span aria-hidden className={`labs-eyebrow-dot is-${eyebrowTone}`} />
            {eyebrow}
          </p>
        )}
        <h1 className={`labs-title ${compact ? "labs-title-compact" : ""}`}>{title}</h1>
        {subtitle && (
          <p className="mt-2 max-w-2xl text-base text-muted-foreground sm:text-lg">{subtitle}</p>
        )}
      </div>
      {aside && <div className="shrink-0">{aside}</div>}
    </header>
  );
}

type Tone = "primary" | "success" | "warning" | "info" | "destructive";

/** A tinted square behind an icon, in one of the semantic tones. */
export function IconTile({
  icon: Icon,
  tone = "primary",
  size = "md",
}: {
  icon: React.ComponentType<{ className?: string }>;
  tone?: Tone;
  size?: "sm" | "md";
}) {
  return (
    <span aria-hidden className={`ui-icon-tile ui-tone-${tone} ${size === "sm" ? "ui-icon-tile-sm" : ""}`}>
      <Icon className={size === "sm" ? "h-4 w-4" : "h-[18px] w-[18px]"} />
    </span>
  );
}

/** A section heading with its icon tile, and an optional link on the right. */
export function SectionTitle({
  icon,
  tone = "primary",
  title,
  count,
  href,
  linkLabel,
  as: Tag = "h2",
}: {
  icon: React.ComponentType<{ className?: string }>;
  tone?: Tone;
  title: ReactNode;
  count?: number;
  href?: string;
  linkLabel?: string;
  as?: "h2" | "h3";
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-4">
      <Tag className="ui-section-title">
        <IconTile icon={icon} tone={tone} size="sm" />
        {title}
        {count !== undefined && <span className="ui-count">{count}</span>}
      </Tag>
      {href && linkLabel && (
        <Link href={href} className="ui-link focus-ring">
          {linkLabel} <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}

/** One figure: a value in the display face over its label, with an icon. */
export function StatTile({
  icon,
  tone = "primary",
  value,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  tone?: Tone;
  value: ReactNode;
  label: string;
}) {
  return (
    <div className={`ui-card ui-stat ui-tone-${tone}`}>
      <IconTile icon={icon} tone={tone} />
      <div className="min-w-0">
        <div className="ui-stat-value">{value}</div>
        <div className="ui-stat-label">{label}</div>
      </div>
    </div>
  );
}
