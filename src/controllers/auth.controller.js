import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/user.js';


export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1️⃣ Input validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // 2️⃣ Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email'
      });
    }

    // 3️⃣ Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Contact admin.'
      });
    }

    // 4️⃣ Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid  password'
      });
    }

    // 5️⃣ Check JWT Secret
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not configured');
    }

    // 6️⃣ Generate JWT Token
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
        issuer: 'ravi-academy',
        audience: 'student-panel'
      }
    );

    // 7️⃣ Send response (exclude password)
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          college_name: user.college_name
        }
      }
    });

  } catch (error) {
    console.error('Login Error:', error);

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};


export const registerStudent = async (req, res) => {
  try {
    const {
      name,
      email,
      mobile_no,
      college_name,
      address,
      password,
      role
    } = req.body;

    // 1. Basic validation
    if (!name || !email || !mobile_no || !college_name || !address || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    // 2. Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered"
      });
    }

    // 3. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Create new user
    const newUser = await User.create({
      name,
      email,
      mobile_no,
      college_name,
      address,
      password: hashedPassword,
      role
    });

    

    res.status(200).json({
      success: true,
      message: "Student registered successfully",
      data: newUser
    });

  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

export const getProfile = (req, res) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authenticated'
    });
  }
  
  res.json({
    success: true,
    data: {
      user: req.user
    }
  });
};