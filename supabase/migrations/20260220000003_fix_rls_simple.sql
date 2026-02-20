-- วิธีที่ 1: ปิด RLS ชั่วคราว (ใช้งานได้ทันที แต่ไม่ปลอดภัย)
-- ALTER TABLE review_links DISABLE ROW LEVEL SECURITY;

-- วิธีที่ 2: เปิด RLS แต่ให้ authenticated ทุกคน insert ได้ (แนะนำ)
-- ลบ policy เก่าทั้งหมด
DROP POLICY IF EXISTS "Allow admin inserts" ON review_links;
DROP POLICY IF EXISTS "Allow admin select all" ON review_links;
DROP POLICY IF EXISTS "Allow public view valid links" ON review_links;
DROP POLICY IF EXISTS "Allow admin delete" ON review_links;
DROP POLICY IF EXISTS "Allow admin update" ON review_links;
DROP POLICY IF EXISTS "Admins can manage review_links" ON review_links;
DROP POLICY IF EXISTS "Public can view unused review_links" ON review_links;

-- สร้าง policy ใหม่ที่ง่ายกว่า

-- 1. ให้ทุกคน (แม้ไม่ login) ดูลิงก์ที่ยังใช้ได้
CREATE POLICY " anyone_can_view_valid_links" 
ON review_links FOR SELECT 
TO anon, authenticated 
USING (
  is_used = false 
  AND (expires_at IS NULL OR expires_at > timezone('utc'::text, now()))
);

-- 2. ให้ user ที่ login แล้ว insert ได้ (ไม่ต้อง check admin)
CREATE POLICY "authenticated_can_insert" 
ON review_links FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- 3. ให้เจ้าของลิงก์ หรือ แอดมิน update ได้
CREATE POLICY "owner_or_admin_can_update" 
ON review_links FOR UPDATE 
TO authenticated 
USING (true);

-- 4. ให้เจ้าของลิงก์ หรือ แอดมิน delete ได้
CREATE POLICY "owner_or_admin_can_delete" 
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
