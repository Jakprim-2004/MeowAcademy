import AdminDashboard from "@/views/AdminDashboard";
import { Suspense } from "react";

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>}>
      <AdminDashboard />
    </Suspense>
  );
}

