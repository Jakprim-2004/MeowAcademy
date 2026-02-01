import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "./ui/accordion";

const FAQSection = () => {
    const faqs = [
        {
            question: "บริการปลอดภัยหรือไม่?",
            answer: "ปลอดภัย 100% ครับ ข้อมูลส่วนตัวของคุณ (รหัสผ่าน กยศ.) จะถูกเก็บเป็นความลับสูงสุดและใช้สำหรับการเข้าสู่ระบบเพื่อบันทึกข้อมูลเท่านั้น ไม่มีการนำไปเผยแพร่หรือใช้ในทางอื่นแน่นอน",
        },
        {
            question: "ใช้เวลาดำเนินการนานเท่าไหร่?",
            answer: "โดยปกติทีมงานจะดำเนินการให้เสร็จสิ้นภายใน 1-2 วันหลังจากได้รับการยืนยันการชำระเงินครับ รวดเร็วทันใจแน่นอน",
        },
        {
            question: "ต้องเตรียมข้อมูลอะไรบ้าง?",
            answer: "เตรียมแค่ 'รหัสผ่าน กยศ. Connect' และ 'ชื่อบัญชีผู้ใช้' เท่านั้นครับ ส่วนรายละเอียดกิจกรรมจิตอาสาทางเราจะจัดการหามาบันทึกให้ครับ",
        },
        {
            question: "MeowAcademy ปล่อยกู้เงินจริงไหม?",
            answer: "ไม่ใช่ครับ! MeowAcademy เป็นเพียงชื่อแบรนด์บริการ 'รับจ้างบันทึกชั่วโมงจิตอาสา' สำหรับน้องๆ กยศ. เท่านั้น เราไม่ได้ให้บริการสินเชื่อหรือปล่อยกู้เงินใดๆ ครับ",
        },
        {
            question: "ทำไมถึงควรใช้บริการของเรา?",
            answer: "เราช่วยประหยัดเวลาอันมีค่าของน้องๆ เพื่อให้มีเวลาไปอ่านหนังสือสอบ หรือทำกิจกรรมอื่นๆ ที่สำคัญกว่า โดยไม่ต้องกังวลเรื่องการหาที่ทำจิตอาสาและการกรอกข้อมูลที่ยุ่งยากครับ",
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
            </div>
        </section>
    );
};

export default FAQSection;
