-- Converge Digitals — LinkedIn Content Engine Schema
-- Supabase PostgreSQL Migration Script

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create Enums
CREATE TYPE pillar_type AS ENUM ('authority', 'offer', 'aradhya', 'proof');
CREATE TYPE day_slot_type AS ENUM ('mon', 'tue', 'wed', 'thu', 'fri');
CREATE TYPE post_status_type AS ENUM ('draft', 'ready', 'posted');
CREATE TYPE visual_type_enum AS ENUM ('ai', 'real', 'none');
CREATE TYPE idea_source_enum AS ENUM ('manual', 'crawler_news', 'github', 'competitor_research', 'client');
CREATE TYPE research_source_enum AS ENUM ('meta_ad_library', 'linkedin_ad_library', 'google_ads', 'web_search', 'manual');
CREATE TYPE chat_role_enum AS ENUM ('user', 'assistant');
CREATE TYPE lead_type_enum AS ENUM ('web_dev', 'aradhya_video');
CREATE TYPE lead_status_enum AS ENUM ('new', 'contacted', 'archived');

-- 2. Posts Table
CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    pillar pillar_type NOT NULL,
    day_slot day_slot_type NOT NULL,
    idea_text TEXT NOT NULL,
    draft_1 TEXT,
    draft_2 TEXT,
    draft_3 TEXT,
    selected_draft TEXT,
    status post_status_type DEFAULT 'draft',
    scheduled_date DATE,
    posted_date DATE,
    post_url TEXT,
    visual_type visual_type_enum DEFAULT 'none'
);

-- 3. Clients Table
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    industry VARCHAR(255),
    project_type VARCHAR(255),
    results_summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Competitors Table
CREATE TABLE IF NOT EXISTS competitors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    website_url TEXT,
    discovered_via VARCHAR(100) DEFAULT 'ai_search',
    first_discovered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    industry_tag VARCHAR(100),
    notes TEXT,
    active BOOLEAN DEFAULT TRUE
);

-- 5. Competitor Research Table
CREATE TABLE IF NOT EXISTS competitor_research (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    competitor_id UUID REFERENCES competitors(id) ON DELETE CASCADE,
    source research_source_enum DEFAULT 'web_search',
    content_notes TEXT NOT NULL,
    screenshot_url TEXT,
    date_added TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. GitHub Projects Table
CREATE TABLE IF NOT EXISTS github_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    repo_name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    tech_stack TEXT[],
    client_name VARCHAR(255),
    live_url TEXT,
    last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    used_as_idea BOOLEAN DEFAULT FALSE
);

-- 7. Idea Bank Table
CREATE TABLE IF NOT EXISTS idea_bank (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pillar pillar_type NOT NULL,
    idea_text TEXT NOT NULL UNIQUE,
    source idea_source_enum DEFAULT 'manual',
    source_ref_id UUID,
    times_used INT DEFAULT 0,
    last_used_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Metrics Table (FK to Posts)
CREATE TABLE IF NOT EXISTS metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    impressions INT DEFAULT 0,
    reactions INT DEFAULT 0,
    comments INT DEFAULT 0,
    dms_received INT DEFAULT 0,
    client_type_of_dm VARCHAR(255),
    notes TEXT,
    entered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Draft Chats Table (FK to Posts)
CREATE TABLE IF NOT EXISTS draft_chats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    role chat_role_enum NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Leads Table (With Strict UNIQUE constraint on business_name)
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_type lead_type_enum NOT NULL,
    business_name VARCHAR(255) NOT NULL UNIQUE,
    niche VARCHAR(255) NOT NULL,
    city_state VARCHAR(255),
    rating NUMERIC(2, 1),
    website_url TEXT,
    google_map_url TEXT,
    phone_number VARCHAR(100),
    email VARCHAR(255),
    qualification_reason TEXT NOT NULL,
    ad_status VARCHAR(255),
    status lead_status_enum DEFAULT 'new',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Indexes for performance
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_pillar ON posts(pillar);
CREATE INDEX IF NOT EXISTS idx_idea_bank_pillar ON idea_bank(pillar);
CREATE INDEX IF NOT EXISTS idx_competitor_research_comp ON competitor_research(competitor_id);
CREATE INDEX IF NOT EXISTS idx_leads_type ON leads(lead_type);
