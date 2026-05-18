const brandsRepository = require("./brands.repository");

exports.getAll = async (req, res, next) => {
  try {
    const [rows] = await brandsRepository.getAll();
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const [rows] = await brandsRepository.getById(req.params.id);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Brand not found" });
    }

    return res.json({ success: true, data: rows[0] });
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { brand_name, logo_url } = req.body;
    await brandsRepository.create(brand_name, logo_url);
    res.status(201).json({ success: true, message: "Brand created successfully" });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { brand_name, logo_url } = req.body;
    await brandsRepository.update(req.params.id, brand_name, logo_url);
    res.json({ success: true, message: "Brand updated successfully" });
  } catch (error) {
    next(error);
  }
};

exports.delete = async (req, res, next) => {
  try {
    await brandsRepository.delete(req.params.id);
    res.json({ success: true, message: "Brand deleted successfully" });
  } catch (error) {
    next(error);
  }
};
