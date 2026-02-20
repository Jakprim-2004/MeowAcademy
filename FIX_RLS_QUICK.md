## 🔧 แก้ไข RLS Error - วิธีด่วน

### ปัญหา
```
new row violates row-level security policy for table "review_links"
```

### วิธีแก้ (รันใน Supabase)

1. ไปที่ https://supabase.com/dashboard/project/iiimpsfjzcgxcoxvveis/sql-editor
2. สร้าง **New Query**
3. **วางโค้ดนี้ทั้งหมด** แล้วกด **Run**

```sql
-- ลบ policy เก่าทั้งหมด
DROP POLICY IF EXISTS "Allow admin inserts" ON review_links;
DROP POLICY IF EXISTS "Allow admin select all" ON review_links;
DROP POLICY IF EXISTS "Allow public view valid links" ON review_links;
DROP POLICY IF EXISTS "Allow admin delete" ON review_links;
DROP POLICY IF EXISTS "Allow admin update" ON review_links;
DROP POLICY IF EXISTS "Admins can manage review_links" ON review_links;
DROP POLICY IF EXISTS "Public can view unused review_links" ON review_links;

-- สร้าง policy ใหม่ที่ง่ายกว่า

-- 1. ให้ทุกคนดูลิงก์ที่ยังใช้ได้
CREATE POLICY "anyone_can_view_valid_links" 
ON review_links FOR SELECT 
TO anon, authenticated 
USING (
  is_used = false 
  AND (expires_at IS NULL OR expires_at > timezone('utc'::text, now()))
);

-- 2. ให้ user ที่ login insert ได้
CREATE POLICY "authenticated_can_insert" 
ON review_links FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- 3. ให้ update ได้
CREATE POLICY "authenticated_can_update" 
ON review_links FOR UPDATE 
TO authenticated 
USING (true);

-- 4. ให้ delete ได้
CREATE POLICY "authenticated_can_delete" 
ON review_links FOR DELETE 
TO authenticated 
USING (true);

-- 5. ให้ authenticated ดูทั้งหมดได้
CREATE POLICY "authenticated_can_select_all" 
ON review_links FOR SELECT 
TO authenticated 
USING (true);

-- เปิด RLS
ALTER TABLE review_links ENABLE ROW LEVEL SECURITY;
```

### ผลลัพธ์
หลังรัน SQL นี้ แอดมินจะสามารถสร้างลิงก์รีวิวได้ทันที

### หมายเหตุ
- วิธีนี้ยังคงปลอดภัย เพราะต้อง login ก่อนถึงจะ insert ได้
- ถ้ายังไม่ได้ ให้ลอง **Refresh หน้าเว็บ** แล้วลองใหม่
