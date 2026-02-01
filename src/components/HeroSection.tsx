import { ArrowRight, Sparkles, Clock, Users, Shield } from "lucide-react";
import { Button } from "./ui/button";
import catMascot from "@/assets/cat-mascot.png";

const HeroSection = () => {
  const stats = [
    { value: "82+", label: "ลูกค้าที่ใช้บริการ", icon: Users },
    { value: "100%", label: "รับรองผลงาน", icon: Shield },
    { value: "24/7", label: "พร้อมให้บริการ", icon: Clock },
  ];

  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-secondary/50 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* Content */}
          <div className="lg:col-span-7 space-y-8 animate-fade-in text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">บริการเชื่อถือได้ รวดเร็ว ปลอดภัย</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
              <span className="text-gradient">MeowAcademy</span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground w-full select-none">
              รับจ้างเก็บชั่วโมงจิตอาสาและกรอกข้อมูลลงระบบ{" "}
              <span className="text-foreground font-semibold whitespace-nowrap">ง่าย สะดวก รวดเร็ว</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button size="lg" className="bg-hero-gradient hover:opacity-90 shadow-glow text-lg px-8 group" asChild>
                <a href="#services">
                  เริ่มต้นใช้บริการ
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-border">
              {stats.map((stat, index) => (
                <div
                  key={stat.label}
                  className="text-center animate-fade-in-up"
                  style={{ animationDelay: `${0.2 + index * 0.1}s` }}
                >
                  <div className="flex justify-center mb-2">
                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                      <stat.icon className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                  <p className="text-2xl md:text-3xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Cat Mascot */}
          <div className="lg:col-span-5 relative flex justify-center animate-scale-in order-first lg:order-last">
            {/* Soft glow behind cat */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl" />

            {/* Cat image */}
            <img
              src={catMascot}
              alt="MeowAcademy Mascot"
              className="relative w-96 md:w-[500px] lg:w-[600px] animate-bounce-slow drop-shadow-2xl"
            />

          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
