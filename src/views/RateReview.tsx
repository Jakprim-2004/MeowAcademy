"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Star, Send, Home, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const RateReview = () => {
    const params = useParams();
    const orderId = params?.orderId as string | undefined;
    const token = params?.token as string | undefined;
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isValid, setIsValid] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [reviewLinkId, setReviewLinkId] = useState<string | null>(null);
    const [orderDetails, setOrderDetails] = useState<{
        id: string;
        customer_name: string;
        service_name: string;
        custom_message?: string;
    } | null>(null);

    useEffect(() => {
        validateAndLoadReview();
    }, [orderId, token]);

    const validateAndLoadReview = async () => {
        try {
            // Case 1: Using review link token
            if (token) {
                const { data: linkData, error: linkError } = await supabase
                    .from('review_links')
                    .select(`
                        id,
                        order_id,
                        is_used,
                        expires_at,
                        custom_message,
                        orders:order_id (id, customer_name, service_name)
                    `)
                    .eq('token', token)
                    .single();

                if (linkError || !linkData) {
                    setIsValid(false);
                    setErrorMessage("ลิงก์รีวิวไม่ถูกต้องหรือไม่มีในระบบ");
                    setIsLoading(false);
                    return;
                }

                // Check if link is already used
                if (linkData.is_used) {
                    setIsValid(false);
                    setErrorMessage("คุณได้ให้คะแนนไปแล้ว ขอบคุณมากครับ! 🙏");
                    setIsLoading(false);
                    return;
                }

                // Check if link is expired
                if (linkData.expires_at && new Date(linkData.expires_at) < new Date()) {
                    setIsValid(false);
                    setErrorMessage("ลิงก์รีวิวหมดอายุแล้ว");
                    setIsLoading(false);
                    return;
                }

                setReviewLinkId(linkData.id);
                setOrderDetails({
                    id: linkData.order_id,
                    customer_name: linkData.orders?.customer_name || "",
                    service_name: linkData.orders?.service_name || "",
                    custom_message: linkData.custom_message,
                });

                // Check if order already has a review
                const { data: existingReview } = await supabase
                    .from('reviews')
                    .select('id')
                    .eq('order_id', linkData.order_id)
                    .maybeSingle();

                if (existingReview) {
                    setIsSubmitted(true);
                }
            }
            // Case 2: Using orderId directly (legacy mode)
            else if (orderId) {
                const { data: orderData, error: orderError } = await supabase
                    .from('orders')
                    .select('id, customer_name, service_name')
                    .eq('id', orderId)
                    .single();

                if (orderError || !orderData) {
                    setIsValid(false);
                    setErrorMessage("ไม่พบออเดอร์นี้ในระบบ");
                    setIsLoading(false);
                    return;
                }

                setOrderDetails(orderData);

                // Check if already reviewed
                const { data: existingReview } = await supabase
                    .from('reviews')
                    .select('id')
                    .eq('order_id', orderId)
                    .maybeSingle();

                if (existingReview) {
                    setIsSubmitted(true);
                }
            }
            else {
                setIsValid(false);
                setErrorMessage("ไม่พบรหัสออเดอร์หรือลิงก์รีวิว");
            }
        } catch (error) {
            console.error("Error validating review:", error);
            setIsValid(false);
            setErrorMessage("เกิดข้อผิดพลาดในการตรวจสอบลิงก์");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (rating === 0) {
            toast.error("กรุณาให้คะแนนอย่างน้อย 1 ดาวครับ");
            return;
        }

        if (!orderDetails?.id) {
            toast.error("ไม่พบข้อมูลออเดอร์");
            return;
        }

        setIsSubmitting(true);
        try {
            // Insert review
            const { error: reviewError } = await supabase
                .from('reviews')
                .insert({
                    order_id: orderDetails.id,
                    rating: rating,
                    comment: comment,
                    review_link_id: reviewLinkId,
                });

            if (reviewError) throw reviewError;

            // Mark review link as used (if using token)
            if (token && reviewLinkId) {
                await supabase.rpc('mark_review_link_used', { p_token: token });
            }

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

    if (!isValid) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
                <div className="max-w-md w-full text-center space-y-6">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                        <AlertTriangle className="w-10 h-10 text-red-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-foreground">ไม่สามารถรีวิวได้</h1>
                    <p className="text-muted-foreground">{errorMessage}</p>
                    
                    <Link to="/">
                        <Button className="mt-4">
                            <Home className="w-4 h-4 mr-2" />
                            กลับหน้าหลัก
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full animate-fade-in-up">
                {/* Header */}
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-2 mb-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-glow">
                            <img src="/images/cat-icons/logo_cat.png" alt="MeowAcademy Logo" className="w-full h-full object-contain drop-shadow-md" />
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
                        {/* Custom Message from Admin */}
                        {orderDetails?.custom_message && (
                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                                <p className="text-sm text-blue-800">{orderDetails.custom_message}</p>
                            </div>
                        )}

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
