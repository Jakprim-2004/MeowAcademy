"use client";

export default function TermsContent() {
  return (
    <div className="rounded-3xl bg-card border border-border p-8 md:p-10 shadow-sm space-y-8 animate-fade-in-up">
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">1</span>
          ข้อตกลงทั่วไป
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          เว็บไซต์ MeowAcademy ให้บริการเก็บชั่วโมงจิตอาสา กยศ. และบริการกรอกข้อมูลลงระบบสำหรับนิสิต/นักศึกษา
          การใช้งานเว็บไซต์นี้ถือว่าผู้ใช้ยอมรับข้อกำหนดทั้งหมด
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">2</span>
          บริการของเรา
        </h2>
        <ul className="list-disc list-inside text-muted-foreground space-y-2 pl-4">
          <li>บริการเก็บชั่วโมงจิตอาสา กยศ. รายชั่วโมง</li>
          <li>แพ็คเกจเก็บชั่วโมงจิตอาสา 36 ชั่วโมง</li>
          <li>บริการกรอกข้อมูลลงระบบ กยศ.</li>
        </ul>
      </section>
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">3</span>
          การชำระเงิน
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          การชำระเงินสามารถทำได้ผ่าน PromptPay QR Code หรือโอนเข้าบัญชีธนาคาร
          ออเดอร์ที่ไม่ชำระเงินภายใน 24 ชั่วโมง จะถูกยกเลิกโดยอัตโนมัติ
        </p>
      </section>
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center text-destructive text-sm font-bold">4</span>
          <span className="text-destructive">ข้อจำกัดความรับผิดชอบ</span>
        </h2>
        <div className="rounded-2xl border-2 border-destructive/30 bg-destructive/5 p-6 space-y-3">
          <p className="text-sm font-semibold text-destructive">⚠️ กรุณาอ่านให้ครบถ้วนก่อนใช้บริการ</p>
          <p className="text-muted-foreground leading-relaxed">
            หากชั่วโมงจิตอาสาไม่ได้รับการอนุมัติ ทางร้านจะไม่รับเคลมหรือคืนเงินใดๆ ทั้งสิ้น
            การแก้ไขเพิ่มเติมจะต้องชำระค่าบริการเพิ่ม
            หากผู้ใช้ถูกตัดสิทธิ์กู้ยืม กยศ. ทางร้านไม่รับผิดชอบใดๆ ทั้งสิ้น
          </p>
        </div>
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
