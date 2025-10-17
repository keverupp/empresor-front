"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Menu, X, ArrowRight, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { appConfig } from "@/config/app";
import { ModeToggle } from "@/components/theme-toggle";
import { useNavigation } from "@/hooks/use-navigation";
import { useAuth } from "@/contexts/AuthContext";

interface NavItem {
  name: string;
  href: string;
}

const navItems: NavItem[] = [
  { name: "Início", href: "#hero" },
  { name: "Funcionalidades", href: "#features" },
  { name: "FAQ", href: "#faq" },
];

export default function Header2() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const { navigateTo } = useNavigation();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const containerVariants: Variants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
  };

  const mobileMenuVariants: Variants = {
    closed: {
      opacity: 0,
      x: "100%",
      transition: { duration: 0.3, ease: "easeInOut" },
    },
    open: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3, ease: "easeInOut", staggerChildren: 0.1 },
    },
  };

  const mobileItemVariants: Variants = {
    closed: { opacity: 0, x: 20 },
    open: { opacity: 1, x: 0 },
  };

  const handleNavClick = (href: string) => {
    setIsMobileMenuOpen(false);
    navigateTo(href);
  };

  return (
    <>
      <motion.header
        className={`fixed left-0 right-0 top-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "border-b border-border/50 bg-background/80 shadow-sm backdrop-blur-md"
            : "bg-transparent"
        }`}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <motion.div
              className="flex items-center space-x-3"
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <Link href="/" className="flex items-center space-x-3">
                <div className="relative">
                  <div className="flex h-9 w-9 items-center justify-center">
                    <img
                      src={appConfig.assets.logo.icon}
                      alt={appConfig.name}
                      className="h-8 w-8 text-white"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        e.currentTarget.nextElementSibling?.classList.remove(
                          "hidden"
                        );
                      }}
                    />
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-foreground">
                    {appConfig.name}
                  </span>
                </div>
              </Link>
            </motion.div>

            <nav className="hidden items-center space-x-1 lg:flex">
              {navItems.map((item) => (
                <motion.div
                  key={item.name}
                  variants={itemVariants}
                  className="relative"
                  onMouseEnter={() => setHoveredItem(item.name)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <button
                    onClick={() => handleNavClick(item.href)}
                    className="relative rounded-lg px-4 py-2 text-sm font-medium text-foreground/80 transition-colors duration-200 hover:text-foreground"
                  >
                    {hoveredItem === item.name && (
                      <motion.div
                        className="absolute inset-0 rounded-lg bg-muted"
                        layoutId="navbar-hover"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 30,
                        }}
                      />
                    )}
                    <span className="relative z-10">{item.name}</span>
                  </button>
                </motion.div>
              ))}
            </nav>

            <motion.div
              className="hidden items-center space-x-3 lg:flex"
              variants={itemVariants}
            >
              <ModeToggle />

              {isAuthenticated ? (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center space-x-2 rounded-lg bg-foreground px-5 py-2.5 text-sm font-medium text-background shadow-sm transition-all duration-200 hover:bg-foreground/90"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </motion.div>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-4 py-2 text-sm font-medium text-foreground/80 transition-colors duration-200 hover:text-foreground"
                  >
                    Entrar
                  </Link>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      href="/register"
                      className="inline-flex items-center space-x-2 rounded-lg bg-foreground px-5 py-2.5 text-sm font-medium text-background shadow-sm transition-all duration-200 hover:bg-foreground/90"
                    >
                      <span>Começar</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </motion.div>
                </>
              )}
            </motion.div>

            <motion.button
              className="rounded-lg p-2 text-foreground transition-colors duration-200 hover:bg-muted lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              variants={itemVariants}
              whileTap={{ scale: 0.95 }}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </motion.button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              className="fixed right-4 top-16 z-50 w-80 overflow-hidden rounded-2xl border border-border bg-background shadow-2xl lg:hidden"
              variants={mobileMenuVariants}
              initial="closed"
              animate="open"
              exit="closed"
            >
              <div className="space-y-6 p-6">
                <div className="space-y-1">
                  {navItems.map((item) => (
                    <motion.div key={item.name} variants={mobileItemVariants}>
                      <button
                        onClick={() => handleNavClick(item.href)}
                        className="block w-full rounded-lg px-4 py-3 text-left font-medium text-foreground transition-colors duration-200 hover:bg-muted"
                      >
                        {item.name}
                      </button>
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  className="flex items-center justify-between border-t border-border pt-6"
                  variants={mobileItemVariants}
                >
                  <span className="text-sm text-muted-foreground">Tema</span>
                  <ModeToggle />
                </motion.div>

                <motion.div
                  className="space-y-3 border-t border-border pt-6"
                  variants={mobileItemVariants}
                >
                  {isAuthenticated ? (
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        navigateTo("/dashboard");
                      }}
                      className="block w-full rounded-lg bg-foreground py-3 text-center font-medium text-background transition-all duration-200 hover:bg-foreground/90"
                    >
                      Dashboard
                    </button>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        className="block w-full rounded-lg py-3 text-center font-medium text-foreground transition-colors duration-200 hover:bg-muted"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Entrar
                      </Link>
                      <Link
                        href="/register"
                        className="block w-full rounded-lg bg-foreground py-3 text-center font-medium text-background transition-all duration-200 hover:bg-foreground/90"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Começar
                      </Link>
                    </>
                  )}
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
