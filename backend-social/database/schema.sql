-- Database schema for Passive-Aggressive Alarm Clock
-- Can be used with Supabase, PostgreSQL, or any SQL database

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255),
    phone_number VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    twitter_handle VARCHAR(255),
    settings JSONB DEFAULT '{}'::jsonb
);

-- Snooze history table
CREATE TABLE IF NOT EXISTS snooze_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    user_external_id VARCHAR(255),
    alarm_time TIMESTAMP NOT NULL,
    snooze_count INTEGER DEFAULT 0,
    excuse TEXT,
    transcribed_excuse TEXT,
    wake_up_time TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Excuse patterns table
CREATE TABLE IF NOT EXISTS excuse_patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    excuse_text TEXT NOT NULL,
    frequency INTEGER DEFAULT 1,
    legitimacy_score DECIMAL(3, 2),
    sentiment VARCHAR(50),
    first_used_at TIMESTAMP DEFAULT NOW(),
    last_used_at TIMESTAMP DEFAULT NOW()
);

-- Embarrassing stats table
CREATE TABLE IF NOT EXISTS embarrassing_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    stat_date DATE NOT NULL,
    total_snoozes INTEGER DEFAULT 0,
    longest_snooze_session INTEGER DEFAULT 0,
    average_wake_up_time TIME,
    total_alarm_time_minutes INTEGER DEFAULT 0,
    most_common_excuse TEXT,
    excuse_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, stat_date)
);

-- Social media posts table
CREATE TABLE IF NOT EXISTS social_media_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    snooze_count INTEGER NOT NULL,
    post_type VARCHAR(50) NOT NULL, -- 'twitter', 'sms', 'both'
    post_content TEXT NOT NULL,
    post_url VARCHAR(500),
    post_id VARCHAR(255), -- Twitter post ID
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'posted', 'failed'
    posted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Escalation triggers table
CREATE TABLE IF NOT EXISTS escalation_triggers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    snooze_threshold INTEGER NOT NULL,
    action_type VARCHAR(50) NOT NULL, -- 'twitter_post', 'sms_threat', 'escalate_roast'
    triggered_at TIMESTAMP DEFAULT NOW(),
    executed BOOLEAN DEFAULT FALSE,
    execution_result JSONB
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_snooze_history_user_id ON snooze_history(user_id);
CREATE INDEX IF NOT EXISTS idx_snooze_history_created_at ON snooze_history(created_at);
CREATE INDEX IF NOT EXISTS idx_excuse_patterns_user_id ON excuse_patterns(user_id);
CREATE INDEX IF NOT EXISTS idx_embarrassing_stats_user_date ON embarrassing_stats(user_id, stat_date);
CREATE INDEX IF NOT EXISTS idx_social_media_posts_user_id ON social_media_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_social_media_posts_status ON social_media_posts(status);
CREATE INDEX IF NOT EXISTS idx_escalation_triggers_user_id ON escalation_triggers(user_id);

