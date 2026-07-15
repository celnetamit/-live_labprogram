import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { BookOpen, GraduationCap, LayoutGrid, Clock, CalendarDays, ExternalLink, ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function ProgramsDashboard() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  // Mock data for programs since we haven't added them to the Prisma schema yet
  const activePrograms = [
    {
      id: "P001",
      title: "Advanced Artificial Intelligence",
      provider: "Panoptical AI Institute",
      progress: 65,
      nextModule: "Neural Network Architectures",
      dueDate: "Oct 24, 2026",
      color: "blue"
    },
    {
      id: "P002",
      title: "Cyber Security Fundamentals",
      provider: "Panoptical Security Labs",
      progress: 32,
      nextModule: "Network Penetration Testing",
      dueDate: "Oct 28, 2026",
      color: "emerald"
    }
  ];

  const availablePrograms = [
    {
      id: "P003",
      title: "Quantum Computing Basics",
      provider: "Physics Research Dept",
      duration: "12 Weeks",
      level: "Intermediate",
      tags: ["Physics", "Computing"]
    },
    {
      id: "P004",
      title: "Data Science Masters",
      provider: "Panoptical Analytics",
      duration: "24 Weeks",
      level: "Advanced",
      tags: ["Data", "Analytics", "Python"]
    }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 pt-10">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Programs</h1>
          <p className="text-muted-foreground mt-1">Manage your enrolled courses, tracks, and educational programs.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard" className="px-4 py-2 bg-background border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors inline-flex items-center">
            <LayoutGrid className="w-4 h-4 mr-2" /> View Labs
          </Link>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors inline-flex items-center">
            <GraduationCap className="w-4 h-4 mr-2" /> Browse Catalog
          </button>
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-xl font-bold mb-6 flex items-center">
          <BookOpen className="w-5 h-5 mr-2 text-primary" /> Active Enrollments
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {activePrograms.map((program) => (
            <div key={program.id} className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              {/* Top Accent Line */}
              <div className={`absolute top-0 left-0 w-full h-1 bg-${program.color}-500`} />
              
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-1">{program.provider}</div>
                  <h3 className="text-xl font-bold">{program.title}</h3>
                </div>
                <div className="w-12 h-12 rounded-full border-4 border-muted flex items-center justify-center relative">
                  {/* Fake circular progress */}
                  <div className="text-sm font-bold">{program.progress}%</div>
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 mb-6">
                <div className="text-sm font-medium mb-1">Up Next:</div>
                <div className="text-sm text-muted-foreground flex items-center justify-between">
                  <span className="flex items-center"><Clock className="w-4 h-4 mr-2" /> {program.nextModule}</span>
                  <span className="flex items-center text-orange-500/80"><CalendarDays className="w-4 h-4 mr-1.5" /> {program.dueDate}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors flex items-center justify-center">
                  Resume Learning <ArrowRight className="w-4 h-4 ml-2" />
                </button>
                <button className="px-4 border border-input bg-background hover:bg-muted py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center">
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-6 flex items-center">
          <LayoutGrid className="w-5 h-5 mr-2 text-primary" /> Recommended for You
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availablePrograms.map((program) => (
            <div key={program.id} className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-colors flex flex-col h-full">
              <div className="flex-1">
                <div className="flex gap-2 mb-3">
                  {program.tags.map(tag => (
                    <span key={tag} className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-secondary text-secondary-foreground rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
                <h3 className="text-lg font-bold mb-1">{program.title}</h3>
                <div className="text-sm text-muted-foreground mb-4">{program.provider}</div>
              </div>
              
              <div className="pt-4 border-t border-border flex items-center justify-between mt-auto">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">{program.duration}</span>
                  <span className="text-xs font-medium">{program.level}</span>
                </div>
                <button className="px-4 py-2 bg-secondary text-secondary-foreground text-sm font-medium rounded-lg hover:bg-secondary/80 transition-colors">
                  Learn More
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
