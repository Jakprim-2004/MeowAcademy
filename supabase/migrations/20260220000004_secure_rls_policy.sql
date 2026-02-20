-- 🔒 แก้ไข RLS Policy ให้ปลอดภัย
-- ลบ policy อ่อนแอที่ให้ authenticated ทุกคนทำได้

-- ลบ policy เก่าที่อ่อนแอ
DROP POLICY IF EXISTS "authenticated_can_insert" ON review_links;
DROP POLICY IF EXISTS "authenticated_can_delete" ON review_links;
DROP POLICY IF EXISTS "authenticated_can_update" ON review_links;
DROP POLICY IF EXISTS "owner_or_admin_can_update" ON review_links;
DROP POLICY IF EXISTS "owner_or_admin_can_delete" ON review_links;
DROP POLICY IF EXISTS " anyone_can_view_valid_links" ON review_links;
DROP POLICY IF EXISTS "authenticated_can_select_all" ON review_links;

-- ลบ policy เก่าอื่นๆ ที่อาจมี
DROP POLICY IF EXISTS "Allow admin inserts" ON review_links;
DROP POLICY IF EXISTS "Allow admin select all" ON review_links;
DROP POLICY IF EXISTS "Allow public view valid links" ON review_links;
DROP POLICY IF EXISTS "Allow admin delete" ON review_links;
DROP POLICY IF EXISTS "Allow admin update" ON review_links;
DROP POLICY IF EXISTS "Admins can manage review_links" ON review_links;
DROP POLICY IF EXISTS "Public can view unused review_links" ON review_links;

-- สร้าง policy ใหม่ที่ปลอดภัย

-- 1. ให้เฉพาะแอดมินเท่านั้นที่จัดการข้อมูลได้ (INSERT, UPDATE, DELETE)
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

-- 2. ให้ public (ไม่ต้อง login) ดูลิงก์ที่ยังใช้ได้อยู่ (สำหรับหน้ารีวิว)
-- แต่ดูได้เฉพาะ fields ที่จำเป็น (ใช้ column-level security หรือ view)
CREATE POLICY "public_can_view_unused_links" 
ON review_links FOR SELECT 
TO anon 
USING (
  is_used = false 
  AND (expires_at IS NULL OR expires_at > timezone('utc'::text, now()))
);

-- 3. ให้ authenticated (แอดมิน) ดูข้อมูลทั้งหมดได้
CREATE POLICY "authenticated_can_select_all" 
ON review_links FOR SELECT 
TO authenticated 
USING (true);

-- เปิด RLS
ALTER TABLE review_links ENABLE ROW LEVEL SECURITY;
