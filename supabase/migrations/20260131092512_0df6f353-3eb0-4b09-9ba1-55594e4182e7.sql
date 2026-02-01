-- Add line_user_id column to orders table for sending push notifications to customers
ALTER TABLE public.orders ADD COLUMN line_user_id TEXT;

-- Add index for querying orders by line_user_id
CREATE INDEX idx_orders_line_user_id ON public.orders(line_user_id);

-- Add reminder_sent column to track payment reminder status
ALTER TABLE public.orders ADD COLUMN reminder_sent BOOLEAN DEFAULT false;