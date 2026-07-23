"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button 
      onClick={() => signOut({ callbackUrl: `${window.location.origin}/` })}
      className="flex w-full items-center px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-muted hover:text-foreground text-red-500 hover:text-red-400"
    >
      <LogOut className="mr-3 h-4 w-4" /> Sign Out
    </button>
  );
}
