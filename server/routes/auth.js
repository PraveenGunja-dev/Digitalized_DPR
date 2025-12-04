// server/routes/auth.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

// We'll pass the pool from server.js when registering the routes
let pool;

const router = express.Router();

// Function to set the pool and middleware (called from server.js)
const setPool = (dbPool, authMiddleware) => {
  pool = dbPool;
  authenticateToken = authMiddleware;
};

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
};

// Middleware to check if user is PMAG
const isPMAG = (req, res, next) => {
  console.log("isPMAG middleware - req.user:", req.user); // Debug log
  if (req.user && req.user.role === 'PMAG') {
    console.log("User is PMAG, allowing access"); // Debug log
    next();
  } else {
    console.log("User is not PMAG, denying access"); // Debug log
    res.status(403).json({ message: 'Access denied. PMAG privileges required.' });
  }
};

// Middleware to check if user is Site PM
const isSitePM = (req, res, next) => {
  if (req.user && req.user.role === 'Site PM') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Site PM privileges required.' });
  }
};

// We'll pass the authenticateToken middleware from server.js when registering the routes
let authenticateToken;

// In-memory store for refresh tokens (in production, use Redis or database)
const refreshTokens = new Map();

// Generate tokens function
const generateTokens = (user) => {
  // Short-lived access token (15 minutes)
  const accessToken = jwt.sign(
    { userId: user.user_id || user.userId, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'adani_flow_secret_key',
    { expiresIn: '15m' }
  );
  
  // Long-lived refresh token (7 days)
  const refreshToken = jwt.sign(
    { userId: user.user_id || user.userId, email: user.email, role: user.role, tokenId: uuidv4() },
    process.env.REFRESH_TOKEN_SECRET || 'adani_flow_refresh_secret_key',
    { expiresIn: '7d' }
  );
  
  return { accessToken, refreshToken };
};

// Register a new user (requires authentication based on role hierarchy)
// Oracle P6 equivalent would be creating a new user in the system
router.post('/register', async (req, res, next) => {
  // First authenticate the requesting user
  if (authenticateToken) {
    authenticateToken(req, res, () => {
      // After authentication, check role-based permissions
      const { role } = req.body;
      
      // Validate role hierarchy:
      // - PMAG can create Site PM and PMAG users
      // - Site PM can create Supervisor users
      // - Others cannot create users
      
      if (req.user.role === 'PMAG') {
        // PMAG can create Site PM and PMAG users
        if (role !== 'Site PM' && role !== 'PMAG') {
          return res.status(403).json({ 
            message: 'PMAG users can only create Site PM and PMAG users.' 
          });
        }
        next(); // Allow registration
      } else if (req.user.role === 'Site PM') {
        // Site PM can only create Supervisor users
        if (role !== 'supervisor') {
          return res.status(403).json({ 
            message: 'Site PM users can only create Supervisor users.' 
          });
        }
        next(); // Allow registration
      } else {
        // Other roles cannot create users
        return res.status(403).json({ 
          message: 'Access denied. Only PMAG and Site PM users can create new users.' 
        });
      }
    });
  } else {
    next();
  }
}, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate required fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({ 
        message: 'All fields are required: name, email, password, role' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        message: 'Invalid email format' 
      });
    }

    // Validate password strength (at least 8 characters)
    if (password.length < 8) {
      return res.status(400).json({ 
        message: 'Password must be at least 8 characters long' 
      });
    }

    // Validate role
    const validRoles = ['supervisor', 'Site PM', 'PMAG', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ 
        message: 'Invalid role. Must be one of: ' + validRoles.join(', ')
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert user into database
    const result = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING user_id, name, email, role',
      [name, email, hashedPassword, role]
    );

    const user = result.rows[0];

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);
    
    // Store refresh token
    refreshTokens.set(refreshToken, { 
      userId: user.user_id, 
      email: user.email, 
      role: user.role 
    });

    // Oracle P6 API compatible response format
    res.status(201).json({
      message: 'User registered successfully. Note: Projects can only be assigned at user creation time.',
      accessToken,
      refreshToken,
      user: {
        ObjectId: user.user_id,  // Oracle P6 uses ObjectId
        Name: user.name,         // Oracle P6 uses PascalCase
        Email: user.email,
        Role: user.role
      },
      // Additional Oracle P6 compatible fields
      sessionId: accessToken,
      loginStatus: 'SUCCESS'
    });
  } catch (error) {
    console.error('Registration error:', error);
    if (error.code === '23505') {
      return res.status(400).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Login user (no authentication required)
// Oracle P6 equivalent - authenticates user and returns session/token
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        message: 'Invalid email format' 
      });
    }

    // Find user by email
    const result = await pool.query(
      'SELECT user_id, name, email, password, role FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);
    
    // Store refresh token
    refreshTokens.set(refreshToken, { 
      userId: user.user_id, 
      email: user.email, 
      role: user.role 
    });

    // Remove password from user object
    const { password: _, ...userWithoutPassword } = user;

    // Oracle P6 API compatible response format
    res.status(200).json({
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: {
        ObjectId: userWithoutPassword.user_id,  // Oracle P6 uses ObjectId
        Name: userWithoutPassword.name,         // Oracle P6 uses PascalCase
        Email: userWithoutPassword.email,
        Role: userWithoutPassword.role
      },
      // Additional Oracle P6 compatible fields
      sessionId: accessToken,
      loginStatus: 'SUCCESS'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Refresh token endpoint
router.post('/refresh-token', async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token is required' });
  }

  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET || 'adani_flow_refresh_secret_key');
    
    // Check if refresh token exists in our store
    const storedToken = refreshTokens.get(refreshToken);
    if (!storedToken) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }

    // Check if token matches stored data
    if (decoded.userId !== storedToken.userId) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }

    // Generate new tokens
    const user = {
      userId: storedToken.userId,
      email: storedToken.email,
      role: storedToken.role
    };
    
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);
    
    // Remove old refresh token and store new one
    refreshTokens.delete(refreshToken);
    refreshTokens.set(newRefreshToken, storedToken);

    res.status(200).json({
      accessToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      // Remove expired token from store
      refreshTokens.delete(refreshToken);
      return res.status(401).json({ message: 'Refresh token expired' });
    }
    return res.status(403).json({ message: 'Invalid refresh token' });
  }
});

