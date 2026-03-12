-- ============================================================
-- Migration 003: Stripe payment cycle alignment
-- ============================================================

-- Add columns required by current Stripe webhook and analytics queries.
ALTER TABLE payments ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS stripe_session_id TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS teacher_amount DECIMAL(10,2) NOT NULL DEFAULT 0;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS platform_amount DECIMAL(10,2) NOT NULL DEFAULT 0;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS currency VARCHAR(10) NOT NULL DEFAULT 'egp';
ALTER TABLE payments ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;

-- Keep legacy status values compatible with current code.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE table_name = 'payments'
      AND constraint_type = 'CHECK'
      AND constraint_name = 'payments_status_check'
  ) THEN
    ALTER TABLE payments DROP CONSTRAINT payments_status_check;
  END IF;
END $$;

ALTER TABLE payments
  ADD CONSTRAINT payments_status_check
  CHECK (status IN ('pending', 'completed', 'failed', 'refunded'));

-- Normalize legacy succeeded values if they exist.
UPDATE payments
SET status = 'completed'
WHERE status = 'succeeded';

-- Ensure unique references for Stripe entities.
CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_stripe_payment_intent_id
  ON payments(stripe_payment_intent_id)
  WHERE stripe_payment_intent_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_stripe_session_id
  ON payments(stripe_session_id)
  WHERE stripe_session_id IS NOT NULL;
