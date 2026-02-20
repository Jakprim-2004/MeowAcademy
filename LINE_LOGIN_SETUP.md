# LINE Login Deployment Guide

## ปัญหาที่พบ

หากพบ error `line-auth?action=login-url` แสดงว่า edge function ยังไม่ได้ deploy หรือขาด environment variables

## วิธีแก้ไข

### 1. Deploy Edge Function

```bash
# Login to Supabase
npx supabase login

# Deploy the line-auth function
npx supabase functions deploy line-auth
```

### 2. ตั้งค่า Environment Variables

ไปที่ Supabase Dashboard > Project Settings > Secrets > Add Secrets:

```
LINE_LOGIN_CHANNEL_ID=your_line_channel_id
LINE_LOGIN_CHANNEL_SECRET=your_line_channel_secret
```

หรือใช้ CLI:

```bash
npx supabase secrets set LINE_LOGIN_CHANNEL_ID=your_line_channel_id
npx supabase secrets set LINE_LOGIN_CHANNEL_SECRET=your_line_channel_secret
```

### 3. ตรวจสอบ Supabase URL และ Anon Key

ในไฟล์ `.env`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

หาได้จาก: Supabase Dashboard > Project Settings > API > Project URL และ Project API keys

### 4. สร้าง LINE Login Channel

1. ไปที่ [LINE Developers Console](https://developers.line.biz/)
2. สร้าง Provider ใหม่
3. สร้าง LINE Login Channel
4. ตั้งค่า Callback URL: `https://your-domain.com/login`
5. คัดลอก Channel ID และ Channel Secret

### 5. ทดสอบ

1. รัน `npm run dev`
2. เปิด Developer Console (F12)
3. กดปุ่ม "เข้าสู่ระบบด้วย LINE"
4. ดู log ใน console เพื่อตรวจสอบ error

## Error Messages

| Error | สาเหตุ | วิธีแก้ |
|-------|--------|---------|
| `LINE Login credentials not configured` | ไม่ได้ตั้งค่า LINE_LOGIN_CHANNEL_ID/SECRET | ตั้งค่า secrets ใน Supabase |
| `Server error: 404` | Edge function ยังไม่ได้ deploy | รัน `npx supabase functions deploy line-auth` |
| `Failed to get LINE token` | LINE callback URL ไม่ตรงกัน | ตรวจสอบ redirectUri และ LINE Console |

## การ Debug

เปิด Developer Console (F12) เพื่อดู log เพิ่มเติม:

```javascript
// ใน console จะแสดง:
// - "Calling LINE auth URL: ..."
// - "LINE callback - Code: ..."
// - "LINE_AUTH_DEBUG: ..."
```
