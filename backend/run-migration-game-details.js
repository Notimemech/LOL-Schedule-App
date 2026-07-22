import { pool } from './src/config/db.config.js';
import dotenv from 'dotenv';
dotenv.config();

// Game detail feature: players, per-game player stats (incl. MVP),
// key events (first blood / towers / objectives) and team gold.
// Run once: node run-migration-game-details.js
const runMigration = async () => {
    try {
        console.log('Running game-details migration...');
        const sql = `
            CREATE TABLE IF NOT EXISTS Players (
                id            bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                team_id       bigint NOT NULL,
                in_game_name  text   NOT NULL,
                real_name     text,
                role          text   NOT NULL,
                country       text,
                created_at    timestamptz NOT NULL DEFAULT now(),

                CONSTRAINT fk_player_team
                    FOREIGN KEY (team_id) REFERENCES Teams(id) ON DELETE CASCADE,
                CONSTRAINT uq_player_team_name UNIQUE (team_id, in_game_name)
            );
            CREATE INDEX IF NOT EXISTS idx_players_team ON Players(team_id);

            CREATE TABLE IF NOT EXISTS GamePlayerStats (
                id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                game_id     bigint NOT NULL,
                player_id   bigint NOT NULL,
                team_id     bigint NOT NULL,
                champion    text,
                kills       int NOT NULL DEFAULT 0 CHECK (kills >= 0),
                deaths      int NOT NULL DEFAULT 0 CHECK (deaths >= 0),
                assists     int NOT NULL DEFAULT 0 CHECK (assists >= 0),
                is_mvp      boolean NOT NULL DEFAULT false,

                CONSTRAINT fk_gps_game
                    FOREIGN KEY (game_id) REFERENCES Games(id) ON DELETE CASCADE,
                CONSTRAINT fk_gps_player
                    FOREIGN KEY (player_id) REFERENCES Players(id) ON DELETE CASCADE,
                CONSTRAINT uq_gps_game_player UNIQUE (game_id, player_id)
            );
            CREATE INDEX IF NOT EXISTS idx_gps_game ON GamePlayerStats(game_id);

            CREATE TABLE IF NOT EXISTS GameEvents (
                id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                game_id     bigint NOT NULL,
                event_type  text   NOT NULL,
                team_id     bigint,
                game_minute int,
                description text,

                CONSTRAINT fk_ge_game
                    FOREIGN KEY (game_id) REFERENCES Games(id) ON DELETE CASCADE
            );
            CREATE INDEX IF NOT EXISTS idx_ge_game ON GameEvents(game_id, game_minute);

            ALTER TABLE Games ADD COLUMN IF NOT EXISTS team1_gold int NOT NULL DEFAULT 0;
            ALTER TABLE Games ADD COLUMN IF NOT EXISTS team2_gold int NOT NULL DEFAULT 0;
        `;

        await pool.query(sql);
        console.log('Game-details migration completed.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
};

runMigration();
