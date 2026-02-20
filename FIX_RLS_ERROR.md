# วิธีแก้ไข RLS Error

## ปัญหา
```
new row violates row-level security policy for table "review_links"
```

## สาเหตุ
RLS Policy ไม่ยอมให้ insert ข้อมูล

## วิธีแก้ไข

### วิธีที่ 1: รัน SQL ใน Supabase Dashboard (แนะนำ)

1. ไปที่ https://supabase.com/dashboard/project/iiimpsfjzcgxcoxvveis/sql-editor
2. สร้าง New Query
3. วางโค้ดด้านล่างแล้วกด Run

```sql
-- ลบ policy เก่า
DROP POLICY IF EXISTS "Admins can manage review_links" ON review_links;

-- สร้าง policy ใหม่
CREATE POLICY "Allow admin inserts" 
ON review_links FOR INSERT 
TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

CREATE POLICY "Allow admin select all" 
ON review_links FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);
```

### วิธีที่ 2: ปิด RLS ชั่วคราว (ถ้าวิธีที่ 1 ไม่ได้ - ไม่แนะนำสำหรับ production)

```sql
ALTER TABLE review_links DISABLE ROW LEVEL SECURITY;
```

**⚠️ ระวัง:** วิธีนี้จะทำให้ใครก็ได้เข้าถึงตารางนี้ได้

### วิธีที่ 3: ใช้ Service Role Key (แก้ไขโค้ด)

ถ้าต้องการให้แน่ใจว่าทำงานได้ ให้ใช้ Edge Function แทนการ insert ตรงๆ:

```typescript
// ใน ReviewManagement.tsx เปลี่ยนจาก:
const { error } = await supabase
  .from("review_links")
  .insert({...})

// เป็นการเรียก Edge Function แทน
const { data, error } = await supabase.functions.invoke('create-review-link', {
  body: { orderId, token, customMessage }
});
```

## ตรวจสอบว่า User เป็น Admin จริงๆ

รัน SQL นี้เพื่อเช็ค:

```sql
SELECT * FROM user_roles WHERE user_id = 'YOUR_USER_ID';
```

ถ้าไม่มีข้อมูล ต้องเพิ่มแอดมินก่อน:

```sql
INSERT INTO user_roles (user_id, role) 
VALUES ('YOUR_USER_ID', 'admin');
```

## สรุป

วิธีที่ง่ายที่สุดคือ **วิธีที่ 1** - รัน SQL แก้ไข policy ใน Supabase Dashboard
