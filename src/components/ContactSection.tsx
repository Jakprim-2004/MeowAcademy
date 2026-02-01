import { MessageCircle, HelpCircle } from "lucide-react";
import { Button } from "./ui/button";

const ContactSection = () => {
  return (
    <section id="contact" className="py-20">
      <div className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy to-foreground p-12 md:p-16 text-center animate-fade-in">
          {/* Decorations */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
          
          <div className="relative">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/10 mb-8">
              <HelpCircle className="w-10 h-10 text-white" />
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              มีข้อสงสัยหรือต้องการสอบถามเพิ่มเติม?
            </h2>
            <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
              ทีมงานของเราพร้อมให้คำปรึกษาและตอบคำถามทุกข้อสงสัย
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                className="bg-[hsl(142,76%,36%)] hover:bg-[hsl(142,76%,32%)] text-primary-foreground font-semibold shadow-lg px-8"
                onClick={() => window.open("https://line.me/R/ti/p/@807chkoh", "_blank")}
              >
                <MessageCircle className="mr-2 w-5 h-5" />
                ติดต่อเราทาง Line
              </Button>
            </div>

            <p className="mt-6 text-white/60">
              LINE OA: <span className="text-white font-medium">@807chkoh</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
