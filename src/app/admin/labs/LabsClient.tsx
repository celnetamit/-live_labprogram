"use client";

import { useState } from "react";
import { Plus, Search, Filter, MoreHorizontal, FlaskConical, Edit, Trash, Lock, Globe, X, Loader2 } from "lucide-react";
import { Lab } from "@prisma/client";
import { createLab, updateLab, deleteLab } from "./actions";

export default function LabsClient({ initialLabs }: { initialLabs: Lab[] }) {
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLab, setEditingLab] = useState<Lab | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredLabs = initialLabs.filter(lab => 
    lab.name.toLowerCase().includes(search.toLowerCase()) || 
    lab.domainUrl.toLowerCase().includes(search.toLowerCase()) ||
    lab.category?.toLowerCase().includes(search.toLowerCase())
  );

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
      if (editingLab) {
        await updateLab(editingLab.id, formData);
      } else {
        await createLab(formData);
      }
      closeModal();
    } catch (error) {
      console.error(error);
      alert("An error occurred while saving the lab.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this lab? This action cannot be undone.")) return;
    
    setDeletingId(id);
    try {
      await deleteLab(id);
    } catch (error) {
      console.error(error);
      alert("Failed to delete lab.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lab Management</h1>
          <p className="text-muted-foreground mt-1">Manage external lab deployments and ecosystem integrations.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5 mr-2" /> Add New Lab
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden relative">
        {/* Toolbar */}
        <div className="p-4 border-b border-border flex flex-col sm:flex-row justify-between gap-4 bg-muted/20">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text"
              placeholder="Search labs by name, domain, or category..."
              className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button className="flex items-center px-3 py-2 bg-background border border-input rounded-md text-sm font-medium hover:bg-muted transition-colors">
              <Filter className="w-4 h-4 mr-2" /> Filter
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground bg-muted/50 uppercase">
              <tr>
                <th className="px-6 py-4 font-medium">Lab Details</th>
                <th className="px-6 py-4 font-medium">Domain Integration</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Access Type</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredLabs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    No labs found matching "{search}"
                  </td>
                </tr>
              ) : null}
              {filteredLabs.map((lab) => (
                <tr key={lab.id} className="hover:bg-muted/20 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <FlaskConical className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">{lab.name}</div>
                        <div className="text-xs text-muted-foreground">ID: {lab.id.substring(0,8)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <a href={`http://${lab.domainUrl}`} target="_blank" rel="noopener noreferrer" className="flex items-center text-muted-foreground hover:text-primary cursor-pointer transition-colors">
                      <Globe className="w-4 h-4 mr-2" />
                      {lab.domainUrl}
                    </a>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{lab.category || "Uncategorized"}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-muted-foreground">
                      {lab.accessType === 'Private' && <Lock className="w-3 h-3 mr-1.5" />}
                      {lab.accessType === 'Public' && <Globe className="w-3 h-3 mr-1.5 text-green-500" />}
                      {lab.accessType}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                      lab.status === 'Active' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                      lab.status === 'Maintenance' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                      'bg-red-500/10 text-red-500 border-red-500/20'
                    }`}>
                      {lab.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => openEditModal(lab)}
                        className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                        title="Edit Lab"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(lab.id)}
                        disabled={deletingId === lab.id}
                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors disabled:opacity-50"
                        title="Delete Lab"
                      >
                        {deletingId === lab.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash className="w-4 h-4" />}
                      </button>
                      <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="p-4 border-t border-border flex items-center justify-between text-sm text-muted-foreground bg-muted/20">
          <div>Showing {filteredLabs.length} labs</div>
          <div className="flex gap-1">
            <button className="px-3 py-1 border border-input rounded-md hover:bg-muted disabled:opacity-50" disabled>Previous</button>
            <button className="px-3 py-1 border border-input rounded-md hover:bg-muted bg-primary/10 text-primary border-primary/20">1</button>
            <button className="px-3 py-1 border border-input rounded-md hover:bg-muted disabled:opacity-50" disabled>Next</button>
          </div>
        </div>
      </div>

      {/* Lab Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-xl shadow-lg w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-muted/30">
              <h3 className="text-lg font-bold">{editingLab ? "Edit Lab" : "Add New Lab"}</h3>
              <button onClick={closeModal} className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted transition-colors">
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
                  placeholder="e.g. Advanced AI Subnet" 
                  className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring" 
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Domain URL</label>
                <input 
                  type="text" 
                  name="domainUrl" 
                  required
                  defaultValue={editingLab?.domainUrl}
                  placeholder="e.g. ai-lab.livelabs.local:3001" 
                  className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <input 
                  type="text" 
                  name="category" 
                  defaultValue={editingLab?.category || ""}
                  placeholder="e.g. Security, AI, Data Science" 
                  className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Access Type</label>
                  <select 
                    name="accessType" 
                    defaultValue={editingLab?.accessType || "Private"}
                    className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="Public">Public</option>
                    <option value="Private">Private</option>
                    <option value="Subscription">Subscription</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <select 
                    name="status" 
                    defaultValue={editingLab?.status || "Active"}
                    className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="Active">Active</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-border flex justify-end gap-3">
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
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors flex items-center"
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
