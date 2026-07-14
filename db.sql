-- =====================================================================
-- ESPORT BETTING DATABASE SCHEMA (PostgreSQL)
-- Phiên bản cải thiện:
--   * Bỏ ON DELETE CASCADE ở dữ liệu tài chính (dùng RESTRICT)
--   * Thêm UNIQUE cho username/email/wallet
--   * Thêm CHECK constraints (balance, amount, odds, team1 <> team2)
--   * settled_at cho phép NULL
--   * Thêm scheduled_at cho Matches, game_number cho Games
--   * Chuẩn hoá tên bảng/cột, thêm created_at/updated_at
--   * Thêm index cho các FK hay query
--   * Thêm bảng OddsHistory để lưu lịch sử tỷ lệ cược
-- =====================================================================

-- =====================
-- ENUM TYPES
-- =====================
CREATE TYPE states_enum AS ENUM ('upcoming', 'happening', 'finished', 'cancelled');

-- Sửa typo 'successed' -> 'success'
CREATE TYPE status_enum AS ENUM ('pending', 'success', 'failed', 'cancelled');

CREATE TYPE market_type_enum AS ENUM (
    'winner_team',
    'first_blood',
    'total_kill',
    'average_kill',
    'most_kill'
);

CREATE TYPE market_status_enum AS ENUM (
    'open',
    'suspended',
    'closed',
    'settled',
    'cancelled'
);

CREATE TYPE transaction_type_enum AS ENUM (
    'DEPOSIT',
    'WITHDRAW',
    'BET',
    'PAYOUT',
    'REFUND'
);

CREATE TYPE bet_status_enum AS ENUM ('pending', 'won', 'lost', 'cancelled', 'cashout');

-- Loại tham chiếu cho WalletTransactions.reference_id (FK đa hình)
CREATE TYPE reference_type_enum AS ENUM ('BET', 'PAYMENT', 'MANUAL');

-- =====================
-- 0. ROLES
-- =====================
CREATE TABLE Roles (
    id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name        varchar(50) NOT NULL UNIQUE
);

-- =====================
-- 1. USERS
-- =====================
CREATE TABLE Users (
    id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username    varchar(50)  NOT NULL UNIQUE,
    password    varchar(255) NOT NULL,           -- lưu hash (bcrypt/argon2), không lưu plaintext
    role_id     bigint       NOT NULL,
    phone       varchar(20),
    email       varchar(100) NOT NULL UNIQUE,
    is_active   boolean      NOT NULL DEFAULT TRUE,  -- soft-delete: set FALSE thay vì DELETE
    created_at  timestamptz  NOT NULL DEFAULT now(),
    updated_at  timestamptz  NOT NULL DEFAULT now(),

    CONSTRAINT fk_user_role
        FOREIGN KEY (role_id)
        REFERENCES Roles(id)
        ON DELETE RESTRICT              -- không cho xoá role đang có user
);

CREATE INDEX idx_users_role ON Users(role_id);

-- =====================
-- 2. MATCH TYPES (LOL, Valorant, ...)
-- =====================
CREATE TABLE MatchTypes (
    id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    match_type  varchar(20) NOT NULL UNIQUE
);

-- =====================
-- 3. LEAGUES
-- =====================
CREATE TABLE Leagues (
    id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name        varchar(255) NOT NULL,
    slug        varchar(50)  NOT NULL UNIQUE,
    logo_url    text         NOT NULL,
    created_at  timestamptz  NOT NULL DEFAULT now()
);

-- =====================
-- 4. TOURNAMENTS (thuộc 1 league, có thời gian diễn ra)
-- =====================
CREATE TABLE Tournaments (
    id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    league_id   bigint       NOT NULL,
    name        varchar(255) NOT NULL,
    start_date  date,
    end_date    date,
    created_at  timestamptz  NOT NULL DEFAULT now(),

    CONSTRAINT fk_tournament_league
        FOREIGN KEY (league_id)
        REFERENCES Leagues(id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_tournament_dates
        CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date)
);

CREATE INDEX idx_tournaments_league ON Tournaments(league_id);

-- =====================
-- 5. TEAMS
-- =====================
CREATE TABLE Teams (
    id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name        varchar(255) NOT NULL,
    code        varchar(10)  NOT NULL,
    slug        varchar(50)  NOT NULL UNIQUE,
    logo_url    text         NOT NULL,
    created_at  timestamptz  NOT NULL DEFAULT now()
);

