import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory storage (replace MongoDB)
const users = [];
const todos = [];
const verificationCodes = new Map(); // Map userId -> { code, expires }

// Middleware
app.use(cors());
app.use(express.json());

// Helper function to find user by email
const findUserByEmail = (email) => {
  return users.find(user => user.email === email);
};

// Helper function to find user by ID
const findUserById = (id) => {
  return users.find(user => user.id === id);
};

// Helper function to find todos by user ID
const findTodosByUserId = (userId) => {
  return todos.filter(todo => todo.userId === userId);
};

// Helper function to generate ID
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Email configuration
const createTransporter = () => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  
  if (!emailUser || !emailPass) {
    console.warn('Email credentials not configured. Email verification will not work.');
    return null;
  }

  // Determine email service from email address
  const isGmail = emailUser.includes('@gmail.com');
  const isMicrosoft = emailUser.includes('@outlook.com') || 
                     emailUser.includes('@hotmail.com') || 
                     emailUser.includes('@live.com') ||
                     emailUser.includes('@msn.com') ||
                     emailUser.includes('@newlifeacademy.org') || // School Microsoft domain
                     emailUser.includes('@office365.com') ||
                     emailUser.includes('@microsoft.com');
  const isYahoo = emailUser.includes('@yahoo.com');

  if (isGmail) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user: emailUser, pass: emailPass }
    });
  } else if (isMicrosoft) {
    return nodemailer.createTransport({
      host: 'smtp-mail.outlook.com',
      port: 587,
      secure: false,
      auth: { user: emailUser, pass: emailPass },
      tls: {
        ciphers: 'SSLv3',
        rejectUnauthorized: false
      }
    });
  } else if (isYahoo) {
    return nodemailer.createTransport({
      service: 'yahoo',
      auth: { user: emailUser, pass: emailPass }
    });
  } else {
    return nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: { user: emailUser, pass: emailPass }
    });
  }
};

const transporter = createTransporter();

// Generate verification code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send verification email
const sendVerificationEmail = async (email, code) => {
  if (!transporter) {
    console.log('⚠️  Email not configured. Verification code for manual testing:');
    console.log(`📧 Email: ${email}`);
    console.log(`🔢 Code: ${code}`);
    console.log('📝 Please check the server console for verification codes during development.');
    return;
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Verify Your Email - Todo App',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome to Todo App!</h2>
        <p>Thank you for creating an account. Please verify your email address by entering the following code:</p>
        <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
          <h1 style="color: #007bff; font-size: 32px; letter-spacing: 5px; margin: 0;">${code}</h1>
        </div>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't create this account, please ignore this email.</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Verification email sent to:', email);
  } catch (error) {
    console.error('❌ Error sending email:', error);
    console.log('⚠️  Email failed. Verification code for manual testing:');
    console.log(`📧 Email: ${email}`);
    console.log(`🔢 Code: ${code}`);
    throw new Error('Failed to send verification email');
  }
};

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = findUserById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Routes

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    console.log('Registration request received:', req.body)
    const { name, email, password, confirmPassword } = req.body;

    console.log('Extracted data:', { name, email, password: password ? '***' : 'undefined', confirmPassword: confirmPassword ? '***' : 'undefined' })

    // Validation
    if (!name || !email || !password) {
      console.log('Validation failed: missing required fields')
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 6) {
      console.log('Validation failed: password too short')
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    if (confirmPassword !== undefined && password !== confirmPassword) {
      console.log('Validation failed: passwords do not match')
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    // Check if user already exists
    const existingUser = findUserByEmail(email);
    if (existingUser) {
      console.log('Registration failed: email already exists')
      return res.status(400).json({ error: 'Email already registered' });
    }

    console.log('Creating new user...')
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = {
      id: generateId(),
      name,
      email,
      password: hashedPassword,
      verified: false
    };

    users.push(user);
    console.log('User created successfully:', user.email)

    // Send verification email
    const verificationCode = generateVerificationCode();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    verificationCodes.set(user.id, { code: verificationCode, expires });

    try {
      await sendVerificationEmail(email, verificationCode);
      console.log('✅ Verification email sent to:', email)
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Don't fail registration if email fails
    }

    res.status(201).json({ 
      message: 'Account created successfully. Please check your email for verification code.',
      userId: user.id
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Verify email
app.post('/api/auth/verify', async (req, res) => {
  try {
    const { email, code } = req.body;

    const user = findUserByEmail(email);
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    if (user.verified) {
      return res.status(400).json({ error: 'Email already verified' });
    }

    const record = verificationCodes.get(user.id);
    if (!record || record.code !== code) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }
    if (new Date() > record.expires) {
      return res.status(400).json({ error: 'Verification code expired' });
    }

    // Mark as verified
    user.verified = true;
    verificationCodes.delete(user.id);

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Email verified successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('Login request body:', req.body)
    console.log('Email:', email)
    console.log('Password:', password)

    if (!email || !password) {
      console.log('Missing email or password')
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = findUserByEmail(email);
    if (!user) {
      console.log('User not found for email:', email)
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      console.log('Invalid password for user:', email)
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Check if verified
    // Uncomment the next lines if you want to require email verification for login
    // if (!user.verified) {
    //   return res.status(400).json({ error: 'Please verify your email before logging in' });
    // }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    console.log('Login successful for user:', email)

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user profile
app.get('/api/auth/profile', authenticateToken, async (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email
    }
  });
});

// Todo routes
app.get('/api/todos', authenticateToken, async (req, res) => {
  try {
    const todos = findTodosByUserId(req.user.id);
    res.json(todos);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/todos', authenticateToken, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Todo text is required' });
    }

    const todo = {
      id: generateId(),
      userId: req.user.id,
      text: text.trim()
    };

    todos.push(todo);
    res.status(201).json(todo);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/todos/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { completed } = req.body;

    const todo = findTodosByUserId(req.user.id).find(t => t.id === id);
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    todo.completed = completed;
    res.json(todo);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/todos/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const todoIndex = todos.findIndex(t => t.id === id && t.userId === req.user.id);

    if (todoIndex === -1) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    const todo = todos[todoIndex];
    todos.splice(todoIndex, 1);

    res.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Development endpoint - create test user (remove in production)
app.post('/api/dev/create-test-user', async (req, res) => {
  try {
    // Delete existing user if exists
    users.splice(users.findIndex(u => u.email === 'sawyer.kjelshus1@gmail.com'), 1);
    
    // Create new test user with user's email and preferred password
    const hashedPassword = await bcrypt.hash('Zielinski.7', 10);
    const user = {
      id: generateId(),
      name: 'Sawyer Kjelshus',
      email: 'sawyer.kjelshus1@gmail.com',
      password: hashedPassword,
      verified: true // Skip verification for test user
    };
    
    users.push(user);
    
    res.json({ 
      message: 'Test user created successfully',
      email: 'sawyer.kjelshus1@gmail.com',
      password: 'Zielinski.7'
    });
  } catch (error) {
    console.error('Create test user error:', error);
    res.status(500).json({ error: 'Failed to create test user' });
  }
});

// Add process error handlers to prevent crashes
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Don't exit the process, just log the error
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit the process, just log the error
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Add error handler for the server
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
    process.exit(1);
  } else {
    console.error('Server error:', error);
  }
}); 