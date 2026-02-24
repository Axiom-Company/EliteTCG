-- ============================================
-- EliteTCG Marketplace Schema Extension
-- PostgreSQL / Supabase
-- ============================================

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE card_condition AS ENUM ('mint', 'near_mint', 'excellent', 'good', 'played', 'poor');
CREATE TYPE listing_status AS ENUM ('active', 'sold', 'paused', 'deleted');
CREATE TYPE application_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE marketplace_order_status AS ENUM ('pending', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE payout_status AS ENUM ('pending', 'processing', 'completed', 'failed');

-- ============================================
-- MODIFY EXISTING CUSTOMERS TABLE
-- ============================================

-- Add seller-related columns to customers table
ALTER TABLE customers ADD COLUMN IF NOT EXISTS first_name VARCHAR(100);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS is_seller BOOLEAN DEFAULT false;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS seller_verified_at TIMESTAMPTZ;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- ============================================
-- NEW TABLES
-- ============================================

-- Seller Profiles
CREATE TABLE seller_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,

    -- Display info
    display_name VARCHAR(100) NOT NULL,
    bio TEXT,
    avatar_url VARCHAR(500),

    -- Location
    location_city VARCHAR(100),
    location_province VARCHAR(50),

    -- PayFast credentials (for split payments)
    payfast_merchant_id VARCHAR(100),
    payfast_merchant_key VARCHAR(100),
    payfast_email VARCHAR(255),

    -- Contact preferences
    contact_phone VARCHAR(20),
    contact_whatsapp VARCHAR(20),
    contact_email VARCHAR(255),
    show_phone BOOLEAN DEFAULT true,
    show_whatsapp BOOLEAN DEFAULT true,
    show_email BOOLEAN DEFAULT true,

    -- Stats (denormalized for performance)
    total_listings INTEGER DEFAULT 0,
    active_listings INTEGER DEFAULT 0,
    total_sales INTEGER DEFAULT 0,
    total_revenue DECIMAL(12, 2) DEFAULT 0,
    rating DECIMAL(3, 2) DEFAULT 0,
    review_count INTEGER DEFAULT 0,

    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(customer_id)
);

-- Seller Applications
CREATE TABLE seller_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,

    -- Application details
    display_name VARCHAR(100) NOT NULL,
    reason TEXT NOT NULL,
    experience TEXT,

    -- PayFast info (required for payouts)
    payfast_merchant_id VARCHAR(100),
    payfast_email VARCHAR(255) NOT NULL,

    -- Optional verification documents
    id_document_url VARCHAR(500),
    proof_of_address_url VARCHAR(500),

    -- Status
    status application_status DEFAULT 'pending',
    admin_notes TEXT,
    rejection_reason TEXT,
    reviewed_by UUID REFERENCES admin_users(id),
    reviewed_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Marketplace Listings
CREATE TABLE marketplace_listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID NOT NULL REFERENCES seller_profiles(id) ON DELETE CASCADE,

    -- Card information
    title VARCHAR(200) NOT NULL,
    description TEXT,
    card_name VARCHAR(200),
    set_name VARCHAR(200),
    card_number VARCHAR(50),

    -- Condition
    condition card_condition NOT NULL,
    language VARCHAR(20) DEFAULT 'English',

    -- Grading (optional)
    is_graded BOOLEAN DEFAULT false,
    grading_company VARCHAR(50),
    grade VARCHAR(20),
    certificate_number VARCHAR(50),

    -- Pricing (ZAR)
    price DECIMAL(10, 2) NOT NULL,
    compare_at_price DECIMAL(10, 2),
    currency VARCHAR(3) DEFAULT 'ZAR',

    -- Quantity
    quantity INTEGER DEFAULT 1,
    sold_quantity INTEGER DEFAULT 0,

    -- Images (JSON array of URLs, max 5)
    images JSONB DEFAULT '[]',

    -- Categorization
    category VARCHAR(50) DEFAULT 'singles', -- singles, sealed, accessories

    -- Status
    status listing_status DEFAULT 'active',

    -- Analytics (denormalized for performance)
    view_count INTEGER DEFAULT 0,
    favorite_count INTEGER DEFAULT 0,

    -- Flags
    is_featured BOOLEAN DEFAULT false,
    is_negotiable BOOLEAN DEFAULT false,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    sold_at TIMESTAMPTZ
);