-- =====================
-- 6. MATCHES
-- =====================
CREATE TABLE Matches (
    id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    match_type_id   bigint      NOT NULL,
    tournament_id   bigint      NOT NULL,
    block_name      varchar(50) NOT NULL,          -- vd: 'Playoffs - Round 1'
    team1_id        bigint      NOT NULL,
    team2_id        bigint      NOT NULL,
    team1_score     int         NOT NULL DEFAULT 0 CHECK (team1_score >= 0),
    team2_score     int         NOT NULL DEFAULT 0 CHECK (team2_score >= 0),
    best_of         smallint    NOT NULL DEFAULT 1 CHECK (best_of IN (1, 3, 5)),
    winner_team_id  bigint,                        -- NULL cho đến khi có kết quả
    state           states_enum NOT NULL DEFAULT 'upcoming',
    scheduled_at    timestamptz NOT NULL,          -- giờ thi đấu dự kiến
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT fk_match_type
        FOREIGN KEY (match_type_id) REFERENCES MatchTypes(id) ON DELETE RESTRICT,

    CONSTRAINT fk_match_tournament
        FOREIGN KEY (tournament_id) REFERENCES Tournaments(id) ON DELETE RESTRICT,

    CONSTRAINT fk_match_team1
        FOREIGN KEY (team1_id) REFERENCES Teams(id) ON DELETE RESTRICT,

    CONSTRAINT fk_match_team2
        FOREIGN KEY (team2_id) REFERENCES Teams(id) ON DELETE RESTRICT,

    CONSTRAINT fk_match_winner
        FOREIGN KEY (winner_team_id) REFERENCES Teams(id) ON DELETE RESTRICT,

    CONSTRAINT chk_match_diff_teams
        CHECK (team1_id <> team2_id),

    -- winner phải là 1 trong 2 đội của trận
    CONSTRAINT chk_match_winner_valid
        CHECK (winner_team_id IS NULL OR winner_team_id IN (team1_id, team2_id))
);

CREATE INDEX idx_matches_tournament   ON Matches(tournament_id);
CREATE INDEX idx_matches_state        ON Matches(state);
CREATE INDEX idx_matches_scheduled_at ON Matches(scheduled_at);
CREATE INDEX idx_matches_team1        ON Matches(team1_id);
CREATE INDEX idx_matches_team2        ON Matches(team2_id);

-- =====================
-- 7. GAMES (các ván trong 1 match Bo3/Bo5)
-- =====================
CREATE TABLE Games (
    id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    match_id        bigint      NOT NULL,
    game_number     smallint    NOT NULL CHECK (game_number >= 1),  -- ván 1, 2, 3...
    team1_id        bigint      NOT NULL,
    team2_id        bigint      NOT NULL,
    team1_kill      int         NOT NULL DEFAULT 0 CHECK (team1_kill >= 0),
    team2_kill      int         NOT NULL DEFAULT 0 CHECK (team2_kill >= 0),
    first_blood_team_id bigint,                    -- đội lấy first blood
    winner_team_id      bigint,                    -- đội thắng ván
    state           states_enum NOT NULL DEFAULT 'upcoming',
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT fk_game_match
        FOREIGN KEY (match_id) REFERENCES Matches(id) ON DELETE CASCADE,
        -- CASCADE chấp nhận được: xoá match nháp thì xoá games con.
        -- Match đã có bet sẽ bị chặn bởi RESTRICT ở BetMarkets.

    CONSTRAINT fk_game_team1
        FOREIGN KEY (team1_id) REFERENCES Teams(id) ON DELETE RESTRICT,

    CONSTRAINT fk_game_team2
        FOREIGN KEY (team2_id) REFERENCES Teams(id) ON DELETE RESTRICT,

    CONSTRAINT fk_game_first_blood
        FOREIGN KEY (first_blood_team_id) REFERENCES Teams(id) ON DELETE RESTRICT,

    CONSTRAINT fk_game_winner
        FOREIGN KEY (winner_team_id) REFERENCES Teams(id) ON DELETE RESTRICT,

    CONSTRAINT chk_game_diff_teams
        CHECK (team1_id <> team2_id),

    CONSTRAINT chk_game_first_blood_valid
        CHECK (first_blood_team_id IS NULL OR first_blood_team_id IN (team1_id, team2_id)),

    CONSTRAINT chk_game_winner_valid
        CHECK (winner_team_id IS NULL OR winner_team_id IN (team1_id, team2_id)),

    -- không trùng số thứ tự ván trong cùng 1 match
    CONSTRAINT uq_game_number UNIQUE (match_id, game_number)
);

