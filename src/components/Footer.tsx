"use client";

import { Heart } from "lucide-react";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="py-12 border-t border-border bg-card">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center">
              <img src="/images/cat-icons/logo_cat.png" alt="MeowAcademy Logo - บริการเก็บชั่วโมงจิตอาสา" className="w-full h-full object-contain drop-shadow-md" />
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
            <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
              ข้อกำหนด
            </Link>
            <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
              ความเป็นส่วนตัว
            </Link>
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
