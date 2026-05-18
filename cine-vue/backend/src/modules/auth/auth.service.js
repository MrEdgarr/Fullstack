const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const customersRepository = require("../customers/customers.repository");
const AppError = require("../../shared/utils/app-error");

const SALT_ROUNDS = 10;

exports.register = async ({
  full_name,
  email,
  phone,
  password,
  avatar_url,
  date_of_birth,
}) => {
  const [existingCustomers] = await customersRepository.getByEmail(email);

  if (existingCustomers.length > 0) {
    throw new AppError("Email already exists", 400);
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  await customersRepository.create(
    full_name,
    email,
    phone,
    passwordHash,
    avatar_url,
    date_of_birth,
  );
};

exports.login = async ({ email, password }) => {
  const [rows] = await customersRepository.getByEmail(email);
  const customer = rows[0];

  if (!customer) {
    throw new AppError("Invalid email or password", 401);
  }

  const passwordMatches = await bcrypt.compare(password, customer.password_hash);

  if (!passwordMatches) {
    throw new AppError("Invalid email or password", 401);
  }

  const token = jwt.sign(
    {
      customer_id: customer.customer_id,
      email: customer.email,
      full_name: customer.full_name,
      role: customer.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );

  return {
    token,
    customer: {
      customer_id: customer.customer_id,
      full_name: customer.full_name,
      email: customer.email,
    },
  };
};
