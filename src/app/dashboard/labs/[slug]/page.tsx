import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Award,
  ExternalLink,
  Lock,
  CheckCircle2,
  FlaskConical,
  Sparkles,
} from "lucide-react";
import { hasLabAccess, parseList, formatPrice } from "@/lib/access";
import CheckoutButton from "./CheckoutButton";

export default async function LabDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; role?: string } | undefined;
  if (!user?.id) redirect("/login");

  const lab = await prisma.lab.findUnique({ where: { slug } });
  if (!lab || !lab.enabled) notFound();

  const owned = await hasLabAccess(user.id, user.role, lab.id);
  const skills = parseList(lab.keySkills);
  const tags = parseList(lab.tags);
  const launchUrl =
    lab.sourceUrl || (lab.domainUrl && !lab.domainUrl.includes("lab.local") ? lab.domainUrl : null);

  return (
    <div className="max-w-5xl mx-auto">
      <Link
        href="/dashboard/labs"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to catalog
      </Link>

      {/* Hero */}
      <div className="relative overflow-hidden glass brand-ring rounded-2xl p-6 sm:p-8 mb-6">
        <div className="aurora-blob animate-aurora bg-brand-1 w-72 h-72 -top-20 -right-10 opacity-30" />
        <div className="relative">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-wider">
              <FlaskConical className="w-3.5 h-3.5" />
              {lab.subject ?? "General"}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full border border-border text-muted-foreground">
              {lab.difficulty ?? "Beginner"}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Award className="w-3.5 h-3.5" /> {lab.points} pts
            </span>
            {owned ? (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400">
                <CheckCircle2 className="w-4 h-4" /> Owned
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
                <Lock className="w-3.5 h-3.5" /> Locked
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">{lab.name}</h1>
          <p className="text-muted-foreground max-w-3xl">{lab.synopsis ?? lab.description}</p>

          {skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4">
              {skills.map((s) => (
                <span
                  key={s}
                  className="text-xs px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground"
                >
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {owned ? (
        <div className="space-y-6">
          {/* Launch */}
          <div className="glass rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" /> Ready to launch
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Open the live lab environment in a new tab.
              </p>
            </div>
            {launchUrl ? (
              <a
                href={launchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 btn-brand rounded-xl font-semibold whitespace-nowrap"
              >
                Launch Lab <ExternalLink className="w-4 h-4" />
              </a>
            ) : (
              <span className="text-sm text-muted-foreground">No launch URL configured.</span>
            )}
          </div>

          {/* Instructions */}
          {lab.instructions && (
            <div className="glass rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-3">Instructions</h2>
              <pre className="whitespace-pre-wrap font-sans text-sm text-muted-foreground leading-relaxed">
                {lab.instructions.trim()}
              </pre>
            </div>
          )}

          {/* Starter code */}
          {lab.starterCode && (
            <div className="glass rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-3">Starter Code</h2>
              <pre className="overflow-x-auto rounded-lg bg-background/60 border border-border p-4 text-sm font-mono">
                {lab.starterCode.trim()}
              </pre>
            </div>
          )}
        </div>
      ) : (
        /* Locked paywall */
        <div className="glass brand-ring rounded-2xl p-8 text-center">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mb-4">
            <Lock className="w-7 h-7 text-primary" />
          </div>
          <h2 className="text-xl font-bold mb-2">Unlock the full lab</h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-2">
            Buy this lab to access the step-by-step instructions, starter code, and the live
            launch link.
          </p>
          <div className="text-3xl font-extrabold text-gradient mb-6">
            {formatPrice(lab.priceMinor, lab.currency)}
          </div>
          <CheckoutButton labId={lab.id} priceLabel={formatPrice(lab.priceMinor, lab.currency)} />
          <p className="text-xs text-muted-foreground mt-4">
            One-time purchase · lifetime access to this lab
          </p>
        </div>
      )}

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-6">
          {tags.map((t) => (
            <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              #{t}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
