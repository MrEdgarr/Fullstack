import * as customersRepository from "./customers.repository.js";
import * as customersService from "./customers.service.js";

export const getMe = async (req, res, next) => {
  try {
    const data = await customersService.getCurrentProfile(req.user.customer_id);
    return res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const updateMe = async (req, res, next) => {
  try {
    const data = await customersService.updateCurrentProfile(
      req.user.customer_id,
      req.body,
      req.file,
    );
    return res.json({
      success: true,
      message: "Profile updated successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const [rows] = await customersRepository.getPublicById(req.params.id);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }

    return res.json({ success: true, data: rows[0] });
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const { full_name, email, phone, avatar_url, date_of_birth } = req.body;
    await customersRepository.update(
      req.params.id,
      full_name,
      email,
      phone,
      avatar_url,
      date_of_birth,
    );
    res.json({ success: true, message: "Customer updated successfully" });
  } catch (error) {
    next(error);
  }
};
