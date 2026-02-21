import { useState, useEffect, memo } from "react";
import { Star } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { supabase } from "@/integrations/supabase/client";

interface Review {
    id: string;
    rating: number;
    comment: string;
}

// Optimized Component: Defined OUTSIDE to prevent re-creation on every render
const ReviewCard = memo(({ review }: { review: Review }) => (
    <Card className="border shadow-sm w-[300px] md:w-[400px] flex-shrink-0 mx-4 bg-white transform-gpu will-change-transform">
        <CardContent className="p-6 flex flex-col h-full">
            <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                    <Star
                        key={i}
                        className={`w-4 h-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"}`}
                    />
                ))}
            </div>
            <p className="text-foreground text-sm md:text-base leading-relaxed line-clamp-3">
                "{review.comment}"
            </p>
        </CardContent>
    </Card>
));

ReviewCard.displayName = "ReviewCard";





const TestimonialsSection = () => {
    // 1. Define Static Mock Data (Fallback & Filler)
    const mockReviews = [
        {
            id: "mock-1",
            rating: 5,
            comment: "สะดวกมากค่ะ ไม่ต้องไปเดินหาที่ทำจิตอาสาเอง เวลาไปอ่านหนังสือเพิ่มขึ้นเยอะเลย",
        },
        {
            id: "mock-2",
            rating: 5,
            comment: "ตอนแรกกังวลว่าจะโกงไหม แต่พี่แอดมินตอบไว งานเสร็จจริง ยื่นกู้ผ่านฉลุยครับ",
        },
        {
            id: "mock-3",
            rating: 5,
            comment: "ราคาไม่แพงเลยค่ะถ้าเทียบกับความสะดวก รวดเร็วมาก สั่งปุ๊บอีกวันเสร็จปั๊บ",
        },
        {
            id: "mock-4",
            rating: 4,
            comment: "งานละเอียดดีครับ แต่ตอบแชทช้าไปนิดนึง โดยรวมโอเคครับ",
        },
        {
            id: "mock-5",
            rating: 5,
            comment: "ช่วยชีวิตไว้ได้ทันเวลาพอดี ขอบคุณมากๆ เลยค่ะ",
        },
        {
            id: "mock-6",
            rating: 5,
            comment: "ประทับใจบริการมากครับ รวดเร็วทันใจ ไม่ยุ่งยาก",
        },
    ];

    const [reviews, setReviews] = useState<Review[]>(mockReviews);
    const [totalOrders, setTotalOrders] = useState(82);

    useEffect(() => {
        fetchReviews();
        fetchTotalOrders();
    }, []);

    const fetchReviews = async () => {
        try {
            // Fetch reviews from DB (Limit 50 to emulate "not all at once" but enough for scrolling)
            const { data, error } = await supabase
                .from('reviews' as any)
                .select('id, rating, comment')
                .gt('rating', 0)
                .not('comment', 'is', null)
                .limit(50)
                .order('created_at', { ascending: false });

            if (data && data.length > 0) {
                // Combine Mock + Real Data
                setReviews(prev => [...prev, ...(data as unknown as Review[])]);
            }
        } catch (error) {
            console.error("Error fetching reviews:", error);
        }
    };

    const fetchTotalOrders = async () => {
        try {
            // Call RPC function to get count (bypasses RLS)
            // MAKE SURE to run the SQL function creation in Supabase Dashboard first!
            const { data, error } = await supabase.rpc('get_total_orders' as any);

            if (error) {
                console.error("RPC Error:", error);
                throw error;
            }

            const count = data as unknown as number;

            if (typeof count === 'number') {
                const targetCount = 82 + count;
                // Simple animation
                let start = 0;
                const duration = 2000;
                const increment = targetCount / (duration / 16);

                const timer = setInterval(() => {
                    start += increment;
                    if (start >= targetCount) {
                        setTotalOrders(targetCount);
                        clearInterval(timer);
                    } else {
                        setTotalOrders(Math.ceil(start));
                    }
                }, 16);
            }
        } catch (error) {
            console.error("Error counting profiles:", error);
            // Fallback to static if profiles table doesn't exist or error
            setTotalOrders(82);
        }
    };



    // Calculate split points for 2 rows
    const midPoint = Math.ceil(reviews.length / 2);
    const row1 = reviews.slice(0, midPoint);
    const row2 = reviews.slice(midPoint);

    // Ensure rows aren't empty by falling back to full list or mock
    const finalRow1 = row1.length > 0 ? row1 : mockReviews;
    const finalRow2 = row2.length > 0 ? row2 : mockReviews;

    return (
        <section className="py-20 bg-secondary/30 relative overflow-hidden">
            {/* Styles for Infinite Scroll */}
            <style>{`
                @keyframes scroll {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-scroll {
                    animation: scroll 60s linear infinite;
                }

            `}</style>

            {/* Background decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-10 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute bottom-10 right-10 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
            </div>

            <div className="container mx-auto px-4 mb-12">
                <div className="text-center animate-fade-in">
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                        เสียงตอบรับจากลูกค้า
                    </h2>
                    <p className="text-lg text-muted-foreground">
                        ความประทับใจจากน้องๆ ที่ใช้บริการ MeowAcademy
                    </p>
                </div>
            </div>

            {/* Marquee Rows Container */}
            <div className="flex flex-col gap-8 w-full">
                {/* Row 1: Moves Left */}
                <div className="flex w-full overflow-hidden">
                    <div className="flex animate-scroll w-max">
                        {[...finalRow1, ...finalRow1, ...finalRow1, ...finalRow1].map((review, i) => (
                            <ReviewCard key={`r1-${i}-${review.id}`} review={review} />
                        ))}
                    </div>
                </div>

                {/* Row 2: Moves Right (Reverse Direction) */}
                <div className="flex w-full overflow-hidden">
                    <div className="flex animate-scroll w-max" style={{ animationDirection: 'reverse', animationDuration: '70s' }}>
                        {[...finalRow2, ...finalRow2, ...finalRow2, ...finalRow2].map((review, i) => (
                            <ReviewCard key={`r2-${i}-${review.id}`} review={review} />
                        ))}
                    </div>
                </div>


            </div>

            <div className="container mx-auto px-4 mt-16">
                {/* Start Stats */}
                <div className="text-center animate-fade-in" style={{ animationDelay: "0.5s" }}>
                    <div className="inline-flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow-sm border border-border">
                        <span className="flex -space-x-2">
                            <div className="w-8 h-8 rounded-full bg-red-100 border-2 border-white" />
                            <div className="w-8 h-8 rounded-full bg-green-100 border-2 border-white" />
                            <div className="w-8 h-8 rounded-full bg-blue-100 border-2 border-white" />
                        </span>
                        <span className="font-semibold text-foreground">
                            ไว้วางใจโดยลูกค้ากว่า <span className="text-primary">{totalOrders}+</span> ครั้ง
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TestimonialsSection;
