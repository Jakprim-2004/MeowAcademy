import { ReactNode } from "react";
import BackgroundDecorations from "./BackgroundDecorations";

interface PageLayoutProps {
  children: ReactNode;
  backgroundVariant?: "default" | "minimal" | "full";
  className?: string;
}

const PageLayout = ({ 
  children, 
  backgroundVariant = "default",
  className = "" 
}: PageLayoutProps) => {
  return (
    <div className={`min-h-screen bg-background ${className}`}>
      <BackgroundDecorations variant={backgroundVariant} />
      {children}
    </div>
  );
};

export default PageLayout;
