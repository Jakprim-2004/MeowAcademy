import { LucideIcon, Check } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Link } from "react-router-dom";

interface ServiceCardProps {
  title: string;
  description: string;
  price: number;
  unit: string;
  icon: LucideIcon;
  features: string[];
  href: string;
  isPopular?: boolean;
  buttonText?: string;
}

const ServiceCard = ({
  title,
  description,
  price,
  unit,
  icon: Icon,
  features,
  href,
  isPopular = false,
  buttonText = "เลือกบริการนี้",
}: ServiceCardProps) => {
  return (
    <div
      className={`relative rounded-2xl p-8 transition-all duration-300 hover:shadow-xl ${
        isPopular
          ? "bg-card border-2 border-primary shadow-glow"
          : "bg-card border border-border hover:border-primary/50"
      }`}
    >
      {isPopular && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-hero-gradient text-primary-foreground">
          แนะนำ
        </Badge>
      )}

      <div className="text-center mb-6">
        <div
          className={`w-14 h-14 rounded-xl mx-auto mb-4 flex items-center justify-center ${
            isPopular ? "bg-primary/20" : "bg-secondary"
          }`}
        >
          <Icon className={`w-7 h-7 ${isPopular ? "text-primary" : "text-muted-foreground"}`} />
        </div>

        <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>

      <div className="text-center mb-6">
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-sm text-muted-foreground">฿</span>
          <span className="text-4xl font-bold text-foreground">{price}</span>
          <span className="text-muted-foreground">{unit}</span>
        </div>
      </div>

      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-3 text-sm">
            <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Check className="w-3 h-3 text-primary" />
            </div>
            <span className="text-muted-foreground">{feature}</span>
          </li>
        ))}
      </ul>

      <Button
        className={`w-full ${
          isPopular
            ? "bg-hero-gradient hover:opacity-90 shadow-glow"
            : "bg-secondary text-foreground hover:bg-secondary/80"
        }`}
        asChild
      >
        <Link to={href}>{buttonText}</Link>
      </Button>
    </div>
  );
};

export default ServiceCard;
