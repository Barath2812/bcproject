const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');

exports.loginUser = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // Check if user exists
      const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      if (user.rows.length === 0) {
        return res.status(400).json({ error: 'Invalid email or password' });
      }
  
      // Compare password
      const isMatch = await bcrypt.compare(password, user.rows[0].password_hash);
      if (!isMatch) {
        return res.status(400).json({ error: 'Invalid email or password' });
      }
  
      // Generate JWT
      const token = jwt.sign({ id: user.rows[0].id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  
      res.json({ token, user: { id: user.rows[0].id, name: user.rows[0].name, email: user.rows[0].email } });
    } catch (err) {
      console.error('Error logging in:', err);
      res.status(500).json({ error: 'Server error' });
    }
  };
  