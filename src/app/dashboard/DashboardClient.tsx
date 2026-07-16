"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ExternalLink,
  FlaskConical,
  Award,
  Layers,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

export type OwnedLab = {
  slug: string;
  title: string;
  subject: string;
  difficulty: string;
  points: number;
  sourceUrl: string | null;
  skills: string[];
};

export default function DashboardClient({
  userName,
  isAdmin,
  ownedLabs,
  totalLabs,
  totalPoints,
}: {
  userName: string;
  isAdmin: boolean;
  ownedLabs: OwnedLab[];
  totalLabs: number;
  totalPoints: number;
}) {
  const stats = [
    { label: isAdmin ? "All Labs (admin)" : "Labs Owned", value: ownedLabs.length, icon: FlaskConical },
    { label: "Catalog Size", value: totalLabs, icon: Layers },
    { label: "Points Unlocked", value: totalPoints, icon: Award },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Welcome back, {userName}</h1>
        <p className="text-muted-foreground mt-1">
          {isAdmin
            ? "You have admin access to every lab in the ecosystem."
            : "Your unlocked labs and workshop progress."}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {stats.map((s) => (
          <div key={s.label} className="glass rounded-2xl p-4 sm:p-5">
            <s.icon className="w-5 h-5 text-primary mb-2" />
            <div className="text-2xl sm:text-3xl font-extrabold">{s.value}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      {/* My Labs */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="text-emerald-400 w-5 h-5" />
          <h2 className="text-xl font-bold">{isAdmin ? "Featured Labs" : "My Labs"}</h2>
        </div>
        <Link
          href="/dashboard/labs"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          Browse catalog <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {ownedLabs.length === 0 ? (
        <div className="glass brand-ring rounded-2xl p-10 text-center">
          <div className="mx-auto w-14 h-14 rounded-2xl btn-brand flex items-center justify-center mb-4">
            <Sparkles className="w-7 h-7 text-primary-foreground" />
          </div>
          <h3 className="text-lg font-bold mb-2">No labs yet</h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            Explore {totalLabs} premium workshop labs. Buy a lab to unlock its full resources and
            live launch link.
          </p>
          <Link
            href="/dashboard/labs"
            className="inline-flex items-center gap-2 px-6 py-3 btn-brand rounded-xl font-semibold"
          >
            Browse the catalog <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {ownedLabs.map((lab, index) => (
            <motion.div
              key={lab.slug}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index, 8) * 0.05, duration: 0.3 }}
              className="flex flex-col rounded-2xl border border-border bg-card p-5 hover:border-primary/50 transition-all group"
            >
              <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                <FlaskConical className="w-5 h-5" />
              </div>
              <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">
                {lab.subject}
              </div>
              <h3 className="font-bold leading-snug mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                {lab.title}
              </h3>
              <div className="mt-auto flex items-center gap-2">
                <Link
                  href={`/dashboard/labs/${lab.slug}`}
                  className="flex-1 text-center py-2 rounded-lg border border-border text-sm font-medium hover:bg-accent transition-colors"
                >
                  Details
                </Link>
                {lab.sourceUrl && (
                  <a
                    href={lab.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 py-2 px-3 btn-brand rounded-lg text-sm font-medium whitespace-nowrap"
                  >
                    Launch <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
