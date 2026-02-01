import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ShieldCheck, Package, Clock, CheckCircle, XCircle, Loader2, ChevronLeft, ChevronRight, MessageSquare, Eye, Copy } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import type { Tables } from "@/integrations/supabase/types";
import SendMessageDialog from "@/components/SendMessageDialog";

type Order = Tables<"orders">;
type OrderStatus = "pending" | "paid" | "processing" | "completed" | "cancelled";

const statusConfig: Record<OrderStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: "รอชำระเงิน", color: "bg-yellow-500", icon: <Clock className="w-4 h-4" /> },
  paid: { label: "ชำระเงินแล้ว", color: "bg-blue-500", icon: <CheckCircle className="w-4 h-4" /> },
  processing: { label: "กำลังดำเนินการ", color: "bg-purple-500", icon: <Loader2 className="w-4 h-4" /> },
  completed: { label: "เสร็จสิ้น", color: "bg-green-500", icon: <CheckCircle className="w-4 h-4" /> },
  cancelled: { label: "ยกเลิก", color: "bg-red-500", icon: <XCircle className="w-4 h-4" /> },
};

const ITEMS_PER_PAGE = 10;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [dashboardStats, setDashboardStats] = useState({
    total: 0,
    pending: 0,
    paid: 0,
    processing: 0,
    completed: 0,
    cancelled: 0,
  });

  // Message dialog state
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<{
    name: string;
    lineUserId: string;
  } | null>(null);

  // Order Details Dialog State
  const [viewOrder, setViewOrder] = useState<Order | null>(null);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  useEffect(() => {
    checkAdminAndFetchOrders();
  }, [currentPage]);

  const checkAdminAndFetchOrders = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        toast.error("กรุณาเข้าสู่ระบบ");
        navigate("/login");
        return;
      }

      // Check if user is admin using the has_role function
      const { data: roleData, error: roleError } = await supabase
        .rpc('has_role', { _user_id: session.user.id, _role: 'admin' });

      if (roleError) {
        console.error("Error checking role:", roleError);
        toast.error("ไม่สามารถตรวจสอบสิทธิ์ได้");
        navigate("/dashboard");
        return;
      }

      if (!roleData) {
        toast.error("คุณไม่มีสิทธิ์เข้าถึงหน้านี้");
        navigate("/dashboard");
        return;
      }

      setIsAdmin(true);

      // Fetch total count and stats
      const { data: allOrdersStatus, error: statsError } = await supabase
        .from("orders")
        .select("status");

      if (statsError) {
        console.error("Error fetching stats:", statsError);
      } else if (allOrdersStatus) {
        setTotalCount(allOrdersStatus.length);
        const newStats = {
          total: allOrdersStatus.length,
          pending: allOrdersStatus.filter(o => o.status === "pending").length,
          paid: allOrdersStatus.filter(o => o.status === "paid").length,
          processing: allOrdersStatus.filter(o => o.status === "processing").length,
          completed: allOrdersStatus.filter(o => o.status === "completed").length,
          cancelled: allOrdersStatus.filter(o => o.status === "cancelled").length,
        };
        setDashboardStats(newStats);
      }

      // Fetch paginated orders for table
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })
        .range(from, to);

      if (ordersError) {
        console.error("Error fetching orders:", ordersError);
        toast.error("ไม่สามารถโหลดข้อมูลได้");
        return;
      }

      setOrders(ordersData || []);
    } catch (error) {
      console.error("Error:", error);
      toast.error("เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const previousStatus = order.status;
    setUpdating(orderId);

    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId);

      if (error) {
        console.error("Error updating order:", error);
        toast.error("ไม่สามารถอัปเดตสถานะได้");
        return;
      }

      setOrders(orders.map(o =>
        o.id === orderId ? { ...o, status: newStatus } : o
      ));
      toast.success(`อัปเดตสถานะเป็น "${statusConfig[newStatus].label}" แล้ว`);

      // Send LINE notification for processing or completed status
      if ((newStatus === 'processing' || newStatus === 'completed') && order.line_user_id) {
        try {
          await supabase.functions.invoke('line-notify', {
            body: {
              type: newStatus === 'completed' ? 'work_completed' : 'work_processing',
              orderId: orderId,
              customerName: order.customer_name,
              serviceName: order.service_name,
              totalPrice: order.total_price,
              lineUserId: order.line_user_id,
            },
          });
          console.log(`LINE notification sent for ${newStatus}`);
          toast.success('ส่งแจ้งเตือนไปยังลูกค้าแล้ว');
        } catch (notifyError) {
          console.error('Failed to send LINE notification:', notifyError);
          // Don't show error to user - status update was successful
        }
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("เกิดข้อผิดพลาด");
    } finally {
      setUpdating(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
    }).format(price);
  };

  // Stats are now managed via dashboardStats state populated in checkAdminAndFetchOrders
  const stats = dashboardStats;

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const openMessageDialog = (customerName: string, lineUserId: string) => {
    setSelectedCustomer({ name: customerName, lineUserId });
    setMessageDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-12">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-hero-gradient flex items-center justify-center shadow-glow">
            <ShieldCheck className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">จัดการคำสั่งซื้อทั้งหมด</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-sm text-muted-foreground">ทั้งหมด</p>
            </CardContent>
          </Card>
          <Card className="border-yellow-500/50">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-yellow-500">{stats.pending}</div>
              <p className="text-sm text-muted-foreground">รอชำระเงิน</p>
            </CardContent>
          </Card>
          <Card className="border-blue-500/50">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-blue-500">{stats.paid}</div>
              <p className="text-sm text-muted-foreground">ชำระแล้ว</p>
            </CardContent>
          </Card>
          <Card className="border-purple-500/50">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-purple-500">{stats.processing}</div>
              <p className="text-sm text-muted-foreground">กำลังดำเนินการ</p>
            </CardContent>
          </Card>
          <Card className="border-green-500/50">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-500">{stats.completed}</div>
              <p className="text-sm text-muted-foreground">เสร็จสิ้น</p>
            </CardContent>
          </Card>
          <Card className="border-red-500/50">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-red-500">{stats.cancelled}</div>
              <p className="text-sm text-muted-foreground">ยกเลิก</p>
            </CardContent>
          </Card>
        </div>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              รายการคำสั่งซื้อ
            </CardTitle>
          </CardHeader>
          <CardContent>
            {orders.length === 0 && !loading ? (
              <div className="text-center py-12 text-muted-foreground">
                ยังไม่มีคำสั่งซื้อ
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>วันที่</TableHead>
                        <TableHead>ชื่อลูกค้า</TableHead>
                        <TableHead>บริการ</TableHead>
                        <TableHead>รายละเอียดงาน</TableHead>
                        <TableHead>ราคา</TableHead>
                        <TableHead>สถานะ</TableHead>
                        <TableHead>จัดการ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="whitespace-nowrap">
                            {formatDate(order.created_at)}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{order.customer_name}</div>
                              <div className="text-xs text-muted-foreground">
                                {order.citizen_id.replace(/(\d{1})(\d{4})(\d{5})(\d{2})(\d{1})/, "$1-$2-$3-$4-$5")}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{order.service_name}</div>
                              <div className="text-xs text-muted-foreground">{order.service_type}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm space-y-1">
                              {order.hours && (
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-muted-foreground" />
                                  <span>{order.hours} ชั่วโมง</span>
                                </div>
                              )}
                              {order.include_data_entry && (
                                <Badge variant="secondary" className="text-xs">
                                  รวมกรอกข้อมูล
                                </Badge>
                              )}
                              {order.notes && (
                                <div className="text-xs text-muted-foreground max-w-[150px] truncate" title={order.notes}>
                                  📝 {order.notes}
                                </div>
                              )}
                              {!order.hours && !order.include_data_entry && !order.notes && (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatPrice(order.total_price)}
                          </TableCell>
                          <TableCell>
                            <Badge className={`${statusConfig[order.status as OrderStatus].color} text-white`}>
                              {statusConfig[order.status as OrderStatus].icon}
                              <span className="ml-1">{statusConfig[order.status as OrderStatus].label}</span>
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Select
                                value={order.status}
                                onValueChange={(value) => handleStatusChange(order.id, value as OrderStatus)}
                                disabled={updating === order.id}
                              >
                                <SelectTrigger className="w-[140px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">รอชำระเงิน</SelectItem>
                                  <SelectItem value="paid">ชำระแล้ว</SelectItem>
                                  <SelectItem value="processing">กำลังดำเนินการ</SelectItem>
                                  <SelectItem value="completed">เสร็จสิ้น</SelectItem>
                                  <SelectItem value="cancelled">ยกเลิก</SelectItem>
                                </SelectContent>
                              </Select>

                              {order.line_user_id && (
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => openMessageDialog(order.customer_name, order.line_user_id!)}
                                  title="ส่งข้อความหาลูกค้า"
                                >
                                  <MessageSquare className="w-4 h-4" />
                                </Button>
                              )}

                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setViewOrder(order)}
                                title="ดูรายละเอียดครบ"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      แสดง {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} จาก {totalCount} รายการ
                    </p>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1 || loading}
                      >
                        <ChevronLeft className="w-4 h-4" />
                        ก่อนหน้า
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
                              disabled={loading}
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
                        disabled={currentPage === totalPages || loading}
                      >
                        ถัดไป
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}

          </CardContent>
        </Card>

        {/* Order Details Dialog */}
        <Dialog open={!!viewOrder} onOpenChange={(open) => !open && setViewOrder(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>รายละเอียดคำสั่งซื้อ</DialogTitle>
              <DialogDescription>
                รหัสสั่งซื้อ: {viewOrder?.id.slice(0, 8)}...
              </DialogDescription>
            </DialogHeader>

            {viewOrder && (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-1">ชื่อลูกค้า</h4>
                      <p className="text-base font-medium">{viewOrder.customer_name}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-1">เลขบัตรประชาชน</h4>
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-lg tracking-wide">
                        {viewOrder.citizen_id.replace(/(\d{1})(\d{4})(\d{5})(\d{2})(\d{1})/, "$1-$2-$3-$4-$5")}
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => {
                          navigator.clipboard.writeText(viewOrder.citizen_id);
                          toast.success("คัดลอกเลขบัตรแล้ว");
                        }}
                        title="คัดลอก"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border/50">
                    <h4 className="font-semibold text-sm text-muted-foreground mb-1">🔑 รหัสผ่าน / หมายเหตุ</h4>
                    <div className="flex items-start gap-2">
                      <div className="bg-background/50 rounded px-3 py-2 text-sm font-mono break-all border flex-1 relative min-h-[38px] flex items-center">
                        {viewOrder.notes ? (
                          viewOrder.notes
                        ) : (
                          <span className="text-muted-foreground italic text-xs">- ไม่ได้ระบุ -</span>
                        )}
                      </div>

                      {viewOrder.notes && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-background border"
                          onClick={() => {
                            navigator.clipboard.writeText(viewOrder.notes || "");
                            toast.success("คัดลอกแล้ว");
                          }}
                          title="คัดลอก"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">รายละเอียดงาน</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-muted-foreground">บริการ:</div>
                    <div>{viewOrder.service_name}</div>
                    <div className="text-muted-foreground">ประเภท:</div>
                    <div>{viewOrder.service_type}</div>
                    {viewOrder.hours && (
                      <>
                        <div className="text-muted-foreground">จำนวนชั่วโมง:</div>
                        <div>{viewOrder.hours} ชั่วโมง</div>
                      </>
                    )}
                    <div className="text-muted-foreground">ราคา:</div>
                    <div className="font-bold text-primary">{formatPrice(viewOrder.total_price)}</div>
                  </div>
                </div>




              </div>
            )}
          </DialogContent>
        </Dialog>


        {/* Send Message Dialog */}
        {
          selectedCustomer && (
            <SendMessageDialog
              open={messageDialogOpen}
              onOpenChange={setMessageDialogOpen}
              customerName={selectedCustomer.name}
              lineUserId={selectedCustomer.lineUserId}
            />
          )
        }
      </main>
    </div>
  );
};

export default AdminDashboard;
