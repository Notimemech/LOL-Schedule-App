import { pool } from './src/config/db.config.js';

const sql = `
CREATE TABLE IF NOT EXISTS VipTiers (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name varchar(50) NOT NULL UNIQUE,
    price_per_month decimal(15,2) NOT NULL,
    deposit_bonus_percent decimal(5,2) NOT NULL,
    bet_cashback_percent decimal(5,2) NOT NULL,
    min_bet_for_cashback decimal(15,2) NOT NULL DEFAULT 0
);

INSERT INTO VipTiers (name, price_per_month, deposit_bonus_percent, bet_cashback_percent, min_bet_for_cashback) VALUES
('VIP 1', 49000, 10, 1, 300000),
('VIP 2', 129000, 15, 5, 300000),
('VIP 3', 179000, 20, 5, 200000),
('VIP 4', 179000, 20, 10, 300000),
('VIP 5', 229000, 35, 15, 200000)
ON CONFLICT (name) DO UPDATE SET 
    price_per_month = EXCLUDED.price_per_month,
    deposit_bonus_percent = EXCLUDED.deposit_bonus_percent,
    bet_cashback_percent = EXCLUDED.bet_cashback_percent,
    min_bet_for_cashback = EXCLUDED.min_bet_for_cashback;

ALTER TABLE Users ADD COLUMN IF NOT EXISTS vip_tier_id bigint;
ALTER TABLE Users DROP CONSTRAINT IF EXISTS fk_user_vip;
ALTER TABLE Users ADD CONSTRAINT fk_user_vip FOREIGN KEY (vip_tier_id) REFERENCES VipTiers(id) ON DELETE SET NULL;

ALTER TABLE Users ADD COLUMN IF NOT EXISTS vip_expires_at timestamptz;
ALTER TABLE Users ADD COLUMN IF NOT EXISTS is_vip_auto_renew boolean DEFAULT true;

CREATE TABLE IF NOT EXISTS Notifications (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id bigint NOT NULL,
    title varchar(255) NOT NULL,
    message text NOT NULL,
    is_read boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),

    CONSTRAINT fk_notification_user FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);
`;

async function run() {
    try {
        const client = await pool.connect();
        await client.query(sql);
        console.log("Migration executed successfully.");
        client.release();
        process.exit(0);
    } catch (e) {
        console.error("Migration failed:", e);
        process.exit(1);
    }
}

run();