-- Listing Views (for analytics)
CREATE TABLE listing_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID NOT NULL REFERENCES marketplace_listings(id) ON DELETE CASCADE,
    viewer_id UUID REFERENCES customers(id) ON DELETE SET NULL,

    -- Tracking data
    ip_address VARCHAR(45),
    user_agent TEXT,
    referrer VARCHAR(500),

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Marketplace Orders
CREATE TABLE marketplace_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) NOT NULL UNIQUE,

    -- Parties
    listing_id UUID REFERENCES marketplace_listings(id) ON DELETE SET NULL,
    seller_id UUID NOT NULL REFERENCES seller_profiles(id),
    buyer_id UUID REFERENCES customers(id) ON DELETE SET NULL,

    -- Quantities and pricing
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,

    -- Platform commission (10%)
    platform_fee DECIMAL(10, 2) NOT NULL,
    platform_fee_percentage DECIMAL(5, 2) DEFAULT 10.00,

    -- Seller payout (90%)
    seller_amount DECIMAL(10, 2) NOT NULL,

    -- Total
    total_amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'ZAR',

    -- Status
    status marketplace_order_status DEFAULT 'pending',
    payment_status payment_status DEFAULT 'pending',

    -- PayFast payment details
    payfast_payment_id VARCHAR(100),
    payfast_pf_payment_id VARCHAR(100),

    -- Buyer info (snapshot at time of order)
    buyer_email VARCHAR(255) NOT NULL,
    buyer_name VARCHAR(200) NOT NULL,
    buyer_phone VARCHAR(20),

    -- Shipping
    shipping_address JSONB,
    tracking_number VARCHAR(100),
    shipping_carrier VARCHAR(50),

    notes TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    paid_at TIMESTAMPTZ,
    shipped_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ
);

-- Seller Payouts
CREATE TABLE seller_payouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID NOT NULL REFERENCES seller_profiles(id),
    order_id UUID REFERENCES marketplace_orders(id) ON DELETE SET NULL,

    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'ZAR',

    status payout_status DEFAULT 'pending',

    -- PayFast split payment details
    payfast_split_payment_id VARCHAR(100),

    -- Processing info
    processed_at TIMESTAMPTZ,
    error_message TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Listing Favorites (for users to save listings)
CREATE TABLE listing_favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    listing_id UUID NOT NULL REFERENCES marketplace_listings(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(customer_id, listing_id)
);

-- ============================================
-- INDEXES
-- ============================================

-- Seller profiles
CREATE INDEX idx_seller_profiles_customer_id ON seller_profiles(customer_id);
CREATE INDEX idx_seller_profiles_is_active ON seller_profiles(is_active);
CREATE INDEX idx_seller_profiles_rating ON seller_profiles(rating DESC);

-- Seller applications
CREATE INDEX idx_seller_applications_customer_id ON seller_applications(customer_id);
CREATE INDEX idx_seller_applications_status ON seller_applications(status);
CREATE INDEX idx_seller_applications_created_at ON seller_applications(created_at DESC);

-- Marketplace listings
CREATE INDEX idx_marketplace_listings_seller_id ON marketplace_listings(seller_id);
CREATE INDEX idx_marketplace_listings_status ON marketplace_listings(status);
CREATE INDEX idx_marketplace_listings_condition ON marketplace_listings(condition);
CREATE INDEX idx_marketplace_listings_price ON marketplace_listings(price);
CREATE INDEX idx_marketplace_listings_category ON marketplace_listings(category);
CREATE INDEX idx_marketplace_listings_created_at ON marketplace_listings(created_at DESC);
CREATE INDEX idx_marketplace_listings_view_count ON marketplace_listings(view_count DESC);

-- Full text search on listings
CREATE INDEX idx_marketplace_listings_title_search ON marketplace_listings USING gin(to_tsvector('english', title));
CREATE INDEX idx_marketplace_listings_card_name_search ON marketplace_listings USING gin(to_tsvector('english', coalesce(card_name, '')));

-- Listing views
CREATE INDEX idx_listing_views_listing_id ON listing_views(listing_id);
CREATE INDEX idx_listing_views_created_at ON listing_views(created_at);
CREATE INDEX idx_listing_views_ip_listing ON listing_views(ip_address, listing_id);

-- Marketplace orders
CREATE INDEX idx_marketplace_orders_seller_id ON marketplace_orders(seller_id);
CREATE INDEX idx_marketplace_orders_buyer_id ON marketplace_orders(buyer_id);
CREATE INDEX idx_marketplace_orders_listing_id ON marketplace_orders(listing_id);
CREATE INDEX idx_marketplace_orders_status ON marketplace_orders(status);
CREATE INDEX idx_marketplace_orders_created_at ON marketplace_orders(created_at DESC);

-- Seller payouts
CREATE INDEX idx_seller_payouts_seller_id ON seller_payouts(seller_id);
CREATE INDEX idx_seller_payouts_status ON seller_payouts(status);

-- Listing favorites
CREATE INDEX idx_listing_favorites_customer_id ON listing_favorites(customer_id);
CREATE INDEX idx_listing_favorites_listing_id ON listing_favorites(listing_id);

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update updated_at for seller_profiles
CREATE TRIGGER update_seller_profiles_updated_at
    BEFORE UPDATE ON seller_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-update updated_at for seller_applications
CREATE TRIGGER update_seller_applications_updated_at
    BEFORE UPDATE ON seller_applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-update updated_at for marketplace_listings