CREATE INDEX idx_games_match ON Games(match_id);

-- =====================
-- 8. WALLETS
-- =====================
CREATE TABLE Wallets (
    id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id     bigint        NOT NULL UNIQUE,     -- mỗi user chỉ 1 ví
    balance     decimal(15,2) NOT NULL DEFAULT 0 CHECK (balance >= 0),
    updated_at  timestamptz   NOT NULL DEFAULT now(),

    CONSTRAINT fk_wallet_user
        FOREIGN KEY (user_id)
        REFERENCES Users(id)
        ON DELETE RESTRICT              -- không xoá user còn ví; dùng soft-delete
);

-- =====================
-- 9. WALLET TRANSACTIONS (append-only, KHÔNG xoá/sửa)
-- =====================
CREATE TABLE WalletTransactions (
    id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    wallet_id       bigint        NOT NULL,
    amount          decimal(15,2) NOT NULL CHECK (amount <> 0),
        -- Quy ước: dương = tiền vào (DEPOSIT/PAYOUT/REFUND),
        --          âm   = tiền ra (BET/WITHDRAW)
    type            transaction_type_enum NOT NULL,
    status          status_enum   NOT NULL DEFAULT 'pending',
    reference_type  reference_type_enum,           -- reference_id trỏ đến đâu
    reference_id    bigint,
    created_at      timestamptz   NOT NULL DEFAULT now(),

    CONSTRAINT fk_transaction_wallet
        FOREIGN KEY (wallet_id)
        REFERENCES Wallets(id)
        ON DELETE RESTRICT,             -- KHÔNG BAO GIỜ cascade dữ liệu tài chính

    -- Dấu của amount phải khớp với loại giao dịch
    CONSTRAINT chk_transaction_amount_sign CHECK (
        (type IN ('DEPOSIT', 'PAYOUT', 'REFUND') AND amount > 0)
        OR
        (type IN ('BET', 'WITHDRAW') AND amount < 0)
    )
);

CREATE INDEX idx_wallet_tx_wallet     ON WalletTransactions(wallet_id);
CREATE INDEX idx_wallet_tx_created_at ON WalletTransactions(created_at);
CREATE INDEX idx_wallet_tx_reference  ON WalletTransactions(reference_type, reference_id);

CREATE TABLE vnpay_payments (
    id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id         bigint        NOT NULL,
    txn_ref         varchar(255)  NOT NULL UNIQUE,
    amount          decimal(15,2) NOT NULL CHECK (amount > 0),
    status          status_enum   NOT NULL DEFAULT 'pending',
    response_code   varchar(10),
    created_at      timestamptz   NOT NULL DEFAULT now(),
    updated_at      timestamptz   NOT NULL DEFAULT now(),

    CONSTRAINT fk_vnpay_user
        FOREIGN KEY (user_id)
        REFERENCES Users(id)
        ON DELETE RESTRICT
);

CREATE INDEX idx_vnpay_txn_ref ON vnpay_payments(txn_ref);
CREATE INDEX idx_vnpay_user ON vnpay_payments(user_id);

-- =====================
-- 10. BET MARKETS
-- =====================
CREATE TABLE BetMarkets (
    id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    match_id        bigint             NOT NULL,
    market_type     market_type_enum   NOT NULL,
    options         jsonb              NOT NULL,   -- danh sách lựa chọn của market
    total_pool      decimal(15,2)      NOT NULL DEFAULT 0 CHECK (total_pool >= 0),
    status          market_status_enum NOT NULL DEFAULT 'open',
    result_option   text,                          -- NULL cho đến khi settle
    closes_at       timestamptz        NOT NULL,   -- thời điểm đóng nhận cược
    created_at      timestamptz        NOT NULL DEFAULT now(),
    updated_at      timestamptz        NOT NULL DEFAULT now(),

    CONSTRAINT fk_market_match
        FOREIGN KEY (match_id)
        REFERENCES Matches(id)
        ON DELETE RESTRICT              -- match có market thì không được xoá
);

CREATE INDEX idx_markets_match  ON BetMarkets(match_id);
CREATE INDEX idx_markets_status ON BetMarkets(status);

