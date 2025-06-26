const bcrypt = require('bcrypt');
const crypto = require('crypto');
const transporter = require('../config/mailer');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('../models/userModel');

const sendVerificationEmail = async (user, res) => {
  const verificationURL = `http://localhost:3000/api/auth/verify-email?token=${user.verificationToken}`;
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: "Please verify your email",
    html: `
      <h2>Hello, ${user.user_name}!</h2>
      <p>Please verify your email by clicking the link below:</p>
      <a href="${verificationURL}">Verify Email</a>
    `,
  };
  try {
    await transporter.sendMail(mailOptions);
    res.json({ message: 'Verification email sent. Please verify your email.' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.json({ message: 'Failed to send verification email' });
  }
};

const register = async (req, res) => {
  const { user_name, password, email } = req.body;
  try {
    const isUserExisting = await User.findOne({ where: { user_name } });
    if (isUserExisting) {
      if (!isUserExisting.is_verified && isUserExisting.verificationToken) {
        return sendVerificationEmail(isUserExisting, res);
      }
      return res.json({ message: "The user already exists." });
    }

    const isEmailExisting = await User.findOne({ where: { email } });
    if (isEmailExisting) {
      if (!isEmailExisting.is_verified && isEmailExisting.verificationToken) {
        return sendVerificationEmail(isEmailExisting, res);
      }
      return res.json({ message: "Email already registered, try logging in." });
    }

    const hashed = await bcrypt.hash(password, 12);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const user = await User.create({
      user_name,
      email,
      password: hashed,
      is_verified: false,
      verificationToken
    });

    return sendVerificationEmail(user, res);

  } catch (e) {
    res.json({ error: e.message });
  }
};

const verifyEmail = async (req, res) => {
  const { token } = req.query;
  try {
    const user = await User.findOne({ where: { verificationToken: token } });
    if (!user) return res.send("Invalid or expired verification token.");

    user.is_verified = true;
    user.verificationToken = null;
    await user.save();

    res.redirect("http://localhost:3001/login?verified=true");
  } catch (e) {
    res.json({ error: e.message });
  }
};

const deregister = async (req, res) => {
  const { user_name } = req.body;
  try {
    const user = await User.findOne({ where: { user_name } });
    if (!user) return res.json({ message: "User not found" });

    await user.destroy();
    res.clearCookie('token');
    return res.json({ message: "Deregistered successfully" });
  } catch (e) {
    res.json({ error: e.message });
  }
};

const login = async (req, res) => {
  const { user_name, password } = req.body;
  try {
    const user = await User.findOne({ where: { user_name } });
    if (!user) return res.json({ message: "Invalid username or password" , messageType : 1});

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.json({ message: "Invalid username or password" , messageType : 1});

    if (!user.is_verified) {
      if (user.verificationToken) {
        return sendVerificationEmail(user, res);
      }
      return res.json({ message: "Please verify your email before logging in." });
    }

    const tokenPayload = {
      user_id: user.user_id,
      user_name: user.user_name,
      email: user.email,
      googleId: user.googleId,
      is_verified: user.is_verified
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000
    });

    res.json({ message: "Login successful", user: tokenPayload,messageType : 0,token:token});
  } catch (e) {
    res.json({ message : e.message , messageType : 1});
  }
};

const logout = (req, res) => {
  try {
    res.clearCookie('token');
    res.json({ message: 'Logged out successfully' });
  } catch (e) {
    res.json({ error: e.message });
  }
};

const googleAuth = passport.authenticate('google', { scope: ['profile', 'email'] });

const googleCallback = (req, res, next) => {
  passport.authenticate('google', { session: false }, (err, user, info) => {
    if (err) {
      const message = 'Internal server error during Google login';
      return res.redirect(`http://localhost:3001?message=${encodeURIComponent(message)}`);
    }
    if (!user) {
      const message = (info && info.message) ? info.message : 'Google login failed';
      return res.redirect(`http://localhost:3001?message=${encodeURIComponent(message)}`);
    }

    const tokenPayload = {
      user_id: user.user_id,
      user_name: user.user_name,
      email: user.email,
      googleId: user.googleId,
      is_verified: user.is_verified
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000
    });

    res.send(`
      <html>
        <head>
          <script>
            setTimeout(() => {
              window.location.href = "http://localhost:3001/oauth-success";
            }, 500);
          </script>
        </head>
        <body>
          <p>Logging in via Google... Please wait.</p>
        </body>
      </html>
    `);
  })(req, res, next);
};

const authCheck = async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) return res.sendStatus(403);

    try {
      const user = await User.findByPk(decoded.user_id);
      if (!user) return res.sendStatus(404);

      const userData = {
        user_id: user.user_id,
        user_name: user.user_name,
        email: user.email,
        googleId: user.googleId,
        is_verified: user.is_verified
      };

      res.status(200).json({ user: userData });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
};

module.exports = {
  register,
  login,
  logout,
  deregister,
  googleAuth,
  googleCallback,
  verifyEmail,
  authCheck
};
