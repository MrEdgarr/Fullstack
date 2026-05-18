const bookingsService = require("./bookings.service");

exports.getByCustomer = async (req, res, next) => {
  try {
    const [rows] = await bookingsService.getByCustomer(req.user, req.params.customerId);
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const data = await bookingsService.create(req.user.customer_id, req.body);
    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const result = await bookingsService.updateStatus(req.user, req.params.id, req.body.status);

    if (result.alreadyConfirmed) {
      return res.json({ success: true, message: "Booking already confirmed" });
    }

    return res.json({ success: true, message: "Booking status updated successfully" });
  } catch (error) {
    next(error);
  }
};

exports.delete = async (req, res, next) => {
  try {
    await bookingsService.delete(req.user, req.params.id);
    res.json({ success: true, message: "Booking deleted successfully" });
  } catch (error) {
    next(error);
  }
};
