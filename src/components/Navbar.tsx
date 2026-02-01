import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Cat, User, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const navigate = useNavigate();
  const isLoggingOut = useRef(false);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // Handle Token Refresh
        if (event === 'TOKEN_REFRESHED') {
          console.log('Session token refreshed');
        }

        // Handle Session Expiry (Auto Logout)
        if (event === 'SIGNED_OUT') {
          if (!isLoggingOut.current) {


            // Only show if we lose an active session
            if (user) {
              toast.error("หมดเวลาการใช้งาน กรุณาเข้าสู่ระบบใหม่อีกครั้ง");
              navigate("/login");
            }
          }
          // Reset for next time (though usually we navigate away)
          isLoggingOut.current = false;
        }

        setUser(session?.user ?? null);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [user, navigate]);

  const handleLogout = async () => {
    try {
      isLoggingOut.current = true; // Mark as manual logout
      await supabase.auth.signOut();

      // Explicitly clear Supabase tokens from localStorage to ensure clean state
      // This handles cases where signOut() might leave some artifacts
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('sb-') || key.includes('supabase')) {
          localStorage.removeItem(key);
        }
      });

      setUser(null);
      toast.success("ออกจากระบบเรียบร้อย");
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      // Force cleanup even on error
      localStorage.clear();
      setUser(null);
      navigate("/");
    } finally {
      // Optional: reset flag after a delay if we didn't navigate (but we do)
      setTimeout(() => { isLoggingOut.current = false; }, 1000);
    }
  };

  const navLinks = [
    { name: "หน้าหลัก", href: "/" },
    { name: "บริการ", href: "/#services" },
    { name: "คำถามที่พบบ่อย", href: "/#faq" },
    { name: "ติดต่อเรา", href: "/#contact" },
  ];

  const userMetadata = user?.user_metadata;
  const displayName = userMetadata?.full_name || "ผู้ใช้งาน";
  const avatarUrl = userMetadata?.avatar_url;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-hero-gradient flex items-center justify-center shadow-glow group-hover:animate-wiggle transition-all">
              <Cat className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-gradient">MeowAcademy</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-muted-foreground hover:text-primary font-medium transition-colors relative group"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
              </a>
            ))}
          </div>

          {/* CTA Buttons / Profile */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-3 px-3 py-2 h-auto rounded-full border border-border hover:bg-secondary/50">
                    <Avatar className="w-9 h-9">
                      <AvatarImage src={avatarUrl} alt={displayName} />
                      <AvatarFallback className="bg-muted">
                        <User className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-foreground max-w-[120px] truncate">{displayName}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 p-2 bg-background border border-border shadow-lg">
                  <div className="flex items-center gap-3 px-2 py-3 border-b border-border mb-2">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={avatarUrl} alt={displayName} />
                      <AvatarFallback className="bg-muted">
                        <User className="w-5 h-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">{displayName}</span>
                      <span className="text-xs text-muted-foreground">LINE Account</span>
                    </div>
                  </div>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="cursor-pointer flex items-center gap-2 px-2 py-2 rounded-md">
                      <User className="w-4 h-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer flex items-center gap-2 px-2 py-2 rounded-md text-muted-foreground hover:text-foreground mt-1"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>ออกจากระบบ</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button className="bg-hero-gradient hover:opacity-90 shadow-md font-medium" asChild>
                <Link to="/login">เข้าสู่ระบบ</Link>
              </Button>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="px-4 py-3 rounded-lg hover:bg-secondary text-foreground font-medium transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </a>
              ))}
              <div className="flex flex-col gap-2 mt-4 px-4">
                {user ? (
                  <>
                    <Link to="/" className="flex items-center gap-2">
                      <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        MeowAcademy
                      </span>
                    </Link>                    <div className="flex items-center gap-3 py-2">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={avatarUrl} alt={displayName} />
                        <AvatarFallback>
                          <User className="w-5 h-5" />
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{displayName}</span>
                    </div>
                    <Button variant="outline" className="w-full" asChild>
                      <Link to="/dashboard" onClick={() => setIsOpen(false)}>
                        Dashboard
                      </Link>
                    </Button>
                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={() => {
                        handleLogout();
                        setIsOpen(false);
                      }}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      ออกจากระบบ
                    </Button>
                  </>
                ) : (
                  <Button className="w-full bg-hero-gradient" asChild>
                    <Link to="/login" onClick={() => setIsOpen(false)}>เข้าสู่ระบบ</Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
