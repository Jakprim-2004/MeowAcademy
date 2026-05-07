import OrderStatus from "@/views/OrderStatus";
import { Suspense } from "react";

export default function OrderStatusPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>}>
      <OrderStatus />
    </Suspense>
  );
}
