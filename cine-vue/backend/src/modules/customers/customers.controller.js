const customersRepository = require("./customers.repository");

exports.getById = async (req, res, next) => {
  try {
    const [rows] = await customersRepository.getById(req.params.id);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }

    return res.json({ success: true, data: rows[0] });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
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
