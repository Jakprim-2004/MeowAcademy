import { Cat, Heart } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="py-12 border-t border-border bg-card">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-hero-gradient flex items-center justify-center">
              <Cat className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-gradient">MeowAcademy</span>
          </Link>

          {/* Links */}
          <div className="flex items-center gap-8">
            <a href="/#services" className="text-muted-foreground hover:text-foreground transition-colors">
              บริการ
            </a>
            <a href="/#contact" className="text-muted-foreground hover:text-foreground transition-colors">
              ติดต่อเรา
            </a>
          </div>

          {/* Copyright */}
          <p className="flex items-center gap-1 text-sm text-muted-foreground">
            Made with <Heart className="w-4 h-4 text-primary fill-primary" /> by MeowAcademy Team
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
