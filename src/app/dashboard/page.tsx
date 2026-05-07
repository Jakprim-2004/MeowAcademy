import Dashboard from "@/views/Dashboard";
import { Suspense } from "react";

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>}>
      <Dashboard />
    </Suspense>
  );
}

