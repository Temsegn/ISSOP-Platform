const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authRepository = require('./auth.repository');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

class AuthService {
  async register(userData) {
    const { name, email, password, role, phone } = userData;

    // Check if user already exists
    const existingUser = await authRepository.findUserByEmail(email);
    if (existingUser) {
      const error = new Error('User with this email already exists');
      error.statusCode = 400;
      throw error;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Save user
    const newUser = await authRepository.createUser({
      name,
      email,
      password: hashedPassword,
      role: role || 'USER', // Default to USER from schema anyway
      phone,
    });

    // Generate token
    const token = this.generateToken(newUser);

    // Remove password from response
    const { password: _, ...userResponse } = newUser;
    return { user: userResponse, token };
  }

  async login(email, password) {
    const user = await authRepository.findUserByEmail(email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    const token = this.generateToken(user);

    // Remove password from response
    const { password: _, ...userResponse } = user;
    return { user: userResponse, token };
  }

  generateToken(user) {
    return jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
  }
}

module.exports = new AuthService();
