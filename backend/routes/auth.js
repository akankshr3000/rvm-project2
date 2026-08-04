import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { dbRun, dbGet } from '../database.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { sendOTP } from '../utils/email.js';

const router = Router();

// In-memory store for OTPs (for simplicity and speed)
// Format: { email: { otp: '1234', expiresAt: timestamp } }
const otpStore = new Map();
// Temporary store for verified password resets
// Format: { email: { resetToken: 'xyz', expiresAt: timestamp } }
const resetStore = new Map();

// Stores for Registration OTP flow
const registerOtpStore = new Map();
const registerVerifiedStore = new Map();

// POST /api/auth/register-send-otp
router.post('/register-send-otp', async (req, res) => {
  try {
    const { usn, email } = req.body;
    if (!usn || !email) {
      return res.status(400).json({ success: false, message: 'USN and email are required' });
    }

    const upperUSN = usn.toUpperCase();
    const existing = dbGet('SELECT id FROM users WHERE usn = ? OR email = ?', [upperUSN, email]);
    if (existing) {
      return res.status(409).json({ success: false, message: 'User with this USN or email already exists' });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000;
    registerOtpStore.set(email, { otp, expiresAt, lastSent: Date.now() });

    const emailSent = await sendOTP(email, otp, 'register');
    if (emailSent) {
      res.json({ success: true, message: 'Registration OTP sent successfully' });
    } else {
      res.status(500).json({ success: false, message: 'Failed to send OTP email' });
    }
  } catch (err) {
    console.error('Register send OTP error:', err);
    res.status(500).json({ success: false, message: 'Server error sending registration OTP' });
  }
});

// POST /api/auth/register-verify-otp
router.post('/register-verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ success: false, message: 'Email and OTP required' });

    const record = registerOtpStore.get(email);
    if (!record) {
      return res.status(400).json({ success: false, message: 'No active registration session found' });
    }

    if (Date.now() > record.expiresAt) {
      registerOtpStore.delete(email);
      return res.status(400).json({ success: false, message: 'OTP has expired' });
    }

    if (record.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Incorrect OTP' });
    }

    const registrationToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const expiresAt = Date.now() + 15 * 60 * 1000;

    registerVerifiedStore.set(email, { registrationToken, expiresAt });
    registerOtpStore.delete(email);

    res.json({ success: true, message: 'OTP verified', registrationToken });
  } catch (err) {
    console.error('Register verify OTP error:', err);
    res.status(500).json({ success: false, message: 'Server error validating OTP' });
  }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { usn, name, email, pin, branch, year, role, registrationToken } = req.body;

    if (!usn || !name || !email || !pin || !registrationToken) {
      return res.status(400).json({ success: false, message: 'All fields including email verification token are required' });
    }

    if (!/^\d{4}$/.test(pin)) {
      return res.status(400).json({ success: false, message: 'PIN must be exactly 4 digits' });
    }

    const upperUSN = usn.toUpperCase();

    // Check if registration token is valid
    const verifiedRecord = registerVerifiedStore.get(email);
    if (!verifiedRecord || verifiedRecord.registrationToken !== registrationToken || Date.now() > verifiedRecord.expiresAt) {
      return res.status(400).json({ success: false, message: 'Invalid or expired registration token. Please verify email again.' });
    }

    // Check if user already exists
    const existing = dbGet('SELECT id FROM users WHERE usn = ? OR email = ?', [upperUSN, email]);
    if (existing) {
      return res.status(409).json({ success: false, message: 'User with this USN or email already exists' });
    }

    const pinHash = await bcrypt.hash(pin, 10);

    dbRun(
      'INSERT INTO users (usn, name, email, pin_hash, branch, year, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [upperUSN, name.trim(), email.trim(), pinHash, branch || null, year || null, role || 'student']
    );

    // Clean up verified store before responding
    registerVerifiedStore.delete(email);

    // Fetch inserted user (fallback to constructed object if DB read fails)
    let user = dbGet('SELECT id, usn, name, email, coins, branch, year, role, created_at FROM users WHERE usn = ?', [upperUSN]);
    if (!user) {
      // Construct a safe user object from known registration data
      user = {
        usn: upperUSN,
        name: name.trim(),
        email: email.trim(),
        coins: 0,
        branch: branch || null,
        year: year || null,
        role: role || 'student',
        created_at: new Date().toISOString(),
      };
    }

    const token = jwt.sign(
      { id: user.id || upperUSN, usn: user.usn, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      data: { user, token },
      message: 'Registration successful'
    });
  } catch (err) {
    console.error('Register error:', err);
    // If user was actually inserted before the crash, still report success
    const inserted = dbGet('SELECT id, usn, name, email, coins, branch, year, role, created_at FROM users WHERE usn = ? OR email = ?', [req.body?.usn?.toUpperCase(), req.body?.email]);
    if (inserted) {
      const token = jwt.sign({ id: inserted.id, usn: inserted.usn, role: inserted.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
      return res.status(201).json({ success: true, data: { user: inserted, token }, message: 'Registration successful' });
    }
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { usn, pin } = req.body;

    if (!usn || !pin) {
      return res.status(400).json({ success: false, message: 'USN and PIN are required' });
    }

    const upperUSN = usn.toUpperCase();
    const user = dbGet('SELECT * FROM users WHERE usn = ?', [upperUSN]);

    if (!user) {
      return res.status(401).json({ success: false, message: 'Incorrect USN or PIN' });
    }

    const pinMatch = await bcrypt.compare(pin, user.pin_hash);
    if (!pinMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect PIN' });
    }

    const token = jwt.sign({ id: user.id, usn: user.usn, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

    const { pin_hash, ...safeUser } = user;
    res.json({
      success: true,
      data: { user: safeUser, token },
      message: 'Login successful'
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
});

// GET /api/auth/check-user/:usn  — check if a USN is registered (no PIN needed)
router.get('/check-user/:usn', (req, res) => {
  try {
    const upperUSN = req.params.usn.toUpperCase();
    const user = dbGet('SELECT id FROM users WHERE usn = ?', [upperUSN]);
    if (user) {
      res.json({ success: true, exists: true });
    } else {
      res.status(404).json({ success: false, exists: false, message: 'User not found' });
    }
  } catch (err) {
    console.error('Check user error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, (req, res) => {
  try {
    const user = dbGet('SELECT id, usn, name, email, coins, branch, year, role, created_at FROM users WHERE id = ?', [req.user.id]);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: { user } });
  } catch (err) {
    console.error('Me error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/auth/google
router.post('/google', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email required' });

    const user = dbGet('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.json({ success: true, isNew: true });
    }

    // Existing Google User found
    const token = jwt.sign({ id: user.id, usn: user.usn, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    const { pin_hash, ...safeUser } = user;
    
    res.json({
      success: true,
      isNew: false,
      data: { user: safeUser, token },
      message: 'Google login successful'
    });
  } catch (err) {
    console.error('Google check error:', err);
    res.status(500).json({ success: false, message: 'Server error during Google auth' });
  }
});

// POST /api/auth/googleRegister
router.post('/googleRegister', async (req, res) => {
  try {
    const { usn, name, email, pin, role } = req.body;

    if (!usn || !name || !email || !pin) {
      return res.status(400).json({ success: false, message: 'USN, name, email, and PIN are required' });
    }

    if (!/^\d{4}$/.test(pin)) {
      return res.status(400).json({ success: false, message: 'PIN must be exactly 4 digits' });
    }

    const upperUSN = usn.toUpperCase();

    // Check if user already exists
    const existing = dbGet('SELECT id FROM users WHERE usn = ? OR email = ?', [upperUSN, email]);
    if (existing) {
      return res.status(409).json({ success: false, message: 'User with this USN or email already exists' });
    }

    const pinHash = await bcrypt.hash(pin, 10);

    dbRun(
      'INSERT INTO users (usn, name, email, pin_hash, role) VALUES (?, ?, ?, ?, ?)',
      [upperUSN, name.trim(), email.trim(), pinHash, role || 'student']
    );

    // Fetch inserted user (fallback to constructed object if DB read fails)
    let user = dbGet('SELECT id, usn, name, email, coins, branch, year, role, created_at FROM users WHERE usn = ?', [upperUSN]);
    if (!user) {
      user = {
        usn: upperUSN,
        name: name.trim(),
        email: email.trim(),
        coins: 0,
        branch: null,
        year: null,
        role: role || 'student',
        created_at: new Date().toISOString(),
      };
    }

    const token = jwt.sign(
      { id: user.id || upperUSN, usn: user.usn, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      data: { user, token },
      message: 'Google registration successful'
    });
  } catch (err) {
    console.error('Google Register error:', err);
    // If user was actually inserted before the crash, still report success
    const inserted = dbGet('SELECT id, usn, name, email, coins, branch, year, role, created_at FROM users WHERE usn = ? OR email = ?', [req.body?.usn?.toUpperCase(), req.body?.email]);
    if (inserted) {
      const token = jwt.sign({ id: inserted.id, usn: inserted.usn, role: inserted.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
      return res.status(201).json({ success: true, data: { user: inserted, token }, message: 'Google registration successful' });
    }
    res.status(500).json({ success: false, message: 'Server error during Google registration' });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { identifier } = req.body;
    if (!identifier) return res.status(400).json({ success: false, message: 'Email or USN is required' });

    const searchVal = identifier.trim().toLowerCase();
    
    const user = dbGet('SELECT * FROM users WHERE LOWER(email) = ? OR LOWER(usn) = ?', [searchVal, searchVal]);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Generate random 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    
    // Set 5-minute expiry
    const expiresAt = Date.now() + 5 * 60 * 1000;
    
    // Save to store mapping uniquely to email
    otpStore.set(user.email, { otp, expiresAt, lastSent: Date.now() });

    // Send the email
    const emailSent = await sendOTP(user.email, otp);
    
    if (emailSent) {
      // Let frontend know which email we locked on if search was via USN
      res.json({ success: true, message: 'OTP sent successfully', displayEmail: user.email.replace(/(.{2})(.*)(?=@)/, '$1***') });
    } else {
      res.status(500).json({ success: false, message: 'Failed to send OTP server-side' });
    }
  } catch (err) {
    console.error('Forgot password lookup error:', err);
    res.status(500).json({ success: false, message: 'Server error processing forgot password' });
  }
});

// POST /api/auth/verify-otp
router.post('/verify-otp', async (req, res) => {
  try {
    const { identifier, otp } = req.body;
    if (!identifier || !otp) return res.status(400).json({ success: false, message: 'Identifier and OTP required' });

    const searchVal = identifier.trim().toLowerCase();
    const user = dbGet('SELECT * FROM users WHERE LOWER(email) = ? OR LOWER(usn) = ?', [searchVal, searchVal]);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const record = otpStore.get(user.email);
    if (!record) {
      return res.status(400).json({ success: false, message: 'No active OTP session found' });
    }

    if (Date.now() > record.expiresAt) {
      otpStore.delete(user.email);
      return res.status(400).json({ success: false, message: 'OTP has expired' });
    }

    if (record.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Incorrect OTP' });
    }

    // Success! Generate a temporary reset token valid for 10 minutes
    const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const resetExpiresAt = Date.now() + 10 * 60 * 1000;

    resetStore.set(user.email, { resetToken, expiresAt: resetExpiresAt });
    otpStore.delete(user.email); // Clear the OTP so it can't be reused

    res.json({ success: true, message: 'OTP verified', resetToken, email: user.email });
  } catch (err) {
    console.error('Verify OTP error:', err);
    res.status(500).json({ success: false, message: 'Server error processing OTP verification' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, resetToken, newPin } = req.body;
    if (!email || !resetToken || !newPin) {
      return res.status(400).json({ success: false, message: 'Invalid payload elements missing' });
    }

    if (!/^\d{4}$/.test(newPin)) {
      return res.status(400).json({ success: false, message: 'New PIN must be exactly 4 digits' });
    }

    // Look up the actual user by email (case-insensitive) to get the canonical email
    const user = dbGet('SELECT * FROM users WHERE LOWER(email) = ?', [email.trim().toLowerCase()]);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const record = resetStore.get(user.email);
    if (!record || record.resetToken !== resetToken) {
      return res.status(400).json({ success: false, message: 'Invalid or missing reset token' });
    }

    if (Date.now() > record.expiresAt) {
      resetStore.delete(user.email);
      return res.status(400).json({ success: false, message: 'Reset token has expired' });
    }

    // Token is valid, check if new PIN is same as old PIN
    const isSamePin = await bcrypt.compare(newPin, user.pin_hash);
    if (isSamePin) {
      return res.status(400).json({ success: false, message: 'New PIN cannot be same as old PIN' });
    }

    // Token is valid, hash new PIN and replace
    const pinHash = await bcrypt.hash(newPin, 10);
    
    dbRun('UPDATE users SET pin_hash = ? WHERE email = ?', [pinHash, user.email]);
    
    // Clear out token after use
    resetStore.delete(user.email);
    otpStore.delete(user.email);

    console.log('RESET PIN SUCCESS for:', user.email);
    res.json({ success: true, message: 'PIN updated successfully' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ success: false, message: 'Server error performing PIN reset' });
  }
});

// Test endpoint for quick connectivity check (Requirement #8)
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Auth API is connected and responding' });
});

// POST /api/auth/resend-otp
router.post('/resend-otp', async (req, res) => {
  try {
    const { email, type } = req.body; // type: 'register' or 'forgot'
    if (!email || !type) {
      return res.status(400).json({ success: false, message: 'Email and type are required' });
    }

    const store = type === 'register' ? registerOtpStore : otpStore;
    const record = store.get(email);

    if (!record) {
      return res.status(400).json({ success: false, message: 'No active session found for this email' });
    }

    // Check 30s cooldown
    const now = Date.now();
    if (now - record.lastSent < 30000) {
      const wait = Math.ceil((30000 - (now - record.lastSent)) / 1000);
      return res.status(429).json({ success: false, message: `Please wait ${wait} seconds before requesting again` });
    }

    // Generate new OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = now + 5 * 60 * 1000;

    // Update store
    store.set(email, { otp, expiresAt, lastSent: now });

    // Send email
    const emailSent = await sendOTP(email, otp, type);
    
    if (emailSent) {
      res.json({ success: true, message: 'OTP resent successfully' });
    } else {
      res.status(500).json({ success: false, message: 'Failed to send OTP email' });
    }
  } catch (err) {
    console.error('Resend OTP error:', err);
    res.status(500).json({ success: false, message: 'Server error resending OTP' });
  }
});

export default router;

