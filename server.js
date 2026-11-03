const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_dopgS9aw0WUs@ep-long-cell-arvvjp4f-pooler.c-4.us-west-2.aws.neon.tech/neondb?sslmode=require',
  ssl: { rejectUnauthorized: false }
});

app.get('/leaderboard', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT player, MAX(score) as score 
      FROM leaderboard 
      GROUP BY player 
      ORDER BY score DESC 
      LIMIT 10
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка базы данных' });
  }
});

app.post('/leaderboard', async (req, res) => {
  const { player, score } = req.body;
  if (!player || !score) return res.status(400).json({ error: 'Нужны имя и счет' });

  try {
    await pool.query(
      'INSERT INTO leaderboard (player, score) VALUES ($1, $2)',
      [player, score]
    );
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка базы данных' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
