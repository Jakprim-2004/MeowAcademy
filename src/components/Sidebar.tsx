import { Link, useLocation } from "react-router-dom";
import { Home, LayoutDashboard, Package, FileText, User as UserIcon, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface SidebarProps {
    className?: string;
}

const Sidebar = ({ className }: SidebarProps) => {
    const location = useLocation();
    const navigate = useNavigate();
    const pathname = location.pathname;

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut();
            localStorage.clear();
            sessionStorage.clear();
            toast.success("ออกจากระบบเรียบร้อย");
            navigate("/login");
        } catch (error) {
            console.error("Logout error:", error);
            navigate("/login");
        }
    };

    const menuItems = [
        {
            title: "หน้าหลัก",
            href: "/",
            icon: Home,
        },
        {
            title: "Dashboard",
            href: "/dashboard",
            icon: LayoutDashboard,
        },
        {
            title: "สถานะคำสั่งซื้อ",
            href: "/order-status",
            icon: Package,
        },
        {
            title: "บริการของเรา",
            href: "/#services",
            icon: FileText,
        },
    ];

    return (
        <div className={cn("flex flex-col h-full bg-card border-r border-border", className)}>
            {/* Logo */}
            <div className="p-6 border-b border-border">
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-glow group-hover:animate-wiggle transition-all">
                        <img src="/images/cat-icons/logo_cat.png" alt="MeowAcademy Logo" className="w-full h-full object-contain drop-shadow-md" />
                    </div>
                    <span className="text-xl font-bold text-gradient">MeowAcademy</span>
                </Link>
            </div>

            {/* Navigation */}
            <div className="flex-1 py-6 px-4 space-y-2">
                {menuItems.map((item) => (
                    <Link
                        key={item.href}
                        to={item.href}
                        className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden",
                            pathname === item.href
                                ? "bg-primary/10 text-primary font-semibold shadow-sm"
                                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                        )}
                    >
                        {pathname === item.href && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />
                        )}
                        <item.icon
                            className={cn(
                                "w-5 h-5 transition-colors",
                                pathname === item.href ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                            )}
                        />
                        <span>{item.title}</span>
                    </Link>
                ))}
            </div>

            {/* Footer / Logout */}
            <div className="p-4 border-t border-border">
                <Button
                    variant="ghost"
                    className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={handleLogout}
                >
                    <LogOut className="w-5 h-5 mr-3" />
                    ออกจากระบบ
                </Button>
            </div>
        </div>
    );
};

export default Sidebar;
