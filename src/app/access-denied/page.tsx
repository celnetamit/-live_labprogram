"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ShieldAlert, ArrowLeft, LogOut, HelpCircle } from "lucide-react";
import { signOut } from "next-auth/react";

function AccessDeniedContent() {
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason") || "You are not authorized to access this lab environment.";
  const labSlug = searchParams.get("labSlug");

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-red-500/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-md w-full bg-slate-900/70 backdrop-blur-xl border border-red-500/30 rounded-2xl p-8 text-center shadow-2xl relative z-10">
        <div className="w-16 h-16 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center mx-auto mb-6 text-red-400">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <span className="text-xs font-semibold uppercase tracking-wider text-red-400 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
          HTTP 403 Forbidden
        </span>

        <h1 className="text-2xl font-bold mt-4 mb-2 text-white">Access Denied</h1>
        <p className="text-slate-400 text-sm leading-relaxed mb-6">{reason}</p>

        {labSlug && (
          <div className="mb-6 p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 text-xs text-slate-300">
            Requested Environment: <span className="font-mono text-white">{labSlug}</span>
          </div>
        )}

        <div className="space-y-3">
          <Link
            href="/dashboard/labs"
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium text-sm transition-all shadow-lg shadow-red-500/20"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Lab Catalog
          </Link>

          <button
            onClick={() => signOut({ callbackUrl: `${window.location.origin}/login` })}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-slate-200 font-medium text-sm transition-all"
          >
            <LogOut className="w-4 h-4" />
            Switch User Account
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-800/80 flex items-center justify-center gap-2 text-xs text-slate-500">
          <HelpCircle className="w-3.5 h-3.5" />
          Need lab allocation? Contact your platform administrator.
        </div>
      </div>
    </div>
  );
}

export default function AccessDeniedPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#090d16] flex items-center justify-center text-slate-400">Loading...</div>}>
      <AccessDeniedContent />
    </Suspense>
  );
}
