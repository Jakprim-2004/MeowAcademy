import { useState, useMemo, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { ArrowLeft, User, CreditCard, Lock, QrCode, Plus, Minus, FileText, Check, Loader2, Building, Smartphone, Copy, CheckCheck, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import QRCode from "qrcode";
import krungthaiLogo from "@/assets/krungthai-logo.png";

interface ServiceType {
  title: string;
  price: number;
  unit: string;
  description: string;
  isPackage?: boolean;
  fixedHours?: number;
}

const Register = () => {
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type") || "hourly";
  const existingOrderId = searchParams.get("orderId");

  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [existingOrder, setExistingOrder] = useState<{
    id: string;
    customer_name: string;
    total_price: number;
    service_name: string;
    hours: number | null;
    include_data_entry: boolean | null;
  } | null>(null);
  const [isLoadingOrder, setIsLoadingOrder] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Load existing order if orderId is provided
  useEffect(() => {
    if (existingOrderId && user) {
      loadExistingOrder();
    }
  }, [existingOrderId, user]);

  const loadExistingOrder = async () => {
    if (!existingOrderId) return;

    setIsLoadingOrder(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('id, customer_name, total_price, service_name, hours, include_data_entry')
        .eq('id', existingOrderId)
        .eq('status', 'pending')
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setExistingOrder(data);
        setCurrentOrderId(data.id);
        setFormData(prev => ({ ...prev, name: data.customer_name }));
        if (data.hours) setHours(data.hours);
        if (data.include_data_entry) setIncludeDataEntry(true);
        // Generate QR and show payment
        await generateQRForExistingOrder(data.total_price);
      } else {
        toast.error("ไม่พบออเดอร์หรือออเดอร์นี้ชำระเงินไปแล้ว");
      }
    } catch (error) {
      console.error('Error loading order:', error);
      toast.error("ไม่สามารถโหลดข้อมูลออเดอร์ได้");
    } finally {
      setIsLoadingOrder(false);
    }
  };

  const generateQRForExistingOrder = async (amount: number) => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-qr', {
        body: {
          promptPayCode: "0656922937",
          promptPayType: "phone_number",
          accountName: "ไข่มุข จันทร์พริ้ม",
          amount: amount.toString(),
        },
      });

      if (error) throw error;

      if (data?.success && data?.data?.payload) {
        const qrDataUrl = await QRCode.toDataURL(data.data.payload, {
          width: 256,
          margin: 2,
          color: { dark: '#000000', light: '#FFFFFF' },
        });
        setQrCodeData(qrDataUrl);
        setShowPayment(true);
      }
    } catch (error) {
      console.error("Error generating QR:", error);
      toast.error("เกิดข้อผิดพลาดในการสร้าง QR Code");
    }
  };

  const serviceTypes: Record<string, ServiceType> = {
    hourly: {
      title: "บริการรายชั่วโมง",
      price: 5,
      unit: "บาท/ชั่วโมง",
      description: "เก็บชั่วโมงจิตอาสาตามจำนวนที่ต้องการ",
    },
    package: {
      title: "แพ็คเกจ 36 ชั่วโมง",
      price: 120,
      unit: "บาท",
      description: "ประหยัดกว่าเมื่อเทียบกับรายชั่วโมง",
      isPackage: true,
      fixedHours: 36,
    },
    system: {
      title: "บริการกรอกข้อมูล",
      price: 50,
      unit: "บาท/ครั้ง",
      description: "กรอกข้อมูลลงระบบให้เรียบร้อย",
      isPackage: true,
    },
  };

  const currentService = serviceTypes[type] || serviceTypes.hourly;

  // Bank account info
  const bankInfo = {
    bankName: "ธนาคารกรุงไทย",
    accountNumber: "661-8-39450-3",
    accountName: "ไข่มุข จันทร์พริ้ม",
  };

  // Payment method state
  const [paymentMethod, setPaymentMethod] = useState<'promptpay' | 'bank'>('promptpay');
  const [copied, setCopied] = useState(false);

  const copyAccountNumber = async () => {
    try {
      await navigator.clipboard.writeText(bankInfo.accountNumber);
      setCopied(true);
      toast.success("คัดลอกเลขบัญชีแล้ว");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("ไม่สามารถคัดลอกได้");
    }
  };

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    citizenId: "",
    gysPassword: "",
    studentId: "",
    additionalDetails: "",
  });

  // For hourly service
  const [hours, setHours] = useState(1);
  const [includeDataEntry, setIncludeDataEntry] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);

  // Calculate total price (use existing order price if available)
  const totalPrice = useMemo(() => {
    if (existingOrder) {
      return existingOrder.total_price;
    }
    let total = 0;
    if (type === "hourly") {
      total = hours * currentService.price;
    } else {
      total = currentService.price;
    }
    if (includeDataEntry && type !== "system") {
      total += serviceTypes.system.price;
    }
    return total;
  }, [type, hours, includeDataEntry, currentService.price, existingOrder]);

  const formatCitizenId = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 13);
    if (digits.length <= 1) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 1)}-${digits.slice(1)}`;
    if (digits.length <= 10) return `${digits.slice(0, 1)}-${digits.slice(1, 5)}-${digits.slice(5)}`;
    if (digits.length <= 12) return `${digits.slice(0, 1)}-${digits.slice(1, 5)}-${digits.slice(5, 10)}-${digits.slice(10)}`;
    return `${digits.slice(0, 1)}-${digits.slice(1, 5)}-${digits.slice(5, 10)}-${digits.slice(10, 12)}-${digits.slice(12)}`;
  };

  const handleCitizenIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCitizenId(e.target.value);
    setFormData({ ...formData, citizenId: formatted });
  };

  const handleHoursChange = (delta: number) => {
    setHours(prev => Math.max(1, prev + delta));
  };

  const validateForm = () => {
    if (!formData.name || !formData.citizenId || !formData.gysPassword) {
      toast.error("กรุณากรอกข้อมูลให้ครบถ้วน");
      return false;
    }

    // Validate email format (only if provided)
    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast.error("กรุณากรอกอีเมลให้ถูกต้อง");
        return false;
      }
    }

    if (includeDataEntry && (!formData.studentId || formData.studentId.length !== 10)) {
      toast.error("กรุณากรอกรหัสนิสิตให้ครบ 10 หลัก");
      return false;
    }

    const cleanCitizenId = formData.citizenId.replace(/-/g, '');
    if (cleanCitizenId.length !== 13) {
      toast.error("เลขบัตรประชาชนไม่ถูกต้อง");
      return false;
    }
    return true;
  };

  const handleGenerateQR = async () => {
    if (!validateForm()) return;
    const cleanCitizenId = formData.citizenId.replace(/-/g, '');

    setIsLoading(true);
    try {
      let orderId: string | null = null;

      // Create order in database if user is logged in
      if (user) {
        const lineUserId = user.user_metadata?.line_user_id || null;

        // Append Student ID to notes if provided
        let notesText = formData.email.trim() ? `อีเมล: ${formData.email}\n` : '';
        notesText += `รหัสผ่าน กยศ: ${formData.gysPassword}`;
        if (includeDataEntry && formData.studentId) {
          notesText += `\nรหัสนิสิต: ${formData.studentId}`;
        }
        if (formData.additionalDetails.trim()) {
          notesText += `\nรายละเอียดเพิ่มเติม: ${formData.additionalDetails.trim()}`;
        }

        const { data: orderData, error: orderError } = await supabase.from('orders').insert({
          user_id: user.id,
          service_type: type,
          service_name: currentService.title,
          hours: type === "hourly" ? hours : (type === "package" ? 36 : null),
          include_data_entry: includeDataEntry && type !== "system",
          total_price: totalPrice,
          customer_name: formData.name,
          citizen_id: cleanCitizenId,
          notes: notesText,
          status: 'pending',
          line_user_id: lineUserId,
        }).select('id').single();

        if (orderError) {
          console.error("Error creating order:", orderError);
        } else {
          orderId = orderData?.id || null;
          setCurrentOrderId(orderId);
          console.log('Order created with LINE user ID:', lineUserId);

          // Notify Admin
          try {
            supabase.functions.invoke('line-notify', {
              body: {
                type: 'new_order_admin',
                orderId: orderId,
                customerName: formData.name,
                serviceName: currentService.title,
                totalPrice: totalPrice,
                citizenId: cleanCitizenId,
                notes: notesText,
              },
            });
          } catch (err) {
            console.error('Failed to notify admin:', err);
          }
        }
      }

      const { data, error } = await supabase.functions.invoke('generate-qr', {
        body: {
          promptPayCode: "0656922937",
          promptPayType: "phone_number",
          accountName: "ไข่มุข จันทร์พริ้ม",
          amount: totalPrice.toString(),
        },
      });

      if (error) throw error;

      if (data?.success && data?.data?.payload) {
        // Generate QR code image from PromptPay payload
        const qrDataUrl = await QRCode.toDataURL(data.data.payload, {
          width: 256,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
        });
        setQrCodeData(qrDataUrl);
        setShowPayment(true);
        toast.success("สร้าง QR Code สำเร็จ!");
      } else {
        throw new Error(data?.error || "ไม่สามารถสร้าง QR Code ได้");
      }
    } catch (error) {
      console.error("Error generating QR:", error);
      toast.error("เกิดข้อผิดพลาดในการสร้าง QR Code");
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-background">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Back button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          กลับหน้าหลัก
        </Link>

        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10 animate-fade-in">
            <Link to="/" className="inline-flex items-center gap-2 mb-6">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-glow">
                <img src="/images/cat-icons/logo_cat.png" alt="MeowAcademy Logo" className="w-full h-full object-contain drop-shadow-md" />
              </div>
              <span className="text-2xl font-bold text-gradient">MeowAcademy</span>
            </Link>

            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              {existingOrderId ? 'ชำระเงิน' : 'สั่งจองบริการ'}
            </h1>
          </div>

          {isLoadingOrder ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
          ) : !showPayment ? (
            <div className="space-y-6 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              {/* Selected Service Card - Locked */}
              <div className="rounded-3xl bg-card border-2 border-primary p-6 shadow-glow">
                <div className="flex items-center justify-between mb-4">
                  <Badge className="bg-hero-gradient text-primary-foreground">
                    บริการที่เลือก
                  </Badge>
                  <Link to="/#services" className="text-sm text-primary hover:underline">
                    เปลี่ยนบริการ
                  </Link>
                </div>

                <h3 className="text-xl font-bold text-foreground mb-1">{currentService.title}</h3>
                <p className="text-muted-foreground text-sm mb-3">{currentService.description}</p>

                <div className="flex items-baseline gap-1">
                  <span className="text-sm text-muted-foreground">฿</span>
                  <span className="text-3xl font-bold text-primary">{currentService.price}</span>
                  <span className="text-muted-foreground">{currentService.unit}</span>
                </div>
              </div>

              {/* Hours Selector (only for hourly) */}
              {type === "hourly" && (
                <div className="rounded-3xl bg-card border border-border p-6 space-y-4">
                  <Label className="text-base font-semibold">จำนวนชั่วโมงที่ต้องการ</Label>

                  <div className="flex items-center justify-center gap-6">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-12 w-12 rounded-xl"
                      onClick={() => handleHoursChange(-1)}
                      disabled={hours <= 1}
                    >
                      <Minus className="w-5 h-5" />
                    </Button>

                    <div className="text-center">
                      <span className="text-4xl font-bold text-foreground">{hours}</span>
                      <p className="text-sm text-muted-foreground">ชั่วโมง</p>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-12 w-12 rounded-xl"
                      onClick={() => handleHoursChange(1)}
                    >
                      <Plus className="w-5 h-5" />
                    </Button>
                  </div>

                  <p className="text-center text-primary font-medium">
                    ค่าบริการ: ฿{(hours * currentService.price).toLocaleString('th-TH')}
                  </p>
                </div>
              )}

              {/* Add-on: Data Entry Service (for hourly and package) */}
              {(type === "hourly" || type === "package") && (
                <div className="space-y-4">
                  <div
                    className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all ${includeDataEntry
                      ? 'bg-primary/10 border-2 border-primary'
                      : 'bg-muted/50 border-2 border-transparent hover:border-border'
                      }`}
                    onClick={() => setIncludeDataEntry(!includeDataEntry)}
                  >
                    <Checkbox
                      id="dataEntry"
                      checked={includeDataEntry}
                      onCheckedChange={(checked) => setIncludeDataEntry(checked as boolean)}
                      className="h-5 w-5"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary" />
                        <span className="font-medium text-foreground">เพิ่มบริการกรอกข้อมูลลงระบบ</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        กรอกข้อมูลลงระบบให้เรียบร้อย
                      </p>
                    </div>
                    <Badge variant="secondary" className="font-bold">
                      +฿{serviceTypes.system.price}
                    </Badge>
                  </div>


                </div>
              )}

              {/* Form */}
              <div className="rounded-3xl bg-card border border-border p-8 shadow-sm space-y-6">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="w-4 h-4 text-primary" />
                    ชื่อ-นามสกุล
                  </Label>
                  <Input
                    id="name"
                    placeholder="กรอกชื่อ-นามสกุล"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="h-12 rounded-xl"
                    required
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-primary" />
                    อีเมล
                    <span className="text-xs text-muted-foreground font-normal">(ไม่บังคับ)</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="h-12 rounded-xl"
                  />
                  <p className="text-xs text-muted-foreground">
                    * เฉพาะทุนเรียนดีเท่านั้น กยศ ไม่ต้องกรอก
                  </p>
                </div>

                {/* Citizen ID */}
                <div className="space-y-2">
                  <Label htmlFor="citizenId" className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-primary" />
                    เลขบัตรประชาชน
                  </Label>
                  <Input
                    id="citizenId"
                    placeholder="X-XXXX-XXXXX-XX-X"
                    value={formData.citizenId}
                    onChange={handleCitizenIdChange}
                    className="h-12 rounded-xl font-mono tracking-wider"
                    required
                  />
                </div>

                {/* GYS Password */}
                <div className="space-y-2">
                  <Label htmlFor="gysPassword" className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-primary" />
                    รหัสผ่าน กยศ. Connect
                  </Label>
                  <Input
                    id="gysPassword"
                    type="password"
                    placeholder="กรอกรหัสผ่าน กยศ. Connect"
                    value={formData.gysPassword}
                    onChange={(e) => setFormData({ ...formData, gysPassword: e.target.value })}
                    className="h-12 rounded-xl"
                    required
                  />
                </div>

                {/* Additional Details */}
                <div className="space-y-2">
                  <Label htmlFor="additionalDetails" className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    รายละเอียดเพิ่มเติม
                  </Label>
                  <Textarea
                    id="additionalDetails"
                    placeholder="ระบุรายละเอียดเพิ่มเติม (ถ้ามี)"
                    value={formData.additionalDetails}
                    onChange={(e) => setFormData({ ...formData, additionalDetails: e.target.value })}
                    className="min-h-[100px] rounded-xl resize-none"
                  />
                </div>

                {/* Student ID - Only if data entry is selected */}
                {includeDataEntry && (
                  <div className="space-y-2 animate-fade-in-up">
                    <Label htmlFor="studentId" className="flex items-center gap-2">
                      <User className="w-4 h-4 text-primary" />
                      รหัสนิสิต / นักศึกษา (10 หลัก)
                    </Label>
                    <Input
                      id="studentId"
                      placeholder="กรอกรหัสนิสิต 10 หลัก"
                      value={formData.studentId || ""}
                      maxLength={10}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setFormData({ ...formData, studentId: value });
                      }}
                      className="h-12 rounded-xl border-primary/30 focus:border-primary"
                      required
                    />
                  </div>
                )}
              </div>

              {/* Summary & Payment */}
              <div className="rounded-3xl bg-card border border-border p-6">
                <h4 className="font-semibold text-foreground mb-4">สรุปรายการ</h4>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{currentService.title}</span>
                    <span className="text-foreground">
                      {type === "hourly"
                        ? `${hours} ชม. × ฿${currentService.price}`
                        : `฿${currentService.price}`
                      }
                    </span>
                  </div>

                  {type === "hourly" && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ค่าบริการชั่วโมง</span>
                      <span className="text-foreground">฿{(hours * currentService.price).toLocaleString('th-TH')}</span>
                    </div>
                  )}

                  {includeDataEntry && (
                    <div className="flex justify-between text-primary">
                      <span className="flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        บริการกรอกข้อมูลลงระบบ
                      </span>
                      <span>฿{serviceTypes.system.price}</span>
                    </div>
                  )}

                  <div className="border-t border-border pt-2 mt-2">
                    <div className="flex justify-between text-lg font-bold">
                      <span className="text-foreground">ยอดชำระทั้งหมด</span>
                      <span className="text-primary">฿{totalPrice.toLocaleString('th-TH')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Button */}
              <Button
                onClick={handleGenerateQR}
                disabled={isLoading}
                size="lg"
                className="w-full h-14 bg-hero-gradient hover:opacity-90 shadow-glow text-lg font-semibold"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    กำลังสร้าง QR Code...
                  </span>
                ) : (
                  <>
                    <QrCode className="mr-2 w-5 h-5" />
                    ชำระเงิน ฿{totalPrice.toLocaleString('th-TH')}
                  </>
                )}
              </Button>
            </div>
          ) : (
            /* Payment Section */
            <div className="space-y-6 animate-fade-in-up">
              <>
                <div className="rounded-3xl bg-card border border-border p-8 shadow-sm space-y-6">
                  {/* Summary */}
                  <div className="text-center space-y-2">
                    <Badge variant="secondary" className="text-base px-4 py-2">
                      ยอดชำระ
                    </Badge>
                    <p className="text-4xl font-bold text-primary">
                      ฿{totalPrice.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-muted-foreground">{formData.name}</p>

                    {/* Order details */}
                    <div className="text-sm text-muted-foreground mt-2">
                      <p>{currentService.title} {type === "hourly" && `(${hours} ชม.)`}</p>
                      {includeDataEntry && <p>+ บริการกรอกข้อมูลลงระบบ</p>}
                    </div>
                  </div>

                  {/* Payment Method Tabs */}
                  <div className="flex gap-2 p-1 bg-muted rounded-xl">
                    <button
                      onClick={() => setPaymentMethod('promptpay')}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all ${paymentMethod === 'promptpay'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                      <Smartphone className="w-4 h-4" />
                      PromptPay QR
                    </button>
                    <button
                      onClick={() => setPaymentMethod('bank')}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all ${paymentMethod === 'bank'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                      <Building className="w-4 h-4" />
                      โอนผ่านธนาคาร
                    </button>
                  </div>

                  {/* Payment Details */}
                  {paymentMethod === 'promptpay' ? (
                    /* QR Code */
                    <div className="flex flex-col items-center space-y-4">
                      <div className="p-4 bg-white rounded-2xl shadow-md">
                        {qrCodeData ? (
                          <img
                            src={qrCodeData}
                            alt="PromptPay QR Code"
                            className="w-64 h-64 object-contain"
                          />
                        ) : (
                          <div className="w-64 h-64 flex items-center justify-center bg-muted rounded-xl">
                            <QrCode className="w-16 h-16 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground text-center">
                        สแกน QR Code ด้วยแอปธนาคารเพื่อชำระเงิน
                      </p>
                    </div>
                  ) : (
                    /* Bank Transfer */
                    <div className="space-y-4">
                      <div className="p-4 bg-muted/50 rounded-xl space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center">
                            <img src={krungthaiLogo} alt="ธนาคารกรุงไทย" className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{bankInfo.bankName}</p>
                            <p className="text-sm text-muted-foreground">ออมทรัพย์</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">เลขที่บัญชี</span>
                            <button
                              onClick={copyAccountNumber}
                              className="flex items-center gap-2 text-primary hover:underline"
                            >
                              <span className="font-mono font-bold text-lg">{bankInfo.accountNumber}</span>
                              {copied ? (
                                <CheckCheck className="w-4 h-4" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">ชื่อบัญชี</span>
                            <span className="font-medium text-foreground">{bankInfo.accountName}</span>
                          </div>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground text-center">
                        โอนเงินผ่านแอปธนาคาร หรือ ATM แล้วส่งสลิปผ่าน LINE
                      </p>
                    </div>
                  )}
                </div>

                {/* LINE Send Slip Section */}
                <div className="rounded-3xl bg-card border border-border p-6 shadow-sm space-y-4">
                  <div className="text-center">
                    <h3 className="font-semibold text-foreground mb-2">
                      ส่งสลิปผ่าน LINE เพื่อยืนยันการชำระเงิน
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      หลังโอนเงินแล้ว กรุณาส่งสลิปมาทาง LINE OA เพื่อตรวจสอบอัตโนมัติ
                    </p>
                  </div>

                  <a
                    href="https://line.me/R/oaMessage/@807chkoh/?%E0%B8%AA%E0%B9%88%E0%B8%87%E0%B8%AA%E0%B8%A5%E0%B8%B4%E0%B8%9B%E0%B8%A2%E0%B8%B7%E0%B8%99%E0%B8%A2%E0%B8%B1%E0%B8%99%E0%B8%81%E0%B8%B2%E0%B8%A3%E0%B8%8A%E0%B8%B3%E0%B8%A3%E0%B8%B0%E0%B9%80%E0%B8%87%E0%B8%B4%E0%B8%99"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 w-full h-14 bg-[#06C755] hover:bg-[#05b54d] text-white rounded-2xl text-lg font-semibold transition-colors shadow-lg md:hidden"
                  >
                    <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current">
                      <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                    </svg>
                    ส่งสลิปผ่าน LINE
                  </a>

                  {/* Desktop: แสดงคำแนะนำเพิ่ม LINE OA */}
                  <div className="hidden md:flex flex-col items-center gap-3 w-full p-5 bg-[#06C755]/10 border-2 border-[#06C755]/30 rounded-2xl">
                    <svg viewBox="0 0 24 24" className="w-10 h-10 fill-[#06C755]">
                      <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                    </svg>
                    <p className="text-base font-semibold text-foreground">ส่งสลิปผ่าน LINE OA</p>
                    <p className="text-sm text-muted-foreground text-center">เปิด LINE บนมือถือแล้วค้นหา</p>
                    <div className="flex items-center gap-2 bg-background border border-border rounded-xl px-4 py-2">
                      <span className="text-lg font-bold text-[#06C755]">@807chkoh</span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText("@807chkoh");
                        }}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors underline"
                      >
                        คัดลอก
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground text-center">เพิ่มเพื่อนแล้วส่งรูปสลิปในแชทได้เลย</p>
                  </div>

                  <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 space-y-2">
                    <p className="text-sm font-medium text-foreground text-center">วิธีส่งสลิป</p>
                    <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                      <li className="md:hidden">กดปุ่ม "ส่งสลิปผ่าน LINE" ด้านบน</li>
                      <li className="hidden md:list-item">เพิ่มเพื่อน LINE OA: @807chkoh</li>
                      <li>ส่งรูปสลิปการโอนเงินในแชท</li>
                      <li>ระบบจะตรวจสอบอัตโนมัติ และแจ้งผลทันที</li>
                    </ol>
                  </div>

                  <p className="text-xs text-muted-foreground text-center">
                    LINE OA: @807chkoh | ระบบตรวจสอบสลิปอัตโนมัติ 24 ชม.
                  </p>
                </div>
              </>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;
