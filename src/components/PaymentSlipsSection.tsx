import { useState, useEffect, useRef, useCallback, memo } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SlipData {
    id: string;
    payment_proof_url: string;
}

const PAGE_SIZE = 10;

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
    const [hasMore, setHasMore] = useState(true);
    const seenUrlsRef = useRef(new Set<string>());
    const pageRef = useRef(0);
    const isFetchingRef = useRef(false);

    const fetchSlipsPage = useCallback(async (page: number) => {
        if (isFetchingRef.current) return;
        isFetchingRef.current = true;

        try {
            const from = page * PAGE_SIZE;
            const to = from + PAGE_SIZE - 1;

            const { data: dbData, error } = await supabase
                .from("orders")
                .select("id, payment_proof_url")
                .not("payment_proof_url", "is", null)
                .in("status", ["paid", "processing", "completed"])
                .order("updated_at", { ascending: false })
                .range(from, to);

            if (error) {
                console.error("Error fetching payment slips page:", error);
                setHasMore(false);
                return;
            }

            if (!dbData || dbData.length === 0) {
                setHasMore(false);
                return;
            }

            // Mark no more pages if we got fewer than PAGE_SIZE
            if (dbData.length < PAGE_SIZE) {
                setHasMore(false);
            }

            const newSlips: SlipData[] = [];
            for (const order of dbData) {
                if (order.payment_proof_url && !seenUrlsRef.current.has(order.payment_proof_url)) {
                    seenUrlsRef.current.add(order.payment_proof_url);
                    newSlips.push({
                        id: order.id,
                        payment_proof_url: order.payment_proof_url,
                    });
                }
            }

            if (newSlips.length > 0) {
                setSlips(prev => [...prev, ...newSlips]);
            }
        } catch (error) {
            console.error("Error fetching payment slips:", error);
            setHasMore(false);
        } finally {
            isFetchingRef.current = false;
        }
    }, []);

    // Initial load: fetch first page immediately
    useEffect(() => {
        fetchSlipsPage(0);
    }, [fetchSlipsPage]);

    // Progressive loading: fetch remaining pages in the background
    useEffect(() => {
        if (slips.length === 0 || !hasMore) return;

        const loadMore = async () => {
            pageRef.current += 1;
            await fetchSlipsPage(pageRef.current);
        };

        // Delay subsequent pages to prioritize initial render
        const timer = setTimeout(loadMore, 1500);
        return () => clearTimeout(timer);
    }, [slips.length, hasMore, fetchSlipsPage]);

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
