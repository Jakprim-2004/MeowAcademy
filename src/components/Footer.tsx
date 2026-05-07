"use client";

import { Heart } from "lucide-react";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="py-12 border-t border-border bg-card">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo and SEO Text */}
          <div className="flex flex-col gap-4 max-w-sm text-center md:text-left">
            <Link href="/" className="flex items-center justify-center md:justify-start gap-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center">
                <img src="/images/cat-icons/logo_cat.png" alt="MeowAcademy Logo - บริการเก็บชั่วโมงจิตอาสา" className="w-full h-full object-contain drop-shadow-md" />
              </div>
              <span className="text-xl font-bold text-gradient">MeowAcademy</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              MeowAcademy คือผู้ให้บริการรับจ้างเก็บชั่วโมงจิตอาสา กยศ. ชั้นนำที่นักศึกษากว่าพันคนไว้วางใจ เรามุ่งมั่นช่วยเหลือให้นักศึกษามีเวลาไปโฟกัสกับการเรียนมากขึ้น ด้วยบริการเก็บชั่วโมง กยศ ออนไลน์ที่รวดเร็ว ปลอดภัย และราคาประหยัดที่สุด เริ่มต้นเพียง 5 บาท/ชม.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-col gap-4 text-center md:text-left">
            <h4 className="font-semibold text-foreground">เมนูหลัก</h4>
            <div className="flex flex-col gap-2">
              <a href="/#services" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                บริการเก็บชั่วโมงจิตอาสา
              </a>
              <a href="/#contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                ติดต่อสอบถาม
              </a>
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                ข้อกำหนดและเงื่อนไข
              </Link>
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                นโยบายความเป็นส่วนตัว
              </Link>
            </div>
          </div>

          {/* Social Links & Copyright */}
          <div className="flex flex-col gap-4 items-center md:items-end">
            <h4 className="font-semibold text-foreground">ติดตามเรา</h4>
            <div className="flex items-center gap-4">
              <a href="https://facebook.com/meowacademy" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary transition-colors" aria-label="Facebook">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg>
              </a>
              <a href="https://twitter.com/meowacademy" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary transition-colors" aria-label="X / Twitter">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="https://instagram.com/meowacademy" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary transition-colors" aria-label="Instagram">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
              <a href="https://youtube.com/@meowacademy" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary transition-colors" aria-label="YouTube">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
            </div>
            <p className="flex items-center gap-1 text-sm text-muted-foreground mt-4 md:mt-auto">
              Made with <Heart className="w-4 h-4 text-primary fill-primary" /> by MeowAcademy Team
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
