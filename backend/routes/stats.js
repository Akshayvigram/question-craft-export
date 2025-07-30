const express = require('express');

module.exports = (db, config) => {
  const router = express.Router();

  router.get('/stats', async (req, res) => {
    try {
      const [userRows] = await db.promise().query('SELECT COUNT(*) as count FROM users');
      const [paperRows] = await db.promise().query('SELECT COUNT(*) as count FROM question_papers');
      
      const activeUsers = userRows[0]?.count || 0;
      const totalPapers = paperRows[0]?.count || 0;

      const avgTime = 3;
      const satisfaction = 98;
      res.json({
        totalPapers,
        activeUsers,
        avgTime,
        satisfaction,
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
      res.status(500).json({ error: 'Failed to fetch stats' });
    }
  });

  return router;
};