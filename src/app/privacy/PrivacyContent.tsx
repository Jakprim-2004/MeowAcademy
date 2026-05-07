"use client";

export default function PrivacyContent() {
  return (
    <div className="rounded-3xl bg-card border border-border p-8 md:p-10 shadow-sm space-y-8 animate-fade-in-up">
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">1</span>
          ข้อมูลที่เราเก็บรวบรวม
        </h2>
        <ul className="list-disc list-inside text-muted-foreground space-y-2 pl-4">
          <li><strong className="text-foreground">ข้อมูลจาก LINE:</strong> ชื่อผู้ใช้, รูปโปรไฟล์, LINE User ID</li>
          <li><strong className="text-foreground">ข้อมูลส่วนบุคคล:</strong> ชื่อ-นามสกุล, เลขบัตรประชาชน, รหัสนิสิต</li>
          <li><strong className="text-foreground">ข้อมูลการสั่งซื้อ:</strong> รายละเอียดบริการ, จำนวนเงิน, สถานะ</li>
          <li><strong className="text-foreground">ข้อมูลการชำระเงิน:</strong> สลิปการโอนเงิน</li>
        </ul>
      </section>
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">2</span>
          วัตถุประสงค์ในการใช้ข้อมูล
        </h2>
        <ul className="list-disc list-inside text-muted-foreground space-y-2 pl-4">
          <li>ให้บริการเก็บชั่วโมงจิตอาสาและกรอกข้อมูลตามที่สั่ง</li>
          <li>ยืนยันตัวตนและตรวจสอบการชำระเงิน</li>
          <li>แจ้งสถานะออเดอร์ผ่าน LINE</li>
          <li>ปรับปรุงคุณภาพการให้บริการ</li>
        </ul>
      </section>
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">3</span>
          การเก็บรักษาข้อมูล
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          ข้อมูลถูกจัดเก็บอย่างปลอดภัยบนระบบ Supabase ซึ่งมีการเข้ารหัสข้อมูลและ Row Level Security
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">4</span>
          การเปิดเผยข้อมูลแก่บุคคลที่สาม
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          เราจะ<strong className="text-foreground">ไม่ขาย แลกเปลี่ยน หรือเปิดเผย</strong>ข้อมูลส่วนบุคคลแก่บุคคลที่สาม ยกเว้นเมื่อได้รับความยินยอม เมื่อจำเป็นตามกฎหมาย หรือเพื่อป้องกันการฉ้อโกง
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">5</span>
          ติดต่อเรา
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          ติดต่อผ่าน LINE OA: <span className="text-primary font-semibold">@807chkoh</span>
        </p>
      </section>
    </div>
  );
}
