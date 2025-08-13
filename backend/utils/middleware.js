function createTokenAuthMiddleware(db) {
  return async function tokenAuth(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization header missing or invalid.' });
    }

    try {
      const token = authHeader.split(' ')[1];
      const decodedToken = Buffer.from(token, 'base64').toString('utf-8');
      const query = 'SELECT id, name, api_token FROM users WHERE api_token = ?';
      const result = await db.query(query, [decodedToken]);
      const rows = result.rows || result;
      
      if (rows.length === 0) {
        return res.status(401).json({ message: 'Invalid or expired token.' });
      }
      const user = rows[0];
      req.user = user;
      next();
    } catch (error) {
      console.error('Token Auth Error:', error.message);
      return res.status(500).json({ message: 'Internal server error during authentication.' });
    }
  };
}

module.exports = createTokenAuthMiddleware;
