import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Logo from "@/components/Logo";
import BackgroundDecorations from "@/components/BackgroundDecorations";

const Terms = () => {
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
            ข้อกำหนดการใช้งาน
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
              ข้อตกลงทั่วไป
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              เว็บไซต์ MeowAcademy ("เรา", "แพลตฟอร์ม") ให้บริการเก็บชั่วโมงจิตอาสา กยศ. และบริการกรอกข้อมูลลงระบบสำหรับนิสิต/นักศึกษา 
              การใช้งานเว็บไซต์นี้ถือว่าผู้ใช้ ("คุณ") ยอมรับข้อกำหนดทั้งหมดที่ระบุไว้ในเอกสารนี้ 
              หากคุณไม่เห็นด้วยกับข้อกำหนดเหล่านี้ กรุณาหยุดใช้งานเว็บไซต์ทันที
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">2</span>
              บริการของเรา
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              MeowAcademy ให้บริการดังต่อไปนี้:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 pl-4">
              <li>บริการเก็บชั่วโมงจิตอาสา กยศ. รายชั่วโมง</li>
              <li>แพ็คเกจเก็บชั่วโมงจิตอาสา 36 ชั่วโมง</li>
              <li>บริการกรอกข้อมูลลงระบบ กยศ.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">3</span>
              การลงทะเบียนและบัญชีผู้ใช้
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              การเข้าใช้งานระบบจำเป็นต้องเข้าสู่ระบบผ่านบัญชี LINE ของคุณ โดย:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 pl-4">
              <li>คุณต้องมีบัญชี LINE ที่ใช้งานได้</li>
              <li>ข้อมูลที่คุณให้ต้องเป็นข้อมูลจริงและถูกต้อง</li>
              <li>คุณมีหน้าที่รักษาความปลอดภัยของบัญชีตนเอง</li>
              <li>คุณต้องรับผิดชอบต่อการใช้งานทุกอย่างที่เกิดขึ้นผ่านบัญชีของคุณ</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">4</span>
              การชำระเงิน
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              การชำระเงินสามารถทำได้ผ่าน PromptPay QR Code หรือโอนเข้าบัญชีธนาคารที่ระบุ 
              หลังชำระเงินแล้วกรุณาส่งสลิปผ่าน LINE OA เพื่อยืนยันการชำระเงิน 
              ออเดอร์ที่ไม่ชำระเงินภายใน 24 ชั่วโมง จะถูกยกเลิกโดยอัตโนมัติ
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">5</span>
              นโยบายการยกเลิกและคืนเงิน
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              การยกเลิกออเดอร์สามารถทำได้ก่อนเริ่มดำเนินการ หากออเดอร์ถูกดำเนินการไปแล้ว 
              จะไม่สามารถยกเลิกหรือขอคืนเงินได้ ยกเว้นในกรณีที่เราไม่สามารถให้บริการตามที่ตกลงไว้
            </p>
          </section>

          {/* ⚠️ Important Warning Section */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center text-destructive text-sm font-bold">6</span>
              <span className="text-destructive">ข้อจำกัดความรับผิดชอบและความเสี่ยงที่ผู้ใช้ต้องรับทราบ</span>
            </h2>

            <div className="rounded-2xl border-2 border-destructive/30 bg-destructive/5 p-6 space-y-4">
              <p className="text-sm font-semibold text-destructive flex items-center gap-2">
                ⚠️ กรุณาอ่านและทำความเข้าใจให้ครบถ้วนก่อนใช้บริการ
              </p>

              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <div className="space-y-2">
                  <p className="font-semibold text-foreground">6.1 กรณีเกิดข้อผิดพลาดหรือเจ้าหน้าที่ไม่อนุมัติ</p>
                  <p>
                    หากเกิดข้อผิดพลาดใดๆ ในการส่งชั่วโมงจิตอาสา หรือเจ้าหน้าที่ของสถาบันการศึกษา/หน่วยงานที่เกี่ยวข้อง
                    <strong className="text-foreground"> ไม่อนุมัติหรือไม่ให้ผ่าน </strong>
                    ชั่วโมงจิตอาสาที่ส่งไป ทางร้าน<strong className="text-foreground">จะไม่รับเคลมหรือคืนเงินใดๆ ทั้งสิ้น</strong>
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="font-semibold text-foreground">6.2 การแก้ไขเพิ่มเติม</p>
                  <p>
                    ในกรณีที่ผู้ใช้ต้องการให้ทางร้านดำเนินการแก้ไขข้อมูลหรือส่งชั่วโมงจิตอาสาใหม่
                    จะต้อง<strong className="text-foreground">ชำระค่าบริการเพิ่มเติม</strong>ตามอัตราที่กำหนด 
                    โดยไม่ถือว่าเป็นการรับประกันจากบริการครั้งก่อน
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="font-semibold text-foreground">6.3 การถูกตัดสิทธิ์กู้ยืม กยศ.</p>
                  <p>
                    ผู้ใช้รับทราบและยอมรับว่า การใช้บริการจ้างเก็บชั่วโมงจิตอาสาเป็น<strong className="text-foreground">ความเสี่ยงของผู้ใช้เอง</strong> 
                    หากผู้ใช้ถูกตรวจสอบ ถูกจับได้ หรือถูกตัดสิทธิ์การกู้ยืมเงิน กยศ. ไม่ว่าจะด้วยสาเหตุใดก็ตาม 
                    ทางร้าน<strong className="text-foreground">ไม่รับผิดชอบใดๆ ทั้งสิ้น</strong> 
                    และไม่สามารถเรียกร้องค่าเสียหายหรือค่าชดเชยใดๆ จากทางร้านได้
                  </p>
                </div>
              </div>
            </div>

            <p className="text-muted-foreground leading-relaxed">
              นอกจากนี้ เราพยายามอย่างดีที่สุดในการให้บริการ แต่ไม่รับประกันว่าบริการจะไม่มีข้อผิดพลาด 
              หรือจะพร้อมใช้งานตลอด 24 ชั่วโมง เราสงวนสิทธิ์ในการปรับปรุง เปลี่ยนแปลง 
              หรือยุติการให้บริการโดยไม่ต้องแจ้งให้ทราบล่วงหน้า
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">7</span>
              การเปลี่ยนแปลงข้อกำหนด
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              เราขอสงวนสิทธิ์ในการเปลี่ยนแปลงข้อกำหนดเหล่านี้ได้ตลอดเวลา 
              การเปลี่ยนแปลงจะมีผลทันทีเมื่อประกาศบนเว็บไซต์ 
              การใช้งานต่อหลังจากมีการเปลี่ยนแปลงถือว่าคุณยอมรับข้อกำหนดใหม่
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">8</span>
              ติดต่อเรา
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              หากมีคำถามเกี่ยวกับข้อกำหนดการใช้งาน สามารถติดต่อเราได้ผ่าน LINE OA:{" "}
              <span className="text-primary font-semibold">@807chkoh</span>
            </p>
          </section>
        </div>

        {/* Footer link */}
        <div className="text-center mt-8 mb-12">
          <Link to="/privacy" className="text-primary hover:underline text-sm">
            อ่านนโยบายความเป็นส่วนตัว →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Terms;