-- =====================
-- 11. ODDS (tỷ lệ cược hiện hành)
-- =====================
CREATE TABLE Odds (
    id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    market_id   bigint        NOT NULL,
    option_key  text          NOT NULL,
    odd_value   decimal(8,4)  NOT NULL CHECK (odd_value > 1),
    updated_at  timestamptz   NOT NULL DEFAULT now(),

    CONSTRAINT fk_odd_market
        FOREIGN KEY (market_id)
        REFERENCES BetMarkets(id)
        ON DELETE RESTRICT,

    -- 1 market không được có 2 dòng odds cho cùng 1 option
    CONSTRAINT uq_odds_market_option UNIQUE (market_id, option_key)
);

CREATE INDEX idx_odds_market ON Odds(market_id);

-- =====================
-- 11b. ODDS HISTORY (append-only: lưu lại mỗi lần odds thay đổi)
-- =====================
CREATE TABLE OddsHistory (
    id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    market_id   bigint        NOT NULL,
    option_key  text          NOT NULL,
    odd_value   decimal(8,4)  NOT NULL,
    changed_at  timestamptz   NOT NULL DEFAULT now(),

    CONSTRAINT fk_odds_history_market
        FOREIGN KEY (market_id)
        REFERENCES BetMarkets(id)
        ON DELETE RESTRICT
);

CREATE INDEX idx_odds_history_market ON OddsHistory(market_id, option_key, changed_at);

-- Trigger tự động ghi lịch sử mỗi khi odds được tạo/cập nhật
CREATE OR REPLACE FUNCTION fn_log_odds_change()
RETURNS trigger AS $$
BEGIN
    INSERT INTO OddsHistory (market_id, option_key, odd_value)
    VALUES (NEW.market_id, NEW.option_key, NEW.odd_value);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_odds_history
AFTER INSERT OR UPDATE OF odd_value ON Odds
FOR EACH ROW EXECUTE FUNCTION fn_log_odds_change();

-- =====================
-- 12. BETS
-- =====================
CREATE TABLE Bets (
    id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id         bigint          NOT NULL,
    market_id       bigint          NOT NULL,
    option_key      text            NOT NULL,
    amount          decimal(15,2)   NOT NULL CHECK (amount > 0),
    odd_snapshot    decimal(8,4)    NOT NULL CHECK (odd_snapshot > 1),
    potential_win   decimal(15,2)   NOT NULL CHECK (potential_win > 0),
    status          bet_status_enum NOT NULL DEFAULT 'pending',
    payout_amount   decimal(15,2)   CHECK (payout_amount IS NULL OR payout_amount >= 0),
    ip_address      inet,                          -- kiểu inet chuẩn của Postgres
    placed_at       timestamptz     NOT NULL DEFAULT now(),
    settled_at      timestamptz,                   -- NULL cho đến khi settle

    CONSTRAINT fk_bet_user
        FOREIGN KEY (user_id)
        REFERENCES Users(id)
        ON DELETE RESTRICT,             -- không xoá user còn lịch sử cược

    CONSTRAINT fk_bet_market
        FOREIGN KEY (market_id)
        REFERENCES BetMarkets(id)
        ON DELETE RESTRICT,

    -- Bet đã settle thì phải có settled_at; đang pending thì chưa có
    CONSTRAINT chk_bet_settled CHECK (
        (status = 'pending' AND settled_at IS NULL)
        OR
        (status <> 'pending' AND settled_at IS NOT NULL)
    )
);

CREATE INDEX idx_bets_user       ON Bets(user_id);
CREATE INDEX idx_bets_market     ON Bets(market_id);
CREATE INDEX idx_bets_status     ON Bets(status);
CREATE INDEX idx_bets_placed_at  ON Bets(placed_at);

