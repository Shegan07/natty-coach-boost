import { useState } from "react";
import { Menu, X, User } from "lucide-react";
import { Link } from "@tanstack/react-router";

const links = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Programs", href: "#programs" },
  { label: "Results", href: "#results" },
  { label: "Contact", href: "#contact" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <a href="#home" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-md border border-silver/40 flex items-center justify-center font-display text-silver text-lg">
            B
          </div>
          <div className="leading-tight">
            <div className="font-display text-sm tracking-wider">NATTY COACH</div>
            <div className="font-display text-sm tracking-wider text-silver-muted">BARATH</div>
          </div>
        </a>

        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex gap-3">
          <Link
            to="/login/coach"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-silver/40 text-sm font-medium hover:bg-secondary transition-colors"
          >
            <User className="h-4 w-4" /> Coach Login
          </Link>
          <Link
            to="/login/client"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-silver/40 text-sm font-medium hover:bg-secondary transition-colors"
          >
            <User className="h-4 w-4" /> Client Login
          </Link>
        </div>

        <button className="md:hidden p-2" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="px-4 py-4 flex flex-col gap-3">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-muted-foreground hover:text-foreground py-1"
              >
                {l.label}
              </a>
            ))}
            <Link
              to="/login/coach"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md border border-silver/40 text-sm font-medium mt-2"
            >
              <User className="h-4 w-4" /> Coach Login
            </Link>
            <Link
              to="/login/client"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md border border-silver/40 text-sm font-medium"
            >
              <User className="h-4 w-4" /> Client Login
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
