INSERT INTO Promotions (title, subtitle, badge_text, quote_text, button_text, button_link, result_label_1, result_val_1, result_label_2, result_val_2, result_label_3, result_val_3, bonus_percentage, max_bonus, is_active)
VALUES
  (
    'WELCOME BONUS 50%',
    'Get 50% extra on your first deposit up to 500,000d. New members only!',
    'NEW MEMBER',
    'Join 50,000+ bettors already winning on BetGG! Your journey starts here.',
    'CLAIM 50% BONUS',
    'Deposit',
    'NEW USERS TODAY', '1,247',
    'AVG FIRST BET', '150,000d',
    'WIN RATE', '61%',
    50, 500000, true
  ),
  (
    'VIP RELOAD BONUS',
    'Every Monday get +30% on your deposit. VIP Level 2+ only.',
    'WEEKLY OFFER',
    'VIP members earned 3x more last month. Upgrade and reload today!',
    'RELOAD NOW',
    'Deposit',
    'PAID OUT TODAY', '48,000,000d',
    'ACTIVE VIPS', '892',
    'TOP WIN', '12,000,000d',
    30, 1000000, true
  ),
  (
    'FREE BET FRIDAY',
    'Place a bet of 100,000d+ on any LOL match and get a 50,000d free bet token.',
    'EVERY FRIDAY',
    'Last Friday: 2,341 free bets claimed. Do not miss out this week!',
    'GET FREE BET',
    'ScheduleStack',
    'FREE BETS GIVEN', '2,341',
    'MATCHES TODAY', '18',
    'BIGGEST WIN', '8,500,000d',
    0, 0, true
  ),
  (
    'REFER A FRIEND',
    'Invite a friend and earn 100,000d when they make their first deposit of 200,000d+.',
    'REFERRAL',
    'Top referrer earned 5,000,000d this month. Start sharing now!',
    'SHARE & EARN',
    'Deposit',
    'REFERRALS THIS MONTH', '456',
    'TOTAL PAID OUT', '45,600,000d',
    'YOUR POTENTIAL', '100,000d/friend',
    0, 0, true
  ),
  (
    'CASHBACK MONDAY',
    'Lost last week? Get 10% cashback on net losses up to 2,000,000d every Monday.',
    'CASHBACK',
    'We have got your back. 10% cashback keeps you in the game even on bad days.',
    'ACTIVATE CASHBACK',
    'Deposit',
    'CASHBACK PAID', '28,000,000d',
    'USERS PROTECTED', '3,210',
    'MAX CASHBACK', '2,000,000d',
    10, 2000000, true
  ),
  (
    'LCK SPECIAL ODDS BOOST',
    'Get boosted odds on all LCK Summer 2026 matches this weekend only!',
    'ODDS BOOST',
    'T1 vs GEN.G - the most anticipated match of 2026. Bet with boosted odds!',
    'BET WITH BOOST',
    'ScheduleStack',
    'ODDS BOOST', 'Up to 2.5x',
    'LCK MATCHES', '8 this weekend',
    'TOTAL PRIZE POOL', '200,000,000d',
    0, 0, true
  );
