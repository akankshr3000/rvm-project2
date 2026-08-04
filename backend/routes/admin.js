import { Router } from 'express';
import { dbGet, dbAll, dbRun } from '../database.js';

const router = Router();

// GET /api/admin/stats
router.get('/stats', (req, res) => {
  try {
    const totalUsers = dbGet('SELECT COUNT(*) as count FROM users', [])?.count || 0;
    const totalCoins = dbGet('SELECT COALESCE(SUM(coins), 0) as total FROM users', [])?.total || 0;

    const bottleStats = dbGet(`
      SELECT 
        COUNT(*) as total_bottles,
        COALESCE(SUM(CASE WHEN bottle_capacity = 'small' THEN 1 ELSE 0 END), 0) as small_count,
        COALESCE(SUM(CASE WHEN bottle_capacity = 'medium' THEN 1 ELSE 0 END), 0) as medium_count,
        COALESCE(SUM(CASE WHEN bottle_capacity = 'large' THEN 1 ELSE 0 END), 0) as large_count
      FROM transactions 
      WHERE type = 'credit' AND bottle_capacity IS NOT NULL
    `, []) || { total_bottles: 0, small_count: 0, medium_count: 0, large_count: 0 };

    const totalTransfers = dbGet("SELECT COUNT(*) as count FROM transactions WHERE type = 'transfer_sent'", [])?.count || 0;

    res.json({
      success: true,
      data: {
        total_users: totalUsers,
        total_coins: totalCoins,
        total_bottles: bottleStats.total_bottles,
        total_transfers: totalTransfers,
        small_count: bottleStats.small_count,
        medium_count: bottleStats.medium_count,
        large_count: bottleStats.large_count,
      }
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/admin/users
router.get('/users', (req, res) => {
  try {
    const { search, sort } = req.query;
    let query = 'SELECT id, usn, name, email, coins, branch, year, role, created_at FROM users';
    const params = [];

    if (search) {
      query += ' WHERE name LIKE ? OR usn LIKE ?';
      params.push(`%${search}%`, `%${search.toUpperCase()}%`);
    }

    if (sort === 'coins') {
      query += ' ORDER BY coins DESC';
    } else if (sort === 'name') {
      query += ' ORDER BY name ASC';
    } else {
      query += ' ORDER BY created_at DESC';
    }

    const users = dbAll(query, params);
    res.json({ success: true, data: { users } });
  } catch (err) {
    console.error('Admin users error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/admin/user/:id
router.get('/user/:id', (req, res) => {
  try {
    const user = dbGet('SELECT id, usn, name, email, coins, branch, year, role, created_at FROM users WHERE id = ?', [parseInt(req.params.id)]);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

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
    `, [user.id, user.id]);

    const stats = dbGet(`
      SELECT 
        COALESCE(SUM(CASE WHEN type = 'credit' AND receiver_id = ? THEN coins ELSE 0 END), 0) as total_credited,
        COALESCE(SUM(CASE WHEN type = 'transfer_sent' AND sender_id = ? THEN coins ELSE 0 END), 0) as total_sent,
        COALESCE(SUM(CASE WHEN type = 'transfer_received' AND receiver_id = ? THEN coins ELSE 0 END), 0) as total_received
      FROM transactions 
      WHERE sender_id = ? OR receiver_id = ?
    `, [user.id, user.id, user.id, user.id, user.id]) || { total_credited: 0, total_sent: 0, total_received: 0 };

    res.json({
      success: true,
      data: { user, transactions, stats }
    });
  } catch (err) {
    console.error('Admin user detail error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/admin/transactions
router.get('/transactions', (req, res) => {
  try {
    const { type, user_id } = req.query;
    let query = `
      SELECT 
        t.*,
        sender.name as sender_name,
        sender.usn as sender_usn,
        receiver.name as receiver_name,
        receiver.usn as receiver_usn
      FROM transactions t
      LEFT JOIN users sender ON t.sender_id = sender.id
      LEFT JOIN users receiver ON t.receiver_id = receiver.id
    `;
    const conditions = [];
    const params = [];

    if (type) {
      conditions.push('t.type = ?');
      params.push(type);
    }

    if (user_id) {
      conditions.push('(t.sender_id = ? OR t.receiver_id = ?)');
      params.push(parseInt(user_id), parseInt(user_id));
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY t.created_at DESC';

    const transactions = dbAll(query, params);
    res.json({ success: true, data: { transactions } });
  } catch (err) {
    console.error('Admin transactions error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE /api/admin/user/:id
router.delete('/user/:id', (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const user = dbGet('SELECT id FROM users WHERE id = ?', [userId]);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    dbRun('DELETE FROM users WHERE id = ?', [userId]);

    res.json({ success: true, message: 'User removed successfully' });
  } catch (err) {
    console.error('Admin user delete error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
