"use client";
import { Clock, Users, Shield, ExternalLink } from "lucide-react";
import { Button } from "./ui/button";

const FeaturesSection = () => {
  const features = [
    {
      icon: Clock,
      title: "บริการรวดเร็ว",
      description: "ดำเนินการทันทีหลังจากได้รับการชำระเงิน งานเสร็จภายใน 1-3 วัน",
      color: "bg-blue-100 text-blue-600",
    },
    {
      icon: Users,
      title: "ทีมงานมืออาชีพ",
      description: "ทีมงานที่มีประสบการณ์ พร้อมให้บริการอย่างมีคุณภาพตลอด 24 ชั่วโมง",
      color: "bg-purple-100 text-purple-600",
    },
    {
      icon: Shield,
      title: "ข้อมูลปลอดภัย",
      description: "ข้อมูลของคุณจะถูกเก็บเป็นความลับและปลอดภัย 100%",
      color: "bg-green-100 text-green-600",
    },
  ];

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4">
        {/* Scholarship Banner */}
        <div className="mb-16 animate-fade-in">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-500 to-teal-600 p-8 md:p-12 shadow-xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            
            <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-4">
                <h3 className="text-2xl md:text-3xl font-bold text-white">
                  รองรับทุนการศึกษากยศและทุนเรียนดี
                </h3>
                <div className="space-y-2">
                  <p className="flex items-center gap-2 text-white/90">
                    <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs">✓</span>
                    ทุน กยศ (กองทุนเงินให้กู้ยืมเพื่อการศึกษา)
                  </p>
                  <p className="flex items-center gap-2 text-white/90">
                    <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs">✓</span>
                    ทุนเรียนดี (ต้องสมัคร SET Member ก่อน)
                  </p>
                </div>
              </div>
              
              <Button 
                size="lg" 
                className="bg-white text-emerald-600 hover:bg-white/90 shadow-lg font-semibold"
                onClick={() => window.open("https://member.set.or.th/set-member/registration/profile-registration", "_blank")}
              >
                สมัคร SET Member
                <ExternalLink className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group p-8 rounded-3xl bg-card border border-border shadow-sm card-hover animate-fade-in-up"
              style={{ animationDelay: `${0.1 + index * 0.1}s` }}
            >
              <div className={`w-16 h-16 rounded-2xl ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* SEO Detailed Content Block (Generative Engine Optimization) */}
        <div className="bg-secondary/50 border border-border p-8 md:p-12 rounded-3xl mt-12 animate-fade-in">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-foreground text-center md:text-left">
            รายละเอียดบริการ รับจ้างเก็บชั่วโมงจิตอาสา กยศ. ออนไลน์
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 text-muted-foreground leading-relaxed">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-foreground border-b border-border pb-2">ขั้นตอนการใช้บริการ</h3>
              <ul className="list-disc list-inside space-y-2">
                <li>แจ้งจำนวนชั่วโมงที่ต้องการเก็บ (1-36 ชั่วโมง)</li>
                <li>ส่งรหัสผ่าน กยศ. Connect เพื่อให้ทีมงานเข้าระบบ</li>
                <li>ทีมงานดำเนินการ <strong>เก็บชั่วโมง กยศ ออนไลน์</strong> ให้ทันที</li>
                <li>รอตรวจงานและชำระเงินหลังงานเสร็จสิ้น</li>
              </ul>

              <h3 className="text-xl font-semibold text-foreground border-b border-border pb-2 mt-6">รูปแบบงานจิตอาสา</h3>
              <ul className="list-disc list-inside space-y-2">
                <li>การทำแบบทดสอบ SET e-Learning</li>
                <li>การดูคลิปวิดีโอให้ครบตามเวลาที่กำหนด</li>
                <li>บริการรับดาวน์โหลดเกียรติบัตรและ <strong>กรอกข้อมูล กยศ</strong></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-foreground border-b border-border pb-2">อัตราค่าบริการ (ราคา)</h3>
              <ul className="list-disc list-inside space-y-2">
                <li>ราคาเริ่มต้นเฉลี่ยชั่วโมงละ 4 - 5 บาท</li>
                <li>เหมาจ่ายครบ 36 ชั่วโมง ในราคาที่คุ้มค่าที่สุด</li>
                <li>ไม่ต้องชำระล่วงหน้า จ่ายหลังงานเสร็จเท่านั้น</li>
              </ul>

              <h3 className="text-xl font-semibold text-foreground border-b border-border pb-2 mt-6">ข้อดีของการ จ้างเก็บชั่วโมง กยศ</h3>
              <ul className="list-disc list-inside space-y-2">
                <li>สะดวกสบาย เหมาะสำหรับผู้ที่ไม่มีเวลาว่าง</li>
                <li>งานเสร็จไวภายใน 1-3 วัน ไม่ทิ้งงาน</li>
                <li>ข้อมูลปลอดภัย 100% ไม่ถูกนำไปใช้ต่อ</li>
                <li>การันตีชั่วโมงผ่านระบบ E-Studentloan แน่นอน</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-border text-center text-sm text-muted-foreground">
            หากคุณกำลังมองหา <strong>บริการเก็บชั่วโมง กยศ</strong> ที่เชื่อถือได้ MeowAcademy คือคำตอบที่ดีที่สุดในการประหยัดเวลาของคุณ เพื่อให้คุณได้นำเวลาไปอ่านหนังสือสอบและทำกิจกรรมอื่นๆ อย่างเต็มที่
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
