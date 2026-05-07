import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Logo from "@/components/Logo";
import BackgroundDecorations from "@/components/BackgroundDecorations";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <BackgroundDecorations variant="minimal" />

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Back button */}
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          กลับหน้าเข้าสู่ระบบ
        </Link>

        {/* Header */}
        <div className="text-center mb-10 animate-fade-in">
          <Logo size="lg" className="justify-center mb-6" />
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            นโยบายความเป็นส่วนตัว
          </h1>
          <p className="text-muted-foreground">
            อัปเดตล่าสุด: 7 พฤษภาคม 2569
          </p>
        </div>

        {/* Content */}
        <div className="rounded-3xl bg-card border border-border p-8 md:p-10 shadow-sm space-y-8 animate-fade-in-up">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">1</span>
              ข้อมูลที่เราเก็บรวบรวม
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              เมื่อคุณใช้บริการ MeowAcademy เราจะเก็บรวบรวมข้อมูลดังต่อไปนี้:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 pl-4">
              <li><strong className="text-foreground">ข้อมูลจาก LINE:</strong> ชื่อผู้ใช้, รูปโปรไฟล์, LINE User ID</li>
              <li><strong className="text-foreground">ข้อมูลส่วนบุคคล:</strong> ชื่อ-นามสกุล, เลขบัตรประชาชน, รหัสนิสิต</li>
              <li><strong className="text-foreground">ข้อมูลการสั่งซื้อ:</strong> รายละเอียดบริการ, จำนวนเงิน, สถานะการชำระ</li>
              <li><strong className="text-foreground">ข้อมูลการชำระเงิน:</strong> สลิปการโอนเงิน, หลักฐานการชำระ</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">2</span>
              วัตถุประสงค์ในการใช้ข้อมูล
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              เราใช้ข้อมูลของคุณเพื่อวัตถุประสงค์ดังต่อไปนี้เท่านั้น:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 pl-4">
              <li>ให้บริการเก็บชั่วโมงจิตอาสาและกรอกข้อมูลตามที่สั่ง</li>
              <li>ยืนยันตัวตนและตรวจสอบการชำระเงิน</li>
              <li>แจ้งสถานะออเดอร์ผ่าน LINE</li>
              <li>ปรับปรุงคุณภาพการให้บริการ</li>
              <li>ติดต่อกลับในกรณีที่มีปัญหาเกี่ยวกับออเดอร์</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">3</span>
              การเก็บรักษาข้อมูล
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              ข้อมูลของคุณถูกจัดเก็บอย่างปลอดภัยบนระบบ Supabase ซึ่งมีมาตรการรักษาความปลอดภัยระดับสูง 
              รวมถึงการเข้ารหัสข้อมูล (Encryption) และการควบคุมการเข้าถึง (Row Level Security) 
              เราจะเก็บข้อมูลของคุณไว้ตราบเท่าที่จำเป็นสำหรับการให้บริการ
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">4</span>
              การเปิดเผยข้อมูลแก่บุคคลที่สาม
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              เราจะ<strong className="text-foreground">ไม่ขาย แลกเปลี่ยน หรือเปิดเผย</strong>ข้อมูลส่วนบุคคลของคุณแก่บุคคลที่สาม 
              ยกเว้นในกรณีดังต่อไปนี้:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 pl-4">
              <li>เมื่อได้รับความยินยอมจากคุณ</li>
              <li>เมื่อจำเป็นตามกฎหมายหรือคำสั่งศาล</li>
              <li>เพื่อป้องกันการฉ้อโกงหรือภัยคุกคามด้านความปลอดภัย</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">5</span>
              สิทธิ์ของคุณ
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              คุณมีสิทธิ์ดังต่อไปนี้เกี่ยวกับข้อมูลส่วนบุคคลของคุณ:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 pl-4">
              <li><strong className="text-foreground">สิทธิ์ในการเข้าถึง:</strong> ขอดูข้อมูลส่วนบุคคลที่เราเก็บไว้</li>
              <li><strong className="text-foreground">สิทธิ์ในการแก้ไข:</strong> ขอแก้ไขข้อมูลที่ไม่ถูกต้อง</li>
              <li><strong className="text-foreground">สิทธิ์ในการลบ:</strong> ขอให้ลบข้อมูลส่วนบุคคลของคุณ</li>
              <li><strong className="text-foreground">สิทธิ์ในการคัดค้าน:</strong> คัดค้านการใช้ข้อมูลในบางกรณี</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              หากต้องการใช้สิทธิ์ดังกล่าว สามารถติดต่อเราผ่าน LINE OA
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">6</span>
              คุกกี้และเทคโนโลยีการติดตาม
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              เราใช้คุกกี้เฉพาะที่จำเป็นสำหรับการทำงานของระบบ เช่น การรักษาสถานะการเข้าสู่ระบบ (Session) 
              เราไม่ใช้คุกกี้เพื่อการโฆษณาหรือติดตามพฤติกรรมข้ามเว็บไซต์
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">7</span>
              การเปลี่ยนแปลงนโยบาย
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              เราอาจปรับปรุงนโยบายความเป็นส่วนตัวนี้เป็นครั้งคราว โดยจะแจ้งให้ทราบผ่านเว็บไซต์ 
              เราแนะนำให้คุณตรวจสอบนโยบายนี้เป็นระยะเพื่อรับทราบการเปลี่ยนแปลง
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">8</span>
              ติดต่อเรา
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              หากมีคำถามหรือข้อกังวลเกี่ยวกับนโยบายความเป็นส่วนตัว สามารถติดต่อเราได้ผ่าน LINE OA:{" "}
              <span className="text-primary font-semibold">@807chkoh</span>
            </p>
          </section>
        </div>

        {/* Footer link */}
        <div className="text-center mt-8 mb-12">
          <Link to="/terms" className="text-primary hover:underline text-sm">
            ← อ่านข้อกำหนดการใช้งาน
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
