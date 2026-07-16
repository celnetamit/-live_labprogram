"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Shield,
  User as UserIcon,
  Mail,
  CheckCircle2,
  ShieldAlert,
  Settings2,
  X,
  Loader2,
  Plus,
  Trash,
} from "lucide-react";
import {
  setUserRole,
  setUserStatus,
  grantLabAccess,
  revokeLabAccess,
} from "./actions";

export type LabOption = { id: string; name: string; subject: string | null; priceMinor: number };
export type AdminUser = {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  status: string;
  organization: string | null;
  designation: string | null;
  purchases: number;
  access: { labId: string; labName: string; source: string }[];
};

export default function UsersClient({ users, labs }: { users: AdminUser[]; labs: LabOption[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [managingId, setManagingId] = useState<string | null>(null);
  const managing = managingId ? users.find((u) => u.id === managingId) ?? null : null;

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter(
      (u) =>
        (u.name ?? "").toLowerCase().includes(q) || (u.email ?? "").toLowerCase().includes(q)
    );
  }, [users, search]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Users &amp; Access</h1>
        <p className="text-muted-foreground mt-1">
          Manage roles, status, and per-lab access for every member.
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/20">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search users by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground bg-muted/50 uppercase border-b border-border">
              <tr>
                <th className="px-4 sm:px-6 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">Lab Access</th>
                <th className="px-4 py-3 font-medium hidden lg:table-cell">Purchases</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 sm:px-6 py-3 text-right font-medium">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-muted/10 transition-colors">
                  <td className="px-4 sm:px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center font-bold text-secondary-foreground shrink-0 border border-border">
                        {u.name ? u.name.charAt(0).toUpperCase() : "U"}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground truncate">
                          {u.name || "Anonymous"}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Mail className="w-3 h-3 shrink-0" />
                          <span className="truncate">{u.email}</span>
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border ${
                        u.role === "SUPER_ADMIN"
                          ? "bg-primary/10 text-primary border-primary/20"
                          : "bg-muted text-muted-foreground border-border"
                      }`}
                    >
                      {u.role === "SUPER_ADMIN" ? (
                        <Shield className="w-3 h-3 mr-1.5" />
                      ) : (
                        <UserIcon className="w-3 h-3 mr-1.5" />
                      )}
                      {u.role.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium hidden md:table-cell">
                    {u.role === "SUPER_ADMIN" ? "All" : `${u.access.length} labs`}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                    {u.purchases}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center text-xs font-medium ${
                        u.status === "ACTIVE" ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {u.status === "ACTIVE" ? (
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      ) : (
                        <ShieldAlert className="w-3.5 h-3.5 mr-1" />
                      )}
                      {u.status}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-3 text-right">
                    <button
                      onClick={() => setManagingId(u.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-lg text-xs font-medium hover:bg-accent transition-colors"
                    >
                      <Settings2 className="w-3.5 h-3.5" /> Manage
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-muted-foreground">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-border text-sm text-muted-foreground bg-muted/20">
          {filtered.length} of {users.length} users
        </div>
      </div>

      {managing && (
        <ManageModal
          user={managing}
          labs={labs}
          onClose={() => setManagingId(null)}
          onChanged={() => router.refresh()}
        />
      )}
    </div>
  );
}

function ManageModal({
  user,
  labs,
  onClose,
  onChanged,
}: {
  user: AdminUser;
  labs: LabOption[];
  onClose: () => void;
  onChanged: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [labSearch, setLabSearch] = useState("");
  const grantedIds = new Set(user.access.map((a) => a.labId));

  const run = (fn: () => Promise<unknown>) => startTransition(() => void fn().then(onChanged));

  const matches = useMemo(() => {
    const q = labSearch.toLowerCase();
    if (!q) return [];
    return labs.filter((l) => !grantedIds.has(l.id) && l.name.toLowerCase().includes(q)).slice(0, 6);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [labSearch, labs]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-muted/30 sticky top-0">
          <div>
            <h3 className="text-lg font-bold">{user.name || "User"}</h3>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Role + status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Role</label>
              <select
                defaultValue={user.role}
                disabled={pending}
                onChange={(e) => run(() => setUserRole(user.id, e.target.value))}
                className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm"
              >
                <option value="USER">User</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Status</label>
              <select
                defaultValue={user.status === "ACTIVE" ? "ACTIVE" : "SUSPENDED"}
                disabled={pending}
                onChange={(e) => run(() => setUserStatus(user.id, e.target.value))}
                className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm"
              >
                <option value="ACTIVE">Active</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>
          </div>

          {/* Grant lab */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Plus className="w-4 h-4" /> Grant lab access
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
              <input
                value={labSearch}
                onChange={(e) => setLabSearch(e.target.value)}
                placeholder="Search labs to grant…"
                className="w-full pl-9 pr-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            {matches.length > 0 && (
              <div className="border border-border rounded-lg divide-y divide-border overflow-hidden">
                {matches.map((l) => (
                  <button
                    key={l.id}
                    disabled={pending}
                    onClick={() =>
                      run(async () => {
                        await grantLabAccess(user.id, l.id);
                        setLabSearch("");
                      })
                    }
                    className="w-full flex items-center justify-between px-3 py-2 text-left text-sm hover:bg-accent transition-colors disabled:opacity-50"
                  >
                    <span className="truncate">{l.name}</span>
                    <span className="text-xs text-primary font-medium">Grant</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Current access */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Current access ({user.role === "SUPER_ADMIN" ? "all labs (admin)" : user.access.length})
            </label>
            {user.role === "SUPER_ADMIN" ? (
              <p className="text-sm text-muted-foreground">
                Admins have access to every lab automatically.
              </p>
            ) : user.access.length === 0 ? (
              <p className="text-sm text-muted-foreground">No labs granted yet.</p>
            ) : (
              <div className="space-y-1.5 max-h-52 overflow-y-auto">
                {user.access.map((a) => (
                  <div
                    key={a.labId}
                    className="flex items-center justify-between px-3 py-2 rounded-lg bg-secondary/50 text-sm"
                  >
                    <span className="truncate">
                      {a.labName}
                      <span className="ml-2 text-[11px] text-muted-foreground uppercase">
                        {a.source}
                      </span>
                    </span>
                    <button
                      disabled={pending}
                      onClick={() => run(() => revokeLabAccess(user.id, a.labId))}
                      className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors disabled:opacity-50"
                      title="Revoke"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {pending && (
            <p className="text-xs text-muted-foreground flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
