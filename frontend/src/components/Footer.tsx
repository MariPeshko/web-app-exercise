import Link from "next/link";
import { Brain } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t-2 border-foreground bg-card">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 text-lg font-black uppercase tracking-wider">
              <div className="flex h-8 w-8 items-center justify-center border-2 border-foreground bg-primary shadow-[2px_2px_0px_0px_#000000]">
                <Brain className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-heading">
                Stud<span className="text-primary">AI</span>
              </span>
            </Link>
            <p className="mt-3 max-w-md text-sm text-muted-foreground">
              The multiplayer study platform powered by AI. Upload your documents,
              challenge your friends, and master any subject together.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="mb-3 font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Product
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/#features" className="text-muted-foreground transition-colors hover:text-primary border-b border-transparent hover:border-primary">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="text-muted-foreground transition-colors hover:text-primary border-b border-transparent hover:border-primary">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/signup" className="text-muted-foreground transition-colors hover:text-primary border-b border-transparent hover:border-primary">
                  Get Started
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Legal
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><span className="cursor-default">Privacy Policy</span></li>
              <li><span className="cursor-default">Terms of Service</span></li>
            </ul>
          </div>
        </div>

        <div className="my-8 h-[2px] w-full bg-foreground" />

        <div className="text-center font-mono text-xs uppercase tracking-widest text-muted-foreground">
          &copy; {new Date().getFullYear()} StudAI. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
