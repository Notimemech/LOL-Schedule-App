-- USE master;
-- GO

-- IF EXISTS (SELECT name FROM sys.databases WHERE name = N'BettingApp')
-- BEGIN
--     ALTER DATABASE BettingApp SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
--     DROP DATABASE BettingApp;
-- END
-- GO

-- CREATE DATABASE BettingApp;
-- GO

-- USE BettingApp;
-- GO

create type states_enum as enum ('upcoming', 'finished', 'cancelled', 'happening');
create type status_enum as enum ('pending', 'successed', 'failed', 'cancelled');
create type market_type_enum as enum ('winner_team', 'first_blood', 'total_kill', 'average_kill', 'most_kill');
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

create type bet_status_enum as enum ('pending', 'won', 'lost', 'cancelled', 'cashout');

-- 1. Bảng Users
create table Users(
	id bigint generated always as identity primary key,
	username varchar(50) not null,
	password varchar(50) not null,
	phone varchar(20),
	email varchar(100) not null,
	is_active boolean not null default 'TRUE'
);

-- 2. Bảng MatchType
create table MatchType(
	id bigint generated always as identity primary key,
	match_type varchar(20) not null
);

-- 3. Bảng Tournaments
create table Tournaments(
	id bigint generated always as identity primary key,
	name varchar(255) not null
);

-- 4. Bảng Leagues
create table Leagues(
	id bigint generated always as identity primary key,
	name varchar(255) not null,
	slug varchar(100) not null
);

-- 5. Bảng Teams
create table Teams(
	id bigint generated always as identity primary key,
	name varchar(255) not null,
	code varchar(10) not null,
	slug varchar(100) not null,
	logo_url text not null
);

-- 6. Bảng Matches
create table Matches(
	id bigint generated always as identity primary key,
	tournament_id bigint not null,
	league_id bigint not null,
	block_name varchar(50) not null,
	team1_id bigint not null,
	team2_id bigint not null,
	team1_score int not null default 0,
	team2_score int not null default 0,
	winner_slug varchar(20),
	state states_enum not null,

	CONSTRAINT fk_tournament_match
        FOREIGN KEY (tournament_id)
        REFERENCES tournaments(id)
        ON DELETE CASCADE,

	CONSTRAINT fk_league_match
        FOREIGN KEY (league_id)
        REFERENCES leagues(id)
        ON DELETE CASCADE,
		
	CONSTRAINT fk_team1_match
        FOREIGN KEY (team1_id)
        REFERENCES teams(id)
        ON DELETE CASCADE,
		
	CONSTRAINT fk_team2_match
        FOREIGN KEY (team2_id)
        REFERENCES teams(id)
        ON DELETE CASCADE
);

-- 7. Bảng Games
create table Games(
	id bigint generated always as identity primary key,
	match_id bigint not null,
	team1_id bigint not null,
	team2_id bigint not null,
	team1_kill int not null default 0,
	team2_kill int not null default 0,
	first_blood bigint,
	winner_team bigint,
	state states_enum not null,

	CONSTRAINT fk_match_game
        FOREIGN KEY (match_id)
        REFERENCES matches(id)
        ON DELETE CASCADE,
		
	CONSTRAINT fk_team1_game
        FOREIGN KEY (team1_id)
        REFERENCES teams(id)
        ON DELETE CASCADE,
		
	CONSTRAINT fk_team2_game
        FOREIGN KEY (team2_id)
        REFERENCES teams(id)
        ON DELETE CASCADE
);

-- 8. Bảng Wallet
create table Wallets(
	id bigint generated always as identity primary key,
	user_id bigint not null,
	balance decimal(15,2) not null default 0,

	CONSTRAINT fk_user_wallet
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- 9. Bảng WalletTransaction
create table WalletTransaction(
	id bigint generated always as identity primary key,
	wallet_id bigint not null,
	amount decimal(15,2) not null,
	type transaction_type_enum not null,  --'PAYOUT' | BET | DEPOSIT
	created_at timestamptz not null default now(),
	status status_enum not null,
	reference_id bigint,

	CONSTRAINT fk_wallet_transaction_wallet
        FOREIGN KEY (wallet_id)
        REFERENCES wallets(id)
        ON DELETE CASCADE
);

-- 10. Bảng BetMarkets
create table BetMarkets(
	id bigint generated always as identity primary key,
	match_id bigint not null,
	market_type market_type_enum not null,
	option jsonb not null,
	total_pool decimal(15,2) not null default 0,
	status market_status_enum not null,
	result_option text,
	closed_at timestamptz not null default now(),
	
	CONSTRAINT fk_market_match
        FOREIGN KEY (match_id)
        REFERENCES matches(id)
        ON DELETE CASCADE
);

-- 11. Bảng Odd
create table Odds(
	id bigint generated always as identity primary key,
	market_id bigint not null,
	options_key text not null,
	odd_value decimal(8,4) not null,
	updated_at timestamptz not null default now(),

	CONSTRAINT fk_odd_market
        FOREIGN KEY (market_id)
        REFERENCES betmarkets(id)
        ON DELETE CASCADE
);

-- 12. Bảng Bets
create table Bets(
	id bigint generated always as identity primary key,
	user_id bigint not null,
	market_id bigint not null,
	option_key text not null,
	amount decimal(15,2) not null default 0,
	odd_snapshot decimal(8,4) not null,
	potential_win decimal(15,2) not null,
	status bet_status_enum not null,
	payout_amount decimal(15,2),
	ip_address text,

	CONSTRAINT fk_bet_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

	CONSTRAINT fk_bet_market
        FOREIGN KEY (market_id)
        REFERENCES betmarkets(id)
        ON DELETE CASCADE
)