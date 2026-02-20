import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, LogOut, Home, LayoutDashboard, ShieldCheck, Star, Link2 } from "lucide-react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuLabel,
} from "./ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { useRef } from "react";

interface UserDropdownProps {
  user: SupabaseUser;
}

const UserDropdown = ({ user }: UserDropdownProps) => {
  const navigate = useNavigate();
  const isLoggingOut = useRef(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingRole, setIsCheckingRole] = useState(true);

  const userMetadata = user?.user_metadata;
  const displayName = userMetadata?.full_name || "ผู้ใช้งาน";
  const avatarUrl = userMetadata?.avatar_url;

  // Check if user is admin
  useEffect(() => {
    const checkAdminRole = async () => {
      try {
        const { data, error } = await supabase
          .rpc('has_role', { _user_id: user.id, _role: 'admin' });
        
        if (error) {
          console.error("Error checking admin role:", error);
          setIsAdmin(false);
        } else {
          setIsAdmin(!!data);
        }
      } catch (error) {
        console.error("Error:", error);
        setIsAdmin(false);
      } finally {
        setIsCheckingRole(false);
      }
    };

    if (user?.id) {
      checkAdminRole();
    }
  }, [user?.id]);

  const navLinks = [
    { name: "หน้าหลัก", href: "/", icon: Home },
    { name: "บริการ", href: "/#services" },
    { name: "คำถามที่พบบ่อย", href: "/#faq" },
    { name: "ติดต่อเรา", href: "/#contact" },
  ];

  const handleLogout = async () => {
    if (isLoggingOut.current) return;

    isLoggingOut.current = true;
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      localStorage.clear();
      sessionStorage.clear();

      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });

      toast.success("ออกจากระบบเรียบร้อย");
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      localStorage.clear();
      navigate("/login");
    } finally {
      isLoggingOut.current = false;
    }
  };

  return (
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
        {/* User Info Header */}
        <div className="flex items-center gap-3 px-2 py-3 border-b border-border mb-2">
          <Avatar className="w-10 h-10">
            <AvatarImage src={avatarUrl} alt={displayName} />
            <AvatarFallback className="bg-muted">
              <User className="w-5 h-5" />
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium text-foreground">{displayName}</span>
            <span className="text-xs text-muted-foreground">
              {isAdmin ? "🔴 แอดมิน" : "LINE Account"}
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        {navLinks.map((link) => (
          <DropdownMenuItem key={link.name} asChild>
            <a href={link.href} className="cursor-pointer flex items-center gap-2 px-2 py-2 rounded-md">
              {link.icon && <link.icon className="w-4 h-4" />}
              <span>{link.name}</span>
            </a>
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        {/* Dashboard */}
        <DropdownMenuItem asChild>
          <a href="/dashboard" className="cursor-pointer flex items-center gap-2 px-2 py-2 rounded-md">
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </a>
        </DropdownMenuItem>

        {/* Admin Menu - Only for admins */}
        {isAdmin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs text-muted-foreground px-2 py-1">
                🛠️ เมนูแอดมิน
              </DropdownMenuLabel>
              
              {/* Admin Dashboard */}
              <DropdownMenuItem asChild>
                <a href="/admin" className="cursor-pointer flex items-center gap-2 px-2 py-2 rounded-md text-primary">
                  <ShieldCheck className="w-4 h-4" />
                  <span>จัดการออเดอร์</span>
                </a>
              </DropdownMenuItem>

              {/* Review Management */}
              <DropdownMenuItem asChild>
                <a href="/admin/reviews" className="cursor-pointer flex items-center gap-2 px-2 py-2 rounded-md text-primary">
                  <Star className="w-4 h-4" />
                  <span>จัดการลิงก์รีวิว</span>
                </a>
              </DropdownMenuItem>

              {/* Create Review Link Button */}
              <DropdownMenuItem asChild>
                <a 
                  href="/admin/reviews?tab=create" 
                  className="cursor-pointer flex items-center gap-2 px-2 py-2 rounded-md bg-primary/10 text-primary font-medium"
                >
                  <Link2 className="w-4 h-4" />
                  <span>+ สร้างลิงก์รีวิว</span>
                </a>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </>
        )}

        <DropdownMenuSeparator />

        {/* Logout */}
        <DropdownMenuItem
          onClick={handleLogout}
          className="cursor-pointer flex items-center gap-2 px-2 py-2 rounded-md text-red-500 hover:text-red-600 mt-1"
        >
          <LogOut className="w-4 h-4" />
          <span>ออกจากระบบ</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserDropdown;
