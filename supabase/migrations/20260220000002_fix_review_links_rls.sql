-- แก้ไข RLS Policy สำหรับ review_links
-- ให้แอดมินสามารถ insert ได้

-- ลบ policy เก่าออกก่อน (ถ้ามี)
DROP POLICY IF EXISTS "Admins can manage review_links" ON review_links;
DROP POLICY IF EXISTS "Public can view unused review_links" ON review_links;
DROP POLICY IF EXISTS "Allow admin inserts" ON review_links;
DROP POLICY IF EXISTS "Allow admin select" ON review_links;
DROP POLICY IF EXISTS "Allow admin delete" ON review_links;

-- สร้าง policy ใหม่ที่ยืดหยุ่นกว่า

-- 1. ให้แอดมิน (authenticated) สามารถ insert ได้
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

-- 2. ให้แอดมินดูข้อมูลทั้งหมด
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

-- 3. ให้ public (ทุกคน) ดูลิงก์ที่ยังใช้งานได้ (ไม่หมดอายุ, ยังไม่ใช้)
CREATE POLICY "Allow public view valid links" 
ON review_links FOR SELECT 
TO anon, authenticated 
USING (
  is_used = false 
  AND (expires_at IS NULL OR expires_at > timezone('utc'::text, now()))
);

-- 4. ให้แอดมินลบได้
CREATE POLICY "Allow admin delete" 
ON review_links FOR DELETE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- 5. ให้แอดมิน update ได้
CREATE POLICY "Allow admin update" 
ON review_links FOR UPDATE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- ตรวจสอบว่า RLS เปิดอยู่
ALTER TABLE review_links ENABLE ROW LEVEL SECURITY;
