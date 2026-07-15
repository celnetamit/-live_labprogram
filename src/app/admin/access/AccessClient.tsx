"use client";

import { useState } from "react";
import { Check, X, ShieldAlert, Clock, User, FlaskConical, Loader2 } from "lucide-react";
import { approveRequest, rejectRequest } from "./actions";

type RequestData = {
  id: string;
  status: string;
  requestedAt: Date;
  user: { name: string | null; email: string | null; designation: string | null; organization: string | null };
  lab: { name: string; domainUrl: string; accessType: string };
};

export default function AccessClient({ pendingRequests, processedRequests }: { pendingRequests: RequestData[], processedRequests: RequestData[] }) {
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    try {
      await approveRequest(id);
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    setProcessingId(id);
    try {
      await rejectRequest(id);
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border bg-muted/30">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-500" />
            <h2 className="text-xl font-semibold">Pending Requests ({pendingRequests.length})</h2>
          </div>
        </div>
        
        {pendingRequests.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
            <ShieldAlert className="w-8 h-8 text-muted-foreground/50 mb-3" />
            <p>No pending access requests.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {pendingRequests.map(req => (
              <div key={req.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-muted/20 transition-colors">
                <div className="grid md:grid-cols-2 gap-6 flex-1">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground shrink-0">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold">{req.user.name || "Unknown User"}</p>
                      <p className="text-sm text-muted-foreground">{req.user.email}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {req.user.designation || "No Designation"} • {req.user.organization || "No Organization"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <FlaskConical className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold">{req.lab.name}</p>
                      <p className="text-sm text-muted-foreground">{req.lab.domainUrl}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Requires <span className="font-medium">{req.lab.accessType}</span> Clearance
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2 items-center justify-end shrink-0">
                  <span className="text-xs text-muted-foreground mr-4">
                    {new Date(req.requestedAt).toLocaleDateString()}
                  </span>
                  
                  <button 
                    onClick={() => handleReject(req.id)}
                    disabled={processingId === req.id}
                    className="p-2 border border-input text-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 rounded-md transition-colors disabled:opacity-50"
                    title="Reject Request"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => handleApprove(req.id)}
                    disabled={processingId === req.id}
                    className="px-4 py-2 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center"
                  >
                    {processingId === req.id ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                    Approve
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border flex justify-between items-center">
          <h2 className="text-lg font-semibold">Recently Processed</h2>
        </div>
        
        {processedRequests.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            No processed requests in history.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground bg-muted/50 uppercase">
                <tr>
                  <th className="px-6 py-3 font-medium">User</th>
                  <th className="px-6 py-3 font-medium">Lab</th>
                  <th className="px-6 py-3 font-medium">Date</th>
                  <th className="px-6 py-3 font-medium text-right">Outcome</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {processedRequests.map(req => (
                  <tr key={req.id} className="hover:bg-muted/10">
                    <td className="px-6 py-4">
                      <p className="font-medium">{req.user.name}</p>
                      <p className="text-xs text-muted-foreground">{req.user.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium">{req.lab.name}</p>
                      <p className="text-xs text-muted-foreground">{req.lab.domainUrl}</p>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(req.requestedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                        req.status === 'APPROVED' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                      }`}>
                        {req.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
