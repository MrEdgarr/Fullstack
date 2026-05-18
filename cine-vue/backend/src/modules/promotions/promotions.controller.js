const promotionsRepository = require("./promotions.repository");

exports.validate = async (req, res, next) => {
  try {
    const code = req.params.code.trim().toUpperCase();
    const [rows] = await promotionsRepository.getActiveByCode(code);
    const promotion = rows[0];

    if (!promotion) {
      return res.status(404).json({ success: false, message: "Promotion not found or inactive" });
    }

    return res.json({
      success: true,
      data: {
        code: promotion.code,
        discount_type: promotion.discount_type,
        discount_value: promotion.discount_value,
        max_discount_amount: promotion.max_discount_amount,
        min_order_amount: promotion.min_order_amount,
      },
    });
  } catch (error) {
    next(error);
  }
};
