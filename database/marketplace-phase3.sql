-- ============================================
-- EliteTCG Marketplace Phase 3 Schema
-- Run AFTER marketplace-schema.sql
-- ============================================

-- 1. Add reservation columns to marketplace_listings
ALTER TABLE marketplace_listings
  ADD COLUMN IF NOT EXISTS reserve_status VARCHAR(20) DEFAULT 'available',
  ADD COLUMN IF NOT EXISTS reserved_by UUID REFERENCES customers(id),
  ADD COLUMN IF NOT EXISTS reserved_at TIMESTAMPTZ;

-- 2. Add promotion columns to marketplace_listings
ALTER TABLE marketplace_listings
  ADD COLUMN IF NOT EXISTS promotion_tier VARCHAR(20),
  ADD COLUMN IF NOT EXISTS promotion_expires_at TIMESTAMPTZ;

-- 3. Add verification columns to seller_profiles
ALTER TABLE seller_profiles
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS id_document_url VARCHAR(500),
  ADD COLUMN IF NOT EXISTS selfie_url VARCHAR(500),
  ADD COLUMN IF NOT EXISTS verification_status VARCHAR(20) DEFAULT 'none';

-- 4. Listing promotions table
CREATE TABLE IF NOT EXISTS listing_promotions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES marketplace_listings(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES seller_profiles(id),
  tier VARCHAR(20) NOT NULL,
  price_paid DECIMAL(10, 2) NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  payfast_payment_id VARCHAR(100),
  payment_status payment_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_listing_promotions_listing_id ON listing_promotions(listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_promotions_expires_at ON listing_promotions(expires_at);
CREATE INDEX IF NOT EXISTS idx_listing_promotions_seller_id ON listing_promotions(seller_id);

-- 5. Reviews table
CREATE TABLE IF NOT EXISTS marketplace_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES marketplace_orders(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES customers(id),
  seller_id UUID NOT NULL REFERENCES seller_profiles(id),
  listing_id UUID REFERENCES marketplace_listings(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(order_id)
);

CREATE INDEX IF NOT EXISTS idx_marketplace_reviews_seller_id ON marketplace_reviews(seller_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_reviews_reviewer_id ON marketplace_reviews(reviewer_id);

-- Auto-update updated_at for reviews
CREATE TRIGGER update_marketplace_reviews_updated_at
  BEFORE UPDATE ON marketplace_reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 6. Trigger: auto-recalculate seller rating on review changes
CREATE OR REPLACE FUNCTION update_seller_rating()
RETURNS TRIGGER AS $$
DECLARE
  target_seller_id UUID;
BEGIN
  target_seller_id := COALESCE(NEW.seller_id, OLD.seller_id);

  UPDATE seller_profiles
  SET rating = COALESCE(
        (SELECT ROUND(AVG(rating)::numeric, 2) FROM marketplace_reviews WHERE seller_id = target_seller_id),
        0
      ),
      review_count = (SELECT COUNT(*) FROM marketplace_reviews WHERE seller_id = target_seller_id)
  WHERE id = target_seller_id;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_seller_rating
  AFTER INSERT OR UPDATE OR DELETE ON marketplace_reviews
  FOR EACH ROW EXECUTE FUNCTION update_seller_rating();

-- 7. RPC: reserve listing with row locking (prevents double-purchase)
CREATE OR REPLACE FUNCTION reserve_listing(
  p_listing_id UUID,
  p_buyer_id UUID,
  p_quantity INTEGER DEFAULT 1
)
RETURNS JSONB AS $$
DECLARE
  v_listing marketplace_listings%ROWTYPE;
BEGIN
  SELECT * INTO v_listing
  FROM marketplace_listings
  WHERE id = p_listing_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Listing not found');
  END IF;

  IF v_listing.status != 'active' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Listing is not active');
  END IF;

  IF v_listing.reserve_status = 'reserved' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Listing is already reserved by another buyer');
  END IF;

  IF v_listing.reserve_status = 'sold' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Listing has already been sold');
  END IF;

  IF v_listing.quantity < p_quantity THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient quantity available');
  END IF;

  UPDATE marketplace_listings
  SET reserve_status = 'reserved',
      reserved_by = p_buyer_id,
      reserved_at = NOW()
  WHERE id = p_listing_id;

  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql;

-- 8. RPC: release expired reservations (called by background job)
CREATE OR REPLACE FUNCTION release_expired_reservations()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE marketplace_listings
  SET reserve_status = 'available',
      reserved_by = NULL,
      reserved_at = NULL
  WHERE reserve_status = 'reserved'
    AND reserved_at < NOW() - INTERVAL '30 minutes';

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- 9. Indexes for reservation queries
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_reserve_status ON marketplace_listings(reserve_status);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_promotion_tier ON marketplace_listings(promotion_tier);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_promotion_expires ON marketplace_listings(promotion_expires_at);

-- 10. RLS for new tables
ALTER TABLE listing_promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Promotions are viewable by everyone"
  ON listing_promotions FOR SELECT USING (true);

CREATE POLICY "Sellers can manage own promotions"
  ON listing_promotions FOR ALL
  USING (seller_id IN (SELECT id FROM seller_profiles WHERE customer_id = auth.uid()));

CREATE POLICY "Reviews are viewable by everyone"
  ON marketplace_reviews FOR SELECT USING (true);

CREATE POLICY "Buyers can create own reviews"
  ON marketplace_reviews FOR INSERT
  WITH CHECK (reviewer_id = auth.uid());
