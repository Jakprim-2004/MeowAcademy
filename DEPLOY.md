# Deploy Instructions

## 1. Login to Supabase (ทำครั้งเดียว)

```bash
npx supabase login
```

จะเปิด browser ให้ login แล้ว copy access token มาใส่

## 2. Link Project (ทำครั้งเดียว)

```bash
npx supabase link --project-ref iiimpsfjzcgxcoxvveis
```

## 3. Deploy Edge Functions

```bash
# Deploy line-auth (สำหรับ LINE Login)
npx supabase functions deploy line-auth

# Deploy line-webhook (สำหรับ Messaging API)
npx supabase functions deploy line-webhook
```

## 4. Set Secrets (ต้องทำทุกครั้งที่ deploy ใหม่ หรือเปลี่ยน secrets)

```bash
# LINE Login
npx supabase secrets set LINE_LOGIN_CHANNEL_ID=your_channel_id
npx supabase secrets set LINE_LOGIN_CHANNEL_SECRET=your_channel_secret

# LINE Messaging API
npx supabase secrets set LINE_MESSAGING_CHANNEL_SECRET=your_messaging_secret
npx supabase secrets set LINE_MESSAGING_CHANNEL_ACCESS_TOKEN=your_messaging_token

# Slip2Go (ตรวจสอบสลิป)
npx supabase secrets set SLIP2GO_SECRET_KEY=your_slip2go_key

# PromptPay (สร้าง QR Code)
npx supabase secrets set PROMPTPAY_ID=your_promptpay_id
```

## 5. ตรวจสอบ Logs

```bash
# ดู logs ของ line-auth
npx supabase functions logs line-auth

# ดู logs ของ line-webhook
npx supabase functions logs line-webhook
```

## ค่าที่ต้องหามาใส่

### LINE Login Channel
- ไปที่ https://developers.line.biz/console/
- เลือก LINE Login channel
- Channel ID และ Channel Secret อยู่ในหน้า Basic settings

### LINE Messaging API Channel
- ไปที่ https://developers.line.biz/console/
- เลือก Messaging API channel (ต่างจาก LINE Login)
- Channel Secret อยู่ในหน้า Basic settings
- Channel Access Token อยู่ในหน้า Messaging API (กด Issue ถ้ายังไม่มี)

### Slip2Go
- สมัครที่ https://slip2go.com
- API Key อยู่ใน Dashboard

### PromptPay
- ใช้เบอร์โทรศัพท์ 10 หลัก (ไม่ต้องมีขีด)