-- =====================
-- TRIGGER: tự động cập nhật updated_at
-- =====================
CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON Users
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_matches_updated_at
    BEFORE UPDATE ON Matches
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_games_updated_at
    BEFORE UPDATE ON Games
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_wallets_updated_at
    BEFORE UPDATE ON Wallets
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_markets_updated_at
    BEFORE UPDATE ON BetMarkets
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- =====================
-- SEED DATA
-- =====================
-- =====================================================================
-- SAMPLE DATA cho hệ thống Esport Betting
-- Chạy SAU khi đã tạo schema (db.sql).
-- File này TRUNCATE toàn bộ bảng và nạp lại dữ liệu mẫu -> idempotent,
-- ID luôn bắt đầu từ 1 nên các quan hệ FK bên dưới đoán trước được.
--
-- Nội dung:
--   * 2 tựa game: LOL, Dota 2
--   * 2 giải: LCK 2025 (LOL) và The International 2025 / TI14 (Dota 2)
--   * 8 team thật (4 LOL + 4 Dota 2), logo_url trỏ tới trang chính thức
--   * 5 trận: gồm trận đã kết thúc, sắp diễn ra
--   * Market "match winner" cho MỌI trận + odds cho từng lựa chọn
--   * 3 tài khoản: 1 admin + 2 user, kèm ví, giao dịch, và các phiếu cược
--
-- LƯU Ý về logo_url:
--   Các wiki esports (Liquipedia/Leaguepedia) chặn truy cập tự động nên
--   không hotlink được file ảnh đã xác minh. logo_url dưới đây trỏ tới
--   TRANG CHÍNH THỨC của team. Khi lên production nên tải logo về và host
--   trên CDN/object storage của bạn (vd: https://cdn.yourapp.com/teams/t1.png)
--   thay vì hotlink trực tiếp.
-- =====================================================================

BEGIN;

-- Xoá sạch & reset identity (thứ tự không quan trọng vì CASCADE)
TRUNCATE Roles, Users, MatchTypes, Leagues, Tournaments, Teams, Matches,
         Games, Wallets, WalletTransactions, BetMarkets, Odds, OddsHistory, Bets
    RESTART IDENTITY CASCADE;

-- =====================
-- Roles (1=admin, 2=user)
-- =====================
INSERT INTO Roles (name) VALUES
    ('admin'),   -- id 1
    ('user');    -- id 2

-- =====================
-- Users (mật khẩu là bcrypt hash của 'password123' — chỉ để demo)
-- (1=admin, 2=ledat, 3=minhquan)
-- =====================
INSERT INTO Users (username, password, role_id, phone, email, is_active) VALUES
    ('admin',    '$2b$10$nt23xQxOCxcSnd7qbghzEeMayVBEj3GxOCy1jgwIMTNPQdDbVXgMa', 1, '0900000001', 'admin@betgg.vn',    TRUE),
    ('ledat',    '$2b$10$nt23xQxOCxcSnd7qbghzEeMayVBEj3GxOCy1jgwIMTNPQdDbVXgMa', 2, '0900000002', 'ledat@example.com', TRUE),
    ('minhquan', '$2b$10$nt23xQxOCxcSnd7qbghzEeMayVBEj3GxOCy1jgwIMTNPQdDbVXgMa', 2, '0900000003', 'minhquan@example.com', TRUE);

-- =====================
-- MatchTypes (tựa game) (1=LOL, 2=Dota 2)
-- =====================
INSERT INTO MatchTypes (match_type) VALUES
    ('LOL'),     -- id 1
    ('Dota 2');  -- id 2

-- =====================
-- Leagues (1=LCK, 2=The International)
-- =====================
INSERT INTO Leagues (name, slug, logo_url) VALUES
    ('League of Legends Champions Korea', 'lck', 'https://lolesports.com/en-US/leagues/lck'),
    ('The International',                  'ti',  'https://www.dota2.com/international');

-- =====================
-- Tournaments (1=LCK 2025, 2=TI 2025)
-- =====================
INSERT INTO Tournaments (league_id, name, start_date, end_date) VALUES
    (1, 'LCK 2025 Season',           '2025-01-15', '2025-09-01'),
    (2, 'The International 2025 (TI14)', '2025-09-04', '2025-09-14');

-- =====================
-- Teams (logo_url = trang chính thức của từng team)
-- LOL (LCK): 1=T1, 2=Gen.G, 3=HLE, 4=KT
-- Dota 2 (TI): 5=Falcons, 6=Xtreme, 7=Liquid, 8=Spirit
-- =====================
INSERT INTO Teams (name, code, slug, logo_url) VALUES
    ('T1',                  'T1',   't1',             'https://static.lolesports.com/teams/1726801573959_539px-T1_2019_full_allmode.png'),
    ('Gen.G Esports',       'GEN',  'geng',           'https://static.lolesports.com/teams/1773829250929_GENGLOGO_GOLD.png'),
    ('Hanwha Life Esports', 'HLE',  'hle',            'https://static.lolesports.com/teams/1631819564399_hle-2021-worlds.png'),
    ('KT Rolster',          'KT',   'kt',             'https://static.lolesports.com/teams/kt_darkbackground.png'),
    ('Team Falcons',        'FLCN', 'falcons',        'https://static.gosugamers.net/49/8d/cb/42637ee79b18bdff6c9473c0cf17d837702a2b08bcfda3d0cb6349bb09.webp'),
    ('Xtreme Gaming',       'XG',   'xtreme-gaming',  'https://liquipedia.net/commons/images/thumb/7/72/Xtreme_Gaming_%28China%29_allmode.png/201px-Xtreme_Gaming_%28China%29_allmode.png'),
    ('Team Liquid',         'TL',   'team-liquid',    'https://static.gosugamers.net/62/61/31/c51502def1d90d781d97c85872fd9a67170a32c0022dac8b1119451c9b.webp'),
    ('Team Spirit',         'TS',   'team-spirit',    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQZXxjQ7sxr2hXUGkMBbuXNvcPEbKEG3LR3nTwioj76zQ&s=10');

-- =====================
-- Matches
--   M1: T1 vs Gen.G   (LCK, Bo5) — đã kết thúc, T1 thắng 3-2
--   M2: HLE vs KT     (LCK, Bo3) — sắp diễn ra
--   M3: T1 vs HLE     (LCK, Bo3) — sắp diễn ra
--   M4: Falcons vs Xtreme (TI, Bo5) — đã kết thúc, Falcons thắng 3-2 (kết quả thật TI14)
--   M5: Liquid vs Spirit  (TI, Bo3) — sắp diễn ra
-- =====================
INSERT INTO Matches
    (match_type_id, tournament_id, block_name, team1_id, team2_id,
     team1_score, team2_score, best_of, winner_team_id, state, scheduled_at) VALUES
    (1, 1, 'Playoffs - Final',    1, 2, 3, 2, 5, 1,    'finished', '2025-08-31 17:00:00+09'),
    (1, 1, 'Regular - Week 1',    3, 4, 0, 0, 3, NULL, 'upcoming', '2026-07-12 17:00:00+09'),
    (1, 1, 'Regular - Week 1',    1, 3, 0, 0, 3, NULL, 'upcoming', '2026-07-13 17:00:00+09'),
    (2, 2, 'Playoffs - Grand Final', 5, 6, 3, 2, 5, 5, 'finished', '2025-09-14 18:00:00+02'),
    (2, 2, 'Group Stage',         7, 8, 0, 0, 3, NULL, 'upcoming', '2026-07-15 18:00:00+02');

-- =====================
-- Games (chỉ tạo cho 2 trận đã kết thúc)
--   M1 (T1 3-2 Gen.G): ván 1,3,5 T1 thắng; ván 2,4 Gen.G thắng
--   M4 (Falcons 3-2 Xtreme): ván 1,3,5 Falcons; ván 2,4 Xtreme
-- =====================
INSERT INTO Games
    (match_id, game_number, team1_id, team2_id, team1_kill, team2_kill,
     first_blood_team_id, winner_team_id, state) VALUES
    -- Match 1: T1 (1) vs Gen.G (2)
    (1, 1, 1, 2, 24, 12, 1, 1, 'finished'),
    (1, 2, 1, 2, 15, 21, 2, 2, 'finished'),
    (1, 3, 1, 2, 28, 18, 1, 1, 'finished'),
    (1, 4, 1, 2, 10, 19, 2, 2, 'finished'),
    (1, 5, 1, 2, 22, 16, 1, 1, 'finished'),
    -- Match 4: Falcons (5) vs Xtreme (6)
    (4, 1, 5, 6, 31, 20, 5, 5, 'finished'),
    (4, 2, 5, 6, 18, 25, 6, 6, 'finished'),
    (4, 3, 5, 6, 27, 14, 5, 5, 'finished'),
    (4, 4, 5, 6, 16, 23, 6, 6, 'finished'),
    (4, 5, 5, 6, 29, 21, 5, 5, 'finished');

-- =====================
-- Wallets (1=admin, 2=ledat, 3=minhquan)
-- Số dư cuối khớp với lịch sử giao dịch bên dưới.
-- =====================
INSERT INTO Wallets (user_id, balance) VALUES
    (1, 0.00),          -- admin
    (2, 515000.00),     -- ledat: 500k nạp -100k cược +165k thắng -50k cược
    (3, 800000.00);     -- minhquan: 1tr nạp -200k cược (thua)

-- =====================
-- BetMarkets (market "match winner" cho MỖI trận)
--   Trận đã xong -> status 'settled' + result_option = slug đội thắng
--   Trận sắp diễn ra -> status 'open'
-- IDs: 1..5 tương ứng M1..M5
-- =====================
INSERT INTO BetMarkets
    (match_id, market_type, options, total_pool, status, result_option, closes_at) VALUES
    (1, 'winner_team', '{"selections":["t1","geng"]}'::jsonb,          100000.00, 'settled', 't1',       '2025-08-31 17:00:00+09'),
    (2, 'winner_team', '{"selections":["hle","kt"]}'::jsonb,            50000.00, 'open',    NULL,       '2026-07-12 17:00:00+09'),
    (3, 'winner_team', '{"selections":["t1","hle"]}'::jsonb,                0.00, 'open',    NULL,       '2026-07-13 17:00:00+09'),
    (4, 'winner_team', '{"selections":["falcons","xtreme-gaming"]}'::jsonb, 200000.00, 'settled', 'falcons', '2025-09-14 18:00:00+02'),
    (5, 'winner_team', '{"selections":["team-liquid","team-spirit"]}'::jsonb, 0.00, 'open',    NULL,       '2026-07-15 18:00:00+02'),
    (2, 'first_blood', '{"selections":["hle","kt"]}'::jsonb,            10000.00, 'open',    NULL,       '2026-07-12 17:00:00+09'),
    (2, 'total_kill',  '{"selections":["over_20.5","under_20.5"]}'::jsonb, 0.00,   'open',    NULL,       '2026-07-12 17:00:00+09'),
    (2, 'most_kill',   '{"selections":["hle","kt"]}'::jsonb,                0.00, 'open',    NULL,       '2026-07-12 17:00:00+09'),
    (1, 'first_blood', '{"selections":["t1","geng"]}'::jsonb,           15000.00, 'settled', 't1',       '2025-08-31 17:00:00+09'),
    (1, 'total_kill',  '{"selections":["over_20.5","under_20.5"]}'::jsonb, 5000.00, 'settled', 'over_20.5', '2025-08-31 17:00:00+09'),
    (1, 'most_kill',   '{"selections":["t1","geng"]}'::jsonb,           12000.00, 'settled', 't1',       '2025-08-31 17:00:00+09');

-- =====================
-- Odds (mỗi market 2 lựa chọn; trigger tự ghi OddsHistory)
-- =====================
INSERT INTO Odds (market_id, option_key, odd_value) VALUES
    (1, 't1',            1.6500),
    (1, 'geng',          2.2500),
    (2, 'hle',           1.9000),
    (2, 'kt',            1.9500),
    (3, 't1',            1.4000),
    (3, 'hle',           3.0000),
    (4, 'falcons',       2.1000),
    (4, 'xtreme-gaming', 1.7500),
    (5, 'team-liquid',   1.8500),
    (5, 'team-spirit',   1.9500),
    (6, 'hle',           1.8500),
    (6, 'kt',            1.8500),
    (7, 'over_20.5',     1.9000),
    (7, 'under_20.5',    1.8000),
    (8, 'hle',           1.9000),
    (8, 'kt',            1.9000),
    (9, 't1',            1.8000),
    (9, 'geng',          1.9000),
    (10, 'over_20.5',    1.8500),
    (10, 'under_20.5',   1.8500),
    (11, 't1',           1.7500),
    (11, 'geng',         1.9500);

-- =====================
-- Bets
--   Bet 1: ledat cược T1 thắng M1 -> ĐÃ THẮNG (payout 165k)
--   Bet 2: minhquan cược Xtreme thắng M4 -> ĐÃ THUA (Falcons thắng)
--   Bet 3: ledat cược HLE thắng M2 -> ĐANG CHỜ (pending)
-- IDs: 1,2,3
-- =====================
INSERT INTO Bets
    (user_id, market_id, option_key, amount, odd_snapshot, potential_win,
     status, payout_amount, ip_address, placed_at, settled_at) VALUES
    (2, 1, 't1',            100000.00, 1.6500, 165000.00, 'won',     165000.00, '113.161.10.20', '2025-08-31 16:30:00+09', '2025-08-31 20:15:00+09'),
    (3, 4, 'xtreme-gaming', 200000.00, 1.7500, 350000.00, 'lost',    NULL,      '116.98.44.5',   '2025-09-14 17:30:00+02', '2025-09-14 22:40:00+02'),
    (2, 2, 'hle',            50000.00, 1.9000,  95000.00, 'pending', NULL,      '113.161.10.20', '2026-07-07 09:00:00+07', NULL);

-- =====================
-- WalletTransactions (append-only; dấu amount: nạp/thắng dương, cược âm)
-- reference_id trỏ tới bet tương ứng khi type = BET/PAYOUT
-- =====================
INSERT INTO WalletTransactions
    (wallet_id, amount, type, status, reference_type, reference_id, created_at) VALUES
    -- ledat (wallet 2)
    (2,  500000.00, 'DEPOSIT', 'success', 'MANUAL', NULL, '2025-08-01 10:00:00+07'),
    (2, -100000.00, 'BET',     'success', 'BET',    1,    '2025-08-31 16:30:00+09'),
    (2,  165000.00, 'PAYOUT',  'success', 'BET',    1,    '2025-08-31 20:15:00+09'),
    (2,  -50000.00, 'BET',     'success', 'BET',    3,    '2026-07-07 09:00:00+07'),
    -- minhquan (wallet 3)
    (3, 1000000.00, 'DEPOSIT', 'success', 'MANUAL', NULL, '2025-09-01 09:00:00+07'),
    (3, -200000.00, 'BET',     'success', 'BET',    2,    '2025-09-14 17:30:00+02');

-- =====================
-- Promotions
-- =====================
CREATE TABLE IF NOT EXISTS Promotions (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    subtitle TEXT NOT NULL,
    badge_text VARCHAR(100),
    quote_text TEXT,
    button_text VARCHAR(100),
    button_link VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    bonus_percentage NUMERIC DEFAULT 0,
    max_bonus NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO Promotions 
    (title, subtitle, badge_text, quote_text, button_text, button_link, is_active, bonus_percentage, max_bonus)
VALUES 
    ('DOUBLE YOUR DEPOSIT!', 'Get +100% bonus on your first top-up up to 2.000.000đ!', 'LIMITED OFFER', '🔥 HOT PROMO: Deposit now to double your balance and unlock VIP features!', 'CLAIM 100% BONUS NOW', 'Deposit', true, 100, 2000000),
    ('WELCOME BONUS 50%', 'Get 50% extra on your first deposit up to 500.000đ. New members only!', 'NEW MEMBER', '🎮 Join 50,000+ bettors already winning on BetGG! Your esports journey starts here.', 'CLAIM 50% BONUS', 'Deposit', true, 50, 500000),
    ('VIP RELOAD BONUS', 'Every Monday get +30% on your deposit. VIP Level 2+ only.', 'WEEKLY OFFER', '💎 VIP members earned 3x more last month. Upgrade and reload today!', 'RELOAD NOW', 'Deposit', true, 30, 1000000),
    ('FREE BET FRIDAY', 'Place a bet of 100.000đ+ on any LOL match and get a 50.000đ free bet token.', 'EVERY FRIDAY', '⚡ Last Friday: 2,341 free bets claimed. Don''t miss out this week!', 'GET FREE BET', 'ScheduleStack', true, 0, 0),
    ('REFER A FRIEND', 'Invite a friend and earn 100.000đ when they make their first deposit of 200.000đ+.', 'REFERRAL', '👥 Top referrer earned 5,000,000đ this month. Start sharing now!', 'SHARE LINK', 'Deposit', true, 0, 0),
    ('CASHBACK MONDAY', 'Lost last week? Get 10% cashback on net losses up to 2.000.000đ every Monday.', 'CASHBACK', '🛡️ We''ve got your back. 10% cashback keeps you in the game even on bad days.', 'ACTIVATE CASHBACK', 'Deposit', true, 10, 2000000);

-- =====================
-- UserPromotions
-- =====================
CREATE TABLE IF NOT EXISTS UserPromotions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES Users(id),
    promotion_id INTEGER NOT NULL REFERENCES Promotions(id),
    status VARCHAR(50) DEFAULT 'used',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    used_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, promotion_id)
);

INSERT INTO UserPromotions (user_id, promotion_id) 
VALUES (2, 1); -- Simulate user ledat (id=2) having already claimed promotion 1

COMMIT;

select * from users