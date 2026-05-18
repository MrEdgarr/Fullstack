const paymentsService = require("./payments.service");

exports.getByBooking = async (req, res, next) => {
  try {
    const [rows] = await paymentsService.getByBooking(req.user, req.params.bookingId);
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const data = await paymentsService.create(req.user, req.body);
    res.status(201).json({
      success: true,
      message: "Payment created successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    await paymentsService.updateStatus(req.user, req.params.id, req.body.status);
    res.json({ success: true, message: "Payment status updated successfully" });
  } catch (error) {
    next(error);
  }
};
