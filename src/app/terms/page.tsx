import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Logo from "@/components/Logo";
import BackgroundDecorations from "@/components/BackgroundDecorations";
import TermsContent from "./TermsContent";

export const metadata: Metadata = {
  title: "ข้อกำหนดการใช้งาน",
  description: "ข้อกำหนดการใช้งานบริการ MeowAcademy รับจ้างเก็บชั่วโมงจิตอาสา กยศ. สำหรับนักศึกษา",
  alternates: {
    canonical: "https://meow-loan.com/terms",
  },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <BackgroundDecorations variant="minimal" />
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          กลับหน้าเข้าสู่ระบบ
        </Link>

        <div className="text-center mb-10 animate-fade-in">
          <Logo size="lg" className="justify-center mb-6" />
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            ข้อกำหนดการใช้งาน
          </h1>
          <p className="text-muted-foreground">
            อัปเดตล่าสุด: 7 พฤษภาคม 2569
          </p>
        </div>

        <TermsContent />

        <div className="text-center mt-8 mb-12">
          <Link href="/privacy" className="text-primary hover:underline text-sm">
            อ่านนโยบายความเป็นส่วนตัว →
          </Link>
        </div>
      </div>
    </div>
  );
}
