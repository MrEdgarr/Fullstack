import * as authService from "./auth.service.js";

export const register = async (req, res, next) => {
  try {
    await authService.register(req.body);
    res.status(201).json({
      success: true,
      message: "Đăng ký tài khoản thành công",
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    res.json({
      success: true,
      message: "Đăng nhập thành công",
      ...result,
    });
  } catch (error) {
    next(error);
  }
};