// Logout endpoint - revoke refresh token
router.post('/logout', async (req, res) => {
  const { refreshToken } = req.body;

  if (refreshToken) {
    // Remove refresh token from store
    refreshTokens.delete(refreshToken);
  }

  res.status(200).json({ message: 'Logout successful' });
});

// Get user profile (requires authentication)
// Oracle P6 equivalent - gets current user information
const getUserProfile = async (req, res) => {
  try {
    // Get user ID from authenticated request
    const userId = req.user.userId;

    // Find user by ID
    const result = await pool.query(
      'SELECT user_id, name, email, role FROM users WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = result.rows[0];

    // Oracle P6 API compatible response format
    res.status(200).json({
      message: 'Profile fetched successfully',
      user: {
        ObjectId: user.user_id,  // Oracle P6 uses ObjectId
        Name: user.name,         // Oracle P6 uses PascalCase
        Email: user.email,
        Role: user.role
      }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

router.get('/profile', (req, res, next) => {
  if (authenticateToken) {
    authenticateToken(req, res, next);
  } else {
    next();
  }
}, getUserProfile);

// Get all supervisors (requires authentication and PMAG or Site PM role)
router.get('/supervisors', (req, res, next) => {
  if (authenticateToken) {
    authenticateToken(req, res, () => {
      // Allow both PMAG and Site PM to fetch supervisors
      if (req.user.role === 'PMAG' || req.user.role === 'Site PM') {
        next();
      } else {
        res.status(403).json({ message: 'Access denied. PMAG or Site PM privileges required.' });
      }
    });
  } else {
    next();
  }
}, async (req, res) => {
  try {
    console.log("Fetching supervisors for user:", req.user); // Debug log
    // Get all users with supervisor role
    const result = await pool.query(
      'SELECT user_id, name, email, role FROM users WHERE role = $1 ORDER BY name',
      ['supervisor']
    );

    console.log("Supervisors found:", result.rows); // Debug log
    
    // Transform to Oracle P6 format (PascalCase)
    const supervisors = result.rows.map(user => ({
      ObjectId: user.user_id,
      Name: user.name,
      Email: user.email,
      Role: user.role
    }));
    
    res.status(200).json(supervisors);
  } catch (error) {
    console.error('Fetch supervisors error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Reset users - delete all except admin and create admin if needed (admin only)
router.post('/reset-users', isAdmin, async (req, res) => {
  try {
    // Delete all users except admin (PMAG role or admin email)
    await pool.query(`
      DELETE FROM users 
      WHERE email != 'admin@adani.com' 
      AND role != 'PMAG'
    `);
    
    // Check if admin exists, if not create it
    const adminCheck = await pool.query(
      "SELECT user_id FROM users WHERE email = 'admin@adani.com' OR role = 'PMAG' LIMIT 1"
    );
    
    let adminUser;
    if (adminCheck.rows.length === 0) {
      // Create admin user if it doesn't exist
      const adminPassword = 'admin123';
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);

      const result = await pool.query(
        'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING user_id, name, email, role',
        ['Admin User', 'admin@adani.com', hashedPassword, 'PMAG']
      );
      adminUser = result.rows[0];
    } else {
      // Get existing admin user
      const result = await pool.query(
        "SELECT user_id, name, email, role FROM users WHERE email = 'admin@adani.com' OR role = 'PMAG' LIMIT 1"
      );
      adminUser = result.rows[0];
    }

    // Oracle P6 API compatible response format
    res.status(200).json({
      message: 'Users reset successfully. Admin user created.',
      admin: {
        ObjectId: adminUser.user_id,  // Oracle P6 uses ObjectId
        Name: adminUser.name,         // Oracle P6 uses PascalCase
        Email: adminUser.email,
        Role: adminUser.role
        // Note: In a real application, never send passwords in responses
      },
      status: 'SUCCESS'
    });
  } catch (error) {
    console.error('Reset users error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = { router, setPool, getUserProfile };