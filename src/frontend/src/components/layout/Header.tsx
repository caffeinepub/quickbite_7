import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChefHat,
  ClipboardList,
  LogOut,
  Menu,
  Settings,
  ShoppingCart,
  User,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useCart } from "../../contexts/CartContext";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";
import { useIsAdmin } from "../../hooks/useQueries";

interface HeaderProps {
  onNavigate: (page: "home" | "orders" | "admin") => void;
  currentPage: string;
}

export function Header({ onNavigate, currentPage }: HeaderProps) {
  const { identity, login, clear, isLoggingIn } = useInternetIdentity();
  const { itemCount, openCart } = useCart();
  const { data: isAdmin } = useIsAdmin();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isLoggedIn = !!identity;

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/90 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <button
          type="button"
          onClick={() => onNavigate("home")}
          className="flex items-center gap-2.5 group"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-glow-sm group-hover:shadow-glow transition-shadow duration-300">
            <img
              src="/assets/generated/quickbite-logo-transparent.dim_120x120.png"
              alt="QuickBite"
              className="h-7 w-7 object-contain"
            />
          </div>
          <span className="font-display text-xl font-700 tracking-tight">
            Quick<span className="text-primary">Bite</span>
          </span>
        </button>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          <Button
            variant={currentPage === "home" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => onNavigate("home")}
            className="font-body font-500"
          >
            <ChefHat className="mr-1.5 h-4 w-4" />
            Restaurants
          </Button>
          {isLoggedIn && (
            <Button
              variant={currentPage === "orders" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => onNavigate("orders")}
              className="font-body font-500"
            >
              <ClipboardList className="mr-1.5 h-4 w-4" />
              My Orders
            </Button>
          )}
          {isLoggedIn && isAdmin && (
            <Button
              variant={currentPage === "admin" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => onNavigate("admin")}
              className="font-body font-500"
            >
              <Settings className="mr-1.5 h-4 w-4" />
              Admin
            </Button>
          )}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Cart button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={openCart}
            className="relative"
            aria-label={`Cart with ${itemCount} items`}
          >
            <ShoppingCart className="h-5 w-5" />
            <AnimatePresence>
              {itemCount > 0 && (
                <motion.div
                  key="badge"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -right-1 -top-1"
                >
                  <Badge className="flex h-5 w-5 items-center justify-center rounded-full bg-primary p-0 text-xs font-bold text-primary-foreground">
                    {itemCount > 9 ? "9+" : itemCount}
                  </Badge>
                </motion.div>
              )}
            </AnimatePresence>
          </Button>

          {/* Auth button */}
          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="secondary"
                  size="sm"
                  className="hidden md:flex gap-2"
                >
                  <User className="h-4 w-4" />
                  <span className="font-body font-500">Account</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => onNavigate("orders")}>
                  <ClipboardList className="mr-2 h-4 w-4" />
                  My Orders
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem onClick={() => onNavigate("admin")}>
                    <Settings className="mr-2 h-4 w-4" />
                    Admin Panel
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={clear}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              size="sm"
              onClick={login}
              disabled={isLoggingIn}
              className="hidden md:flex bg-primary hover:bg-primary/90 text-primary-foreground font-body font-600 shadow-glow-sm"
            >
              {isLoggingIn ? (
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Signing in…
                </span>
              ) : (
                <>
                  <User className="mr-1.5 h-4 w-4" />
                  Sign In
                </>
              )}
            </Button>
          )}

          {/* Mobile menu */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile menu panel */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-border/50 bg-background/95 md:hidden"
          >
            <div className="container flex flex-col gap-1 px-4 py-3">
              <Button
                variant={currentPage === "home" ? "secondary" : "ghost"}
                className="justify-start"
                onClick={() => {
                  onNavigate("home");
                  setMobileMenuOpen(false);
                }}
              >
                <ChefHat className="mr-2 h-4 w-4" />
                Restaurants
              </Button>
              {isLoggedIn && (
                <Button
                  variant={currentPage === "orders" ? "secondary" : "ghost"}
                  className="justify-start"
                  onClick={() => {
                    onNavigate("orders");
                    setMobileMenuOpen(false);
                  }}
                >
                  <ClipboardList className="mr-2 h-4 w-4" />
                  My Orders
                </Button>
              )}
              {isLoggedIn && isAdmin && (
                <Button
                  variant={currentPage === "admin" ? "secondary" : "ghost"}
                  className="justify-start"
                  onClick={() => {
                    onNavigate("admin");
                    setMobileMenuOpen(false);
                  }}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Admin Panel
                </Button>
              )}
              {isLoggedIn ? (
                <Button
                  variant="ghost"
                  className="justify-start text-destructive"
                  onClick={() => {
                    clear();
                    setMobileMenuOpen(false);
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    login();
                    setMobileMenuOpen(false);
                  }}
                  disabled={isLoggingIn}
                  className="justify-start bg-primary text-primary-foreground"
                >
                  <User className="mr-2 h-4 w-4" />
                  Sign In
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
