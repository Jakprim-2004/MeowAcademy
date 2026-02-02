import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, MessageCircle, Loader2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import PageLayout from "@/components/PageLayout";
import PageHeader from "@/components/PageHeader";

const Dashboard = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setIsLoading(false);

        if (!session) {
          navigate("/login");
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsLoading(false);

      if (!session) {
        navigate("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  const userMetadata = user?.user_metadata;
  const displayName = userMetadata?.full_name || "ผู้ใช้งาน";
  const avatarUrl = userMetadata?.avatar_url;

  return (
    <PageLayout variant="minimal">
      {/* Header */}
      <PageHeader user={user} />

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome section */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            สวัสดี, {displayName}! 🐱
          </h1>
          <p className="text-muted-foreground">
            ยินดีต้อนรับสู่ MeowAcademy Dashboard
          </p>
        </div>

        {/* Quick actions */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card
            className="hover:shadow-lg transition-shadow cursor-pointer group"
            onClick={() => window.location.href = "/#services"}
          >
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2 group-hover:bg-primary/20 transition-colors">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>เลือกบริการ</CardTitle>
              <CardDescription>เริ่มต้นเลือกบริการที่ต้องการ</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                ดูบริการ
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-2 group-hover:bg-accent/20 transition-colors">
                <User className="w-6 h-6 text-accent" />
              </div>
              <CardTitle>ตรวจสอบสถานะ</CardTitle>
              <CardDescription>ดูสถานะการสั่งซื้อบริการของคุณ</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" onClick={() => navigate("/order-status")}>
                ดูสถานะ
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-2 group-hover:bg-accent/20 transition-colors">
                <MessageCircle className="w-6 h-6 text-accent" />
              </div>
              <CardTitle>ติดต่อเรา</CardTitle>
              <CardDescription>พูดคุยกับทีมงานผ่าน LINE</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.open("https://line.me/R/ti/p/@807chkoh", "_blank")}
              >
                แชทเลย
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Profile card */}
        <Card>
          <CardHeader>
            <CardTitle>ข้อมูลบัญชี</CardTitle>
            <CardDescription>ข้อมูลบัญชี LINE ที่เชื่อมต่อกับระบบ</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={avatarUrl} alt={displayName} />
                <AvatarFallback>
                  <User className="w-8 h-8" />
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-lg">{displayName}</p>
                <p className="text-sm text-muted-foreground">
                  เข้าสู่ระบบด้วย LINE
                </p>
                {userMetadata?.line_user_id && (
                  <p className="text-xs text-muted-foreground mt-1">
                    LINE ID: {userMetadata.line_user_id.substring(0, 8)}...
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </PageLayout>
  );
};

export default Dashboard;
