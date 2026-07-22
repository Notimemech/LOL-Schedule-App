import { pool } from '../src/config/db.config.js';
import dotenv from 'dotenv';
dotenv.config();

// Populates Players (real 2025 rosters), then generates per-game player
// stats, key events and team gold for every FINISHED game.
// Deterministic (seeded PRNG per game id) so re-runs produce identical data.
// Run once after run-migration-game-details.js:
//   node scripts/populate-game-details.js

// ===== Rosters (LCK 2025 per lol.fandom.com/wiki/LCK/2025_Season) =====
const LOL_ROLES = ['TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT'];
const DOTA_ROLES = ['CARRY', 'MID', 'OFFLANE', 'SOFT SUPPORT', 'HARD SUPPORT'];

const ROSTERS = {
  // team_id: [game, [players...]]
  1: ['LOL', ['Doran', 'Oner', 'Faker', 'Gumayusi', 'Keria']],            // T1
  2: ['LOL', ['Kiin', 'Canyon', 'Chovy', 'Ruler', 'Duro']],               // GEN
  3: ['LOL', ['Zeus', 'Peanut', 'Zeka', 'Viper', 'Delight']],             // HLE
  4: ['LOL', ['PerfecT', 'Cuzz', 'Bdd', 'deokdam', 'Way']],               // KT
  9: ['LOL', ['Rich', 'Sponge', 'Ucal', 'Teddy', 'Andil']],               // DRX
  10: ['LOL', ['Bin', 'Xun', 'Knight', 'Elk', 'ON']],                     // BLG
  11: ['LOL', ['Ale', 'Jiejie', 'Fisher', 'Leave', 'Meiko']],             // EDG
  12: ['LOL', ['Fudge', 'Blaber', 'Jojopyun', 'Berserker', 'Vulcan']],    // C9
  5: ['DOTA', ['skiter', 'Malr1ne', 'ATF', 'Cr1t-', 'Sneyking']],         // FLCN
  6: ['DOTA', ['Ame', 'Xm', 'Xxs', 'XinQ', 'Dy']],                        // XG
  7: ['DOTA', ['miCKe', 'Nisha', '33', 'Boxi', 'Insania']],               // TL
  8: ['DOTA', ['Yatoro', 'Larl', 'Collapse', 'Mira', 'Miposhka']],        // TS
  13: ['DOTA', ['Timado', 'bzm', 'Wisper', 'Ari', 'Fly']],                // OG
  14: ['DOTA', ['shiro', 'NothingToSay', 'niu', 'planet', 'y`']],         // LGD
  15: ['DOTA', ['Crystallis', 'Topson', '9Class', 'Saksa', 'Whitemon']],  // TNDR
  16: ['DOTA', ['Gunnar', 'Copy', 'Moo', 'Lelis', 'Fata']],               // NOUNS
};

const LOL_CHAMPS = {
  TOP: ['Aatrox', "K'Sante", 'Jax', 'Gnar', 'Rumble'],
  JUNGLE: ['Viego', 'Sejuani', 'Maokai', 'Lee Sin', 'Vi'],
  MID: ['Azir', 'Ahri', 'Orianna', 'Sylas', 'Taliyah'],
  ADC: ['Jinx', 'Kaisa', 'Varus', 'Ezreal', 'Xayah'],
  SUPPORT: ['Rell', 'Rakan', 'Nautilus', 'Renata', 'Alistar'],
};
const DOTA_HEROES = {
  CARRY: ['Faceless Void', 'Morphling', 'Terrorblade', 'Juggernaut', 'Luna'],
  MID: ['Storm Spirit', 'Puck', 'Invoker', 'Ember Spirit', 'Pangolier'],
  OFFLANE: ['Mars', 'Tidehunter', 'Axe', 'Doom', 'Beastmaster'],
  'SOFT SUPPORT': ['Rubick', 'Tusk', 'Earth Spirit', 'Snapfire', 'Mirana'],
  'HARD SUPPORT': ['Crystal Maiden', 'Lion', 'Disruptor', 'Witch Doctor', 'Oracle'],
};

