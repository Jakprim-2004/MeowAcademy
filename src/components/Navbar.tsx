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
  // Remove isOpen state
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const navigate = useNavigate();
  const isLoggingOut = useRef(false);

  // ... useEffect logic remains same

  const handleLogout = async () => {
    // ... logic remains same
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
            <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-all group-hover:scale-110">
              <img src="/images/cat-icons/logo_cat.png" alt="MeowAcademy Logo" className="w-full h-full object-contain drop-shadow-md" />
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

          {/* Right Side Actions (Desktop & Mobile) */}
          <div className="flex items-center gap-3">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 px-2 md:px-3 py-1 md:py-2 h-auto rounded-full border border-border hover:bg-secondary/50">
                    <Avatar className="w-8 h-8 md:w-9 md:h-9">
                      <AvatarImage src={avatarUrl} alt={displayName} />
                      <AvatarFallback className="bg-muted">
                        <User className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-sm md:text-base text-foreground max-w-[80px] md:max-w-[120px] truncate">
                      {displayName}
                    </span>
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

                  {/* Mobile-only Menu Links */}
                  <div className="md:hidden">
                    {navLinks.map((link) => (
                      <DropdownMenuItem key={link.name} asChild>
                        <a href={link.href} className="cursor-pointer flex items-center gap-2 px-2 py-2 rounded-md">
                          <span>{link.name}</span>
                        </a>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                  </div>

                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="cursor-pointer flex items-center gap-2 px-2 py-2 rounded-md">
                      <User className="w-4 h-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer flex items-center gap-2 px-2 py-2 rounded-md text-red-500 hover:text-red-600 mt-1"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>ออกจากระบบ</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button className="bg-hero-gradient hover:opacity-90 shadow-md font-medium px-4 md:px-6" asChild>
                <Link to="/login">เข้าสู่ระบบ</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
