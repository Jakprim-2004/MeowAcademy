-- 🔒 แก้ไข RLS Policy - รันใน Supabase SQL Editor
-- ลิงก์: https://supabase.com/dashboard/project/iiimpsfjzcgxcoxvveis/sql-editor

-- ขั้นตอน 1: ลบ policy อ่อนแอทั้งหมด
DROP POLICY IF EXISTS "authenticated_can_insert" ON review_links;
DROP POLICY IF EXISTS "authenticated_can_delete" ON review_links;
DROP POLICY IF EXISTS "authenticated_can_update" ON review_links;
DROP POLICY IF EXISTS "owner_or_admin_can_update" ON review_links;
DROP POLICY IF EXISTS "owner_or_admin_can_delete" ON review_links;
DROP POLICY IF EXISTS " anyone_can_view_valid_links" ON review_links;
DROP POLICY IF EXISTS "authenticated_can_select_all" ON review_links;
DROP POLICY IF EXISTS "Allow admin inserts" ON review_links;
DROP POLICY IF EXISTS "Allow admin select all" ON review_links;
DROP POLICY IF EXISTS "Allow public view valid links" ON review_links;
DROP POLICY IF EXISTS "Allow admin delete" ON review_links;
DROP POLICY IF EXISTS "Allow admin update" ON review_links;
DROP POLICY IF EXISTS "Admins can manage review_links" ON review_links;
DROP POLICY IF EXISTS "Public can view unused review_links" ON review_links;

-- ขั้นตอน 2: สร้าง policy ใหม่ที่ปลอดภัย

-- 2.1 เฉพาะแอดมินที่จัดการข้อมูลได้ (INSERT, UPDATE, DELETE)
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

-- 2.2 Public ดูลิงก์ที่ยังใช้ได้ (ไม่ต้อง login)
CREATE POLICY "public_can_view_unused_links" 
ON review_links FOR SELECT 
TO anon 
USING (
  is_used = false 
  AND (expires_at IS NULL OR expires_at > timezone('utc'::text, now()))
);

-- 2.3 Authenticated ดูข้อมูลทั้งหมดได้ (สำหรับแอดมินดู list)
CREATE POLICY "authenticated_can_select_all" 
ON review_links FOR SELECT 
TO authenticated 
USING (true);

-- ขั้นตอน 3: เปิด RLS
ALTER TABLE review_links ENABLE ROW LEVEL SECURITY;

-- ✅ เสร็จสิ้น - ตอนนี้เฉพาะแอดมินเท่านั้นที่สร้าง/ลบ/แก้ไขลิงก์ได้
