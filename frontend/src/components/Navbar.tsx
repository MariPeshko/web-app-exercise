"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Brain, LogOut, Menu, User } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { springBouncy, springSnappy } from "@/lib/animations";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={springBouncy}
      className="fixed top-0 left-0 right-0 z-50 border-b-2 border-foreground bg-background"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-xl font-black uppercase tracking-wider">
          <motion.div
            whileHover={{ rotate: -10, scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            transition={springBouncy}
            className="flex h-10 w-10 items-center justify-center border-2 border-foreground bg-primary shadow-[3px_3px_0px_0px_#000000]"
          >
            <Brain className="h-6 w-6 text-primary-foreground" />
          </motion.div>
          <span className="font-heading text-foreground">
            Stud<span className="text-primary">AI</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-4 md:flex">
          <Link
            href="/#features"
            className="border-b-2 border-transparent px-2 py-1 text-sm font-bold uppercase tracking-wider text-muted-foreground transition-all hover:border-primary hover:text-foreground"
          >
            Features
          </Link>
          <Link
            href="/#how-it-works"
            className="border-b-2 border-transparent px-2 py-1 text-sm font-bold uppercase tracking-wider text-muted-foreground transition-all hover:border-secondary hover:text-foreground"
          >
            How It Works
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Button asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={springSnappy}
                    className="focus:outline-none"
                  >
                    <Avatar className="h-9 w-9 border-2 border-foreground shadow-[2px_2px_0px_0px_#000000]">
                      <AvatarFallback className="bg-secondary text-secondary-foreground text-sm font-black">
                        {user?.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </motion.button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 rounded-none border-2 border-foreground bg-background shadow-[4px_4px_0px_0px_#000000]">
                  <DropdownMenuItem disabled className="text-muted-foreground text-xs font-mono">
                    {user?.email}
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="font-bold uppercase cursor-pointer">
                    <Link href="/profile/me">
                      <User className="mr-2 h-4 w-4" />
                      My Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout} className="font-bold uppercase text-pink focus:text-pink cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Button variant="ghost" asChild>
                <Link href="/login">Log In</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 bg-background">
              <SheetTitle className="font-heading text-xl font-black uppercase">
                Stud<span className="text-primary">AI</span>
              </SheetTitle>
              <nav className="mt-8 flex flex-col gap-4">
                <Link
                  href="/#features"
                  className="border-b-2 border-transparent py-2 font-bold uppercase tracking-wider text-muted-foreground hover:border-primary hover:text-foreground"
                  onClick={() => setMobileOpen(false)}
                >
                  Features
                </Link>
                <Link
                  href="/#how-it-works"
                  className="border-b-2 border-transparent py-2 font-bold uppercase tracking-wider text-muted-foreground hover:border-secondary hover:text-foreground"
                  onClick={() => setMobileOpen(false)}
                >
                  How It Works
                </Link>
                <AnimatePresence>
                  {isAuthenticated ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col gap-3 border-t-2 border-foreground pt-4"
                    >
                      <Button asChild>
                        <Link href="/dashboard" onClick={() => setMobileOpen(false)}>Dashboard</Link>
                      </Button>
                      <Button variant="outline" asChild>
                        <Link href="/profile/me" onClick={() => setMobileOpen(false)}>
                          <User className="mr-2 h-4 w-4" /> My Profile
                        </Link>
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => { logout(); setMobileOpen(false); }}
                      >
                        <LogOut className="mr-2 h-4 w-4" /> Logout
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col gap-3 border-t-2 border-foreground pt-4"
                    >
                      <Button variant="outline" asChild>
                        <Link href="/login" onClick={() => setMobileOpen(false)}>Log In</Link>
                      </Button>
                      <Button asChild>
                        <Link href="/signup" onClick={() => setMobileOpen(false)}>Sign Up</Link>
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.nav>
  );
}
