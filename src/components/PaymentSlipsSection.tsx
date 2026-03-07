import { useState, useEffect, memo } from "react";
import { Receipt } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface SlipData {
    id: string;
    payment_proof_url: string;
}

const SlipCard = memo(({ slip }: { slip: SlipData }) => (
    <div className="w-[180px] md:w-[220px] flex-shrink-0 mx-3 transform-gpu will-change-transform">
        <div className="rounded-xl overflow-hidden border border-border/50 shadow-sm bg-white hover:shadow-md transition-shadow duration-300">
            <img
                src={slip.payment_proof_url}
                alt="หลักฐานการชำระเงิน"
                className="w-full h-[260px] md:h-[320px] object-cover"
                loading="lazy"
            />
        </div>
    </div>
));

SlipCard.displayName = "SlipCard";

const PaymentSlipsSection = () => {
    const [slips, setSlips] = useState<SlipData[]>([]);

    useEffect(() => {
        fetchSlips();
    }, []);

    const fetchSlips = async () => {
        try {
            const { data, error } = await supabase
                .from("orders")
                .select("id, payment_proof_url")
                .not("payment_proof_url", "is", null)
                .in("status", ["paid", "processing", "completed"])
                .order("updated_at", { ascending: false })
                .limit(30);

            if (error) throw error;

            if (data && data.length > 0) {
                setSlips(data as SlipData[]);
            }
        } catch (error) {
            console.error("Error fetching payment slips:", error);
        }
    };

    // Don't render the section if no slips
    if (slips.length === 0) return null;

    return (
        <section className="py-16 bg-gradient-to-b from-background to-secondary/20 relative overflow-hidden">
            {/* Styles for Infinite Scroll */}
            <style>{`
        @keyframes scroll-slips {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll-slips {
          animation: scroll-slips 40s linear infinite;
        }
      `}</style>

            <div className="container mx-auto px-4 mb-10">
                <div className="text-center animate-fade-in">
                    <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4 border border-green-200">
                        <Receipt className="w-4 h-4" />
                        ยอดชำระจริง
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                        หลักฐานการชำระเงิน
                    </h2>
                    <p className="text-muted-foreground text-lg">
                        สลิปจริงจากลูกค้าที่ไว้วางใจใช้บริการ MeowAcademy
                    </p>
                </div>
            </div>

            {/* Auto-scrolling Slips */}
            <div className="flex w-full overflow-hidden">
                <div className="flex animate-scroll-slips w-max">
                    {[...slips, ...slips, ...slips, ...slips].map((slip, i) => (
                        <SlipCard key={`slip-${i}-${slip.id}`} slip={slip} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default PaymentSlipsSection;
