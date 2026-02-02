import Logo from "./Logo";
import UserDropdown from "./UserDropdown";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface PageHeaderProps {
  user: SupabaseUser | null;
  logoSize?: "sm" | "md" | "lg";
  className?: string;
}

const PageHeader = ({ user, logoSize = "md", className = "" }: PageHeaderProps) => {
  return (
    <header className={`border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50 ${className}`}>
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Logo size={logoSize} />
        {user && <UserDropdown user={user} />}
      </div>
    </header>
  );
};

export default PageHeader;
