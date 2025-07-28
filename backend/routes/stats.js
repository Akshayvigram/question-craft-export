const express = require('express');
const cors = require('cors');
const db = require('../awsdb');
require("dotenv").config();
const router = express.Router();
const app = express();
router.get('/stats', async (req, res) => {
    try {
      const [users] = await db.promise().query('SELECT COUNT(*) as count FROM users');
      const [papers] = await db.promise().query('SELECT COUNT(*) as count FROM question_papers');
      const avgTime = 3;
      const satisfaction = 98;
      res.json({
        totalPapers: papers[0].count,
        activeUsers: users[0].count,
        avgTime,
        satisfaction,
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
      res.status(500).json({ error: 'Failed to fetch stats' });
    }
  });
module.exports = router;