import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { dbRun, dbGet, dbTransaction } from '../database.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

const COIN_VALUES = {
  small: 5,
  medium: 10,
  large: 15,
};

// POST /api/machine/generate-qr
router.post('/generate-qr', (req, res) => {
  try {
    const { bottle_capacity } = req.body;

    if (!bottle_capacity || !COIN_VALUES[bottle_capacity]) {
      return res.status(400).json({ success: false, message: 'Invalid bottle capacity. Use small, medium, or large.' });
    }

    const token = uuidv4();
    const coinsValue = COIN_VALUES[bottle_capacity];
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 5 * 60 * 1000);

    dbRun(
      'INSERT INTO machine_sessions (qr_token, bottle_capacity, coins_value, expires_at) VALUES (?, ?, ?, ?)',
      [token, bottle_capacity, coinsValue, expiresAt.toISOString()]
    );

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    res.status(201).json({
      success: true,
      data: {
        token,
        coins_value: coinsValue,
        bottle_capacity,
        expires_at: expiresAt.toISOString(),
        qr_url: `${frontendUrl}/claim?token=${token}`,
      },
      message: 'QR session created'
    });
  } catch (err) {
    console.error('Generate QR error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/machine/session/:token
router.get('/session/:token', (req, res) => {
  try {
    const session = dbGet('SELECT * FROM machine_sessions WHERE qr_token = ?', [req.params.token]);

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    if (session.status === 'claimed') {
      return res.json({ success: false, message: 'claimed', data: session });
    }

    const now = new Date();
    const expiresAt = new Date(session.expires_at);
    if (now > expiresAt) {
      return res.json({ success: false, message: 'expired', data: session });
    }

    res.json({ success: true, data: session });
  } catch (err) {
    console.error('Session lookup error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/machine/claim
router.post('/claim', authenticateToken, (req, res) => {
  try {
    const { token } = req.body;
    const userId = req.user.id;

    if (!token) {
      return res.status(400).json({ success: false, message: 'Token is required' });
    }

    const session = dbGet('SELECT * FROM machine_sessions WHERE qr_token = ?', [token]);

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    if (session.status === 'claimed') {
      return res.status(400).json({ success: false, message: 'Already claimed' });
    }

    const now = new Date();
    const expiresAt = new Date(session.expires_at);
    if (now > expiresAt) {
      return res.status(400).json({ success: false, message: 'QR code expired' });
    }

    // Atomic transaction
    dbTransaction(() => {
      dbRun('UPDATE machine_sessions SET status = ?, claimed_by = ? WHERE id = ?',
        ['claimed', userId, session.id]);

      dbRun('UPDATE users SET coins = coins + ? WHERE id = ?',
        [session.coins_value, userId]);

      dbRun(
        'INSERT INTO transactions (sender_id, receiver_id, type, coins, bottle_capacity, note) VALUES (NULL, ?, ?, ?, ?, ?)',
        [userId, 'credit', session.coins_value, session.bottle_capacity, `Bottle recycled: ${session.bottle_capacity}`]
      );
    });

    const updatedUser = dbGet('SELECT coins FROM users WHERE id = ?', [userId]);

    res.json({
      success: true,
      data: {
        coins_earned: session.coins_value,
        new_balance: updatedUser.coins,
        bottle_capacity: session.bottle_capacity,
      },
      message: 'Coins claimed successfully!'
    });
  } catch (err) {
    console.error('Claim error:', err);
    res.status(500).json({ success: false, message: 'Server error during claim' });
  }
});

export default router;
