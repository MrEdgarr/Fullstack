const customersRepository = require("./customers.repository");
const { uploadToCloudinary } = require("../../shared/middleware/upload-cloudinary");
const AppError = require("../../shared/utils/app-error");

const pickPublicCustomer = (customer) => ({
  customer_id: customer.customer_id,
  full_name: customer.full_name,
  email: customer.email,
  phone: customer.phone,
  avatar_url: customer.avatar_url,
  date_of_birth: customer.date_of_birth,
  role: customer.role,
  status: customer.status,
});

exports.getCurrentProfile = async (customerId) => {
  const [rows] = await customersRepository.getPublicById(customerId);
  const customer = rows[0];

  if (!customer) {
    throw new AppError("Customer not found", 404);
  }

  return pickPublicCustomer(customer);
};

exports.updateCurrentProfile = async (customerId, payload, file = null) => {
  const [rows] = await customersRepository.getPublicById(customerId);
  const currentCustomer = rows[0];

  if (!currentCustomer) {
    throw new AppError("Customer not found", 404);
  }

  const nextProfile = {
    full_name: payload.full_name ?? currentCustomer.full_name,
    email: payload.email ?? currentCustomer.email,
    phone: payload.phone || currentCustomer.phone,
    avatar_url: payload.avatar_url || currentCustomer.avatar_url,
    date_of_birth:
      payload.date_of_birth === undefined
        ? currentCustomer.date_of_birth
        : payload.date_of_birth || null,
  };

  await assertUniqueEmail(customerId, nextProfile.email);

  if (file) {
    nextProfile.avatar_url = await uploadAvatar(file);
  }

  await customersRepository.updateProfile(customerId, nextProfile);

  return exports.getCurrentProfile(customerId);
};

async function uploadAvatar(file) {
  if (!file) {
    throw new AppError("Avatar file is required", 400);
  }

  if (!file.mimetype?.startsWith("image/")) {
    throw new AppError("Avatar must be an image", 400);
  }

  const uploadedAvatar = await uploadToCloudinary(file, "avatars");
  return uploadedAvatar.secure_url;
}

async function assertUniqueEmail(customerId, email) {
  const [rows] = await customersRepository.getByEmail(email);
  const existingCustomer = rows[0];

  if (existingCustomer && Number(existingCustomer.customer_id) !== Number(customerId)) {
    throw new AppError("Email already exists", 409);
  }
}
