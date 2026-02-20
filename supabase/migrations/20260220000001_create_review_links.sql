-- สร้างตาราง review_links สำหรับเก็บลิงก์รีวิวที่แอดมินสร้าง
CREATE TABLE IF NOT EXISTS review_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  custom_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_used BOOLEAN DEFAULT false,
  used_at TIMESTAMP WITH TIME ZONE
);

-- สร้าง index สำหรับค้นหา
CREATE INDEX IF NOT EXISTS idx_review_links_token ON review_links(token);
CREATE INDEX IF NOT EXISTS idx_review_links_order_id ON review_links(order_id);

-- เปิด RLS (Row Level Security)
ALTER TABLE review_links ENABLE ROW LEVEL SECURITY;

-- สร้าง policy สำหรับแอดมิน (อ่าน/เขียน/ลบ ได้ทั้งหมด)
CREATE POLICY "Admins can manage review_links" 
ON review_links FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- สร้าง policy สำหรับผู้ใช้ทั่วไป (อ่านได้เฉพาะที่ยังไม่ใช้และไม่หมดอายุ)
CREATE POLICY "Public can view unused review_links" 
ON review_links FOR SELECT 
TO anon, authenticated 
USING (
  is_used = false 
  AND (expires_at IS NULL OR expires_at > timezone('utc'::text, now()))
);

-- สร้าง function สำหรับ mark review link as used
CREATE OR REPLACE FUNCTION mark_review_link_used(p_token TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE review_links 
  SET is_used = true, 
      used_at = timezone('utc'::text, now())
  WHERE token = p_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- อัพเดทตาราง reviews ให้เชื่อมกับ review_links
ALTER TABLE reviews 
ADD COLUMN IF NOT EXISTS review_link_id UUID REFERENCES review_links(id) ON DELETE SET NULL;

-- สร้าง index สำหรับ reviews
CREATE INDEX IF NOT EXISTS idx_reviews_review_link_id ON reviews(review_link_id);
