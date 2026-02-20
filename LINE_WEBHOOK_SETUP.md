# LINE Webhook Setup Guide

## Webhook URL

```
https://iiimpsfjzcgxcoxvveis.supabase.co/functions/v1/line-webhook
```

## การตั้งค่าใน LINE Console

### 1. เข้า LINE Developers Console
- ไปที่ https://developers.line.biz/
- เลือก Provider ของคุณ
- เลือก Messaging API Channel (ต่างจาก LINE Login)

### 2. ตั้งค่า Webhook URL

1. ไปที่ tab **"Messaging API"**
2. ในส่วน **"Webhook URL"** ใส่:
   ```
   https://iiimpsfjzcgxcoxvveis.supabase.co/functions/v1/line-webhook
   ```
3. กด **"Update"**
4. เปิด **"Use webhook"** (ต้องปิด Auto-reply messages และ Greeting messages ก่อน)

### 3. เปิดใช้งาน Webhook Events

ในส่วน **"Webhook settings"** เปิด:
- ✅ Message events
- ✅ Follow events
- ✅ Postback events

### 4. ปิด Auto-reply (ถ้าต้องการ)

ในส่วน **"Response settings"**:
- ปิด Auto-reply messages
- ปิด Greeting messages

## Environment Variables ที่ต้องตั้งค่า

รันคำสั่งนี้ใน Supabase:

```bash
# LINE Messaging API (ต่างจาก LINE Login)
npx supabase secrets set LINE_MESSAGING_CHANNEL_SECRET=your_channel_secret
npx supabase secrets set LINE_MESSAGING_CHANNEL_ACCESS_TOKEN=your_channel_access_token

# Supabase
npx supabase secrets set SUPABASE_URL=https://iiimpsfjzcgxcoxvveis.supabase.co
npx supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Slip2Go (สำหรับตรวจสอบสลิป)
npx supabase secrets set SLIP2GO_SECRET_KEY=your_slip2go_key

# PromptPay (สำหรับสร้าง QR Code)
npx supabase secrets set PROMPTPAY_ID=your_promptpay_number
```

## การหาค่าต่างๆ

### LINE_MESSAGING_CHANNEL_SECRET
1. LINE Console > Messaging API > Channel secret

### LINE_MESSAGING_CHANNEL_ACCESS_TOKEN
1. LINE Console > Messaging API > Channel access token
2. กด "Issue" ถ้ายังไม่มี

### SUPABASE_SERVICE_ROLE_KEY
1. Supabase Dashboard > Project Settings > API > service_role key
⚠️ อย่าเผยแพร่ key นี้!

### SLIP2GO_SECRET_KEY
1. สมัครที่ https://slip2go.com
2. ไปที่ Dashboard > API Keys

### PROMPTPAY_ID
- หมายเลขพร้อมเพย์ (เบอร์โทรศัพท์ หรือเลขบัตรประชาชน)

## การ Deploy Edge Function

```bash
# Deploy line-webhook
npx supabase functions deploy line-webhook

# Deploy line-auth (สำหรับ LINE Login)
npx supabase functions deploy line-auth
```

## ทดสอบ Webhook

1. ส่งข้อความ "สถานะ" ไปที่ LINE Official Account
2. ดู Logs ใน Supabase Dashboard > Edge Functions > line-webhook > Logs

## ฟีเจอร์ที่รองรับ

| คำสั่ง | ผลลัพธ์ |
|--------|---------|
| ส่งรูปสลิป | ตรวจสอบสลิปอัตโนมัติ & อัพเดทสถานะออเดอร์ |
| พิมพ์ "สถานะ" | ดูออเดอร์ล่าสุด |
| พิมพ์ "1-5" | ให้คะแนนรีวิว |
| พิมพ์ "เข้าสู่ระบบ" | ส่งลิงก์ login |
| กดปุ่ม "ชำระเงิน" | ส่ง QR Code พร้อมเพย์ |
| เพิ่มเพื่อน | ส่งข้อความต้อนรับ |

## การแก้ไขปัญหา

### "Invalid signature"
- ตรวจสอบ LINE_MESSAGING_CHANNEL_SECRET ว่าตรงกับใน Console
- ตรวจสอบว่าใช้ Channel Secret ของ Messaging API (ไม่ใช่ LINE Login)

### "LINE credentials not configured"
- ตรวจสอบว่าได้ set secrets ใน Supabase แล้ว
- รอ 1-2 นาทีหลัง deploy ให้ secrets propagate

### Webhook ไม่ตอบสนอง
1. ตรวจสอบว่า Use webhook เปิดอยู่
2. ตรวจสอบ URL ถูกต้อง
3. ดู Logs ใน Supabase Dashboard
