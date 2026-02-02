import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Clock, CheckCircle, XCircle, Loader2, Package, FileText, RefreshCw, ChevronLeft, ChevronRight, CreditCard, Receipt, User, LogOut, Home, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import Sidebar from "@/components/Sidebar";

interface Order {
  id: string;
  service_type: string;
  service_name: string;
  hours: number | null;
  include_data_entry: boolean;
  total_price: number;
  customer_name: string;
  status: 'pending' | 'paid' | 'processing' | 'completed' | 'cancelled';
  created_at: string;
  payment_proof_url: string | null;
}

const statusConfig = {
  pending: {
    label: "รอชำระเงิน",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: Clock,
  },
  paid: {
    label: "ชำระเงินแล้ว",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: CheckCircle,
  },
  processing: {
    label: "กำลังดำเนินการ",
    color: "bg-purple-100 text-purple-800 border-purple-200",
    icon: Loader2,
  },
  completed: {
    label: "เสร็จสิ้น",
    color: "bg-green-100 text-green-800 border-green-200",
    icon: CheckCircle,
  },
  cancelled: {
    label: "ยกเลิก",
    color: "bg-red-100 text-red-800 border-red-200",
    icon: XCircle,
  },
};

const ITEMS_PER_PAGE = 5;

const OrderStatus = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const navigate = useNavigate();

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (!session) {
          navigate("/login");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user, currentPage]);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      // Get total count
      const { count, error: countError } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });

      if (countError) throw countError;
      setTotalCount(count || 0);

      // Fetch paginated orders
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error("ไม่สามารถโหลดข้อมูลคำสั่งซื้อได้");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.clear();
      sessionStorage.clear();
      toast.success("ออกจากระบบเรียบร้อย");
      navigate("/login");
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการออกจากระบบ");
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Background */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>

      {/* Sidebar (Desktop) */}
      <div className="hidden md:block w-72 fixed inset-y-0 left-0 z-50">
        <Sidebar className="w-full h-full shadow-xl" />
      </div>

      {/* Main Content */}
      <div className="flex-1 md:pl-72 w-full transition-all duration-300">
        {/* Mobile Header */}
        <header className="md:hidden border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50 px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shadow-glow">
              <img src="/images/cat-icons/logo_cat.png" alt="MeowAcademy Logo" className="w-full h-full object-contain drop-shadow-md" />
            </div>
            <span className="font-bold text-gradient">MeowAcademy</span>
          </Link>

          {/* Mobile Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2 py-1 h-auto rounded-full border border-border hover:bg-secondary/50">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback className="bg-muted">
                    <User className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium text-sm text-foreground max-w-[80px] truncate">
                  {user?.user_metadata?.full_name || "User"}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-2 bg-background border border-border shadow-lg">
              <div className="flex items-center gap-3 px-2 py-3 border-b border-border mb-2">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback className="bg-muted">
                    <User className="w-5 h-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-medium text-foreground">{user?.user_metadata?.full_name || "User"}</span>
                  <span className="text-xs text-muted-foreground">LINE Account</span>
                </div>
              </div>
              <DropdownMenuItem onClick={() => navigate("/")} className="cursor-pointer gap-2">
                <Home className="w-4 h-4" />
                <span>หน้าหลัก</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/dashboard")} className="cursor-pointer gap-2">
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer gap-2 text-red-500 focus:text-red-500">
                <LogOut className="w-4 h-4" />
                <span>ออกจากระบบ</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Content Area */}
        <main className="container mx-auto px-4 py-8 md:py-12 max-w-5xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                ตรวจสอบสถานะ
              </h1>
              <p className="text-muted-foreground">
                ดูประวัติและสถานะคำสั่งซื้อบริการของคุณ
              </p>
            </div>

            <Button variant="outline" onClick={fetchOrders} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              รีเฟรช
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
          ) : orders.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  ยังไม่มีคำสั่งซื้อ
                </h3>
                <p className="text-muted-foreground mb-6">
                  คุณยังไม่มีประวัติการสั่งซื้อบริการ
                </p>
                <Button asChild>
                  <Link to="/#services">เลือกบริการ</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const status = statusConfig[order.status];
                const StatusIcon = status.icon;
                const isPending = order.status === 'pending';

                return (
                  <Card
                    key={order.id}
                    className={`overflow-hidden transition-all ${isPending ? 'cursor-pointer hover:border-primary hover:shadow-md' : ''
                      }`}
                    onClick={() => {
                      if (isPending) {
                        // Navigate to payment page with order details
                        navigate(`/register?type=${order.service_type}&orderId=${order.id}`);
                      }
                    }}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            {order.service_type === 'hourly' ? (
                              <Clock className="w-5 h-5 text-primary" />
                            ) : (
                              <FileText className="w-5 h-5 text-primary" />
                            )}
                          </div>
                          <div>
                            <CardTitle className="text-lg">{order.service_name}</CardTitle>
                            <CardDescription>
                              {formatDate(order.created_at)}
                            </CardDescription>
                          </div>
                        </div>

                        <Badge className={`${status.color} border`}>
                          <StatusIcon className={`w-3 h-3 mr-1 ${order.status === 'processing' ? 'animate-spin' : ''}`} />
                          {status.label}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">ชื่อลูกค้า: </span>
                          <span className="font-medium">{order.customer_name}</span>
                        </div>

                        {order.hours && (
                          <div>
                            <span className="text-muted-foreground">จำนวนชั่วโมง: </span>
                            <span className="font-medium">{order.hours} ชม.</span>
                          </div>
                        )}

                        {order.include_data_entry && (
                          <Badge variant="secondary" className="text-xs">
                            + กรอกข้อมูลลงระบบ
                          </Badge>
                        )}

                        <div className="ml-auto">
                          <span className="text-muted-foreground">ยอดชำระ: </span>
                          <span className="font-bold text-primary">
                            ฿{order.total_price.toLocaleString('th-TH')}
                          </span>
                        </div>
                      </div>

                      {/* Show payment proof for paid/completed orders */}
                      {order.payment_proof_url && (order.status === 'paid' || order.status === 'processing' || order.status === 'completed') && (
                        <div className="mt-4 pt-3 border-t border-border">
                          <div className="flex items-center gap-3">
                            <Receipt className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">หลักฐานการชำระเงิน:</span>
                            <a
                              href={order.payment_proof_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <img
                                src={order.payment_proof_url}
                                alt="สลิปการชำระเงิน"
                                className="w-12 h-12 object-cover rounded border hover:opacity-80 transition-opacity"
                              />
                              <span className="text-sm text-primary hover:underline">ดูสลิป</span>
                            </a>
                          </div>
                        </div>
                      )}

                      {/* Show "ชำระเงิน" button for pending orders */}
                      {isPending && (
                        <div className="mt-4 pt-3 border-t border-border">
                          <Button
                            className="w-full bg-hero-gradient hover:opacity-90"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/register?type=${order.service_type}&orderId=${order.id}`);
                            }}
                          >
                            <CreditCard className="w-4 h-4 mr-2" />
                            ชำระเงินตอนนี้
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6">
                  <p className="text-sm text-muted-foreground">
                    แสดง {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} จาก {totalCount} รายการ
                  </p>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1 || isLoading}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span className="hidden sm:inline ml-1">ก่อนหน้า</span>
                    </Button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum: number;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }

                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            className="w-9"
                            onClick={() => handlePageChange(pageNum)}
                            disabled={isLoading}
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages || isLoading}
                    >
                      <span className="hidden sm:inline mr-1">ถัดไป</span>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default OrderStatus;
