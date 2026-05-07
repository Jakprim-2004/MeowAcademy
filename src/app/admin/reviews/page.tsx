import ReviewManagement from "@/views/ReviewManagement";
import { Suspense } from "react";

export default function AdminReviewsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>}>
      <ReviewManagement />
    </Suspense>
  );
}

