import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { dbRun, dbGet, dbAll, dbTransaction } from '../database.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

// GET /api/user/profile
router.get('/profile', authenticateToken, (req, res) => {
  try {
    const user = dbGet('SELECT id, usn, name, email, coins, branch, year, role, created_at FROM users WHERE id = ?', [req.user.id]);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, data: { user } });
  } catch (err) {
    console.error('Profile error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/user/transactions
router.get('/transactions', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;

    const transactions = dbAll(`
      SELECT 
        t.*,
        sender.name as sender_name,
        sender.usn as sender_usn,
        receiver.name as receiver_name,
        receiver.usn as receiver_usn
      FROM transactions t
      LEFT JOIN users sender ON t.sender_id = sender.id
      LEFT JOIN users receiver ON t.receiver_id = receiver.id
      WHERE t.sender_id = ? OR t.receiver_id = ?
      ORDER BY t.created_at DESC
    `, [userId, userId]);

    res.json({ success: true, data: { transactions } });
  } catch (err) {
    console.error('Transactions error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/user/transfer
router.post('/transfer', authenticateToken, async (req, res) => {
  try {
    const { receiver_usn, coins, pin } = req.body;
    const senderId = req.user.id;

    if (!receiver_usn || !coins || !pin) {
      return res.status(400).json({ success: false, message: 'Receiver USN, coins, and PIN are required' });
    }

    const coinsAmount = parseInt(coins, 10);
    if (isNaN(coinsAmount) || coinsAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid coin amount' });
    }

    const sender = dbGet('SELECT * FROM users WHERE id = ?', [senderId]);
    if (!sender) return res.status(404).json({ success: false, message: 'Sender not found' });

    const pinMatch = await bcrypt.compare(pin, sender.pin_hash);
    if (!pinMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect PIN' });
    }

    if (sender.coins < coinsAmount) {
      return res.status(400).json({ success: false, message: 'Insufficient balance' });
    }

    const upperUSN = receiver_usn.toUpperCase();
    const receiver = dbGet('SELECT * FROM users WHERE usn = ?', [upperUSN]);
    if (!receiver) {
      return res.status(404).json({ success: false, message: 'Receiver not found' });
    }

    if (receiver.id === senderId) {
      return res.status(400).json({ success: false, message: 'Cannot transfer to yourself' });
    }

    dbTransaction(() => {
      dbRun('UPDATE users SET coins = coins - ? WHERE id = ?', [coinsAmount, senderId]);
      dbRun('UPDATE users SET coins = coins + ? WHERE id = ?', [coinsAmount, receiver.id]);

      dbRun(
        'INSERT INTO transactions (sender_id, receiver_id, type, coins, note) VALUES (?, ?, ?, ?, ?)',
        [senderId, receiver.id, 'transfer_sent', coinsAmount, `Transfer to ${receiver.name}`]
      );

      dbRun(
        'INSERT INTO transactions (sender_id, receiver_id, type, coins, note) VALUES (?, ?, ?, ?, ?)',
        [senderId, receiver.id, 'transfer_received', coinsAmount, `Transfer from ${sender.name}`]
      );
    });

    const updatedSender = dbGet('SELECT coins FROM users WHERE id = ?', [senderId]);

    res.json({
      success: true,
      data: {
        new_balance: updatedSender.coins,
        receiver_name: receiver.name,
        coins_sent: coinsAmount,
      },
      message: `Successfully sent ${coinsAmount} coins to ${receiver.name}`
    });
  } catch (err) {
    console.error('Transfer error:', err);
    res.status(500).json({ success: false, message: 'Server error during transfer' });
  }
});

// GET /api/user/bottle-stats
router.get('/bottle-stats', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;

    const stats = dbGet(`
      SELECT 
        COALESCE(SUM(CASE WHEN bottle_capacity = 'small' THEN 1 ELSE 0 END), 0) as small,
        COALESCE(SUM(CASE WHEN bottle_capacity = 'medium' THEN 1 ELSE 0 END), 0) as medium,
        COALESCE(SUM(CASE WHEN bottle_capacity = 'large' THEN 1 ELSE 0 END), 0) as large
      FROM transactions 
      WHERE receiver_id = ? AND type = 'credit' AND bottle_capacity IS NOT NULL
    `, [userId]);

    res.json({ success: true, data: { stats: stats || { small: 0, medium: 0, large: 0 } } });
  } catch (err) {
    console.error('Bottle stats error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/user/lookup?usn=XXX
router.get('/lookup', authenticateToken, (req, res) => {
  try {
    const { usn } = req.query;
    if (!usn) return res.status(400).json({ success: false, message: 'USN is required' });

    const upperUSN = usn.toUpperCase();
    const user = dbGet('SELECT id, usn, name FROM users WHERE usn = ?', [upperUSN]);

    if (!user) {
      return res.json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: { user } });
  } catch (err) {
    console.error('Lookup error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
