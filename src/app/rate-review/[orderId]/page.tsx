import RateReview from "@/views/RateReview";
import { Suspense } from "react";

export default function RateReviewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>}>
      <RateReview />
    </Suspense>
  );
}
