import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { Award, Download, Share2, Medal, CheckCircle2, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default async function CertificatesDashboard() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  // Mock data for certificates
  const certificates = [
    {
      id: "CERT-9823-AI",
      title: "Advanced Artificial Intelligence Certification",
      issuer: "Panoptical AI Institute",
      issueDate: "Oct 12, 2025",
      skills: ["Neural Networks", "Deep Learning", "TensorFlow"],
      credentialId: "P-AI-9823",
      color: "blue"
    },
    {
      id: "CERT-4412-CYBER",
      title: "Cyber Security Fundamentals",
      issuer: "Panoptical Security Labs",
      issueDate: "Jan 05, 2026",
      skills: ["Network Security", "Penetration Testing", "Cryptography"],
      credentialId: "P-SEC-4412",
      color: "emerald"
    }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 pt-10">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Certificates</h1>
          <p className="text-muted-foreground mt-1">View, download, and share your earned credentials and achievements.</p>
        </div>
      </div>

      {certificates.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <Award className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold mb-2">No Certificates Yet</h3>
          <p className="text-muted-foreground max-w-md text-center mb-6">
            You haven't earned any certificates yet. Complete programs and labs to start building your credentials.
          </p>
          <Link href="/dashboard/programs" className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
            Browse Programs
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {certificates.map((cert) => (
            <div key={cert.id} className="bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col">
              {/* Certificate Header Graphic */}
              <div className={`h-24 bg-${cert.color}-500/10 border-b border-border flex items-center justify-between px-6 relative overflow-hidden`}>
                <div className={`absolute top-[-50%] right-[-10%] w-[50%] h-[200%] bg-${cert.color}-500/20 rounded-full blur-[40px]`} />
                <div className="flex items-center gap-3 z-10">
                  <div className={`w-12 h-12 bg-background rounded-full flex items-center justify-center border-2 border-${cert.color}-500 shadow-sm`}>
                    <Medal className={`w-6 h-6 text-${cert.color}-500`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg leading-tight">{cert.title}</h3>
                    <p className="text-sm text-muted-foreground font-medium">{cert.issuer}</p>
                  </div>
                </div>
                <div className="z-10 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full border border-border text-xs font-bold flex items-center gap-1.5 shadow-sm">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                  Verified
                </div>
              </div>

              {/* Certificate Details */}
              <div className="p-6 flex-1 flex flex-col">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <div className="text-xs text-muted-foreground font-medium mb-1 uppercase tracking-wider">Date Earned</div>
                    <div className="font-medium">{cert.issueDate}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground font-medium mb-1 uppercase tracking-wider">Credential ID</div>
                    <div className="font-medium font-mono text-sm">{cert.credentialId}</div>
                  </div>
                </div>

                <div className="mb-8">
                  <div className="text-xs text-muted-foreground font-medium mb-3 uppercase tracking-wider">Skills Verified</div>
                  <div className="flex flex-wrap gap-2">
                    {cert.skills.map(skill => (
                      <span key={skill} className="px-2.5 py-1 bg-muted text-muted-foreground rounded-md text-xs font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-auto flex gap-3 pt-4 border-t border-border">
                  <button className="flex-1 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 shadow-sm">
                    <Download className="w-4 h-4" /> Download PDF
                  </button>
                  <button className="px-4 py-2 border border-input bg-background hover:bg-muted text-foreground text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm">
                    <Share2 className="w-4 h-4" /> Share
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Verification section */}
      <div className="mt-12 p-6 bg-secondary/30 rounded-xl border border-secondary/50 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="bg-background p-3 rounded-xl shadow-sm border border-border">
            <ShieldCheck className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Blockchain Verifiable</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-xl">
              All Panoptical Labs certificates are cryptographically signed and independently verifiable. You can add them directly to your LinkedIn profile with one click.
            </p>
          </div>
        </div>
        <button className="whitespace-nowrap px-4 py-2 bg-background border border-border text-sm font-medium rounded-lg hover:bg-muted transition-colors shadow-sm">
          Verify a Certificate
        </button>
      </div>
    </div>
  );
}
