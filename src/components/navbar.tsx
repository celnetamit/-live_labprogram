import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glassmorphism border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
              P
            </div>
            <Link href="/" className="font-bold text-xl tracking-tight">
              Panoptical Labs
            </Link>
          </div>
          <div className="hidden md:flex space-x-8">
            <Link href="#programs" className="text-muted-foreground hover:text-foreground transition-colors">Programs</Link>
            <Link href="#labs" className="text-muted-foreground hover:text-foreground transition-colors">Labs</Link>
            <Link href="#about" className="text-muted-foreground hover:text-foreground transition-colors">Innovation</Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">
              Sign In
            </Link>
            <Link href="/register" className="text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