// Deterministic PRNG so seed data is stable across runs.
const mulberry32 = (seed) => () => {
  seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

// Split `total` kills across 5 players with role weights (carry/mid heavy).
const splitKills = (total, rand) => {
  const weights = [0.18, 0.16, 0.24, 0.32, 0.10].map(w => w * (0.7 + rand() * 0.6));
  const sum = weights.reduce((a, b) => a + b, 0);
  const raw = weights.map(w => Math.floor((w / sum) * total));
  let rest = total - raw.reduce((a, b) => a + b, 0);
  while (rest > 0) { raw[Math.floor(rand() * 5)] += 1; rest -= 1; }
  return raw;
};

const run = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Players
    const playerIds = {}; // team_id -> [{id, name, role}]
    for (const [teamId, [gameType, names]] of Object.entries(ROSTERS)) {
      const roles = gameType === 'LOL' ? LOL_ROLES : DOTA_ROLES;
      playerIds[teamId] = [];
      for (let i = 0; i < names.length; i++) {
        const { rows } = await client.query(
          `INSERT INTO players (team_id, in_game_name, role)
           VALUES ($1, $2, $3)
           ON CONFLICT (team_id, in_game_name) DO UPDATE SET role = EXCLUDED.role
           RETURNING id, in_game_name, role`,
          [teamId, names[i], roles[i]]
        );
        playerIds[teamId].push(rows[0]);
      }
    }
    console.log('Players seeded.');

    // 2. Per-game stats + events + gold for finished games
    const { rows: games } = await client.query(`
        SELECT g.*, mt.match_type
        FROM games g
        JOIN matches m ON g.match_id = m.id
        JOIN matchtypes mt ON m.match_type_id = mt.id
        WHERE g.state = 'finished'
        ORDER BY g.id`);

    for (const game of games) {
      const rand = mulberry32(Number(game.id) * 7919);
      const isLol = game.match_type.toUpperCase().includes('LOL');
      const champPool = isLol ? LOL_CHAMPS : DOTA_HEROES;

      // Wipe previous generated rows so the script is idempotent.
      await client.query('DELETE FROM gameplayerstats WHERE game_id = $1', [game.id]);
      await client.query('DELETE FROM gameevents WHERE game_id = $1', [game.id]);

      // Gold: scale with kills, winner slightly ahead.
      const goldFor = (kills, won) =>
        Math.round((42000 + kills * 850 + rand() * 6000 + (won ? 5000 : 0)) / 100) * 100;
      const t1Won = Number(game.winner_team_id) === Number(game.team1_id);
      const team1Gold = goldFor(game.team1_kill, t1Won);
      const team2Gold = goldFor(game.team2_kill, !t1Won);
      const fbTeam = game.first_blood_team_id ||
        (rand() < 0.6 ? game.winner_team_id : (t1Won ? game.team2_id : game.team1_id));
      await client.query(
        `UPDATE games SET team1_gold = $1, team2_gold = $2, first_blood_team_id = $3 WHERE id = $4`,
        [team1Gold, team2Gold, fbTeam, game.id]
      );

      // Player stats
      let mvpCandidate = null;
      for (const [teamId, oppKills, ownKills] of [
        [game.team1_id, game.team2_kill, game.team1_kill],
        [game.team2_id, game.team1_kill, game.team2_kill],
      ]) {
        const roster = playerIds[teamId];
        if (!roster) continue;
        const kills = splitKills(ownKills, rand);
        const deaths = splitKills(oppKills, rand).reverse();
        for (let i = 0; i < roster.length; i++) {
          const p = roster[i];
          const assists = Math.round(ownKills * (0.25 + rand() * 0.45));
          const champs = champPool[p.role] || ['Unknown'];
          const champion = champs[Math.floor(rand() * champs.length)];
          await client.query(
            `INSERT INTO gameplayerstats (game_id, player_id, team_id, champion, kills, deaths, assists)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [game.id, p.id, teamId, champion, kills[i], deaths[i], assists]
          );
          // MVP = best score on the winning team.
          if (Number(teamId) === Number(game.winner_team_id)) {
            const score = kills[i] * 3 + assists - deaths[i];
            if (!mvpCandidate || score > mvpCandidate.score) {
              mvpCandidate = { playerId: p.id, score };
            }
          }
        }
      }
      if (mvpCandidate) {
        await client.query(
          `UPDATE gameplayerstats SET is_mvp = true WHERE game_id = $1 AND player_id = $2`,
          [game.id, mvpCandidate.playerId]
        );
      }

      // Key events timeline
      const teamCode = async (id) =>
        (await client.query('SELECT code FROM teams WHERE id = $1', [id])).rows[0]?.code || 'Team';
      const winCode = await teamCode(game.winner_team_id);
      const loseTeam = t1Won ? game.team2_id : game.team1_id;
      const loseCode = await teamCode(loseTeam);
      const fbCode = await teamCode(fbTeam);

      const events = [];
      events.push({
        type: 'FIRST_BLOOD', team: fbTeam,
        minute: 2 + Math.floor(rand() * 5),
        desc: `${fbCode} drew first blood`,
      });

      const towerNames = isLol
        ? ['top outer turret', 'mid outer turret', 'bot outer turret', 'mid inner turret', 'top inhibitor turret', 'mid nexus turret']
        : ['top tier-1 tower', 'mid tier-1 tower', 'bot tier-1 tower', 'mid tier-2 tower', 'top tier-3 tower', 'mid tier-4 tower'];
      const towerCount = 4 + Math.floor(rand() * 3);
      let minute = 8 + Math.floor(rand() * 4);
      for (let i = 0; i < towerCount; i++) {
        const byWinner = rand() < 0.7;
        events.push({
          type: 'TOWER', team: byWinner ? game.winner_team_id : loseTeam,
          minute,
          desc: `${byWinner ? winCode : loseCode} destroyed the ${towerNames[i % towerNames.length]}`,
        });
        minute += 3 + Math.floor(rand() * 5);
      }

      const objectives = isLol
        ? [['DRAGON', 'secured the Infernal Drake'], ['HERALD', 'secured the Rift Herald'], ['DRAGON', 'secured the Ocean Drake'], ['BARON', 'secured Baron Nashor'], ['ELDER', 'secured the Elder Dragon']]
        : [['ROSHAN', 'killed Roshan (Aegis of the Immortal)'], ['TORMENTOR', 'killed the Tormentor'], ['ROSHAN', 'killed second Roshan']];
      const objCount = isLol ? 3 + Math.floor(rand() * 3) : 2 + Math.floor(rand() * 2);
      minute = 14 + Math.floor(rand() * 4);
      for (let i = 0; i < objCount; i++) {
        const byWinner = rand() < 0.75;
        const [type, desc] = objectives[i % objectives.length];
        events.push({
          type, team: byWinner ? game.winner_team_id : loseTeam,
          minute,
          desc: `${byWinner ? winCode : loseCode} ${desc}`,
        });
        minute += 5 + Math.floor(rand() * 6);
      }

      events.push({
        type: 'GAME_END', team: game.winner_team_id,
        minute: Math.max(minute, 28 + Math.floor(rand() * 12)),
        desc: `${winCode} won game ${game.game_number}`,
      });

      events.sort((a, b) => a.minute - b.minute);
      for (const e of events) {
        await client.query(
          `INSERT INTO gameevents (game_id, event_type, team_id, game_minute, description)
           VALUES ($1, $2, $3, $4, $5)`,
          [game.id, e.type, e.team, e.minute, e.desc]
        );
      }
    }

    await client.query('COMMIT');
    console.log(`Generated stats/events/gold for ${games.length} finished games.`);
    process.exit(0);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Populate failed:', err);
    process.exit(1);
  } finally {
    client.release();
  }
};

run();
