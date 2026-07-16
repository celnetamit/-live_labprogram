"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Lock, CheckCircle2, Award, ArrowRight, FlaskConical } from "lucide-react";
import { formatPrice } from "@/lib/access";

export type CatalogLab = {
  id: string;
  slug: string;
  title: string;
  synopsis: string;
  subject: string;
  difficulty: string;
  points: number;
  keySkills: string[];
  priceMinor: number;
  currency: string;
  owned: boolean;
};

const difficultyColor: Record<string, string> = {
  Beginner: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  Intermediate: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  Advanced: "text-rose-400 bg-rose-500/10 border-rose-500/20",
};

export default function LabCatalogClient({
  labs,
  isAdmin,
  publicMode = false,
}: {
  labs: CatalogLab[];
  isAdmin: boolean;
  publicMode?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState("All");
  const [difficulty, setDifficulty] = useState("All");

  const subjects = useMemo(
    () => ["All", ...Array.from(new Set(labs.map((l) => l.subject))).sort()],
    [labs]
  );
  const difficulties = ["All", "Beginner", "Intermediate", "Advanced"];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return labs.filter((l) => {
      if (subject !== "All" && l.subject !== subject) return false;
      if (difficulty !== "All" && l.difficulty !== difficulty) return false;
      if (q && !(`${l.title} ${l.synopsis} ${l.keySkills.join(" ")}`.toLowerCase().includes(q)))
        return false;
      return true;
    });
  }, [labs, query, subject, difficulty]);

  const ownedCount = labs.filter((l) => l.owned).length;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          {publicMode ? "Explore Labs" : "Lab Catalog"}
        </h1>
        <p className="text-muted-foreground mt-1">
          {labs.length} premium workshop labs.{" "}
          {publicMode ? (
            <>Browse everything free — <span className="text-primary font-medium">sign in</span> to open a lab and unlock its resources.</>
          ) : isAdmin ? (
            <span className="text-primary font-medium">Admin — full access to all labs.</span>
          ) : (
            <>
              You own <span className="text-primary font-medium">{ownedCount}</span>. Buy a lab to
              unlock its full resources and launch link.
            </>
          )}
        </p>
      </div>

      {/* Filters */}
      <div className="glass rounded-xl p-3 sm:p-4 mb-6 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search labs, skills…"
            className="h-10 w-full rounded-lg border border-input bg-background/50 pl-10 pr-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="h-10 rounded-lg border border-input bg-background/50 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {subjects.map((s) => (
            <option key={s} value={s}>
              {s === "All" ? "All subjects" : s}
            </option>
          ))}
        </select>
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="h-10 rounded-lg border border-input bg-background/50 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {difficulties.map((d) => (
            <option key={d} value={d}>
              {d === "All" ? "All levels" : d}
            </option>
          ))}
        </select>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Showing {filtered.length} of {labs.length}
      </p>

      {/* Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((lab) => (
          <Link
            key={lab.id}
            href={`/dashboard/labs/${lab.slug}`}
            className="group flex flex-col rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all"
          >
            <div className="p-5 flex-1">
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-wider">
                  <FlaskConical className="w-3.5 h-3.5" />
                  {lab.subject}
                </span>
                {lab.owned ? (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" /> Owned
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
                    <Lock className="w-3.5 h-3.5" /> Locked
                  </span>
                )}
              </div>
              <h3 className="text-lg font-bold leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2">
                {lab.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{lab.synopsis}</p>
              <div className="flex flex-wrap gap-1.5">
                {lab.keySkills.slice(0, 3).map((s) => (
                  <span
                    key={s}
                    className="text-[11px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <div className="px-5 py-3 border-t border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span
                  className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${
                    difficultyColor[lab.difficulty] ?? "text-muted-foreground border-border"
                  }`}
                >
                  {lab.difficulty}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Award className="w-3.5 h-3.5" /> {lab.points} pts
                </span>
              </div>
              {lab.owned ? (
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
                  Open <ArrowRight className="w-4 h-4" />
                </span>
              ) : (
                <span className="text-sm font-bold text-foreground">
                  {formatPrice(lab.priceMinor, lab.currency)}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          No labs match your filters.
        </div>
      )}
    </div>
  );
}
