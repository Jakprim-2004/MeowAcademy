"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Star, Link2, Copy, ExternalLink, Trash2, Loader2, ChevronLeft, ChevronRight, MessageSquare, Send } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Tables } from "@/integrations/supabase/types";
import SendMessageDialog from "@/components/SendMessageDialog";

type Order = Tables<"orders">;
type ReviewLink = {
  id: string;
  order_id: string;
  token: string;
  created_at: string;
  expires_at: string | null;
  is_used: boolean;
  customer_name: string;
  service_name: string;
};

const ITEMS_PER_PAGE = 10;

const ReviewManagement = () => {
  const router = useRouter();
  const navigate = (path: string) => router.push(path);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Orders for creating review links
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string>("");
  const [customMessage, setCustomMessage] = useState<string>("");
  const [creatingLink, setCreatingLink] = useState(false);
  
  // Review links list
  const [reviewLinks, setReviewLinks] = useState<ReviewLink[]>([]);
  const [linksPage, setLinksPage] = useState(1);
  const [totalLinksCount, setTotalLinksCount] = useState(0);
  
  // Generated link dialog
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  
  // Send message dialog
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<{
    name: string;
    lineUserId: string;
    reviewLink: string;
  } | null>(null);
  
  // Delete confirmation
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    checkAdminAndFetchData();
  }, [linksPage]);

  const checkAdminAndFetchData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        toast.error("กรุณาเข้าสู่ระบบ");
        navigate("/login");
        return;
      }

      const { data: roleData, error: roleError } = await supabase
        .rpc('has_role', { _user_id: session.user.id, _role: 'admin' });

      if (roleError || !roleData) {
        toast.error("คุณไม่มีสิทธิ์เข้าถึงหน้านี้");
        navigate("/dashboard");
        return;
      }

      setIsAdmin(true);
      await fetchOrders();
      await fetchReviewLinks();
    } catch (error) {
      console.error("Error:", error);
      toast.error("เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("id, customer_name, service_name, status, line_user_id")
        .eq("status", "completed")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("ไม่สามารถโหลดรายการออเดอร์ได้");
    }
  };

  const fetchReviewLinks = async () => {
    try {
      const from = (linksPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      const { data, error, count } = await supabase
        .from("review_links")
        .select(`
          *,
          orders:order_id (customer_name, service_name)
        `, { count: "exact" })
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;

      const formattedLinks: ReviewLink[] = (data || []).map((item: any) => ({
        id: item.id,
        order_id: item.order_id,
        token: item.token,
        created_at: item.created_at,
        expires_at: item.expires_at,
        is_used: item.is_used,
        customer_name: item.orders?.customer_name || "Unknown",
        service_name: item.orders?.service_name || "Unknown",
      }));

      setReviewLinks(formattedLinks);
      setTotalLinksCount(count || 0);
    } catch (error) {
      console.error("Error fetching review links:", error);
      // If table doesn't exist, we'll create it
      toast.error("ระบบลิงก์รีวิวยังไม่พร้อมใช้งาน");
    }
  };

  const generateReviewLink = async () => {
    if (!selectedOrderId) {
      toast.error("กรุณาเลือกออเดอร์");
      return;
    }

    setCreatingLink(true);
    try {
      const order = orders.find(o => o.id === selectedOrderId);
      if (!order) throw new Error("Order not found");

      // Generate unique token
      const token = crypto.randomUUID();
      const baseUrl = window.location.origin;
      const reviewUrl = `${baseUrl}/review/${token}`;

      // Save to database
      const { error } = await supabase
        .from("review_links")
        .insert({
          order_id: selectedOrderId,
          token: token,
          custom_message: customMessage || null,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        });

      if (error) {
        // If table doesn't exist, show instructions
        if (error.code === "42P01") {
          toast.error("กรุณาสร้างตาราง review_links ใน Supabase ก่อน (ดูคู่มือ)");
          return;
        }
        // If RLS policy error
        if (error.code === "42501") {
          toast.error("ไม่มีสิทธิ์สร้างลิงก์ กรุณาตรวจสอบว่าคุณเป็นแอดมิน และรัน SQL แก้ไข RLS Policy", {
            duration: 5000,
          });
          console.error("RLS Error:", error);
          return;
        }
        throw error;
      }

      setGeneratedLink(reviewUrl);
      setShowLinkDialog(true);
      toast.success("สร้างลิงก์รีวิวสำเร็จ!");
      
      // Refresh list
      await fetchReviewLinks();
      
      // Reset form
      setSelectedOrderId("");
      setCustomMessage("");
    } catch (error) {
      console.error("Error creating review link:", error);
      toast.error("ไม่สามารถสร้างลิงก์ได้");
    } finally {
      setCreatingLink(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("คัดลอกลิงก์แล้ว!");
  };

  const deleteReviewLink = async (id: string) => {
    try {
      const { error } = await supabase
        .from("review_links")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("ลบลิงก์แล้ว");
      await fetchReviewLinks();
    } catch (error) {
      console.error("Error deleting link:", error);
      toast.error("ไม่สามารถลบลิงก์ได้");
    }
    setDeleteConfirmId(null);
  };

  const openSendMessageDialog = (link: ReviewLink) => {
    const order = orders.find(o => o.id === link.order_id);
    if (!order?.line_user_id) {
      toast.error("ลูกค้ารายนี้ไม่มี LINE User ID");
      return;
    }

    const baseUrl = window.location.origin;
    const reviewUrl = `${baseUrl}/review/${link.token}`;

    setSelectedCustomer({
      name: link.customer_name,
      lineUserId: order.line_user_id,
      reviewLink: reviewUrl,
    });
    setMessageDialogOpen(true);
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

  const totalPages = Math.ceil(totalLinksCount / ITEMS_PER_PAGE);

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
            <Star className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">จัดการลิงก์รีวิว</h1>
            <p className="text-muted-foreground">สร้างและจัดการลิงก์สำหรับให้คะแนนบริการ</p>
          </div>
        </div>

        <Tabs defaultValue="create" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="create">สร้างลิงก์ใหม่</TabsTrigger>
            <TabsTrigger value="list">ลิงก์ทั้งหมด ({totalLinksCount})</TabsTrigger>
          </TabsList>

          {/* Create Link Tab */}
          <TabsContent value="create">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link2 className="w-5 h-5" />
                  สร้างลิงก์รีวิวใหม่
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Select Order */}
                <div className="space-y-2">
                  <Label htmlFor="order">เลือกออเดอร์ที่เสร็จสิ้นแล้ว</Label>
                  <Select value={selectedOrderId} onValueChange={setSelectedOrderId}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="เลือกออเดอร์..." />
                    </SelectTrigger>
                    <SelectContent>
                      {orders.map((order) => (
                        <SelectItem key={order.id} value={order.id}>
                          {order.customer_name} - {order.service_name} ({new Date(order.created_at).toLocaleDateString("th-TH")})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Custom Message */}
                <div className="space-y-2">
                  <Label htmlFor="message">ข้อความเพิ่มเติม (ไม่บังคับ)</Label>
                  <Textarea
                    id="message"
                    placeholder="ข้อความที่จะแสดงให้ลูกค้าเห็น เช่น 'ขอบคุมที่ใช้บริการ กรุณาให้คะแนนความพึงพอใจด้วยครับ'"
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {customMessage.length}/500
                  </p>
                </div>

                {/* Preview */}
                {selectedOrderId && (
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm font-medium mb-2">ตัวอย่างหน้ารีวิว:</p>
                    <div className="text-sm text-muted-foreground space-y-1">
                      {(() => {
                        const order = orders.find(o => o.id === selectedOrderId);
                        return order ? (
                          <>
                            <p>ลูกค้า: {order.customer_name}</p>
                            <p>บริการ: {order.service_name}</p>
                          </>
                        ) : null;
                      })()}
                    </div>
                  </div>
                )}

                {/* Create Button */}
                <Button
                  onClick={generateReviewLink}
                  disabled={creatingLink || !selectedOrderId}
                  className="w-full h-12 bg-hero-gradient hover:opacity-90"
                >
                  {creatingLink ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : (
                    <Link2 className="w-5 h-5 mr-2" />
                  )}
                  สร้างลิงก์รีวิว
                </Button>

                {/* Setup Instructions */}
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
                  <p className="font-medium text-yellow-800 mb-2">⚠️ ก่อนใช้งานครั้งแรก</p>
                  <p className="text-yellow-700">
                    ต้องสร้างตาราง <code>review_links</code> ใน Supabase ก่อน โดยรันคำสั่ง SQL ในไฟล์ <code>setup_review_links.sql</code>
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Links List Tab */}
          <TabsContent value="list">
            <Card>
              <CardHeader>
                <CardTitle>ลิงก์รีวิวทั้งหมด</CardTitle>
              </CardHeader>
              <CardContent>
                {reviewLinks.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Star className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p>ยังไม่มีลิงก์รีวิว</p>
                    <p className="text-sm">สร้างลิงก์ใหม่ได้จากแท็บ "สร้างลิงก์ใหม่"</p>
                  </div>
                ) : (
                  <>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>วันที่สร้าง</TableHead>
                          <TableHead>ลูกค้า</TableHead>
                          <TableHead>บริการ</TableHead>
                          <TableHead>สถานะ</TableHead>
                          <TableHead>จัดการ</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reviewLinks.map((link) => (
                          <TableRow key={link.id}>
                            <TableCell>{formatDate(link.created_at)}</TableCell>
                            <TableCell>{link.customer_name}</TableCell>
                            <TableCell>{link.service_name}</TableCell>
                            <TableCell>
                              {link.is_used ? (
                                <span className="text-green-600 font-medium">✓ ใช้แล้ว</span>
                              ) : new Date(link.expires_at || '') < new Date() ? (
                                <span className="text-red-500">หมดอายุ</span>
                              ) : (
                                <span className="text-yellow-600">รอใช้งาน</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const baseUrl = window.location.origin;
                                    copyToClipboard(`${baseUrl}/review/${link.token}`);
                                  }}
                                >
                                  <Copy className="w-4 h-4 mr-1" />
                                  คัดลอก
                                </Button>
                                
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const baseUrl = window.location.origin;
                                    window.open(`${baseUrl}/review/${link.token}`, '_blank');
                                  }}
                                >
                                  <ExternalLink className="w-4 h-4 mr-1" />
                                  ดู
                                </Button>

                                {/* Send via LINE */}
                                {(() => {
                                  const order = orders.find(o => o.id === link.order_id);
                                  return order?.line_user_id ? (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => openSendMessageDialog(link)}
                                    >
                                      <MessageSquare className="w-4 h-4 mr-1" />
                                      ส่ง LINE
                                    </Button>
                                  ) : null;
                                })()}

                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-500 hover:text-red-700"
                                  onClick={() => setDeleteConfirmId(link.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between pt-4 border-t mt-4">
                        <p className="text-sm text-muted-foreground">
                          แสดง {((linksPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(linksPage * ITEMS_PER_PAGE, totalLinksCount)} จาก {totalLinksCount} รายการ
                        </p>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setLinksPage(linksPage - 1)}
                            disabled={linksPage === 1}
                          >
                            <ChevronLeft className="w-4 h-4 mr-1" />
                            ก่อนหน้า
                          </Button>
                          <span className="text-sm">
                            หน้า {linksPage} จาก {totalPages}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setLinksPage(linksPage + 1)}
                            disabled={linksPage === totalPages}
                          >
                            ถัดไป
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Generated Link Dialog */}
        <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Link2 className="w-5 h-5" />
                สร้างลิงก์สำเร็จ!
              </DialogTitle>
              <DialogDescription>
                คัดลอกลิงก์นี้ส่งให้ลูกค้าเพื่อให้คะแนนบริการ
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-lg break-all text-sm">
                {generatedLink}
              </div>
              
              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  onClick={() => copyToClipboard(generatedLink!)}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  คัดลอกลิงก์
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    window.open(generatedLink!, '_blank');
                  }}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  ทดสอบ
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>ยืนยันการลบ</DialogTitle>
              <DialogDescription>
                คุณต้องการลบลิงก์รีวิวนี้ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
                ยกเลิก
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteConfirmId && deleteReviewLink(deleteConfirmId)}
              >
                ลบ
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Send Message Dialog */}
        {selectedCustomer && (
          <SendMessageDialog
            open={messageDialogOpen}
            onOpenChange={setMessageDialogOpen}
            customerName={selectedCustomer.name}
            lineUserId={selectedCustomer.lineUserId}
            defaultMessage={`สวัสดีคุณ${selectedCustomer.name} ขอบคุณที่ใช้บริการ MeowAcademy 🐱\n\nกรุณาให้คะแนนความพึงพอใจของคุณได้ที่:\n${selectedCustomer.reviewLink}\n\nขอบคุณมากครับ! 🙏`}
          />
        )}
      </main>
    </div>
  );
};

export default ReviewManagement;
