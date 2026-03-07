import { useState, useEffect, memo } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SlipData {
    id: string;
    payment_proof_url: string;
}

const SUPABASE_URL = "https://iiimpsfjzcgxcoxvveis.supabase.co";

const SlipCard = memo(({ slip }: { slip: SlipData }) => {
    const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');

    if (status === 'error') return null;

    return (
        <div
            className="w-[180px] md:w-[220px] flex-shrink-0 mx-3 transform-gpu will-change-transform"
            style={{ display: status === 'loading' ? 'none' : 'block' }}
        >
            <div className="rounded-xl overflow-hidden border border-border/50 shadow-sm bg-white hover:shadow-md transition-shadow duration-300 relative">
                <img
                    src={slip.payment_proof_url}
                    alt="หลักฐานการชำระเงิน"
                    className="w-full h-[260px] md:h-[320px] object-cover blur-[3px]"
                    loading="lazy"
                    onLoad={() => setStatus('loaded')}
                    onError={() => setStatus('error')}
                />
            </div>
        </div>
    );
});

SlipCard.displayName = "SlipCard";

const PaymentSlipsSection = () => {
    const [slips, setSlips] = useState<SlipData[]>([]);

    useEffect(() => {
        fetchSlips();
    }, []);

    const fetchSlips = async () => {
        try {
            const allSlips: SlipData[] = [];
            const seenUrls = new Set<string>();

            // 1. Primary: Fetch from database (reliable, works with anon key)
            const { data: dbData } = await supabase
                .from("orders")
                .select("id, payment_proof_url")
                .not("payment_proof_url", "is", null)
                .in("status", ["paid", "processing", "completed"])
                .order("updated_at", { ascending: false })
                .limit(30);

            if (dbData) {
                for (const order of dbData) {
                    if (order.payment_proof_url && !seenUrls.has(order.payment_proof_url)) {
                        seenUrls.add(order.payment_proof_url);
                        allSlips.push({
                            id: order.id,
                            payment_proof_url: order.payment_proof_url,
                        });
                    }
                }
            }

            // 2. Secondary: Try listing storage bucket directly (may fail due to RLS)
            try {
                const { data: rootItems } = await supabase.storage
                    .from("payment-slips")
                    .list("", { limit: 100 });

                if (rootItems) {
                    for (const item of rootItems) {
                        if (item.name && item.metadata) {
                            // File at root level
                            const url = `${SUPABASE_URL}/storage/v1/object/public/payment-slips/${item.name}`;
                            if (!seenUrls.has(url)) {
                                seenUrls.add(url);
                                allSlips.push({ id: item.name, payment_proof_url: url });
                            }
                        } else if (item.name && !item.metadata) {
                            // Folder — list files inside
                            const { data: subItems } = await supabase.storage
                                .from("payment-slips")
                                .list(item.name, { limit: 10 });

                            if (subItems) {
                                for (const sub of subItems) {
                                    if (sub.name && sub.metadata) {
                                        const url = `${SUPABASE_URL}/storage/v1/object/public/payment-slips/${item.name}/${sub.name}`;
                                        if (!seenUrls.has(url)) {
                                            seenUrls.add(url);
                                            allSlips.push({ id: `${item.name}/${sub.name}`, payment_proof_url: url });
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            } catch (storageError) {
                console.warn("Storage listing failed (RLS), using database results only:", storageError);
            }

            setSlips(allSlips);
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
          animation: scroll-slips 80s linear infinite;
        }
      `}</style>

            <div className="container mx-auto px-4 mb-10">
                <div className="text-center animate-fade-in">
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
