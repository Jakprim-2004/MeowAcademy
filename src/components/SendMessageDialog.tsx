import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, MessageSquare, Send } from "lucide-react";

interface SendMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerName: string;
  lineUserId: string;
}

const SendMessageDialog = ({
  open,
  onOpenChange,
  customerName,
  lineUserId,
}: SendMessageDialogProps) => {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) {
      toast.error("กรุณากรอกข้อความ");
      return;
    }

    setSending(true);

    try {
      const { data, error } = await supabase.functions.invoke('line-push-message', {
        body: {
          lineUserId,
          message: message.trim(),
          customerName,
        },
      });

      if (error) {
        console.error('Error sending message:', error);
        toast.error("ไม่สามารถส่งข้อความได้: " + error.message);
        return;
      }

      if (!data?.success) {
        toast.error("ไม่สามารถส่งข้อความได้: " + (data?.error || 'Unknown error'));
        return;
      }

      toast.success(`ส่งข้อความไปยัง ${customerName} แล้ว`);
      setMessage("");
      onOpenChange(false);
    } catch (error) {
      console.error('Error:', error);
      toast.error("เกิดข้อผิดพลาดในการส่งข้อความ");
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    if (!sending) {
      setMessage("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            ส่งข้อความหาลูกค้า
          </DialogTitle>
          <DialogDescription>
            ส่งข้อความไปยัง <span className="font-semibold text-foreground">{customerName}</span> ผ่าน LINE
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="message">ข้อความ</Label>
            <Textarea
              id="message"
              placeholder="พิมพ์ข้อความที่ต้องการส่ง..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="resize-none"
              disabled={sending}
            />
          </div>

          <div className="text-xs text-muted-foreground">
            💡 ข้อความจะถูกส่งเป็น Flex Message พร้อมหัวข้อ "ข้อความจากแอดมิน"
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={sending}>
            ยกเลิก
          </Button>
          <Button onClick={handleSend} disabled={sending || !message.trim()}>
            {sending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                กำลังส่ง...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                ส่งข้อความ
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SendMessageDialog;
