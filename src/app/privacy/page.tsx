import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Logo from "@/components/Logo";
import BackgroundDecorations from "@/components/BackgroundDecorations";
import PrivacyContent from "./PrivacyContent";

export const metadata: Metadata = {
  title: "นโยบายความเป็นส่วนตัว",
  description: "นโยบายความเป็นส่วนตัวของ MeowAcademy การเก็บรวบรวม ใช้ และปกป้องข้อมูลส่วนบุคคลของผู้ใช้บริการ",
  alternates: { canonical: "https://meow-loan.com/privacy" },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <BackgroundDecorations variant="minimal" />
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Link href="/login" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          กลับหน้าเข้าสู่ระบบ
        </Link>
        <div className="text-center mb-10 animate-fade-in">
          <Logo size="lg" className="justify-center mb-6" />
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">นโยบายความเป็นส่วนตัว</h1>
          <p className="text-muted-foreground">อัปเดตล่าสุด: 7 พฤษภาคม 2569</p>
        </div>
        <PrivacyContent />
        <div className="text-center mt-8 mb-12">
          <Link href="/terms" className="text-primary hover:underline text-sm">← อ่านข้อกำหนดการใช้งาน</Link>
        </div>
      </div>
    </div>
  );
}