CREATE TRIGGER update_marketplace_listings_updated_at
    BEFORE UPDATE ON marketplace_listings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-update updated_at for marketplace_orders
CREATE TRIGGER update_marketplace_orders_updated_at
    BEFORE UPDATE ON marketplace_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to increment listing view count
CREATE OR REPLACE FUNCTION increment_listing_views(listing_uuid UUID)
RETURNS void AS $$
BEGIN
    UPDATE marketplace_listings
    SET view_count = view_count + 1
    WHERE id = listing_uuid;
END;
$$ LANGUAGE plpgsql;

-- Function to update seller stats after a sale
CREATE OR REPLACE FUNCTION update_seller_stats_on_sale()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.payment_status = 'completed' AND OLD.payment_status != 'completed' THEN
        UPDATE seller_profiles
        SET
            total_sales = total_sales + 1,
            total_revenue = total_revenue + NEW.seller_amount
        WHERE id = NEW.seller_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_seller_stats
    AFTER UPDATE ON marketplace_orders
    FOR EACH ROW EXECUTE FUNCTION update_seller_stats_on_sale();

-- Function to update listing quantity after sale
CREATE OR REPLACE FUNCTION update_listing_on_sale()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.payment_status = 'completed' AND OLD.payment_status != 'completed' THEN
        UPDATE marketplace_listings
        SET
            sold_quantity = sold_quantity + NEW.quantity,
            quantity = quantity - NEW.quantity,
            status = CASE
                WHEN quantity - NEW.quantity <= 0 THEN 'sold'::listing_status
                ELSE status
            END,
            sold_at = CASE
                WHEN quantity - NEW.quantity <= 0 THEN NOW()
                ELSE sold_at
            END
        WHERE id = NEW.listing_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_listing_on_sale
    AFTER UPDATE ON marketplace_orders
    FOR EACH ROW EXECUTE FUNCTION update_listing_on_sale();

-- Function to update seller profile listing counts
CREATE OR REPLACE FUNCTION update_seller_listing_counts()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the seller's listing counts
    UPDATE seller_profiles
    SET
        total_listings = (SELECT COUNT(*) FROM marketplace_listings WHERE seller_id = COALESCE(NEW.seller_id, OLD.seller_id) AND status != 'deleted'),
        active_listings = (SELECT COUNT(*) FROM marketplace_listings WHERE seller_id = COALESCE(NEW.seller_id, OLD.seller_id) AND status = 'active')
    WHERE id = COALESCE(NEW.seller_id, OLD.seller_id);

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_seller_listing_counts
    AFTER INSERT OR UPDATE OR DELETE ON marketplace_listings
    FOR EACH ROW EXECUTE FUNCTION update_seller_listing_counts();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on tables
ALTER TABLE seller_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_favorites ENABLE ROW LEVEL SECURITY;

-- Seller profiles: Public read, owner write
CREATE POLICY "Seller profiles are viewable by everyone"
    ON seller_profiles FOR SELECT
    USING (is_active = true);

CREATE POLICY "Users can update own seller profile"
    ON seller_profiles FOR UPDATE
    USING (customer_id = auth.uid());

-- Seller applications: Only owner and admins
CREATE POLICY "Users can view own applications"
    ON seller_applications FOR SELECT
    USING (customer_id = auth.uid());

CREATE POLICY "Users can create own applications"
    ON seller_applications FOR INSERT
    WITH CHECK (customer_id = auth.uid());

-- Marketplace listings: Public read active, owner all
CREATE POLICY "Active listings are viewable by everyone"
    ON marketplace_listings FOR SELECT
    USING (status = 'active');

CREATE POLICY "Sellers can manage own listings"
    ON marketplace_listings FOR ALL
    USING (seller_id IN (SELECT id FROM seller_profiles WHERE customer_id = auth.uid()));

-- Listing views: Insert only
CREATE POLICY "Anyone can create listing views"
    ON listing_views FOR INSERT
    WITH CHECK (true);

-- Marketplace orders: Buyer and seller can view
CREATE POLICY "Buyers can view own orders"
    ON marketplace_orders FOR SELECT
    USING (buyer_id = auth.uid());

CREATE POLICY "Sellers can view received orders"
    ON marketplace_orders FOR SELECT
    USING (seller_id IN (SELECT id FROM seller_profiles WHERE customer_id = auth.uid()));

-- Listing favorites: Owner only
CREATE POLICY "Users can manage own favorites"
    ON listing_favorites FOR ALL
    USING (customer_id = auth.uid());

-- ============================================
-- SAMPLE DATA (for development)
-- ============================================

-- Note: In production, remove this section

-- Sample seller application (using existing test customer if any)
-- INSERT INTO seller_applications (customer_id, display_name, reason, payfast_email, status)
-- SELECT id, 'TestSeller', 'I want to sell my Pokemon cards', 'seller@test.com', 'approved'
-- FROM customers LIMIT 1;
