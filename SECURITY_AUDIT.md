# 🔒 รายงานความปลอดภัย - MeowAcademy

**วันที่ตรวจสอบ:** 2026-02-20  
**ตรวจสอบโดย:** บ่าว (AI Assistant)

---

## ⚠️ ปัญหาความปลอดภัยที่พบ

### 1. 🔴 HIGH - RLS Policy อ่อนแอ (review_links)

**ปัญหา:**
```sql
CREATE POLICY "authenticated_can_insert" 
ON review_links FOR INSERT 
TO authenticated 
WITH CHECK (true);  -- ⚠️ อันตราย! ใครก็ได้ที่ login สร้างลิงก์ได้
```

**ความเสี่ยง:**
- ผู้ใช้ทั่วไป (ไม่ใช่แอดมิน) สามารถสร้างลิงก์รีวิวได้
- สามารถลบ/แก้ไขลิงก์ของคนอื่นได้

**แก้ไข:**
```sql
-- ลบ policy อ่อนแอ
DROP POLICY IF EXISTS "authenticated_can_insert" ON review_links;
DROP POLICY IF EXISTS "authenticated_can_delete" ON review_links;
DROP POLICY IF EXISTS "authenticated_can_update" ON review_links;

-- สร้างใหม่ที่เช็ค admin จริงๆ
CREATE POLICY "admin_only_insert" 
ON review_links FOR INSERT 
TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

CREATE POLICY "admin_only_delete" 
ON review_links FOR DELETE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

CREATE POLICY "admin_only_update" 
ON review_links FOR UPDATE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);
```

---

### 2. 🟡 MEDIUM - Frontend Admin Check อย่างเดียวไม่พอ

**ปัญหา:** หน้า `/admin/reviews` เช็คแอดมินที่ frontend อย่างเดียว

**ไฟล์:** `ReviewManagement.tsx`
```tsx
const { data: roleData, error: roleError } = await supabase
  .rpc('has_role', { _user_id: session.user.id, _role: 'admin' });

if (roleError || !roleData) {
  navigate("/dashboard");  // หนีไป dashboard
  return;
}
```

**ความเสี่ยง:**
- ถ้ามีช่องโหว่ให้ bypass frontend ได้ จะเข้าถึง API ได้โดยตรง

**แก้ไข:** ต้องแก้ที่ RLS (ดังที่แจ้งในข้อ 1) + เพิ่ม Edge Function สำหรับ operation สำคัญ

---

### 3. 🟢 LOW - Token ไม่มีการเข้ารหัสเพิ่มเติม

**ปัญหา:** ใช้ UUID เป็น token โดยตรง

**ไฟล์:** `ReviewManagement.tsx`
```tsx
const token = crypto.randomUUID();  // ปลอดภัยพอสำหรับ use case นี้
```

**การประเมิน:** ✅ รับได้ - UUID v4 มี entropy สูงพอ ไม่น่าเดาได้

---

### 4. 🟢 LOW - ไม่มี Rate Limiting

**ปัญหา:** ไม่มีการจำกัดจำนวนครั้งในการสร้างลิงก์

**ความเสี่ยง:** ถ้าเป็นแอดมินจริงๆ แต่สร้างลิงก์ spam ได้ไม่จำกัด

**แก้ไข (แนะนำ):** เพิ่ม rate limiting ใน Supabase หรือใช้ Edge Function

---

## ✅ สิ่งที่ปลอดภัยดี

1. **Authentication** - ใช้ Supabase Auth มาตรฐาน
2. **Session Handling** - มีการเช็ค session ก่อนเรียก API
3. **SQL Injection** - ใช้ parameterized queries ผ่าน Supabase client
4. **XSS Protection** - React มีการ escape ข้อมูลอัตโนมัติ

---

## 📋 สรุป

| ระดับ | จำนวน | รายการ |
|-------|-------|--------|
| 🔴 High | 1 | RLS Policy อ่อนแอ |
| 🟡 Medium | 1 | Frontend-only admin check |
| 🟢 Low | 2 | Token format, Rate limiting |

**แนะนำให้แก้:** ข้อ 1 (HIGH) เป็นอันดับแรก

---

## 🔧 วิธีแก้ไขด่วน

รัน SQL นี้ใน Supabase SQL Editor:

```sql
-- ลบ policy อ่อนแอ
DROP POLICY IF EXISTS "authenticated_can_insert" ON review_links;
DROP POLICY IF EXISTS "authenticated_can_delete" ON review_links;
DROP POLICY IF EXISTS "authenticated_can_update" ON review_links;
DROP POLICY IF EXISTS "owner_or_admin_can_update" ON review_links;
DROP POLICY IF EXISTS "owner_or_admin_can_delete" ON review_links;

-- สร้าง policy ใหม่ที่ปลอดภัย
CREATE POLICY "admin_only_all_operations" 
ON review_links FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- ให้ public ดูลิงก์ที่ใช้ได้อยู่ (ไม่ต้อง login)
CREATE POLICY "public_can_view_unused_links" 
ON review_links FOR SELECT 
TO anon 
USING (
  is_used = false 
  AND (expires_at IS NULL OR expires_at > timezone('utc'::text, now()))
);
```
