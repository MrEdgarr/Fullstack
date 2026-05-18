const authService = require("./auth.service");

exports.register = async (req, res, next) => {
  try {
    await authService.register(req.body);
    res.status(201).json({
      success: true,
      message: "Customer registered successfully",
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    res.json({
      success: true,
      message: "Login successful",
      ...result,
    });
  } catch (error) {
    next(error);
  }
};
