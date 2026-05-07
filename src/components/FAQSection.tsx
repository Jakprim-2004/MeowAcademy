"use client";

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "./ui/accordion";
import Link from "next/link";
import { FileText, Shield } from "lucide-react";

const FAQSection = () => {
    const faqs = [
        {
            question: "รับจ้างเก็บชั่วโมงจิตอาสา กยศ. ปลอดภัยหรือไม่?",
            answer: "บริการเก็บชั่วโมง กยศ ออนไลน์ของเราปลอดภัย 100% ครับ ข้อมูลส่วนตัวของคุณจะถูกเก็บเป็นความลับสูงสุดและใช้สำหรับการเข้าสู่ระบบเพื่อกรอกข้อมูล กยศ เท่านั้น ไม่มีการนำไปเผยแพร่หรือใช้ในทางอื่นแน่นอน",
        },
        {
            question: "จ้างเก็บชั่วโมง กยศ ใช้เวลาดำเนินการนานเท่าไหร่?",
            answer: "โดยปกติทีมงานจะรับจ้างเก็บชั่วโมงจิตอาสาและกรอกข้อมูลให้เสร็จสิ้นภายใน 1-3 วันหลังจากได้รับการยืนยันการชำระเงินครับ รวดเร็วทันใจแน่นอน",
        },
        {
            question: "ต้องเตรียมข้อมูลอะไรบ้างสำหรับการทำจิตอาสา กยศ ออนไลน์?",
            answer: "เตรียมแค่ 'รหัสผ่าน กยศ. Connect' และ 'ชื่อบัญชีผู้ใช้' เท่านั้นครับ ส่วนรายละเอียดในการเก็บชั่วโมงจิตอาสา กยศ ทางเราจะจัดการหามาบันทึกและกรอกข้อมูล กยศ ให้ครบถ้วนครับ",
        },
        {
            question: "ชั่วโมงจิตอาสา ออนไลน์ สามารถใช้ยื่นกู้ได้จริงไหม?",
            answer: "สามารถใช้ยื่นกู้ได้จริงครับ ทางเรารับจ้างเก็บชั่วโมงจิตอาสาโดยใช้หลักเกณฑ์ที่ถูกต้อง สามารถตรวจสอบได้ และจะได้รับการบันทึกในระบบ E-Studentloan อย่างถูกต้องแน่นอน",
        },
        {
            question: "ทำไมถึงควรเลือกบริการเก็บชั่วโมง กยศ จาก MeowAcademy?",
            answer: "เราช่วยประหยัดเวลาอันมีค่าของนักศึกษา เพื่อให้มีเวลาไปอ่านหนังสือสอบ หรือทำกิจกรรมอื่นๆ ที่สำคัญกว่า โดยไม่ต้องกังวลเรื่องการหาที่ทำจิตอาสาและการกรอกข้อมูล กยศ ที่ยุ่งยากครับ เราคือตัวจริงเรื่องบริการเก็บชั่วโมง กยศ",
        },
    ];

    return (
        <section id="faq" className="py-20 bg-background">
            <div className="container mx-auto px-4 max-w-3xl">
                <div className="text-center mb-12 animate-fade-in">
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                        คำถามที่พบบ่อย (FAQ)
                    </h2>
                    <p className="text-lg text-muted-foreground">
                        คลายข้อสงสัยเกี่ยวกับบริการของเรา
                    </p>
                </div>

                <div className="animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
                    <Accordion type="single" collapsible className="w-full space-y-4">
                        {faqs.map((faq, index) => (
                            <AccordionItem
                                key={index}
                                value={`item-${index}`}
                                className="border border-border rounded-xl px-4 bg-card"
                            >
                                <AccordionTrigger className="text-left text-lg font-medium hover:text-primary transition-colors">
                                    {faq.question}
                                </AccordionTrigger>
                                <AccordionContent className="text-muted-foreground text-base pb-4">
                                    {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>

                {/* Terms & Privacy Links */}
                <div className="mt-10 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
                    <div className="rounded-2xl border border-border bg-card p-6 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
                        <Link
                            href="/terms"
                            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-medium"
                        >
                            <FileText className="w-4 h-4" />
                            ข้อกำหนดการใช้งาน
                        </Link>
                        <span className="hidden sm:inline text-border">|</span>
                        <Link
                            href="/privacy"
                            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-medium"
                        >
                            <Shield className="w-4 h-4" />
                            นโยบายความเป็นส่วนตัว
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FAQSection;

