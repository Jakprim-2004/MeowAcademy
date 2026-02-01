import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Star, Cat, Send, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const RateReview = () => {
    const { orderId } = useParams();
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [orderDetails, setOrderDetails] = useState<{
        customer_name: string;
        service_name: string;
    } | null>(null);

    useEffect(() => {
        if (orderId) {
            checkExistingReview();
            fetchOrderDetails();
        }
    }, [orderId]);

    const checkExistingReview = async () => {
        try {
            // Check if review already exists for this order
            const { data, error } = await supabase
                .from('reviews' as any)
                .select('id')
                .eq('order_id', orderId)
                .maybeSingle();

            if (data) {
                setIsSubmitted(true);
            }
        } catch (error) {
            console.error("Error checking review:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchOrderDetails = async () => {
        try {
            const { data, error } = await supabase
                .from('orders')
                .select('customer_name, service_name')
                .eq('id', orderId)
                .single();

            if (data) {
                setOrderDetails(data);
            }
        } catch (error) {
            console.error("Error fetching order:", error);
        }
    };

    const handleSubmit = async () => {
        if (rating === 0) {
            toast.error("กรุณาให้คะแนนอย่างน้อย 1 ดาวครับ");
            return;
        }

        setIsSubmitting(true);
        try {
            const { error } = await supabase
                .from('reviews' as any)
                .insert({
                    order_id: orderId,
                    rating: rating,
                    comment: comment,
                    user_id: (await supabase.auth.getUser()).data.user?.id // Optional: link to user if logged in
                });

            if (error) throw error;

            setIsSubmitted(true);
            toast.success("ขอบคุณสำหรับการรีวิวครับ! 🙏");
        } catch (error) {
            console.error("Error submitting review:", error);
            toast.error("เกิดข้อผิดพลาดในการส่งรีวิว กรุณาลองใหม่ครับ");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full animate-fade-in-up">
                {/* Header */}
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-2 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-hero-gradient flex items-center justify-center shadow-glow">
                            <Cat className="w-7 h-7 text-primary-foreground" />
                        </div>
                    </Link>
                    <h1 className="text-2xl font-bold text-foreground">
                        {isSubmitted ? "ขอบคุณสำหรับรีวิวครับ!" : "ให้คะแนนบริการ"}
                    </h1>
                    {orderDetails && !isSubmitted && (
                        <p className="text-muted-foreground mt-2">
                            คุณ {orderDetails.customer_name} • {orderDetails.service_name}
                        </p>
                    )}
                </div>

                {isSubmitted ? (
                    <div className="bg-card border border-border rounded-3xl p-8 text-center space-y-6 shadow-sm">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto text-4xl">
                            🙏
                        </div>
                        <p className="text-foreground">
                            ขอบคุณมากๆ ที่สละเวลาให้คะแนนบริการของเราครับ<br />
                            ทุกความคิดเห็นมีค่าสำหรับเราเสมอ
                        </p>
                        <Link to="/">
                            <Button className="w-full bg-hero-gradient hover:opacity-90 mt-4">
                                <Home className="w-4 h-4 mr-2" />
                                กลับหน้าหลัก
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="bg-card border border-border rounded-3xl p-8 shadow-sm space-y-8">
                        {/* Star Rating */}
                        <div className="flex flex-col items-center gap-4">
                            <label className="text-sm font-medium text-muted-foreground">
                                ความพึงพอใจของคุณ
                            </label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        className="transition-transform hover:scale-110 focus:outline-none"
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        onClick={() => setRating(star)}
                                    >
                                        <Star
                                            className={`w-10 h-10 transition-colors ${star <= (hoverRating || rating)
                                                ? "fill-yellow-400 text-yellow-400 drop-shadow-md"
                                                : "text-muted-foreground/30"
                                                }`}
                                        />
                                    </button>
                                ))}
                            </div>
                            <div className="h-6 text-sm font-medium text-primary">
                                {(hoverRating || rating) === 5 && "สุดยอดมาก! 🤩"}
                                {(hoverRating || rating) === 4 && "ดีมาก 👍"}
                                {(hoverRating || rating) === 3 && "พอใช้ได้ 🙂"}
                                {(hoverRating || rating) === 2 && "ควรปรับปรุง 😐"}
                                {(hoverRating || rating) === 1 && "แย่มาก 😞"}
                            </div>
                        </div>

                        {/* Comment */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">
                                ความคิดเห็นเพิ่มเติม (ไม่บังคับ)
                            </label>
                            <Textarea
                                placeholder="เล่าประสบการณ์ หรือแนะนำติชมได้เลยครับ..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                className="resize-none h-32 rounded-xl text-base"
                                maxLength={500}
                            />
                            <div className="text-right text-xs text-muted-foreground">
                                {comment.length}/500
                            </div>
                        </div>

                        {/* Submit Button */}
                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting || rating === 0}
                            className="w-full h-12 text-lg bg-hero-gradient hover:opacity-90 shadow-glow"
                        >
                            {isSubmitting ? (
                                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                            ) : (
                                <>
                                    ส่งรีวิว <Send className="w-4 h-4 ml-2" />
                                </>
                            )}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RateReview;
