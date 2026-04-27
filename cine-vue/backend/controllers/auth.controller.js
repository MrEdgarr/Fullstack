const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const queries = require("../queries/customersQueries");

const JWT_SECRET = process.env.JWT_SECRET || "cinema-secret-key-2025";
const SALT_ROUNDS = 10;

// Đăng ký khách hàng mới
exports.register = async (req, res) => {
  try {
    const { full_name, email, phone, password, date_of_birth } = req.body;

    // Kiểm tra email đã tồn tại
    const [existing] = await queries.getAll();
    if (existing.some((u) => u.email === email)) {
      return res.status(400).json({ success: false, message: "Email already exists" });
    }

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    await queries.create(full_name, email, phone, password_hash, date_of_birth);

    res.status(201).json({ success: true, message: "Customer registered successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Đăng nhập
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const [rows] = await queries.getAll();
    const customer = rows.find((c) => c.email === email);

    if (!customer) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, customer.password_hash);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const token = jwt.sign(
      {
        customer_id: customer.customer_id,
        email: customer.email,
        full_name: customer.full_name,
        role: customer.role,
      },
      JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      customer: {
        customer_id: customer.customer_id,
        full_name: customer.full_name,
        email: customer.email,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
