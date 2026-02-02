import { LucideIcon } from "lucide-react";

interface StatCardProps {
  value: string;
  label: string;
  icon: LucideIcon;
  delay?: number;
}

const StatCard = ({ value, label, icon: Icon, delay = 0 }: StatCardProps) => {
  return (
    <div
      className="text-center animate-fade-in-up"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="flex justify-center mb-2">
        <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
      </div>
      <p className="text-2xl md:text-3xl font-bold text-foreground">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
};

export default StatCard;
