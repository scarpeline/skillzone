import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Gamepad2,
  Trophy,
  BarChart3,
  Wallet,
  User,
  Menu,
  X,
  Users,
  Star,
} from "lucide-react";

const navItems = [
  { path: "/games", label: "Jogos", icon: Gamepad2 },
  { path: "/tournaments", label: "Torneios", icon: Trophy },
  { path: "/rankings", label: "Rankings", icon: BarChart3 },
  { path: "/hall-of-fame", label: "Hall da Fama", icon: Star },
  { path: "/records", label: "Recordes", icon: Trophy },
  { path: "/affiliates", label: "Afiliados", icon: Users },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center glow-cyan">
                <Gamepad2 className="w-5 h-5 md:w-6 md:h-6 text-primary-foreground" />
              </div>
            </div>
            <span className="font-display text-xl md:text-2xl font-bold text-gradient-neon hidden sm:block">
              SKILLZONE
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className={isActive ? "" : "text-muted-foreground hover:text-foreground"}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/wallet">
              <Button variant="outline" size="sm">
                <Wallet className="w-4 h-4" />
                Carteira
              </Button>
            </Link>
            <Link to="/profile">
              <Button variant="ghost" size="icon">
                <User className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="hero" size="sm">
                Entrar
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-card border-b border-border overflow-hidden"
          >
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                  >
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className="w-full justify-start"
                    >
                      <Icon className="w-5 h-5 mr-2" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
              <div className="h-px bg-border my-2" />
              <Link to="/wallet" onClick={() => setIsOpen(false)}>
                <Button variant="outline" className="w-full justify-start">
                  <Wallet className="w-5 h-5 mr-2" />
                  Carteira
                </Button>
              </Link>
              <Link to="/profile" onClick={() => setIsOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  <User className="w-5 h-5 mr-2" />
                  Perfil
                </Button>
              </Link>
              <Link to="/login" onClick={() => setIsOpen(false)}>
                <Button variant="hero" className="w-full">
                  Entrar
                </Button>
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
