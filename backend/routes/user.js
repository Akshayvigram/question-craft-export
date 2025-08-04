// routes/user.js
const express = require('express');
const router = express.Router();



module.exports = function(db) {
// 🔹 Create a new user
router.post('/create', async (req, res) => {
  const { name, email, role } = req.body;

  if (!name || !email || !role) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const query = `INSERT INTO users (name, email, role, created_at, updated_at, is_active) VALUES (?, ?, ?, NOW(), NOW(), 1)`;
    await db.query(query, [name, email, role]);
    res.json({ message: 'User created successfully' });
  } catch (err) {
    console.error('Create user error:', err);
    res.status(500).json({ message: 'Failed to create user' });
  }
});

// 🔹 Update user
router.put('/update/:id', async (req, res) => {
  const { name, email, role } = req.body;
  const userId = req.params.id;

  if (!name || !email || !role) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const query = `UPDATE users SET name = ?, email = ?, role = ?, updated_at = NOW() WHERE id = ?`;
    await db.query(query, [name, email, role, userId]);
    res.json({ message: 'User updated successfully' });
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ message: 'Failed to update user' });
  }
});

// 🔹 Delete user
router.delete('/delete/:id', async (req, res) => {
  const userId = req.params.id;

  try {
    const query = `DELETE FROM users WHERE id = ?`;
    await db.query(query, [userId]);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ message: 'Failed to delete user' });
  }
});

// routes/user.js
router.get('/list', async (req, res) => {
  try {
    const users = await db.query(`
      SELECT id, name, email, role, created_at, updated_at 
      FROM users 
      ORDER BY created_at DESC
    `);

    res.json(users);
  } catch (err) {
    console.error('List users error:', err);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});


return router;
};
