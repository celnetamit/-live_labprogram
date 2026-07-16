"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  FlaskConical,
  Edit,
  Trash,
  X,
  Loader2,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { Lab } from "@prisma/client";
import { createLab, updateLab, deleteLab, syncLabs } from "./actions";

const PAGE_SIZE = 15;

function statusBadge(status: string) {
  const s = status.toUpperCase();
  if (s === "ACTIVE") return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
  if (s === "MAINTENANCE") return "bg-amber-500/10 text-amber-400 border-amber-500/20";
  return "bg-rose-500/10 text-rose-400 border-rose-500/20";
}

export default function LabsClient({ initialLabs }: { initialLabs: Lab[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLab, setEditingLab] = useState<Lab | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [notice, setNotice] = useState("");

  const filteredLabs = useMemo(() => {
    const q = search.toLowerCase();
    return initialLabs.filter(
      (lab) =>
        lab.name.toLowerCase().includes(q) ||
        (lab.subject ?? "").toLowerCase().includes(q) ||
        (lab.domainUrl ?? "").toLowerCase().includes(q)
    );
  }, [initialLabs, search]);

  const totalPages = Math.max(1, Math.ceil(filteredLabs.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const pageLabs = filteredLabs.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const openAddModal = () => {
    setEditingLab(null);
    setIsModalOpen(true);
  };
  const openEditModal = (lab: Lab) => {
    setEditingLab(lab);
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingLab(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    try {
      if (editingLab) await updateLab(editingLab.id, formData);
      else await createLab(formData);
      closeModal();
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("An error occurred while saving the lab.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this lab? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await deleteLab(id);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to delete lab.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    setNotice("");
    try {
      const r = await syncLabs();
      setNotice(`Synced: ${r.created} new, ${r.updated} updated · ${r.total} total.`);
      router.refresh();
    } catch (e) {
      console.error(e);
      setNotice("Sync failed.");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <>
      <div className="flex flex-wrap justify-between items-end gap-3 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Lab Management</h1>
          <p className="text-muted-foreground mt-1">
            {initialLabs.length} labs · manage pricing, availability, and launch URLs.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center px-4 py-2 border border-border rounded-lg font-medium hover:bg-accent transition-colors disabled:opacity-60"
          >
            {syncing ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Sync from source
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center px-4 py-2 btn-brand rounded-lg font-medium"
          >
            <Plus className="w-5 h-5 mr-2" /> Add Lab
          </button>
        </div>
      </div>

      {notice && (
        <div className="mb-4 text-sm px-4 py-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
          {notice}
        </div>
      )}

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/20">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, subject, or URL…"
              className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground bg-muted/50 uppercase">
              <tr>
                <th className="px-4 sm:px-6 py-3 font-medium">Lab</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">Subject</th>
                <th className="px-4 py-3 font-medium hidden lg:table-cell">Level</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 sm:px-6 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {pageLabs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    No labs found.
                  </td>
                </tr>
              )}
              {pageLabs.map((lab) => (
                <tr key={lab.id} className="hover:bg-muted/20 transition-colors group">
                  <td className="px-4 sm:px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <FlaskConical className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-foreground truncate max-w-[220px]">
                          {lab.name}
                        </div>
                        {lab.sourceUrl && (
                          <a
                            href={lab.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1 truncate max-w-[220px]"
                          >
                            {lab.sourceUrl.replace(/^https?:\/\//, "")}
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </a>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                    {lab.subject || "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                    {lab.difficulty || "—"}
                  </td>
                  <td className="px-4 py-3 font-medium">
                    ₹{(lab.priceMinor / 100).toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusBadge(
                        lab.status
                      )}`}
                    >
                      {lab.enabled ? lab.status : "DISABLED"}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => openEditModal(lab)}
                        className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(lab.id)}
                        disabled={deletingId === lab.id}
                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors disabled:opacity-50"
                        title="Delete"
                      >
                        {deletingId === lab.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-border flex items-center justify-between text-sm text-muted-foreground bg-muted/20">
          <div>
            {filteredLabs.length} labs · page {current}/{totalPages}
          </div>
          <div className="flex gap-1">
            <button
              className="px-3 py-1 border border-input rounded-md hover:bg-muted disabled:opacity-50"
              disabled={current <= 1}
              onClick={() => setPage(current - 1)}
            >
              Previous
            </button>
            <button
              className="px-3 py-1 border border-input rounded-md hover:bg-muted disabled:opacity-50"
              disabled={current >= totalPages}
              onClick={() => setPage(current + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-muted/30 sticky top-0">
              <h3 className="text-lg font-bold">{editingLab ? "Edit Lab" : "Add New Lab"}</h3>
              <button
                onClick={closeModal}
                className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Lab Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  defaultValue={editingLab?.name}
                  className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    defaultValue={editingLab?.subject || ""}
                    className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Difficulty</label>
                  <select
                    name="difficulty"
                    defaultValue={editingLab?.difficulty || "Beginner"}
                    className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Launch / Source URL</label>
                <input
                  type="text"
                  name="sourceUrl"
                  defaultValue={editingLab?.sourceUrl || ""}
                  placeholder="https://lab.example.com/"
                  className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Internal Domain (unique)</label>
                <input
                  type="text"
                  name="domainUrl"
                  required
                  defaultValue={editingLab?.domainUrl}
                  className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Price (₹)</label>
                  <input
                    type="number"
                    name="price"
                    min="0"
                    step="1"
                    defaultValue={editingLab ? editingLab.priceMinor / 100 : 499}
                    className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <select
                    name="status"
                    defaultValue={editingLab?.status || "ACTIVE"}
                    className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="MAINTENANCE">Maintenance</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>
              </div>

              <input type="hidden" name="accessType" value={editingLab?.accessType || "PRIVATE"} />
              <input type="hidden" name="category" value={editingLab?.category || ""} />

              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  name="enabled"
                  defaultChecked={editingLab ? editingLab.enabled : true}
                  className="w-4 h-4 accent-[var(--primary)]"
                />
                Visible in catalog (enabled)
              </label>

              <div className="pt-4 mt-2 border-t border-border flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-input bg-background hover:bg-muted rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 btn-brand rounded-lg text-sm font-medium flex items-center"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {editingLab ? "Save Changes" : "Create Lab"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
