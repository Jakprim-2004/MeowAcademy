"use client";

import { useState, useEffect, useCallback, memo } from "react";
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

// Fetch a page of slips — try view first, fallback to orders table
const fetchPage = async (page: number): Promise<{ rows: SlipData[]; isLast: boolean }> => {
    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    // Try 1: public view (fast, no RLS)
    const { data: viewData, error: viewError } = await supabase
        .from("payment_slips_public" as any)
        .select("id, payment_proof_url")
        .range(from, to);

    if (!viewError && viewData && viewData.length > 0) {
        return {
            rows: (viewData as any[]).map(r => ({ id: r.id, payment_proof_url: r.payment_proof_url })),
            isLast: viewData.length < PAGE_SIZE,
        };
    }

    // Try 2: fallback to orders table directly
    const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select("id, payment_proof_url")
        .not("payment_proof_url", "is", null)
        .in("status", ["paid", "processing", "completed"])
        .order("updated_at", { ascending: false })
        .range(from, to);

    if (orderError || !orderData) {
        console.error("Error fetching slips:", viewError || orderError);
        return { rows: [], isLast: true };
    }

    return {
        rows: orderData
            .filter(r => r.payment_proof_url)
            .map(r => ({ id: r.id, payment_proof_url: r.payment_proof_url! })),
        isLast: orderData.length < PAGE_SIZE,
    };
};

const PaymentSlipsSection = () => {
    const [slips, setSlips] = useState<SlipData[]>([]);
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);

    // Deduplicate and append new slips
    const appendSlips = useCallback((newRows: SlipData[]) => {
        setSlips(prev => {
            const existingUrls = new Set(prev.map(s => s.payment_proof_url));
            const unique = newRows.filter(r => !existingUrls.has(r.payment_proof_url));
            return unique.length > 0 ? [...prev, ...unique] : prev;
        });
    }, []);

    // Initial load — first 10 slips
    useEffect(() => {
        let cancelled = false;

        const loadFirst = async () => {
            setLoading(true);
            const { rows, isLast } = await fetchPage(0);
            if (cancelled) return;
            appendSlips(rows);
            setHasMore(!isLast);
            setCurrentPage(0);
            setLoading(false);
        };

        loadFirst();
        return () => { cancelled = true; };
    }, [appendSlips]);

    // Progressive background loading — page 1, 2, 3...
    useEffect(() => {
        if (loading || !hasMore) return;

        let cancelled = false;
        const timer = setTimeout(async () => {
            const nextPage = currentPage + 1;
            const { rows, isLast } = await fetchPage(nextPage);
            if (cancelled) return;
            appendSlips(rows);
            setHasMore(!isLast);
            setCurrentPage(nextPage);
        }, 1500);

        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [loading, hasMore, currentPage, appendSlips]);

    // Show nothing only if loading is done and still no slips
    if (!loading && slips.length === 0) return null;

    return (
        <section className="py-16 bg-gradient-to-b from-background to-secondary/20 relative overflow-hidden">
            {/* Styles for Infinite Scroll */}
            <style>{`
        @keyframes scroll-slips {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll-slips {
          animation: scroll-slips 70s linear infinite;
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
            {slips.length > 0 ? (
                <div className="flex w-full overflow-hidden">
                    <div className="flex animate-scroll-slips w-max">
                        {[...slips, ...slips, ...slips, ...slips].map((slip, i) => (
                            <SlipCard key={`slip-${i}-${slip.id}`} slip={slip} />
                        ))}
                    </div>
                </div>
            ) : (
                <div className="flex justify-center items-center h-[260px] md:h-[320px]">
                    <div className="flex gap-4">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div
                                key={i}
                                className="w-[180px] md:w-[220px] h-[260px] md:h-[320px] rounded-xl bg-gray-200 animate-pulse"
                            />
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
};

export default PaymentSlipsSection;
