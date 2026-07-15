"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink, ShieldCheck, ShieldAlert, FlaskConical, Loader2, CheckCircle2 } from "lucide-react";
import { Lab, AccessRequest } from "@prisma/client";

interface AuthorizedLab extends Lab {}

interface DashboardClientProps {
  userName: string;
  authorizedLabs: AuthorizedLab[];
  restrictedLabs: Lab[];
  pendingRequests: AccessRequest[];
}

export default function DashboardClient({ userName, authorizedLabs, restrictedLabs, pendingRequests }: DashboardClientProps) {
  const [requestingLabId, setRequestingLabId] = useState<string | null>(null);
  const [requestedLabs, setRequestedLabs] = useState<Set<string>>(new Set(pendingRequests.map(r => r.labId)));

  const handleRequestAccess = async (labId: string) => {
    setRequestingLabId(labId);
    try {
      const res = await fetch("/api/dashboard/request-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ labId })
      });
      
      if (res.ok) {
        setRequestedLabs(prev => {
          const newSet = new Set(prev);
          newSet.add(labId);
          return newSet;
        });
      }
    } catch (err) {
      console.error("Failed to request access", err);
    } finally {
      setRequestingLabId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {userName}</h1>
        <p className="text-muted-foreground mt-1">Here is the overview of your assigned programs and lab access.</p>
      </div>

      {/* Authorized Labs */}
      <div className="mb-12">
        <div className="flex items-center gap-2 mb-6">
          <ShieldCheck className="text-green-500 w-6 h-6" />
          <h2 className="text-2xl font-bold">Authorized Labs</h2>
        </div>
        
        {authorizedLabs.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground">
            You do not currently have access to any labs. Request access from the restricted labs below.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {authorizedLabs.map((lab, index) => (
              <motion.div
                key={lab.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md hover:border-primary/50 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <FlaskConical className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold mb-1 group-hover:text-primary transition-colors">{lab.name}</h3>
                <p className="text-sm text-muted-foreground mb-6">{lab.domainUrl}</p>
                
                <a href={`http://${lab.domainUrl}`} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                  Launch Lab <ExternalLink className="w-4 h-4" />
                </a>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Restricted Labs */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <ShieldAlert className="text-red-500 w-6 h-6" />
          <h2 className="text-2xl font-bold">Access Restricted / Available Labs</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {restrictedLabs.map((lab, index) => {
            const isRequested = requestedLabs.has(lab.id);
            const isRequesting = requestingLabId === lab.id;
            
            return (
              <motion.div
                key={lab.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + (index * 0.1), duration: 0.3 }}
                className="bg-card/50 border border-border rounded-xl p-6 relative overflow-hidden group"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-muted-foreground mb-1">{lab.name}</h3>
                    <p className="text-sm text-muted-foreground">{lab.domainUrl}</p>
                    <p className="text-xs text-red-500 mt-2 font-medium bg-red-500/10 inline-block px-2 py-1 rounded">Requires {lab.accessType} Access</p>
                  </div>
                  <button 
                    onClick={() => handleRequestAccess(lab.id)}
                    disabled={isRequested || isRequesting}
                    className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md text-sm font-medium hover:bg-secondary/80 transition-colors disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center min-w-[140px]"
                  >
                    {isRequesting ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Requesting</>
                    ) : isRequested ? (
                      <><CheckCircle2 className="w-4 h-4 mr-2 text-green-500" /> Requested</>
                    ) : (
                      "Request Access"
                    )}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
