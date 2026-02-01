import { Check, Sparkles, Clock, FileText } from "lucide-react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { Badge } from "./ui/badge";
import { supabase } from "@/integrations/supabase/client";

const PricingSection = () => {
  const navigate = useNavigate();

  const handleBooking = async (href: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/login");
    } else {
      navigate(href);
    }
  };

  const plans = [
    {
      name: "บริการรายชั่วโมง",
      description: "สำหรับผู้ที่ต้องการเก็บชั่วโมงจำนวนน้อย",
      price: "5",
      unit: "/ ชั่วโมง",
      icon: Clock,
      features: [
        "ดำเนินการภายใน 24 ชม.",
        "งานเสร็จ 1-3 วัน",
        "รับรองผลงาน 100%",
      ],
      href: "/register?type=hourly",
      popular: false,
      color: "from-blue-500 to-blue-600",
    },
    {
      name: "แพ็คเกจ 36 ชั่วโมง",
      description: "ประหยัดกว่าเมื่อเทียบกับรายชั่วโมง",
      price: "120",
      unit: "/ 36 ชม.",
      discount: "ประหยัด 33%",
      icon: Sparkles,
      features: [
        "ดำเนินการภายใน 24 ชม.",
        "งานเสร็จ 1-3 วัน",
        "รับรองผลงาน 100%",
      ],
      href: "/register?type=package",
      popular: true,
      color: "from-primary to-accent",
    },
    {
      name: "บริการกรอกข้อมูล",
      description: "บริการกรอกข้อมูลลงระบบให้เรียบร้อย",
      price: "50",
      unit: "/ ครั้ง",
      icon: FileText,
      features: [
        "กรอกข้อมูลครบถ้วน",
        "ดำเนินการภายใน 24 ชม.",
        "รับรองผลงาน 100%",
      ],
      href: "/register?type=system",
      popular: false,
      color: "from-purple-500 to-purple-600",
    },
  ];

  return (
    <section id="services" className="py-20 relative">
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background via-secondary/30 to-background" />

      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <Badge variant="secondary" className="mb-4 px-4 py-2">
            บริการของเรา
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            เลือกแพ็คเกจที่เหมาะกับคุณ
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            บริการครบวงจร ราคาเป็นกันเอง รับรองคุณภาพ
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={`relative rounded-3xl p-6 bg-card border ${plan.popular ? "border-primary shadow-glow" : "border-border"
                } card-hover animate-fade-in-up`}
              style={{ animationDelay: `${0.1 + index * 0.1}s` }}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-hero-gradient text-primary-foreground px-4 py-1">
                    แนะนำ
                  </Badge>
                </div>
              )}

              {/* Icon */}
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4`}>
                <plan.icon className="w-7 h-7 text-white" />
              </div>

              {/* Plan info */}
              <h3 className="text-lg font-bold text-foreground mb-1">{plan.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-sm text-muted-foreground">฿</span>
                  <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.unit}</span>
                </div>
                {plan.discount && (
                  <Badge variant="secondary" className="mt-2 text-primary bg-primary/10">
                    {plan.discount}
                  </Badge>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Button
                className={`w-full ${plan.popular ? "bg-hero-gradient hover:opacity-90" : ""}`}
                variant={plan.popular ? "default" : "outline"}
                onClick={() => handleBooking(plan.href)}
              >
                สั่งจองบริการ
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
